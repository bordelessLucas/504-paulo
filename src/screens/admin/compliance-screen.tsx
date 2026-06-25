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
import { Input } from '@/components/ui/input';
import { Spacing } from '@/constants/theme';
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
      <ScreenHeader
        title="Compliance & Denúncias"
        description="Canal de denúncias, riscos NR1 e planos de ação. Acesso restrito — LGPD."
      />

      {dashboard ? (
        <View style={styles.metricsRow}>
          <Metric label="Denúncias" value={String(dashboard.totalDenuncias)} />
          <Metric label="Abertas" value={String(dashboard.abertas)} />
          <Metric label="Riscos NR1" value={String(dashboard.totalRiscos)} />
          <Metric label="Planos pendentes" value={String(dashboard.planosPendentes)} />
        </View>
      ) : null}

      <Card padding="compact">
        <ThemedText type="subtitle">Nova denúncia</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Tipos: {Object.values(TIPO_DENUNCIA_LABELS).join(' · ')}
        </ThemedText>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="compact" style={styles.metric}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="subtitle">{value}</ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { gap: Spacing.four },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  metric: { flex: 1, minWidth: 120 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  row: {
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.half,
  },
});
