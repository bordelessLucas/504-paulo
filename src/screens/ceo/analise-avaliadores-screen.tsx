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
  fetchGerencialDashboard,
  type GerencialDashboardData,
} from '@/features/gerencial/dashboard-api';

export function AnaliseAvaliadoresScreen() {
  const [data, setData] = useState<GerencialDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setData(await fetchGerencialDashboard());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar análise.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Análise dos Avaliadores"
        description="Preenchimento e pendências por gestor/supervisor no ciclo atual."
      />

      {isLoading ? <SkeletonLoader /> : null}
      {error ? (
        <ThemedText themeColor="danger" type="small">
          {error}
        </ThemedText>
      ) : null}

      {data?.statusPreenchimento.map((gestor) => {
        const concluidos = Math.max(gestor.total - gestor.pendentes, 0);
        const pct = gestor.total > 0 ? Math.round((concluidos / gestor.total) * 100) : 0;
        return (
          <GlassCard key={gestor.id} padding="compact">
            <View style={styles.headerRow}>
              <ThemedText type="smallBold" style={styles.flex}>
                {gestor.nome}
              </ThemedText>
              <StatusBadge
                label={`${pct}%`}
                tone={pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'danger'}
                size="sm"
              />
            </View>
            <ThemedText themeColor="textSecondary" type="small">
              {gestor.departamento ?? gestor.role} · {gestor.cicloLabel}
            </ThemedText>
            <ThemedText type="small">
              Concluídas: {concluidos} / {gestor.total} · Pendentes: {gestor.pendentes}
            </ThemedText>
          </GlassCard>
        );
      })}
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
