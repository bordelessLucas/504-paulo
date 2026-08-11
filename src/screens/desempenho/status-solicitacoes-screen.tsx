import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OptionChips } from '@/components/rh/option-chips';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { GlassCard } from '@/components/premium/GlassCard';
import { StatusBadge } from '@/components/premium/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { layout } from '@/constants/theme';
import {
  fetchStatusSolicitacoes,
  type SolicitacaoStatusRow,
} from '@/features/desempenho/historico-api';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useAppNavigation } from '@/navigation/app-navigation-context';
import { getTabLabelForRole } from '@/navigation/role-menus';
import type { StatusSolicitacaoSalarial } from '@/types/supabase';

const STATUS_FILTERS = ['todos', 'pendente_rh', 'pendente_ceo', 'aprovado', 'recusado', 'devolvida'] as const;

const STATUS_LABELS: Record<string, string> = {
  todos: 'Todos',
  pendente_rh: 'Em análise (RH)',
  pendente_ceo: 'Em análise (CEO)',
  aprovado: 'Deferido',
  recusado: 'Indeferido',
  devolvida: 'Devolvida',
};

function toneForStatus(status: StatusSolicitacaoSalarial) {
  if (status === 'aprovado') return 'success' as const;
  if (status === 'recusado') return 'danger' as const;
  if (status === 'devolvida') return 'warning' as const;
  return 'info' as const;
}

export function StatusSolicitacoesScreen() {
  const { role } = useAuthRole();
  const { navigateToTab, openDrawer } = useAppNavigation();
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('todos');
  const [nome, setNome] = useState('');
  const [rows, setRows] = useState<SolicitacaoStatusRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const title = role
    ? getTabLabelForRole('StatusSolicitacoes', role)
    : 'Dashboard — Status das Solicitações';

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setRows(
        await fetchStatusSolicitacoes({
          status,
          nome: nome.trim() || undefined,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar solicitações.');
    } finally {
      setIsLoading(false);
    }
  }, [nome, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const goReajusteOrMenu = () => {
    if (
      role === 'gerente' ||
      role === 'gestor' ||
      role === 'rh' ||
      role === 'admin' ||
      role === 'ceo'
    ) {
      if (navigateToTab('PainelReajuste')) return;
    }
    if (role === 'colaborador' && navigateToTab('DashboardColaborador')) {
      return;
    }
    openDrawer();
  };

  const emptyActionLabel =
    role === 'colaborador'
      ? 'Abrir dashboard'
      : role === 'supervisor'
        ? 'Abrir menu'
        : 'Ir para Reajuste Salarial';

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader
        title={title}
        description="Acompanhe autoavaliações e pedidos de melhoria salarial."
      />

      <Input label="Nome" onChangeText={setNome} value={nome} placeholder="Filtrar por nome" />
      <OptionChips
        options={[...STATUS_FILTERS]}
        labels={STATUS_LABELS}
        value={status}
        onChange={(value) => setStatus(value as (typeof STATUS_FILTERS)[number])}
      />

      {isLoading ? <SkeletonLoader /> : null}
      {error ? (
        <ThemedText themeColor="danger" type="small">
          {error}
        </ThemedText>
      ) : null}

      {!isLoading && !error && rows.length === 0 ? (
        <EmptyState
          icon="clipboard-text-outline"
          title="Nenhuma solicitação ainda"
          message="Quando houver autoavaliações ou pedidos de reajuste, eles aparecem aqui."
          actionLabel={emptyActionLabel}
          onAction={goReajusteOrMenu}
        />
      ) : null}

      {rows.map((row) => (
        <GlassCard key={row.id} padding="compact">
          <View style={styles.headerRow}>
            <ThemedText type="smallBold" style={styles.flex}>
              {row.colaboradorNome}
            </ThemedText>
            <StatusBadge
              label={STATUS_LABELS[row.status] ?? row.status}
              tone={toneForStatus(row.status)}
              size="sm"
            />
          </View>
          <ThemedText themeColor="textSecondary" type="small">
            {row.colaboradorFuncao ?? '—'} · {row.dataSolicitacao.slice(0, 10)}
          </ThemedText>
          <ThemedText type="small">Tipo: {row.tipoSolicitacao ?? 'Melhoria salarial'}</ThemedText>
          {row.valorEstimado != null ? (
            <ThemedText type="small">
              Valor estimado: R$ {Number(row.valorEstimado).toLocaleString('pt-BR')}
            </ThemedText>
          ) : null}
          <ThemedText themeColor="textSecondary" type="small" numberOfLines={3}>
            {row.justificativa}
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
