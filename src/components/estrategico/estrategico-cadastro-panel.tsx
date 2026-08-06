import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { layout } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import {
  deletePlanoSucessao,
  fetchColaboradoresAtivosOpcoes,
  fetchDashboardExecutivo,
  upsertColaboradorPotencial,
  upsertPlanoSucessao,
  type ColaboradorExecutivo,
  type ColaboradorOpcao,
  type PlanoSucessaoRow,
  type PotencialNivel,
} from '@/features/executivo/api';

const POTENCIAIS: PotencialNivel[] = ['baixo', 'medio', 'alto'];

export function EstrategicoCadastroPanel({ onChanged }: { onChanged?: () => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [nineBox, setNineBox] = useState<ColaboradorExecutivo[]>([]);
  const [sucessao, setSucessao] = useState<PlanoSucessaoRow[]>([]);
  const [opcoes, setOpcoes] = useState<ColaboradorOpcao[]>([]);
  const [colaboradorId, setColaboradorId] = useState('');
  const [potencial, setPotencial] = useState<PotencialNivel>('medio');
  const [posicaoChave, setPosicaoChave] = useState('');
  const [titularId, setTitularId] = useState('');
  const [sucessor1Id, setSucessor1Id] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [exec, opts] = await Promise.all([
      fetchDashboardExecutivo(),
      fetchColaboradoresAtivosOpcoes(),
    ]);
    setNineBox(exec.nineBox);
    setSucessao(exec.sucessao);
    setOpcoes(opts);
    if (!colaboradorId && exec.nineBox[0]) {
      setColaboradorId(exec.nineBox[0].id);
      setPotencial(exec.nineBox[0].potencial);
    }
  }, [colaboradorId]);

  useEffect(() => {
    void load().catch((err: unknown) => {
      showToast(err instanceof Error ? err.message : 'Erro ao carregar cadastros.', 'error');
    });
  }, [load, showToast]);

  async function savePotencial() {
    if (!colaboradorId) return;
    setBusy(true);
    try {
      await upsertColaboradorPotencial({
        colaboradorId,
        potencial,
        avaliadoPorId: user?.id ?? null,
      });
      showToast('Potencial salvo.', 'success');
      await load();
      onChanged?.();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao salvar.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function saveSucessao() {
    setBusy(true);
    try {
      await upsertPlanoSucessao({
        posicaoChave,
        titularId: titularId || null,
        sucessor1Id: sucessor1Id || null,
      });
      setPosicaoChave('');
      setTitularId('');
      setSucessor1Id('');
      showToast('Plano de sucessão criado.', 'success');
      await load();
      onChanged?.();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao salvar.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <Card padding="compact">
        <Text variant="titleMedium">Cadastrar potencial</Text>
        <ThemedText type="small" themeColor="textSecondary">
          Sem cadastro, o nine-box usa potencial médio por padrão.
        </ThemedText>
        <Input
          label="ID do colaborador (cole da lista abaixo)"
          value={colaboradorId}
          onChangeText={setColaboradorId}
        />
        <View style={styles.row}>
          {POTENCIAIS.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={potencial === item ? 'primary' : 'secondary'}
              label={item}
              onPress={() => setPotencial(item)}
            />
          ))}
        </View>
        <Button label="Salvar potencial" disabled={busy} onPress={() => void savePotencial()} />
        <View style={styles.list}>
          {nineBox.slice(0, 12).map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant="secondary"
              label={`${item.nome} · ${item.potencialCadastrado ? item.potencial : 'sem cadastro'}`}
              onPress={() => {
                setColaboradorId(item.id);
                setPotencial(item.potencial);
              }}
            />
          ))}
        </View>
      </Card>

      <Card padding="compact">
        <Text variant="titleMedium">Novo plano de sucessão</Text>
        <Input label="Posição-chave" value={posicaoChave} onChangeText={setPosicaoChave} />
        <Input
          label="Titular (ID)"
          value={titularId}
          onChangeText={setTitularId}
          placeholder="Opcional"
        />
        <Input
          label="Sucessor 1 (ID)"
          value={sucessor1Id}
          onChangeText={setSucessor1Id}
          placeholder="Opcional"
        />
        <ThemedText type="small" themeColor="textSecondary">
          Toque em um nome abaixo para copiar o ID no campo ativo.
        </ThemedText>
        <View style={styles.list}>
          {opcoes.slice(0, 10).map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant="secondary"
              label={item.nome}
              onPress={() => {
                if (!titularId) setTitularId(item.id);
                else setSucessor1Id(item.id);
              }}
            />
          ))}
        </View>
        <Button label="Criar plano" disabled={busy} onPress={() => void saveSucessao()} />
      </Card>

      <Card padding="compact">
        <Text variant="titleMedium">Planos cadastrados</Text>
        {sucessao.length === 0 ? (
          <ThemedText themeColor="textSecondary">Nenhum plano ainda.</ThemedText>
        ) : (
          sucessao.map((item) => (
            <View key={item.id} style={styles.sucessaoRow}>
              <ThemedText type="cardTitle">{item.posicaoChave}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Titular: {item.titularNome ?? '—'} · S1: {item.sucessor1Nome ?? '—'}
              </ThemedText>
              <Button
                size="sm"
                variant="secondary"
                label="Excluir"
                disabled={busy}
                onPress={() => {
                  void deletePlanoSucessao(item.id)
                    .then(() => load())
                    .then(() => {
                      showToast('Plano removido.', 'success');
                      onChanged?.();
                    })
                    .catch((err: unknown) =>
                      showToast(err instanceof Error ? err.message : 'Erro ao excluir.', 'error'),
                    );
                }}
              />
            </View>
          ))
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: layout.space.lg },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.space.sm, marginVertical: 8 },
  list: { gap: 6, marginTop: 8 },
  sucessaoRow: { gap: 4, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
});
