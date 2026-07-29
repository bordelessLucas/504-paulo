import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { GlassCard } from '@/components/premium/GlassCard';
import { StatusBadge } from '@/components/premium/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { layout, Spacing } from '@/constants/theme';
import {
  createCargo,
  fetchCargos,
  setCargoAtivo,
  updateCargo,
  type CargoRow,
} from '@/features/rh/cargos-api';
import { useTheme } from '@/hooks/use-theme';

export function CadastroCargosScreen() {
  const theme = useTheme();
  const [rows, setRows] = useState<CargoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [codigoCbo, setCodigoCbo] = useState('');
  const [departamento, setDepartamento] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setRows(await fetchCargos());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cargos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  function resetForm() {
    setEditingId(null);
    setNome('');
    setCodigoCbo('');
    setDepartamento('');
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const payload = { nome, codigoCbo, departamento };
      if (editingId) {
        await updateCargo(editingId, payload);
      } else {
        await createCargo(payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cargo.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <TabScreenContainer
      scrollable
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void load()} />}>
      <ScreenHeader
        title="Cargos / Funções + CBO"
        description="Cadastro padronizado de cargos com código CBO (Excel 1.10)."
      />

      <GlassCard>
        <ThemedText type="smallBold">{editingId ? 'Editar cargo' : 'Novo cargo'}</ThemedText>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Nome do cargo/função"
          placeholderTextColor={theme.textSecondary}
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Código CBO"
          placeholderTextColor={theme.textSecondary}
          value={codigoCbo}
          onChangeText={setCodigoCbo}
        />
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Departamento"
          placeholderTextColor={theme.textSecondary}
          value={departamento}
          onChangeText={setDepartamento}
        />
        <View style={styles.actions}>
          <Button
            label={editingId ? 'Salvar' : 'Cadastrar'}
            onPress={() => void handleSave()}
            isLoading={isSaving}
          />
          {editingId ? (
            <Button label="Cancelar" variant="secondary" onPress={resetForm} />
          ) : null}
        </View>
      </GlassCard>

      {isLoading && rows.length === 0 ? <SkeletonLoader /> : null}
      {error ? (
        <ThemedText themeColor="danger" type="small">
          {error}
        </ThemedText>
      ) : null}

      {rows.map((row) => (
        <GlassCard key={row.id} padding="compact">
          <View style={styles.headerRow}>
            <ThemedText type="smallBold" style={styles.flex}>
              {row.nome}
            </ThemedText>
            <StatusBadge
              label={row.ativo ? 'Ativo' : 'Inativo'}
              tone={row.ativo ? 'success' : 'neutral'}
              size="sm"
            />
          </View>
          <ThemedText themeColor="textSecondary" type="small">
            CBO {row.codigoCbo ?? '—'}
            {row.departamento ? ` · ${row.departamento}` : ''}
          </ThemedText>
          <View style={styles.actions}>
            <Button
              label="Editar"
              variant="secondary"
              size="sm"
              onPress={() => {
                setEditingId(row.id);
                setNome(row.nome);
                setCodigoCbo(row.codigoCbo ?? '');
                setDepartamento(row.departamento ?? '');
              }}
            />
            <Button
              label={row.ativo ? 'Desativar' : 'Reativar'}
              variant="ghost"
              size="sm"
              onPress={() => void setCargoAtivo(row.id, !row.ativo).then(load)}
            />
          </View>
        </GlassCard>
      ))}
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: layout.space.lg,
    gap: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
});
