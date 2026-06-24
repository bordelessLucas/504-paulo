import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { PDICard } from '@/components/pdi/PDICard';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import {
  fetchColaboradorDashboard,
  formatFeedbackDate,
  formatMediaGeral,
  type AvaliacaoEmAnalise,
  type ColaboradorDashboardData,
} from '@/features/colaborador/dashboard-api';
import { TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import { STATUS_VALIDACAO_LABELS } from '@/features/avaliacao/historico-labels';
import {
  STATUS_SOLICITACAO_LABELS,
  type SolicitacaoColaborador,
} from '@/features/colaborador/solicitacoes-api';
import { BloqueioDeveresHint } from '@/components/colaborador/bloqueio-deveres-hint';
import { DesempenhoSemaforo } from '@/components/gerencial/desempenho-semaforo';
import { createAutoavaliacaoSolicitacao } from '@/features/colaborador/autoavaliacao-api';
import { AutoavaliacaoModal } from '@/features/colaborador/autoavaliacao-modal';
import {
  formatDataAdmissao,
  isElegivelParaAutoavaliacao,
  MENSAGEM_BLOQUEIO_TEMPO_CASA,
  resolveMotivoBloqueioAutoavaliacao,
} from '@/features/colaborador/eligibility';
import { useAuth } from '@/features/auth/auth-context';
import { buscarPDIsAtivosColaborador } from '@/services/pdiService';
import type { PlanoDesenvolvimento } from '@/features/pdi/types';
import type { ColaboradorStackParamList } from '@/navigation/colaborador-stack';
import { useTheme } from '@/hooks/use-theme';

type DashboardNavigation = NativeStackNavigationProp<ColaboradorStackParamList, 'Dashboard'>;

function DashboardCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {children}
    </View>
  );
}

function AvaliacaoEmAnaliseItem({ avaliacao }: { avaliacao: AvaliacaoEmAnalise }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.feedbackItem,
        { backgroundColor: theme.backgroundSelected, borderColor: theme.border },
      ]}>
      <ThemedText style={styles.solicitacaoTipo}>
        {TIPO_AVALIACAO_LABELS[avaliacao.tipo]}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.solicitacaoStatus}>
        {STATUS_VALIDACAO_LABELS[avaliacao.status]}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
        As notas ficam ocultas até a aprovação final do CEO.
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.feedbackDate}>
        {formatFeedbackDate(avaliacao.createdAt)}
      </ThemedText>
    </View>
  );
}

function SolicitacaoStatusItem({ solicitacao }: { solicitacao: SolicitacaoColaborador }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.feedbackItem,
        { backgroundColor: theme.backgroundSelected, borderColor: theme.border },
      ]}>
      <ThemedText style={styles.solicitacaoTipo}>
        {solicitacao.tipo === 'autoavaliacao' ? 'Autoavaliação' : 'Solicitação de melhoria'}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.solicitacaoStatus}>
        {STATUS_SOLICITACAO_LABELS[solicitacao.status]}
      </ThemedText>
      <ThemedText style={styles.feedbackText}>{solicitacao.resumo}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.feedbackDate}>
        {formatFeedbackDate(solicitacao.createdAt)}
      </ThemedText>
    </View>
  );
}

export function DashboardColaboradorScreen() {
  const theme = useTheme();
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
      if (!user) {
        return;
      }

      if (options?.refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const [dashboard, pdis] = await Promise.all([
          fetchColaboradorDashboard(user.id),
          buscarPDIsAtivosColaborador(user.id).catch(() => [] as PlanoDesenvolvimento[]),
        ]);
        setData(dashboard);
        setPdisAtivos(pdis);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Erro ao carregar o dashboard.',
        );
      } finally {
        if (options?.refreshing) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
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

  function handleAutoavaliacaoPress() {
    if (!isAutoavaliacaoEnabled) {
      return;
    }

    setIsAutoavaliacaoModalVisible(true);
  }

  const handleAutoavaliacaoSubmit = useCallback(
    async (payload: { qualificacoes: string; investimento: string }) => {
      if (!user) {
        throw new Error('Sessão inválida. Faça login novamente.');
      }

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

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
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

  return (
    <>
      <TabScreenContainer
        scrollable
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void loadDashboard({ refreshing: true })} />
        }>
        <View style={styles.header}>
            <ThemedText type="heading">Olá, {user?.name.split(' ')[0] ?? 'colaborador'}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Acompanhe seu desempenho e os feedbacks recebidos nas avaliações.
            </ThemedText>
          </View>

          <DashboardCard title="Seu desempenho">
            <DesempenhoSemaforo
              status={data?.semaforoStatus ?? 'cinza'}
              mediaEmpresa={data?.mediaGeral ?? null}
              scopeLabel="Seu desempenho atual"
            />
            <ThemedText themeColor="textSecondary" style={styles.metaText}>
              {data?.totalRespostas
                ? `Média ${formatMediaGeral(data.mediaGeral)} · ${data.totalRespostas} resposta(s) aprovada(s).`
                : 'Sem notas aprovadas ainda — o semáforo ficará cinza até haver avaliações liberadas.'}
            </ThemedText>
            {data?.tempoEmpresaLabel ? (
              <ThemedText themeColor="textSecondary" style={styles.metaText}>
                Tempo de empresa: {data.tempoEmpresaLabel}
              </ThemedText>
            ) : null}
          </DashboardCard>

          <DashboardCard title="Resumo">
            <View style={styles.mediaBlock}>
              <ThemedText style={styles.mediaValue}>{formatMediaGeral(data?.mediaGeral ?? null)}</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.mediaLabel}>
                Média geral das suas notas
              </ThemedText>
            </View>
            <ThemedText themeColor="textSecondary" style={styles.metaText}>
              {data?.totalRespostas
                ? `Calculada a partir de ${data.totalRespostas} resposta(s) registrada(s).`
                : 'Você ainda não possui notas registradas nas avaliações.'}
            </ThemedText>
          </DashboardCard>

          <DashboardCard title="Avaliações em análise">
            <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
              Avaliações enviadas que ainda aguardam validação — sem exibição de notas.
            </ThemedText>

            {data?.avaliacoesEmAnalise.length ? (
              data.avaliacoesEmAnalise.map((avaliacao) => (
                <AvaliacaoEmAnaliseItem key={avaliacao.id} avaliacao={avaliacao} />
              ))
            ) : (
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                Nenhuma avaliação em análise no momento.
              </ThemedText>
            )}
          </DashboardCard>

          <DashboardCard title="Meus Planos de Desenvolvimento">
            {pdisAtivos.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                Nenhum plano ativo no momento. Quando seu líder criar um PDI para você, ele
                aparecerá aqui com prazo e progresso.
              </ThemedText>
            ) : (
              <>
                {pdisAtivos.slice(0, 3).map((pdi) => (
                  <PDICard
                    key={pdi.id}
                    compact
                    hideCriador
                    pdi={pdi}
                    onPress={() => navigation.navigate('PDIDetail', { pdiId: pdi.id })}
                  />
                ))}
                <Button
                  label="Ver todos"
                  variant="secondary"
                  onPress={() => navigation.navigate('PDIList')}
                />
              </>
            )}
          </DashboardCard>

          <DashboardCard title="Pontos de melhoria">
            <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
              Feedbacks construtivos recebidos — sem identificação de quem avaliou.
            </ThemedText>

            {data?.feedbacks.length ? (
              data.feedbacks.map((feedback) => (
                <View
                  key={feedback.id}
                  style={[
                    styles.feedbackItem,
                    { backgroundColor: theme.backgroundSelected, borderColor: theme.border },
                  ]}>
                  <ThemedText style={styles.feedbackText}>{feedback.texto}</ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.feedbackDate}>
                    {formatFeedbackDate(feedback.dataReferencia)}
                  </ThemedText>
                </View>
              ))
            ) : (
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                Nenhum feedback registrado ainda. Quando houver justificativas ou evidências nas suas
                avaliações, elas aparecerão aqui para apoiar seu desenvolvimento.
              </ThemedText>
            )}
          </DashboardCard>

          <DashboardCard title="Minhas solicitações">
            <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
              Acompanhe o andamento das suas autoavaliações e solicitações enviadas.
            </ThemedText>

            {data?.solicitacoes.length ? (
              data.solicitacoes.map((solicitacao) => (
                <SolicitacaoStatusItem key={solicitacao.id} solicitacao={solicitacao} />
              ))
            ) : (
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                Nenhuma solicitação em andamento. Quando você enviar uma autoavaliação, o status
                aparecerá aqui.
              </ThemedText>
            )}
          </DashboardCard>

          <DashboardCard title="Autoavaliação">
            <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
              Disponível após 6 meses de admissão na empresa.
            </ThemedText>

            {data?.dataAdmissao ? (
              <ThemedText themeColor="textSecondary" style={styles.metaText}>
                Data de admissão: {formatDataAdmissao(data.dataAdmissao)}
              </ThemedText>
            ) : null}

            {bloqueioMotivo === 'deveres' ? <BloqueioDeveresHint visible /> : null}

            {bloqueioMotivo === 'tempo_casa' ? (
              <ThemedText themeColor="textSecondary" style={styles.disabledHint}>
                {MENSAGEM_BLOQUEIO_TEMPO_CASA}
              </ThemedText>
            ) : null}

            <Button
              label="Nova Autoavaliação / Solicitação"
              disabled={!isAutoavaliacaoEnabled}
              onPress={handleAutoavaliacaoPress}
            />
          </DashboardCard>
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
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.two,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  mediaBlock: {
    gap: Spacing.one,
  },
  mediaValue: {
    fontFamily: Fonts.sansBold,
    fontSize: 40,
    lineHeight: 44,
  },
  mediaLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  feedbackItem: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  feedbackText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  feedbackDate: {
    fontSize: 12,
    lineHeight: 16,
  },
  solicitacaoTipo: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  solicitacaoStatus: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
  },
  disabledHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
