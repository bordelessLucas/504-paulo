import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ColaboradorRankingList } from '@/components/gerencial/colaborador-ranking-list';
import { ImaGaugeChart } from '@/components/gerencial/ima-gauge-chart';
import { RadarDesempenhoChart } from '@/components/gerencial/radar-desempenho-chart';
import { StatusPreenchimentoList } from '@/components/gerencial/status-preenchimento-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  fetchColaboradorFicha,
  fetchGerencialDashboard,
  type ColaboradorRanking,
  type GerencialDashboardData,
} from '@/features/gerencial/dashboard-api';
import { exportColaboradorFichaPdf } from '@/features/gerencial/export-ficha-pdf';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useTheme } from '@/hooks/use-theme';

function DashboardCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.background, borderColor: theme.border },
      ]}>
      <View style={styles.cardHeader}>
        <ThemedText type="subtitle">{title}</ThemedText>
        {description ? (
          <ThemedText themeColor="textSecondary" style={styles.cardDescription}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function DashboardsGerenciaisScreen() {
  const { showToast } = useToast();
  const [data, setData] = useState<GerencialDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { scrollPaddingBottom } = useTabScreenLayout();

  const loadDashboard = useCallback(async (options?: { refreshing?: boolean }) => {
    if (options?.refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const dashboard = await fetchGerencialDashboard();
      setData(dashboard);
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
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: scrollPaddingBottom }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadDashboard({ refreshing: true })}
            />
          }
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="heading">Dashboard executivo</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Visão consolidada da metodologia 360° com as 3 perguntas universais e o Índice Médio
              de Avaliação (IMA).
            </ThemedText>
          </View>

          <DashboardCard
            title="Radar de desempenho"
            description="Média geral da empresa nas 3 perguntas universais da metodologia 360°.">
            <RadarDesempenhoChart
              labels={data?.radarUniversal.labels ?? []}
              valores={data?.radarUniversal.valores ?? []}
            />
          </DashboardCard>

          <DashboardCard
            title="Velocímetro IMA"
            description="Média global de performance dos colaboradores ativos, com faixas do semáforo na escala 0 a 3.">
            <ImaGaugeChart ima={data?.ima ?? null} />
          </DashboardCard>

          <DashboardCard
            title="Status de preenchimento"
            description="Acompanhamento das avaliações pendentes por supervisor (quinzena) e gestor (semestre), por departamento.">
            <StatusPreenchimentoList items={data?.statusPreenchimento ?? []} />
          </DashboardCard>

          <DashboardCard
            title="Top 5 colaboradores"
            description="Colaboradores com melhor média geral no período.">
            <ColaboradorRankingList
              exportingId={exportingId}
              items={data?.top5 ?? []}
              title="Mais bem avaliados"
              onExport={(colaborador) => void handleExportFicha(colaborador)}
            />
          </DashboardCard>

          <DashboardCard
            title="Bottom 5 colaboradores"
            description="Colaboradores com menor média geral — útil para planos de melhoria.">
            <ColaboradorRankingList
              exportingId={exportingId}
              items={data?.bottom5 ?? []}
              title="Menor desempenho"
              onExport={(colaborador) => void handleExportFicha(colaborador)}
            />
          </DashboardCard>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth + 200,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.two,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardHeader: {
    gap: Spacing.one,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
