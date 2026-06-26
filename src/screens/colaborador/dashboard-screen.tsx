import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BloqueioDeveresHint } from '@/components/colaborador/bloqueio-deveres-hint';
import { DesempenhoSemaforo } from '@/components/gerencial/desempenho-semaforo';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { PDICard } from '@/components/pdi/PDICard';
import {
  CollapsibleSection,
  GlassCard,
  MetricStrip,
  PremiumHeader,
  SectionTitle,
  StatusBadge,
} from '@/components/premium';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { Fonts, layout } from '@/constants/theme';
import { TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import { STATUS_VALIDACAO_LABELS } from '@/features/avaliacao/historico-labels';
import { useAuth } from '@/features/auth/auth-context';
import { createAutoavaliacaoSolicitacao } from '@/features/colaborador/autoavaliacao-api';
import { AutoavaliacaoModal } from '@/features/colaborador/autoavaliacao-modal';
import {
  fetchColaboradorDashboard,
  formatFeedbackDate,
  formatMediaGeral,
  type AvaliacaoEmAnalise,
  type ColaboradorDashboardData,
} from '@/features/colaborador/dashboard-api';
import {
  isElegivelParaAutoavaliacao,
  MENSAGEM_BLOQUEIO_TEMPO_CASA,
  resolveMotivoBloqueioAutoavaliacao,
} from '@/features/colaborador/eligibility';
import {
  STATUS_SOLICITACAO_LABELS,
  type SolicitacaoColaborador,
} from '@/features/colaborador/solicitacoes-api';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTheme } from '@/hooks/use-theme';
import type { ColaboradorStackParamList } from '@/navigation/colaborador-stack';
import type { PlanoDesenvolvimento } from '@/features/pdi/types';
import { buscarPDIsAtivosColaborador } from '@/services/pdiService';

type DashboardNavigation = NativeStackNavigationProp<ColaboradorStackParamList, 'Dashboard'>;

function mapValidacaoTone(status: AvaliacaoEmAnalise['status']) {
  if (status === 'aprovada') return 'success' as const;
  if (status === 'recusada') return 'danger' as const;
  if (status === 'pendente_rh' || status === 'pendente_ceo') return 'warning' as const;
  return 'info' as const;
}

function mapSolicitacaoTone(status: SolicitacaoColaborador['status']) {
  if (status === 'aprovado') return 'success' as const;
  if (status === 'recusado') return 'danger' as const;
  if (status === 'pendente_rh' || status === 'pendente_ceo') return 'warning' as const;
  return 'info' as const;
}

function ListRow({
  title,
  badge,
  meta,
  body,
}: {
  title: string;
  badge?: React.ReactNode;
  meta?: string;
  body?: string;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.listItem, { backgroundColor: theme.backgroundSelected, borderColor: theme.border }]}>
      {title ? (
        <View style={styles.listItemHeader}>
          <ThemedText style={styles.listItemTitle}>{title}</ThemedText>
          {badge}
        </View>
      ) : null}
      {body ? <ThemedText style={styles.bodyText} numberOfLines={3}>{body}</ThemedText> : null}
      {meta ? <ThemedText themeColor="textMuted" style={styles.meta}>{meta}</ThemedText> : null}
    </View>
  );
}

export function DashboardColaboradorScreen() {
  const theme = useTheme();
  const isReducedMotion = useReducedMotion();
  const navigation = useNavigation<DashboardNavigation>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState<ColaboradorDashboardData | null>(null);
  const [pdisAtivos, setPdisAtivos] = useState<PlanoDesenvolvimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoavaliacaoModalVisible, setIsAutoavaliacaoModalVisible] = useState(false);

  const loadDashboard = useCallback(
    async (options?: { refreshing?: boolean }) => {
      if (!user) return;

      if (options?.refreshing) setIsRefreshing(true);
      else setIsLoading(true);

      setError(null);

      try {
        const [dashboard, pdis] = await Promise.all([
          fetchColaboradorDashboard(user.id),
          buscarPDIsAtivosColaborador(user.id).catch(() => [] as PlanoDesenvolvimento[]),
        ]);
        setData(dashboard);
        setPdisAtivos(pdis);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar o dashboard.');
      } finally {
        if (options?.refreshing) setIsRefreshing(false);
        else setIsLoading(false);
      }
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  const isAutoavaliacaoEnabled = isElegivelParaAutoavaliacao(
    data?.dataAdmissao,
    data?.temIncidentesRecentes ?? false,
  );
  const bloqueioMotivo = resolveMotivoBloqueioAutoavaliacao(
    data?.dataAdmissao,
    data?.temIncidentesRecentes ?? false,
  );

  const metrics = useMemo(
    () => [
      {
        label: 'Média',
        value: formatMediaGeral(data?.mediaGeral ?? null),
        tone: 'accent' as const,
      },
      {
        label: 'PDIs',
        value: String(pdisAtivos.length),
        tone: 'info' as const,
      },
      {
        label: 'Em análise',
        value: String(data?.avaliacoesEmAnalise.length ?? 0),
        tone: 'warning' as const,
      },
    ],
    [data?.avaliacoesEmAnalise.length, data?.mediaGeral, pdisAtivos.length],
  );

  const handleAutoavaliacaoSubmit = useCallback(
    async (payload: { qualificacoes: string; investimento: string }) => {
      if (!user) throw new Error('Sessão inválida. Faça login novamente.');

      await createAutoavaliacaoSolicitacao({
        colaboradorId: user.id,
        qualificacoes: payload.qualificacoes,
        investimento: payload.investimento,
      });

      showToast('Solicitação enviada com sucesso.', 'success');
      void loadDashboard();
    },
    [loadDashboard, showToast, user],
  );

  const animate = !isReducedMotion;
  const avaliacoesCount = data?.avaliacoesEmAnalise.length ?? 0;
  const feedbacksCount = data?.feedbacks.length ?? 0;
  const solicitacoesCount = data?.solicitacoes.length ?? 0;

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.accent} size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="danger">{error}</ThemedText>
        <Button label="Tentar novamente" variant="secondary" onPress={() => void loadDashboard()} />
      </ThemedView>
    );
  }

  const hero = (
    <>
      <PremiumHeader userName={user?.name ?? 'Colaborador'} role="colaborador" />
      <MetricStrip metrics={metrics} />
      <GlassCard padding="compact">
        <SectionTitle title="Desempenho" />
        <DesempenhoSemaforo
          status={data?.semaforoStatus ?? 'cinza'}
          mediaEmpresa={data?.mediaGeral ?? null}
          scopeLabel={data?.tempoEmpresaLabel ? `Tempo de casa: ${data.tempoEmpresaLabel}` : 'Status atual'}
        />
      </GlassCard>
    </>
  );

  return (
    <>
      <TabScreenContainer
        scrollable
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void loadDashboard({ refreshing: true })}
            tintColor={theme.accent}
          />
        }>
        {animate ? (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.block}>
            {hero}
          </Animated.View>
        ) : (
          <View style={styles.block}>{hero}</View>
        )}

        {pdisAtivos.length > 0 ? (
          <GlassCard padding="compact">
            <SectionTitle
              title="PDI"
              actionLabel="Ver todos"
              onActionPress={() => navigation.navigate('PDIList')}
            />
            {pdisAtivos.slice(0, 2).map((pdi) => (
              <PDICard
                key={pdi.id}
                compact
                hideCriador
                pdi={pdi}
                onPress={() => navigation.navigate('PDIDetail', { pdiId: pdi.id })}
              />
            ))}
          </GlassCard>
        ) : null}

        {avaliacoesCount > 0 ? (
          <CollapsibleSection title="Avaliações em análise" count={avaliacoesCount} defaultExpanded>
            {data?.avaliacoesEmAnalise.map((avaliacao) => (
              <ListRow
                key={avaliacao.id}
                title={TIPO_AVALIACAO_LABELS[avaliacao.tipo]}
                meta={formatFeedbackDate(avaliacao.createdAt)}
                badge={
                  <StatusBadge
                    label={STATUS_VALIDACAO_LABELS[avaliacao.status]}
                    size="sm"
                    tone={mapValidacaoTone(avaliacao.status)}
                  />
                }
              />
            ))}
          </CollapsibleSection>
        ) : null}

        {feedbacksCount > 0 ? (
          <CollapsibleSection title="Pontos de melhoria" count={feedbacksCount}>
            {data?.feedbacks.map((feedback) => (
              <ListRow
                key={feedback.id}
                body={feedback.texto}
                meta={formatFeedbackDate(feedback.dataReferencia)}
                title=""
              />
            ))}
          </CollapsibleSection>
        ) : null}

        {solicitacoesCount > 0 ? (
          <CollapsibleSection title="Solicitações" count={solicitacoesCount}>
            {data?.solicitacoes.map((solicitacao) => (
              <ListRow
                key={solicitacao.id}
                title={solicitacao.tipo === 'autoavaliacao' ? 'Autoavaliação' : 'Melhoria'}
                body={solicitacao.resumo}
                meta={formatFeedbackDate(solicitacao.createdAt)}
                badge={
                  <StatusBadge
                    label={STATUS_SOLICITACAO_LABELS[solicitacao.status]}
                    size="sm"
                    tone={mapSolicitacaoTone(solicitacao.status)}
                  />
                }
              />
            ))}
          </CollapsibleSection>
        ) : null}

        <GlassCard padding="compact">
          <SectionTitle title="Autoavaliação" />
          {bloqueioMotivo === 'deveres' ? <BloqueioDeveresHint visible /> : null}
          {bloqueioMotivo === 'tempo_casa' ? (
            <EmptyState message={MENSAGEM_BLOQUEIO_TEMPO_CASA} />
          ) : null}
          <Button
            label="Nova solicitação"
            disabled={!isAutoavaliacaoEnabled}
            onPress={() => setIsAutoavaliacaoModalVisible(true)}
          />
        </GlassCard>
      </TabScreenContainer>

      <AutoavaliacaoModal
        visible={isAutoavaliacaoModalVisible}
        onClose={() => setIsAutoavaliacaoModalVisible(false)}
        onSubmit={handleAutoavaliacaoSubmit}
      />
    </>
  );
}

/** @deprecated Use DashboardColaboradorScreen */
export const ColaboradorDashboardScreen = DashboardColaboradorScreen;

const styles = StyleSheet.create({
  content: {
    gap: layout.space.md,
  },
  block: {
    gap: layout.space.md,
  },
  listItem: {
    borderWidth: 1,
    borderRadius: layout.radius.sm,
    padding: layout.space.sm,
    gap: layout.space.xs,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: layout.space.sm,
  },
  listItemTitle: {
    flex: 1,
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.space.lg,
    gap: layout.space.md,
  },
});
