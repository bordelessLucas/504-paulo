import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { PDICard } from '@/components/pdi/PDICard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import type { PlanoDesenvolvimento } from '@/features/pdi/types';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useTheme } from '@/hooks/use-theme';
import type { ColaboradorStackParamList } from '@/navigation/colaborador-stack';
import {
  buscarMetricasColaborador,
  buscarPDIsDoColaborador,
} from '@/services/pdiService';

type NavigationProp = NativeStackNavigationProp<ColaboradorStackParamList, 'PDIList'>;

function MetricCard({ label, value }: { label: string; value: number }) {
  const theme = useTheme();

  return (
    <View style={[styles.metricCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <ThemedText style={styles.metricValue}>{value}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.metricLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

export function PDIListColaboradorScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const theme = useTheme();
  const { scrollPaddingBottom } = useTabScreenLayout();

  const [pdis, setPdis] = useState<PlanoDesenvolvimento[]>([]);
  const [metricas, setMetricas] = useState({ concluidosAno: 0, emAndamento: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (options?: { refreshing?: boolean }) => {
      if (!user) {
        return;
      }

      if (options?.refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const [lista, stats] = await Promise.all([
          buscarPDIsDoColaborador(user.id),
          buscarMetricasColaborador(user.id),
        ]);

        setPdis(lista);
        setMetricas(stats);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar PDIs.');
      } finally {
        if (options?.refreshing) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const grupos = useMemo(() => {
    const ativos = pdis.filter((item) => ['aberto', 'em_andamento'].includes(item.status));
    const concluidos = pdis.filter((item) => item.status === 'concluido');
    const encerrados = pdis.filter((item) => ['cancelado', 'vencido'].includes(item.status));

    return { ativos, concluidos, encerrados };
  }, [pdis]);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: scrollPaddingBottom }]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void loadData({ refreshing: true })} />
        }>
        <ThemedText type="heading">Meus planos de desenvolvimento</ThemedText>

        {error ? (
          <View style={styles.centered}>
            <ThemedText themeColor="danger">{error}</ThemedText>
            <Button label="Tentar novamente" variant="secondary" onPress={() => void loadData()} />
          </View>
        ) : null}

        <View style={styles.metrics}>
          <MetricCard label="Concluídos no ano" value={metricas.concluidosAno} />
          <MetricCard label="Em andamento" value={metricas.emAndamento} />
        </View>

        <Section
          title="Ativos"
          empty="Nenhum plano ativo no momento."
          items={grupos.ativos}
          onOpen={(pdiId) => navigation.navigate('PDIDetail', { pdiId })}
        />
        <Section
          title="Concluídos"
          empty="Nenhum PDI concluído ainda."
          items={grupos.concluidos}
          onOpen={(pdiId) => navigation.navigate('PDIDetail', { pdiId })}
        />
        <Section
          title="Cancelados / Vencidos"
          empty="Nenhum PDI encerrado."
          items={grupos.encerrados}
          onOpen={(pdiId) => navigation.navigate('PDIDetail', { pdiId })}
        />
      </ScrollView>
    </ThemedView>
  );
}

function Section({
  title,
  empty,
  items,
  onOpen,
}: {
  title: string;
  empty: string;
  items: PlanoDesenvolvimento[];
  onOpen: (pdiId: string) => void;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.section, { borderColor: theme.border }]}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {items.length === 0 ? (
        <ThemedText themeColor="textSecondary">{empty}</ThemedText>
      ) : (
        items.map((pdi) => (
          <PDICard key={pdi.id} compact hideCriador pdi={pdi} onPress={() => onOpen(pdi.id)} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  metrics: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
  },
  metricValue: {
    fontFamily: Fonts.sansBold,
    fontSize: 24,
    lineHeight: 28,
  },
  metricLabel: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  section: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
