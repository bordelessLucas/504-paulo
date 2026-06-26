import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { ColaboradorRankingList } from '@/components/gerencial/colaborador-ranking-list';
import { PdiExecutivoCard } from '@/components/pdi/PdiExecutivoCard';
import { ExportacaoFichaPanel } from '@/components/gerencial/exportacao-ficha-panel';
import { ImaGaugeChart } from '@/components/gerencial/ima-gauge-chart';
import { RadarDesempenhoChart } from '@/components/gerencial/radar-desempenho-chart';
import { StatusPreenchimentoList } from '@/components/gerencial/status-preenchimento-list';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { Spacing } from '@/constants/theme';
import {
  fetchColaboradorFicha,
  fetchGerencialDashboard,
  type ColaboradorRanking,
  type GerencialDashboardData,
} from '@/features/gerencial/dashboard-api';
import { exportColaboradorFichaPdf } from '@/features/gerencial/export-ficha-pdf';
import type { PdiEstatisticas } from '@/features/pdi/types';
import { buscarEstatisticasPDI } from '@/services/pdiService';
import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';

function DashboardCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card padding="compact">
      <ThemedText type="subtitle">{title}</ThemedText>
      {children}
    </Card>
  );
}

export function DashboardsGerenciaisScreen() {
  const { showToast } = useToast();
  const isDesktopLayout = useIsDesktopLayout();
  const [data, setData] = useState<GerencialDashboardData | null>(null);
  const [pdiStats, setPdiStats] = useState<PdiEstatisticas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (options?: { refreshing?: boolean }) => {
    if (options?.refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const [dashboard, stats] = await Promise.all([
        fetchGerencialDashboard(),
        buscarEstatisticasPDI().catch(() => null),
      ]);
      setData(dashboard);
      setPdiStats(stats);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Erro ao carregar dashboards gerenciais.',
      );
    } finally {
      if (options?.refreshing) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  const handleExportFicha = useCallback(
    async (colaborador: ColaboradorRanking) => {
      setExportingId(colaborador.id);

      try {
        const ficha = await fetchColaboradorFicha(colaborador.id);
        await exportColaboradorFichaPdf(ficha);
        showToast(`Ficha de ${colaborador.nome} exportada.`, 'success');
      } catch (exportError) {
        showToast(
          exportError instanceof Error
            ? exportError.message
            : 'Não foi possível exportar a ficha em PDF.',
          'error',
        );
      } finally {
        setExportingId(null);
      }
    },
    [showToast],
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="danger">{error}</ThemedText>
        <Button label="Tentar novamente" variant="secondary" onPress={() => void loadDashboard()} />
      </ThemedView>
    );
  }

  return (
    <TabScreenContainer
      scrollable
      contentContainerStyle={[styles.content, isDesktopLayout && styles.contentDesktop]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void loadDashboard({ refreshing: true })}
        />
      }>
      <ScreenHeader title="Dashboard executivo" />

      <View style={[styles.cardsGrid, isDesktopLayout && styles.cardsGridDesktop]}>
            <View style={isDesktopLayout ? styles.cardSlotDesktopWide : undefined}>
          <DashboardCard title="Exportação de fichas PDF">
            <ExportacaoFichaPanel
              exportingId={exportingId}
              onExportingChange={setExportingId}
              onExported={(message) => showToast(message, 'success')}
              onError={(message) => showToast(message, 'error')}
            />
          </DashboardCard>
            </View>

            <View style={isDesktopLayout ? styles.cardSlotDesktop : undefined}>
          <DashboardCard title="Radar offshore (12 eixos)">
            <RadarDesempenhoChart
              labels={data?.radarOffshore.labels ?? []}
              valores={data?.radarOffshore.valores ?? []}
            />
          </DashboardCard>
            </View>

            <View style={isDesktopLayout ? styles.cardSlotDesktop : undefined}>
          <DashboardCard title="Radar legado (3 eixos)">
            <RadarDesempenhoChart
              labels={data?.radarUniversal.labels ?? []}
              valores={data?.radarUniversal.valores ?? []}
            />
          </DashboardCard>
            </View>

            <View style={isDesktopLayout ? styles.cardSlotDesktop : undefined}>
          <DashboardCard title="Velocímetro IMA">
            <ImaGaugeChart ima={data?.ima ?? null} />
          </DashboardCard>
            </View>

            <View style={isDesktopLayout ? styles.cardSlotDesktopWide : undefined}>
          <DashboardCard title="Saúde dos PDIs">
            {pdiStats ? <PdiExecutivoCard stats={pdiStats} /> : null}
          </DashboardCard>
            </View>

            <View style={isDesktopLayout ? styles.cardSlotDesktopWide : undefined}>
          <DashboardCard title="Status de preenchimento">
            <StatusPreenchimentoList items={data?.statusPreenchimento ?? []} />
          </DashboardCard>
            </View>

            <View style={isDesktopLayout ? styles.cardSlotDesktop : undefined}>
          <DashboardCard title="Top 5 colaboradores">
            <ColaboradorRankingList
              exportingId={exportingId}
              items={data?.top5 ?? []}
              title="Mais bem avaliados"
              onExport={(colaborador) => void handleExportFicha(colaborador)}
            />
          </DashboardCard>
            </View>

            <View style={isDesktopLayout ? styles.cardSlotDesktop : undefined}>
          <DashboardCard title="Bottom 5 colaboradores">
            <ColaboradorRankingList
              exportingId={exportingId}
              items={data?.bottom5 ?? []}
              title="Menor desempenho"
              onExport={(colaborador) => void handleExportFicha(colaborador)}
            />
          </DashboardCard>
            </View>

            <View style={isDesktopLayout ? styles.cardSlotDesktopWide : undefined}>
          <DashboardCard title="Ranking completo">
            <ColaboradorRankingList
              exportingId={exportingId}
              items={data?.rankingCompleto ?? []}
              title="Ranking geral"
              onExport={(colaborador) => void handleExportFicha(colaborador)}
            />
          </DashboardCard>
            </View>
          </View>
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
    width: '100%',
  },
  contentDesktop: {
    alignSelf: 'stretch',
  },
  cardsGrid: {
    gap: Spacing.four,
  },
  cardsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  cardSlotDesktop: {
    flexGrow: 1,
    flexBasis: '48%',
    minWidth: 360,
  },
  cardSlotDesktopWide: {
    flexGrow: 1,
    flexBasis: '100%',
    minWidth: 360,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
