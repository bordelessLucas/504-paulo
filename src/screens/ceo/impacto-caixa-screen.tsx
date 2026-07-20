import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OptionChips } from '@/components/rh/option-chips';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { GlassCard } from '@/components/premium/GlassCard';
import { MetricStrip } from '@/components/premium/MetricStrip';
import { ThemedText } from '@/components/themed-text';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { layout } from '@/constants/theme';
import { fetchStatusSolicitacoes } from '@/features/desempenho/historico-api';

type Modo = 'mensal' | 'anual';

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function yearKey(iso: string): string {
  return iso.slice(0, 4);
}

export function ImpactoCaixaScreen() {
  const [modo, setModo] = useState<Modo>('mensal');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aprovados, setAprovados] = useState<
    Array<{ data: string; valor: number; nome: string }>
  >([]);

  useEffect(() => {
    void (async () => {
      try {
        const rows = await fetchStatusSolicitacoes({ status: 'aprovado' });
        setAprovados(
          rows.map((row) => ({
            data: row.dataSolicitacao,
            valor: Number(row.valorEstimado ?? 0),
            nome: row.colaboradorNome,
          })),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar impacto.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const buckets = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of aprovados) {
      const key = modo === 'mensal' ? monthKey(item.data) : yearKey(item.data);
      map.set(key, (map.get(key) ?? 0) + item.valor);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [aprovados, modo]);

  const total = aprovados.reduce((sum, item) => sum + item.valor, 0);

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Impacto no Caixa"
        description="Agregação dos valores estimados de reajustes aprovados."
      />

      <OptionChips
        options={['mensal', 'anual']}
        labels={{ mensal: 'Mensal', anual: 'Anual' }}
        value={modo}
        onChange={(value) => setModo(value as Modo)}
      />

      <MetricStrip
        metrics={[
          {
            label: 'Total aprovado',
            value: `R$ ${total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
            tone: 'accent',
          },
          {
            label: 'Solicitações',
            value: String(aprovados.length),
            tone: 'neutral',
          },
        ]}
      />

      {isLoading ? <SkeletonLoader /> : null}
      {error ? (
        <ThemedText themeColor="danger" type="small">
          {error}
        </ThemedText>
      ) : null}

      {buckets.map(([periodo, valor]) => (
        <GlassCard key={periodo} padding="compact">
          <View style={styles.row}>
            <ThemedText type="smallBold">{periodo}</ThemedText>
            <ThemedText type="smallBold">
              R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </ThemedText>
          </View>
        </GlassCard>
      ))}

      {!isLoading && buckets.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          Nenhum valor monetário registrado. Inclua valor estimado nas solicitações aprovadas.
        </ThemedText>
      ) : null}
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.space.md,
    paddingBottom: layout.space.xxl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
