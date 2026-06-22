import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import {
  fetchDashboardExecutivo,
  NINE_BOX_LABELS,
  type DashboardExecutivoData,
} from '@/features/executivo/api';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useTheme } from '@/hooks/use-theme';

function MetricCard({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.metricCard, { borderColor: theme.border, backgroundColor: theme.background }]}>
      <ThemedText themeColor="textSecondary" style={styles.metricLabel}>
        {label}
      </ThemedText>
      <ThemedText type="subtitle">{value}</ThemedText>
    </View>
  );
}

export function VisaoEstrategicaScreen() {
  const theme = useTheme();
  const [data, setData] = useState<DashboardExecutivoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { scrollPaddingBottom } = useTabScreenLayout();

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await fetchDashboardExecutivo());
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
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: scrollPaddingBottom }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void load()} />}>
        <ThemedText type="title">Visão Estratégica</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Nine Box, sucessão, riscos de turnover e consolidado de performance.
        </ThemedText>

        {error ? (
          <View style={styles.errorBox}>
            <ThemedText style={{ color: theme.danger }}>{error}</ThemedText>
            <Button label="Tentar novamente" variant="secondary" onPress={() => void load()} />
          </View>
        ) : null}

        {data ? (
          <>
            <View style={styles.metricsRow}>
              <MetricCard label="Colaboradores" value={String(data.totalColaboradores)} />
              <MetricCard
                label="IMA médio"
                value={data.imaMedio !== null ? data.imaMedio.toFixed(2) : '—'}
              />
              <MetricCard label="% Alta perf." value={`${data.pctAltaPerformance}%`} />
              <MetricCard label="% Crítico" value={`${data.pctCritico}%`} />
            </View>

            <Section title="Nine Box — amostra">
              {data.nineBox.slice(0, 15).map((item) => (
                <View key={item.id} style={[styles.row, { borderColor: theme.border }]}>
                  <View style={styles.rowMain}>
                    <ThemedText style={styles.rowTitle}>{item.nome}</ThemedText>
                    <ThemedText themeColor="textSecondary" style={styles.rowMeta}>
                      IMA {item.ima?.toFixed(2) ?? '—'} · {NINE_BOX_LABELS[item.quadrante]}
                    </ThemedText>
                  </View>
                  <ThemedText themeColor="textSecondary" style={styles.acao}>
                    {item.acao}
                  </ThemedText>
                </View>
              ))}
            </Section>

            <Section title="Riscos de turnover / retenção">
              {data.riscos.slice(0, 10).map((item) => (
                <View key={item.id} style={[styles.row, { borderColor: theme.border }]}>
                  <ThemedText style={styles.rowTitle}>{item.nome}</ThemedText>
                  <ThemedText themeColor="textSecondary">
                    IMA {item.imaAtual?.toFixed(2) ?? '—'} · Risco: {item.risco}
                  </ThemedText>
                </View>
              ))}
            </Section>

            <Section title="Plano de sucessão">
              {data.sucessao.length === 0 ? (
                <ThemedText themeColor="textSecondary">
                  Nenhuma posição cadastrada. Use o painel RH para registrar sucessores.
                </ThemedText>
              ) : (
                data.sucessao.map((item) => (
                  <View key={item.id} style={[styles.row, { borderColor: theme.border }]}>
                    <ThemedText style={styles.rowTitle}>{item.posicaoChave}</ThemedText>
                    <ThemedText themeColor="textSecondary">
                      Titular: {item.titularNome ?? '—'} · S1: {item.sucessor1Nome ?? '—'} (
                      {item.prontidaoS1 ?? '—'})
                    </ThemedText>
                  </View>
                ))
              )}
            </Section>

            <Section title="Por departamento">
              {data.porDepartamento.map((dept) => (
                <View key={dept.departamento} style={[styles.row, { borderColor: theme.border }]}>
                  <ThemedText style={styles.rowTitle}>{dept.departamento}</ThemedText>
                  <ThemedText themeColor="textSecondary">
                    {dept.total} colab. · IMA {dept.imaMedio?.toFixed(2) ?? '—'}
                  </ThemedText>
                </View>
              ))}
            </Section>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.section, { borderColor: theme.border }]}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.four, gap: Spacing.four },
  subtitle: { marginTop: Spacing.one },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  metricCard: {
    flex: 1,
    minWidth: 140,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.one,
  },
  metricLabel: { fontSize: 12, fontFamily: Fonts.sansMedium },
  section: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionBody: { gap: Spacing.two },
  row: {
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  rowMain: { gap: 2 },
  rowTitle: { fontFamily: Fonts.sansMedium },
  rowMeta: { fontSize: 13 },
  acao: { fontSize: 12 },
  errorBox: { gap: Spacing.two },
});
