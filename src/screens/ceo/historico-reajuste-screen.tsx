import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { GlassCard } from '@/components/premium/GlassCard';
import { StatusBadge } from '@/components/premium/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { layout } from '@/constants/theme';
import {
  fetchStatusSolicitacoes,
  type SolicitacaoStatusRow,
} from '@/features/desempenho/historico-api';

export function HistoricoReajusteScreen() {
  const [rows, setRows] = useState<SolicitacaoStatusRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setRows(await fetchStatusSolicitacoes());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar histórico.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Histórico de Reajuste"
        description="Linha do tempo de solicitações de melhoria salarial e autoavaliação."
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
              {row.colaboradorNome}
            </ThemedText>
            <StatusBadge label={row.status} tone="neutral" size="sm" />
          </View>
          <ThemedText themeColor="textSecondary" type="small">
            {row.dataSolicitacao.slice(0, 10)} · {row.tipoSolicitacao ?? 'Reajuste'}
          </ThemedText>
          {row.valorEstimado != null ? (
            <ThemedText type="small">
              R$ {Number(row.valorEstimado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </ThemedText>
          ) : null}
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
