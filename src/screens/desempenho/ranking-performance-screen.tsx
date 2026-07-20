import { ColaboradorRankingList } from '@/components/gerencial/colaborador-ranking-list';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { ThemedText } from '@/components/themed-text';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { layout } from '@/constants/theme';
import {
  fetchGerencialDashboard,
  type GerencialDashboardData,
} from '@/features/gerencial/dashboard-api';
import { StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';

export function RankingPerformanceScreen() {
  const [data, setData] = useState<GerencialDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setData(await fetchGerencialDashboard());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar ranking.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Ranking de Performance"
        description="Top e bottom performers com base no IMA consolidado."
      />

      {isLoading ? <SkeletonLoader /> : null}
      {error ? (
        <ThemedText themeColor="danger" type="small">
          {error}
        </ThemedText>
      ) : null}

      {data ? (
        <>
          <ColaboradorRankingList
            title="Top 5"
            items={data.top5}
            exportingId={null}
            onExport={() => undefined}
          />
          <ColaboradorRankingList
            title="Bottom 5"
            items={data.bottom5}
            exportingId={null}
            onExport={() => undefined}
          />
          <ColaboradorRankingList
            title="Ranking completo"
            items={data.rankingCompleto}
            exportingId={null}
            onExport={() => undefined}
          />
        </>
      ) : null}
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.space.md,
    paddingBottom: layout.space.xxl,
  },
});
