import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { GlassCard } from '@/components/premium/GlassCard';
import { StatusBadge } from '@/components/premium/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { layout } from '@/constants/theme';
import {
  fetchHistoricoAvaliacoes,
  type HistoricoAvaliacaoRow,
} from '@/features/desempenho/historico-api';
import { useAppNavigation } from '@/navigation/app-navigation-context';
import type { TipoAvaliacao } from '@/types/supabase';

type Props = {
  tipo: TipoAvaliacao;
  title: string;
  description: string;
};

function HistoricoAvaliacoesBase({ tipo, title, description }: Props) {
  const { navigateToTab, openDrawer } = useAppNavigation();
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [cliente, setCliente] = useState('');
  const [unidade, setUnidade] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [rows, setRows] = useState<HistoricoAvaliacaoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHistoricoAvaliacoes(tipo, {
        ano: Number(ano) || undefined,
        cliente: cliente.trim() || undefined,
        unidade: unidade.trim() || undefined,
        supervisor: supervisor.trim() || undefined,
      });
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar histórico.');
    } finally {
      setIsLoading(false);
    }
  }, [ano, cliente, supervisor, tipo, unidade]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader title={title} description={description} />

      <GlassCard padding="compact">
        <ThemedText type="smallBold">Filtros</ThemedText>
        <View style={styles.filters}>
          <Input label="Ano" mask="year" onChangeText={setAno} placeholder="2026" value={ano} />
          <Input label="Cliente" onChangeText={setCliente} value={cliente} placeholder="PRIO" />
          <Input label="Unidade" onChangeText={setUnidade} value={unidade} placeholder="POLVO A" />
          <Input
            label="Supervisor"
            onChangeText={setSupervisor}
            value={supervisor}
            placeholder="Nome do avaliador"
          />
          <Button label="Aplicar filtros" onPress={() => void load()} />
        </View>
      </GlassCard>

      {isLoading ? <SkeletonLoader /> : null}
      {error ? (
        <ThemedText themeColor="danger" type="small">
          {error}
        </ThemedText>
      ) : null}

      {!isLoading && !error && rows.length === 0 ? (
        <EmptyState
          icon="clipboard-text-off-outline"
          title="Nenhuma avaliação neste filtro"
          message="Ajuste os filtros ou registre avaliações no Painel de Avaliações / Lista de Colaboradores."
          actionLabel="Ir para Painel de Avaliações"
          onAction={() => {
            if (!navigateToTab('PainelAvaliacao')) {
              openDrawer();
            }
          }}
        />
      ) : null}

      {rows.map((row) => (
        <GlassCard key={row.id} padding="compact">
          <View style={styles.headerRow}>
            <ThemedText type="smallBold" style={styles.flex}>
              {row.colaboradorNome}
            </ThemedText>
            <StatusBadge label={row.status} tone="neutral" size="sm" />
          </View>
          <ThemedText themeColor="textSecondary" type="small">
            {row.colaboradorFuncao ?? '—'} · IRATA {row.nivelIrata ?? '—'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            Avaliador: {row.avaliadorNome ?? '—'} · {row.quinzena ?? row.createdAt.slice(0, 10)}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            {row.clienteNome ?? '—'} / {row.unidadeNome ?? '—'}
          </ThemedText>
          <ThemedText type="small" style={styles.mt}>
            Notas: {row.notas.length ? row.notas.join(' · ') : '—'} · Média:{' '}
            {row.media !== null ? row.media.toFixed(2) : '—'}
          </ThemedText>
        </GlassCard>
      ))}
    </TabScreenContainer>
  );
}

export function HistoricoQuinzenalScreen() {
  return (
    <HistoricoAvaliacoesBase
      tipo="quinzenal"
      title="Histórico de Avaliações – Quinzenal"
      description="Filtros por ano, cliente, unidade e supervisor de bordo."
    />
  );
}

export function HistoricoSemestralScreen() {
  return (
    <HistoricoAvaliacoesBase
      tipo="semestral"
      title="Histórico das Avaliações – Semestral"
      description="Consolidação das avaliações dos gestores de base."
    />
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.space.md,
    paddingBottom: layout.space.xxl,
  },
  filters: { gap: layout.space.sm, marginTop: layout.space.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: layout.space.sm },
  flex: { flex: 1 },
  mt: { marginTop: layout.space.xs },
});
