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
import { DesempenhoSemaforo } from '@/components/gerencial/desempenho-semaforo';
import { RadarDesempenhoChart } from '@/components/gerencial/radar-desempenho-chart';
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
import { useTheme } from '@/hooks/use-theme';

function DashboardCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <ThemedText type="subtitle">{title}</ThemedText>
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
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadDashboard({ refreshing: true })}
            />
          }
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="heading">Dashboards gerenciais</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Visão executiva do desempenho por departamento e ranking de colaboradores.
            </ThemedText>
          </View>

          <DashboardCard title="Desempenho por departamento">
            <ThemedText themeColor="textSecondary" style={styles.hint}>
              Média das notas por departamento (escala 0 a 5) — 12 áreas da empresa.
            </ThemedText>
            <RadarDesempenhoChart
              labels={data?.radarLabels ?? []}
              valores={data?.radarValores ?? []}
            />
          </DashboardCard>

          <DashboardCard title="Semáforo de desempenho">
            <DesempenhoSemaforo
              mediaEmpresa={data?.mediaEmpresa ?? null}
              status={data?.semaforoStatus ?? 'cinza'}
            />
          </DashboardCard>

          <DashboardCard title="Top 5 colaboradores">
            <ColaboradorRankingList
              exportingId={exportingId}
              items={data?.top5 ?? []}
              title="Mais bem avaliados"
              onExport={(colaborador) => void handleExportFicha(colaborador)}
            />
          </DashboardCard>

          <DashboardCard title="Bottom 5 colaboradores">
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
    paddingBottom: Spacing.six,
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
  hint: {
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
