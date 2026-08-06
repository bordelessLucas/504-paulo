import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Fonts, layout, type SemanticTone } from '@/constants/theme';
import {
  atualizarProgressoPlanoAcao,
  atualizarStatusDenuncia,
  fetchDashboardCompliance,
  registrarDenuncia,
  registrarPlanoAcaoCompliance,
  registrarRiscoNr1,
  TIPO_DENUNCIA_LABELS,
  type StatusDenuncia,
  type TipoDenuncia,
} from '@/features/compliance/api';
import { useTheme } from '@/hooks/use-theme';

const TIPOS = Object.keys(TIPO_DENUNCIA_LABELS) as TipoDenuncia[];
const STATUS_OPTIONS: StatusDenuncia[] = ['aberto', 'em_analise', 'concluido', 'arquivado'];

export function ComplianceScreen() {
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<Awaited<
    ReturnType<typeof fetchDashboardCompliance>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoDenuncia>('outros');
  const [anonimo, setAnonimo] = useState(false);
  const [areaSetor, setAreaSetor] = useState('');
  const [tipoRisco, setTipoRisco] = useState('');
  const [descricaoRisco, setDescricaoRisco] = useState('');
  const [probabilidade, setProbabilidade] = useState('3');
  const [severidade, setSeveridade] = useState('3');
  const [origemPlano, setOrigemPlano] = useState('manual');
  const [descricaoPlano, setDescricaoPlano] = useState('');
  const [prazoPlano, setPrazoPlano] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setDashboard(await fetchDashboardCompliance());
    } catch {
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const metrics = useMemo(
    () =>
      dashboard
        ? [
            { label: 'Denúncias', value: String(dashboard.totalDenuncias), tone: 'neutral' as const },
            { label: 'Abertas', value: String(dashboard.abertas), tone: 'warning' as const },
            { label: 'Riscos NR1', value: String(dashboard.totalRiscos), tone: 'danger' as const },
            { label: 'Planos pendentes', value: String(dashboard.planosPendentes), tone: 'info' as const },
          ]
        : [],
    [dashboard],
  );

  async function handleRegistrarDenuncia() {
    if (descricao.trim().length < 10) {
      showToast('Descreva a denúncia com pelo menos 10 caracteres.', 'error');
      return;
    }
    try {
      await registrarDenuncia({ tipo, descricao, anonimo });
      setDescricao('');
      showToast('Denúncia registrada. Prazo de resposta: 72h.', 'success');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao registrar.', 'error');
    }
  }

  async function handleRegistrarRisco() {
    const prob = Number(probabilidade);
    const sev = Number(severidade);
    if (!areaSetor.trim() || !tipoRisco.trim() || descricaoRisco.trim().length < 5) {
      showToast('Preencha área, tipo e descrição do risco.', 'error');
      return;
    }
    if (!Number.isFinite(prob) || !Number.isFinite(sev) || prob < 1 || sev < 1 || prob > 5 || sev > 5) {
      showToast('Probabilidade e severidade devem ser de 1 a 5.', 'error');
      return;
    }
    try {
      await registrarRiscoNr1({
        areaSetor,
        tipoRisco,
        descricao: descricaoRisco,
        probabilidade: prob,
        severidade: sev,
      });
      setAreaSetor('');
      setTipoRisco('');
      setDescricaoRisco('');
      showToast('Risco NR-1 registrado.', 'success');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao registrar risco.', 'error');
    }
  }

  async function handleRegistrarPlano() {
    try {
      await registrarPlanoAcaoCompliance({
        origemTipo: origemPlano,
        descricaoAcao: descricaoPlano,
        prazo: prazoPlano || null,
      });
      setDescricaoPlano('');
      setPrazoPlano('');
      showToast('Plano de ação criado.', 'success');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao criar plano.', 'error');
    }
  }

  if (isLoading && !dashboard) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <TabScreenContainer
      scrollable
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void load()} />}>
      <ScreenHeader title="Compliance & Denúncias" />

      {metrics.length > 0 ? (
        <View style={styles.metricsRow}>
          {metrics.map((metric) => (
            <ComplianceMetric
              key={metric.label}
              label={metric.label}
              tone={metric.tone}
              value={metric.value}
            />
          ))}
        </View>
      ) : null}

      <Card padding="compact">
        <ThemedText type="subtitle">Nova denúncia</ThemedText>
        <View style={styles.chipRow}>
          {TIPOS.map((item) => (
            <Pressable
              key={item}
              onPress={() => setTipo(item)}
              style={[styles.chip, tipo === item && styles.chipActive]}>
              <ThemedText type="small">{TIPO_DENUNCIA_LABELS[item]}</ThemedText>
            </Pressable>
          ))}
        </View>
        <Input
          label="Descrição"
          placeholder="Descreva o relato com detalhes..."
          multiline
          value={descricao}
          onChangeText={setDescricao}
          style={styles.textArea}
        />
        <View style={styles.actions}>
          <Button
            label={anonimo ? 'Anônimo: sim' : 'Anônimo: não'}
            variant="secondary"
            size="sm"
            onPress={() => setAnonimo((v) => !v)}
          />
          <Button label="Registrar denúncia" onPress={() => void handleRegistrarDenuncia()} />
        </View>
      </Card>

      <Card padding="compact">
        <ThemedText type="subtitle">Novo risco NR-1</ThemedText>
        <Input label="Área / setor" value={areaSetor} onChangeText={setAreaSetor} placeholder="Ex.: Plataforma P-74" />
        <Input label="Tipo de risco" value={tipoRisco} onChangeText={setTipoRisco} placeholder="Ex.: Queda / químico" />
        <Input
          label="Descrição"
          value={descricaoRisco}
          onChangeText={setDescricaoRisco}
          multiline
          style={styles.textArea}
          placeholder="Descreva o risco identificado..."
        />
        <View style={styles.row2}>
          <Input
            label="Probabilidade (1-5)"
            value={probabilidade}
            onChangeText={setProbabilidade}
            keyboardType="number-pad"
          />
          <Input
            label="Severidade (1-5)"
            value={severidade}
            onChangeText={setSeveridade}
            keyboardType="number-pad"
          />
        </View>
        <Button label="Registrar risco" onPress={() => void handleRegistrarRisco()} />
      </Card>

      <Card padding="compact">
        <ThemedText type="subtitle">Novo plano de ação</ThemedText>
        <Input label="Origem" value={origemPlano} onChangeText={setOrigemPlano} placeholder="manual / denuncia / risco" />
        <Input
          label="Ação"
          value={descricaoPlano}
          onChangeText={setDescricaoPlano}
          multiline
          style={styles.textArea}
          placeholder="Descreva a ação corretiva..."
        />
        <Input label="Prazo (AAAA-MM-DD)" value={prazoPlano} onChangeText={setPrazoPlano} placeholder="2026-12-31" />
        <Button label="Criar plano" onPress={() => void handleRegistrarPlano()} />
      </Card>

      <Card padding="compact">
        <ThemedText type="subtitle">Últimas denúncias</ThemedText>
        {(dashboard?.denuncias ?? []).map((d) => (
          <View key={d.id} style={styles.row}>
            <ThemedText type="cardTitle">{d.id_relato}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {d.tipo_denuncia ? TIPO_DENUNCIA_LABELS[d.tipo_denuncia] : '—'} · {d.status}
            </ThemedText>
            <View style={styles.chipRow}>
              {STATUS_OPTIONS.map((status) => (
                <Pressable
                  key={status}
                  onPress={() => {
                    void atualizarStatusDenuncia(d.id, status)
                      .then(() => load())
                      .then(() => showToast('Status atualizado.', 'success'))
                      .catch((err: unknown) =>
                        showToast(err instanceof Error ? err.message : 'Erro ao atualizar.', 'error'),
                      );
                  }}
                  style={[styles.chip, d.status === status && styles.chipActive]}>
                  <ThemedText type="small">{status}</ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </Card>

      <Card padding="compact">
        <ThemedText type="subtitle">Riscos NR-1</ThemedText>
        {(dashboard?.riscos ?? []).map((risco) => (
          <View key={risco.id} style={styles.row}>
            <ThemedText type="cardTitle">{risco.id_risco}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {risco.nivel_risco ?? '—'} · {risco.status}
            </ThemedText>
            <ThemedText type="small">{risco.descricao}</ThemedText>
          </View>
        ))}
      </Card>

      <Card padding="compact">
        <ThemedText type="subtitle">Planos de ação</ThemedText>
        {(dashboard?.planos ?? []).map((plano) => (
          <View key={plano.id} style={styles.row}>
            <ThemedText type="cardTitle">{plano.id_acao}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {plano.status} · {plano.conclusao_pct}%
            </ThemedText>
            <ThemedText type="small">{plano.descricao_acao}</ThemedText>
            <View style={styles.actions}>
              {[25, 50, 75, 100].map((pct) => (
                <Button
                  key={pct}
                  size="sm"
                  variant="secondary"
                  label={`${pct}%`}
                  onPress={() => {
                    void atualizarProgressoPlanoAcao(plano.id, pct)
                      .then(() => load())
                      .then(() => showToast('Progresso atualizado.', 'success'))
                      .catch((err: unknown) =>
                        showToast(err instanceof Error ? err.message : 'Erro ao atualizar.', 'error'),
                      );
                  }}
                />
              ))}
            </View>
          </View>
        ))}
      </Card>
    </TabScreenContainer>
  );
}

function ComplianceMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: SemanticTone;
}) {
  const theme = useTheme();
  const palette = tone ? theme.semantic[tone === 'accent' ? 'accent' : tone] : null;

  return (
    <Card
      padding="compact"
      variant="elevated"
      style={[
        styles.metric,
        theme.shadow.card,
        {
          backgroundColor: palette?.bg ?? theme.backgroundElement,
          borderWidth: 1,
          borderColor: palette?.border ?? theme.border,
          borderRadius: layout.radius.md,
        },
      ]}>
      <View style={styles.metricBody}>
        <ThemedText
          type="small"
          style={[palette ? { color: palette.text, fontFamily: Fonts.sansMedium } : undefined]}
          themeColor={palette ? undefined : 'textSecondary'}>
          {label}
        </ThemedText>
        <ThemedText type="subtitle">{value}</ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { gap: layout.space.lg },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.space.sm,
  },
  metric: {
    flex: 1,
    minWidth: 140,
  },
  metricBody: {
    gap: layout.space.xs,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.space.sm },
  row: {
    paddingVertical: layout.space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  row2: { flexDirection: 'row', gap: layout.space.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    opacity: 0.85,
  },
  chipActive: {
    opacity: 1,
    borderWidth: 1.5,
  },
});
