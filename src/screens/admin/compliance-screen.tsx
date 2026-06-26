import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Fonts, layout, type SemanticTone } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  fetchDashboardCompliance,
  registrarDenuncia,
  TIPO_DENUNCIA_LABELS,
  type TipoDenuncia,
} from '@/features/compliance/api';
import { useToast } from '@/components/ui/toast';

export function ComplianceScreen() {
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof fetchDashboardCompliance>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<TipoDenuncia>('outros');
  const [anonimo, setAnonimo] = useState(false);

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

  const metrics = useMemo(
    () =>
      dashboard
        ? [
            { label: 'Denúncias', value: String(dashboard.totalDenuncias), tone: 'neutral' as const },
            { label: 'Abertas', value: String(dashboard.abertas), tone: 'warning' as const },
            { label: 'Riscos NR1', value: String(dashboard.totalRiscos), tone: 'danger' as const },
            { label: 'Planos pendentes', value: String(dashboard.planosPendentes), tone: 'info' as const },
          ]
        : [],
    [dashboard],
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
    <TabScreenContainer
      scrollable
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void load()} />}>
      <ScreenHeader title="Compliance & Denúncias" />

      {metrics.length > 0 ? (
        <View style={styles.metricsRow}>
          {metrics.map((metric) => (
            <ComplianceMetric
              key={metric.label}
              label={metric.label}
              tone={metric.tone}
              value={metric.value}
            />
          ))}
        </View>
      ) : null}

      <Card padding="compact">
        <ThemedText type="subtitle">Nova denúncia</ThemedText>
        <Input
          label="Descrição"
          placeholder="Descreva o relato com detalhes..."
          multiline
          value={descricao}
          onChangeText={setDescricao}
          style={styles.textArea}
        />
        <View style={styles.actions}>
          <Button
            label={anonimo ? 'Anônimo: sim' : 'Anônimo: não'}
            variant="secondary"
            size="sm"
            onPress={() => setAnonimo((v) => !v)}
          />
          <Button label="Registrar denúncia" onPress={() => void handleRegistrar()} />
        </View>
      </Card>

      <Card padding="compact">
        <ThemedText type="subtitle">Últimas denúncias</ThemedText>
        {(dashboard?.denuncias ?? []).map((d) => (
          <View key={d.id} style={styles.row}>
            <ThemedText type="cardTitle">{d.id_relato}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {d.tipo_denuncia ? TIPO_DENUNCIA_LABELS[d.tipo_denuncia] : '—'} · {d.status}
            </ThemedText>
          </View>
        ))}
      </Card>
    </TabScreenContainer>
  );
}

function ComplianceMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: SemanticTone;
}) {
  const theme = useTheme();
  const palette = tone ? theme.semantic[tone === 'accent' ? 'accent' : tone] : null;

  return (
    <Card
      padding="compact"
      variant="elevated"
      style={[
        styles.metric,
        theme.shadow.card,
        {
          backgroundColor: palette?.bg ?? theme.backgroundElement,
          borderWidth: 1,
          borderColor: palette?.border ?? theme.border,
          borderRadius: layout.radius.md,
        },
      ]}>
      <View style={styles.metricBody}>
        <ThemedText
          type="small"
          style={[palette ? { color: palette.text, fontFamily: Fonts.sansMedium } : undefined]}
          themeColor={palette ? undefined : 'textSecondary'}>
          {label}
        </ThemedText>
        <ThemedText type="subtitle">{value}</ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { gap: layout.space.lg },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.space.sm,
  },
  metric: {
    flex: 1,
    minWidth: 140,
  },
  metricBody: {
    gap: layout.space.xs,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.space.sm },
  row: {
    paddingVertical: layout.space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
});
