import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { Card, Text, useTheme as usePaperTheme } from 'react-native-paper';

import { EstrategicoCadastroPanel } from '@/components/estrategico/estrategico-cadastro-panel';
import { EstrategicoRankingPanel } from '@/components/gerencial/estrategico-ranking-panel';
import { ImaGaugeChart } from '@/components/gerencial/ima-gauge-chart';
import { RadarDesempenhoChart } from '@/components/gerencial/radar-desempenho-chart';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { layout } from '@/constants/theme';
import { fetchGerencialDashboard, type GerencialDashboardData } from '@/features/gerencial/dashboard-api';
import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';

/**
 * Painel estratégico da diretoria — radar, rankings e cadastro de potencial/sucessão.
 */
export function VisaoEstrategicaScreen() {
  const paperTheme = usePaperTheme();
  const isDesktopLayout = useIsDesktopLayout();
  const [data, setData] = useState<GerencialDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setData(await fetchGerencialDashboard());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar visão estratégica.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (isLoading && !data) {
    return (
      <TabScreenContainer scrollable contentContainerStyle={styles.content}>
        <SkeletonLoader variant="title" />
        <SkeletonLoader variant="chart" height={240} />
        <SkeletonLoader variant="list-item" count={5} />
      </TabScreenContainer>
    );
  }

  if (error && !data) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="danger">{error}</ThemedText>
        <Button label="Tentar novamente" variant="secondary" onPress={() => void load()} />
      </ThemedView>
    );
  }

  return (
    <TabScreenContainer
      scrollable
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void load()} />}>
      <View style={styles.header}>
        <Text
          variant="headlineSmall"
          style={{ color: paperTheme.colors.onBackground, fontWeight: '700' }}>
          Visão Estratégica
        </Text>
        <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
          Comparativo de seções offshore, ranking e cadastro de potencial/sucessão.
        </Text>
      </View>

      <EstrategicoCadastroPanel onChanged={() => void load()} />

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" style={{ color: paperTheme.colors.onSurface }}>
            Radar offshore (12 eixos)
          </Text>
          <RadarDesempenhoChart
            labels={data?.radarOffshore.labels ?? []}
            valores={data?.radarOffshore.valores ?? []}
            size={isDesktopLayout ? 320 : 280}
          />
        </Card.Content>
      </Card>

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" style={{ color: paperTheme.colors.onSurface }}>
            IMA consolidado
          </Text>
          <ImaGaugeChart ima={data?.ima ?? null} size={isDesktopLayout ? 300 : 260} />
        </Card.Content>
      </Card>

      <View style={[styles.rankingsRow, isDesktopLayout && styles.rankingsRowDesktop]}>
        <Card mode="elevated" style={[styles.card, styles.rankingCard]}>
          <Card.Content style={styles.cardContent}>
            <EstrategicoRankingPanel
              title="Top 5 colaboradores"
              items={data?.top5 ?? []}
              tone="top"
            />
          </Card.Content>
        </Card>

        <Card mode="elevated" style={[styles.card, styles.rankingCard]}>
          <Card.Content style={styles.cardContent}>
            <EstrategicoRankingPanel
              title="Bottom 5 colaboradores"
              items={data?.bottom5 ?? []}
              tone="bottom"
            />
          </Card.Content>
        </Card>
      </View>
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.space.lg,
  },
  header: {
    gap: layout.space.xs,
  },
  card: {
    borderRadius: layout.radius.lg,
  },
  cardContent: {
    gap: layout.space.md,
  },
  rankingsRow: {
    gap: layout.space.lg,
  },
  rankingsRowDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rankingCard: {
    flex: 1,
    minWidth: 280,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.space.xl,
    gap: layout.space.md,
  },
});
