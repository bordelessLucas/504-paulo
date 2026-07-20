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

function toneForRisco(risco: string | null) {
  const value = (risco ?? '').toLowerCase();
  if (value.includes('crítico') || value.includes('critico')) return 'danger' as const;
  if (value.includes('médio') || value.includes('medio')) return 'warning' as const;
  if (value.includes('baixo')) return 'success' as const;
  return 'neutral' as const;
}

export function AnalisePerfilScreen() {
  const [rows, setRows] = useState<
    Array<{
      id: string;
      nome: string;
      funcao: string | null;
      perfilRisco: string | null;
      departamento: string | null;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchColaboradoresAtivosLista();
        setRows(
          data.map((row) => ({
            id: row.id,
            nome: row.nome,
            funcao: row.funcao,
            perfilRisco: row.perfilRisco,
            departamento: row.departamento,
          })),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar perfis.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Análise de Perfil Comportamental"
        description="Perfil de risco comportamental dos colaboradores ativos."
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
            <StatusBadge
              label={row.perfilRisco ?? 'Sem classificação'}
              tone={toneForRisco(row.perfilRisco)}
              size="sm"
            />
          </View>
          <ThemedText themeColor="textSecondary" type="small">
            {row.funcao ?? '—'} · {row.departamento ?? '—'}
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
