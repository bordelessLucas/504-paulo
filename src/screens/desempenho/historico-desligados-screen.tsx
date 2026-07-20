import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { GlassCard } from '@/components/premium/GlassCard';
import { MetricStrip } from '@/components/premium/MetricStrip';
import { StatusBadge } from '@/components/premium/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { Input } from '@/components/ui/input';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { layout } from '@/constants/theme';
import {
  fetchColaboradoresDesligados,
  type DesligadoRow,
} from '@/features/desempenho/historico-api';

export function HistoricoDesligadosScreen() {
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [rows, setRows] = useState<DesligadoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchColaboradoresDesligados(Number(ano) || undefined);
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar desligados.');
    } finally {
      setIsLoading(false);
    }
  }, [ano]);

  useEffect(() => {
    void load();
  }, [load]);

  const metrics = useMemo(() => {
    const comJusta = rows.filter((r) => (r.tipoDemissao ?? '').toLowerCase().includes('com justa')).length;
    const semJusta = rows.filter((r) => (r.tipoDemissao ?? '').toLowerCase().includes('sem justa')).length;
    const pedido = rows.filter((r) => (r.motivoDemissao ?? '').toLowerCase().includes('pedido')).length;
    return [
      { label: 'Total', value: String(rows.length), tone: 'neutral' as const },
      { label: 'Com justa causa', value: String(comJusta), tone: 'danger' as const },
      { label: 'Sem justa causa', value: String(semJusta), tone: 'warning' as const },
      { label: 'Pedido demissão', value: String(pedido), tone: 'info' as const },
    ];
  }, [rows]);

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Histórico — Colaboradores Desligados"
        description="Desligamentos do período com motivo e aptidão à recontratação."
      />

      <Input label="Ano" onChangeText={setAno} value={ano} keyboardType="number-pad" />
      <MetricStrip metrics={metrics} />

      {isLoading ? <SkeletonLoader /> : null}
      {error ? (
        <ThemedText themeColor="danger" type="small">
          {error}
        </ThemedText>
      ) : null}

      {rows.map((row) => (
        <GlassCard key={row.id} padding="compact">
          <View style={styles.headerRow}>
            <ThemedText type="smallBold" style={styles.flex}>
              {row.nome}
            </ThemedText>
            {row.perfilRisco ? <StatusBadge label={row.perfilRisco} tone="warning" size="sm" /> : null}
          </View>
          <ThemedText themeColor="textSecondary" type="small">
            {row.funcao ?? '—'} · {row.especialidade ?? '—'} · IRATA {row.nivelIrata ?? '—'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            Admissão: {row.dataAdmissao ?? '—'} · Demissão: {row.dataDemissao ?? '—'}
          </ThemedText>
          <ThemedText type="small">
            Motivo: {row.motivoDemissao ?? '—'} · {row.tipoDemissao ?? '—'}
          </ThemedText>
          <ThemedText type="small">
            Apto recontratação: {row.aptoRecontratacao == null ? '—' : row.aptoRecontratacao ? 'Sim' : 'Não'}
          </ThemedText>
        </GlassCard>
      ))}
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.space.md,
    paddingBottom: layout.space.xxl,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: layout.space.sm },
  flex: { flex: 1 },
});
