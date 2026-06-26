import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import {
  fetchDashboardExecutivo,
  NINE_BOX_LABELS,
  type DashboardExecutivoData,
} from '@/features/executivo/api';
import { useTheme } from '@/hooks/use-theme';

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="compact" style={styles.metricCard}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="subtitle">{value}</ThemedText>
    </Card>
  );
}

export function VisaoEstrategicaScreen() {
  const theme = useTheme();
  const [data, setData] = useState<DashboardExecutivoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <TabScreenContainer
      scrollable
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void load()} />}>
      <ScreenHeader title="Visão Estratégica" />

      {error ? (
        <View style={styles.errorBox}>
          <ThemedText themeColor="danger">{error}</ThemedText>
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
                  <ThemedText type="cardTitle">{item.nome}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    IMA {item.ima?.toFixed(2) ?? '—'} · {NINE_BOX_LABELS[item.quadrante]}
                  </ThemedText>
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.acao}
                </ThemedText>
              </View>
            ))}
          </Section>

          <Section title="Riscos de turnover / retenção">
            {data.riscos.slice(0, 10).map((item) => (
              <View key={item.id} style={[styles.row, { borderColor: theme.border }]}>
                <ThemedText type="cardTitle">{item.nome}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  IMA {item.imaAtual?.toFixed(2) ?? '—'} · Risco: {item.risco}
                </ThemedText>
              </View>
            ))}
          </Section>

          <Section title="Plano de sucessão">
            {data.sucessao.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Nenhuma posição cadastrada. Use o painel RH para registrar sucessores.
              </ThemedText>
            ) : (
              data.sucessao.map((item) => (
                <View key={item.id} style={[styles.row, { borderColor: theme.border }]}>
                  <ThemedText type="cardTitle">{item.posicaoChave}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
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
                <ThemedText type="cardTitle">{dept.departamento}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {dept.total} colab. · IMA {dept.imaMedio?.toFixed(2) ?? '—'}
                </ThemedText>
              </View>
            ))}
          </Section>
        </>
      ) : null}
    </TabScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card padding="compact">
      <ThemedText type="subtitle">{title}</ThemedText>
      <View style={styles.sectionBody}>{children}</View>
    </Card>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { gap: Spacing.four },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  metricCard: { flex: 1, minWidth: 140 },
  sectionBody: { gap: Spacing.two },
  row: {
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.half,
  },
  rowMain: { gap: Spacing.half },
  errorBox: { gap: Spacing.two },
});
