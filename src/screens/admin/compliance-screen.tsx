import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import {
  fetchDashboardCompliance,
  registrarDenuncia,
  TIPO_DENUNCIA_LABELS,
  type TipoDenuncia,
} from '@/features/compliance/api';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useTheme } from '@/hooks/use-theme';
import { useToast } from '@/components/ui/toast';

export function ComplianceScreen() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof fetchDashboardCompliance>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoDenuncia>('outros');
  const [anonimo, setAnonimo] = useState(false);
  const { scrollPaddingBottom } = useTabScreenLayout();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setDashboard(await fetchDashboardCompliance());
    } catch {
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function handleRegistrar() {
    if (descricao.trim().length < 10) {
      showToast('Descreva a denúncia com pelo menos 10 caracteres.', 'error');
      return;
    }
    try {
      await registrarDenuncia({ tipo, descricao, anonimo });
      setDescricao('');
      showToast('Denúncia registrada. Prazo de resposta: 72h.', 'success');
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao registrar.', 'error');
    }
  }

  if (isLoading && !dashboard) {
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
        <ThemedText type="title">Compliance & Denúncias</ThemedText>
        <ThemedText themeColor="textSecondary">
          Canal de denúncias, riscos NR1 e planos de ação. Acesso restrito — LGPD.
        </ThemedText>

        {dashboard ? (
          <View style={styles.metricsRow}>
            <Metric label="Denúncias" value={String(dashboard.totalDenuncias)} />
            <Metric label="Abertas" value={String(dashboard.abertas)} />
            <Metric label="Riscos NR1" value={String(dashboard.totalRiscos)} />
            <Metric label="Planos pendentes" value={String(dashboard.planosPendentes)} />
          </View>
        ) : null}

        <View style={[styles.card, { borderColor: theme.border }]}>
          <ThemedText type="subtitle">Nova denúncia</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.hint}>
            Tipos: {Object.values(TIPO_DENUNCIA_LABELS).join(' · ')}
          </ThemedText>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="Descreva o relato com detalhes..."
            placeholderTextColor={theme.textSecondary}
            multiline
            value={descricao}
            onChangeText={setDescricao}
          />
          <View style={styles.actions}>
            <Button
              label={anonimo ? 'Anônimo: sim' : 'Anônimo: não'}
              variant="secondary"
              onPress={() => setAnonimo((v) => !v)}
            />
            <Button label="Registrar denúncia" onPress={() => void handleRegistrar()} />
          </View>
        </View>

        <View style={[styles.card, { borderColor: theme.border }]}>
          <ThemedText type="subtitle">Últimas denúncias</ThemedText>
          {(dashboard?.denuncias ?? []).map((d) => (
            <View key={d.id} style={[styles.row, { borderColor: theme.border }]}>
              <ThemedText style={styles.rowTitle}>{d.id_relato}</ThemedText>
              <ThemedText themeColor="textSecondary">
                {d.tipo_denuncia ? TIPO_DENUNCIA_LABELS[d.tipo_denuncia] : '—'} · {d.status}
              </ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.metric, { borderColor: theme.border }]}>
      <ThemedText themeColor="textSecondary" style={styles.metricLabel}>
        {label}
      </ThemedText>
      <ThemedText type="subtitle">{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.four, gap: Spacing.four },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  metric: {
    flex: 1,
    minWidth: 120,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  metricLabel: { fontSize: 12 },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  hint: { fontSize: 13 },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    textAlignVertical: 'top',
    fontFamily: Fonts.sans,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  row: {
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowTitle: { fontFamily: Fonts.sansMedium },
});
