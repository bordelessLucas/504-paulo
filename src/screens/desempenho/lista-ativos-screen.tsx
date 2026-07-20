import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { GlassCard } from '@/components/premium/GlassCard';
import { StatusBadge } from '@/components/premium/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { layout } from '@/constants/theme';
import { fetchColaboradoresAtivosLista } from '@/features/desempenho/historico-api';

export function ListaAtivosScreen() {
  const [rows, setRows] = useState<
    Array<{
      id: string;
      nome: string;
      funcao: string | null;
      departamento: string | null;
      nivelIrata: string | null;
      dataAdmissao: string | null;
      perfilRisco: string | null;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setRows(await fetchColaboradoresAtivosLista());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar ativos.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Lista de Colaboradores — Ativos"
        description="Colaboradores ativos para análise anual e acompanhamento."
      />

      {isLoading ? <SkeletonLoader /> : null}
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
            <StatusBadge label="Ativo" tone="success" size="sm" />
          </View>
          <ThemedText themeColor="textSecondary" type="small">
            {row.funcao ?? '—'} · {row.departamento ?? '—'} · IRATA {row.nivelIrata ?? '—'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            Admissão: {row.dataAdmissao ?? '—'}
            {row.perfilRisco ? ` · Risco: ${row.perfilRisco}` : ''}
          </ThemedText>
        </GlassCard>
      ))}
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.space.md,
    paddingBottom: layout.space.xxl,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: layout.space.sm },
  flex: { flex: 1 },
});
