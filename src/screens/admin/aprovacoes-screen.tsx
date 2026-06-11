import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvaliacaoValidacaoCard } from '@/components/aprovacoes/avaliacao-validacao-card';
import { SolicitacaoMelhoriaCard } from '@/components/aprovacoes/solicitacao-melhoria-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/ui/toast';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  isCeoApprovalRole,
  isRhValidationRole,
} from '@/features/aprovacoes/approval-roles';
import {
  atualizarStatusAvaliacao,
  fetchAvaliacoesPorStatusValidacao,
  type AvaliacaoPendenteValidacao,
} from '@/features/aprovacoes/avaliacoes-validacao-api';
import {
  atualizarStatusSolicitacao,
  fetchSolicitacoesPorStatus,
  type SolicitacaoMelhoria,
} from '@/features/aprovacoes/api';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useTheme } from '@/hooks/use-theme';
import type { StatusSolicitacaoSalarialEnum, StatusValidacaoEnum } from '@/types/supabase';

type AprovacoesSection = 'solicitacoes' | 'avaliacoes';

type PendingAction =
  | { kind: 'solicitacao'; id: string; action: 'primary' | 'danger' }
  | { kind: 'avaliacao'; id: string; action: 'primary' | 'danger' };

export function AprovacoesScreen() {
  const theme = useTheme();
  const { role, isLoading: isRoleLoading } = useAuthRole();
  const { showToast } = useToast();

  const isRhView = isRhValidationRole(role);
  const isCeoView = isCeoApprovalRole(role);
  const canAccess = isRhView || isCeoView;

  const statusSolicitacao: StatusSolicitacaoSalarialEnum = isRhView ? 'pendente_rh' : 'pendente_ceo';
  const statusAvaliacao: StatusValidacaoEnum = isRhView ? 'pendente_rh' : 'pendente_ceo';

  const [section, setSection] = useState<AprovacoesSection>('solicitacoes');
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoMelhoria[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoPendenteValidacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const loadData = useCallback(
    async (options?: { refreshing?: boolean }) => {
      if (!canAccess) {
        return;
      }

      if (options?.refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const [listaSolicitacoes, listaAvaliacoes] = await Promise.all([
          fetchSolicitacoesPorStatus(statusSolicitacao),
          fetchAvaliacoesPorStatusValidacao(statusAvaliacao),
        ]);

        setSolicitacoes(listaSolicitacoes);
        setAvaliacoes(listaAvaliacoes);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Erro ao carregar validações.',
        );
      } finally {
        if (options?.refreshing) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [canAccess, statusAvaliacao, statusSolicitacao],
  );

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const handleSolicitacaoAction = useCallback(
    async (
      solicitacao: SolicitacaoMelhoria,
      novoStatus: StatusSolicitacaoSalarialEnum,
      action: 'primary' | 'danger',
      successMessage: string,
    ) => {
      setPendingAction({ kind: 'solicitacao', id: solicitacao.id, action });

      try {
        await atualizarStatusSolicitacao(solicitacao.id, novoStatus);
        setSolicitacoes((current) => current.filter((item) => item.id !== solicitacao.id));
        showToast(successMessage, 'success');
      } catch (actionError) {
        showToast(
          actionError instanceof Error
            ? actionError.message
            : 'Não foi possível atualizar a solicitação.',
          'error',
        );
      } finally {
        setPendingAction(null);
      }
    },
    [showToast],
  );

  const handleAvaliacaoAction = useCallback(
    async (
      avaliacao: AvaliacaoPendenteValidacao,
      novoStatus: StatusValidacaoEnum,
      action: 'primary' | 'danger',
      successMessage: string,
    ) => {
      setPendingAction({ kind: 'avaliacao', id: avaliacao.id, action });

      try {
        await atualizarStatusAvaliacao(avaliacao.id, novoStatus);
        setAvaliacoes((current) => current.filter((item) => item.id !== avaliacao.id));
        showToast(successMessage, 'success');
      } catch (actionError) {
        showToast(
          actionError instanceof Error
            ? actionError.message
            : 'Não foi possível atualizar a avaliação.',
          'error',
        );
      } finally {
        setPendingAction(null);
      }
    },
    [showToast],
  );

  if (isRoleLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!canAccess) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="textSecondary" style={styles.unauthorized}>
          Você não tem permissão para acessar validações e aprovações.
        </ThemedText>
      </ThemedView>
    );
  }

  const { scrollPaddingBottom } = useTabScreenLayout();
  const emptySolicitacoes = isRhView
    ? 'Nenhuma solicitação aguardando validação do RH.'
    : 'Nenhuma solicitação aguardando aprovação do CEO.';
  const emptyAvaliacoes = isRhView
    ? 'Nenhuma avaliação aguardando validação do RH.'
    : 'Nenhuma avaliação aguardando aprovação do CEO.';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: scrollPaddingBottom }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadData({ refreshing: true })}
            />
          }
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="heading">
              {isRhView ? 'Validações' : 'Aprovações finais'}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.description}>
              {isRhView
                ? 'Valide solicitações e avaliações antes de encaminhar ao CEO para decisão final.'
                : 'Aprove ou recuse solicitações e avaliações já validadas pelo RH.'}
            </ThemedText>
          </View>

          <View style={styles.segmented}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSection('solicitacoes')}
              style={[
                styles.segment,
                {
                  backgroundColor:
                    section === 'solicitacoes' ? theme.backgroundSelected : theme.background,
                  borderColor: theme.border,
                },
              ]}>
              <ThemedText style={styles.segmentLabel}>
                Solicitações ({solicitacoes.length})
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSection('avaliacoes')}
              style={[
                styles.segment,
                {
                  backgroundColor:
                    section === 'avaliacoes' ? theme.backgroundSelected : theme.background,
                  borderColor: theme.border,
                },
              ]}>
              <ThemedText style={styles.segmentLabel}>
                Avaliações ({avaliacoes.length})
              </ThemedText>
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator style={styles.loader} />
          ) : error ? (
            <ThemedText themeColor="danger" style={styles.error}>
              {error}
            </ThemedText>
          ) : section === 'solicitacoes' ? (
            solicitacoes.length === 0 ? (
              <View style={styles.emptyBox}>
                <ThemedText themeColor="textSecondary" style={styles.empty}>
                  {emptySolicitacoes}
                </ThemedText>
              </View>
            ) : (
              <View style={styles.list}>
                {solicitacoes.map((solicitacao) => (
                  <SolicitacaoMelhoriaCard
                    key={solicitacao.id}
                    solicitacao={solicitacao}
                    showRhValidatedBadge={isCeoView}
                    primaryLabel={isRhView ? 'Validar e encaminhar ao CEO' : 'Aprovar'}
                    dangerLabel={isRhView ? 'Devolver ao solicitante' : 'Recusar'}
                    isPrimaryLoading={
                      pendingAction?.kind === 'solicitacao' &&
                      pendingAction.id === solicitacao.id &&
                      pendingAction.action === 'primary'
                    }
                    isDangerLoading={
                      pendingAction?.kind === 'solicitacao' &&
                      pendingAction.id === solicitacao.id &&
                      pendingAction.action === 'danger'
                    }
                    onPrimary={() =>
                      void handleSolicitacaoAction(
                        solicitacao,
                        isRhView ? 'pendente_ceo' : 'aprovado',
                        'primary',
                        isRhView
                          ? 'Solicitação encaminhada ao CEO.'
                          : 'Solicitação aprovada pelo CEO.',
                      )
                    }
                    onDanger={() =>
                      void handleSolicitacaoAction(
                        solicitacao,
                        isRhView ? 'devolvida' : 'recusado',
                        'danger',
                        isRhView
                          ? 'Solicitação devolvida ao solicitante.'
                          : 'Solicitação recusada pelo CEO.',
                      )
                    }
                  />
                ))}
              </View>
            )
          ) : avaliacoes.length === 0 ? (
            <View style={styles.emptyBox}>
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                {emptyAvaliacoes}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.list}>
              {avaliacoes.map((avaliacao) => (
                <AvaliacaoValidacaoCard
                  key={avaliacao.id}
                  avaliacao={avaliacao}
                  showRhValidatedBadge={isCeoView}
                  primaryLabel={isRhView ? 'Validar e encaminhar ao CEO' : 'Aprovar'}
                  dangerLabel={isRhView ? 'Devolver ao avaliador' : 'Recusar'}
                  isPrimaryLoading={
                    pendingAction?.kind === 'avaliacao' &&
                    pendingAction.id === avaliacao.id &&
                    pendingAction.action === 'primary'
                  }
                  isDangerLoading={
                    pendingAction?.kind === 'avaliacao' &&
                    pendingAction.id === avaliacao.id &&
                    pendingAction.action === 'danger'
                  }
                  onPrimary={() =>
                    void handleAvaliacaoAction(
                      avaliacao,
                      isRhView ? 'pendente_ceo' : 'aprovada',
                      'primary',
                      isRhView
                        ? 'Avaliação encaminhada ao CEO.'
                        : 'Avaliação aprovada pelo CEO.',
                    )
                  }
                  onDanger={() =>
                    void handleAvaliacaoAction(
                      avaliacao,
                      isRhView ? 'devolvida' : 'recusada',
                      'danger',
                      isRhView
                        ? 'Avaliação devolvida ao avaliador.'
                        : 'Avaliação recusada pelo CEO.',
                    )
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth + 360,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.two,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  segmented: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  segment: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
  },
  segmentLabel: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  list: {
    gap: Spacing.three,
  },
  loader: {
    marginTop: Spacing.four,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyBox: {
    paddingVertical: Spacing.four,
  },
  empty: {
    fontSize: 15,
    lineHeight: 22,
  },
  unauthorized: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
});
