import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SolicitacaoMelhoriaCard } from '@/components/aprovacoes/solicitacao-melhoria-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/ui/toast';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  atualizarStatusSolicitacao,
  fetchSolicitacoesPorStatus,
  type SolicitacaoMelhoria,
} from '@/features/aprovacoes/api';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import type { UserRole } from '@/types/supabase';

type AprovacoesViewMode = 'rh' | 'ceo';

function getAprovacoesViewMode(role: UserRole | null): AprovacoesViewMode | null {
  if (role === 'rh') {
    return 'rh';
  }

  if (role === 'ceo' || role === 'admin') {
    return 'ceo';
  }

  return null;
}

export function AprovacoesScreen() {
  const { role, isLoading: isRoleLoading } = useAuthRole();
  const { showToast } = useToast();
  const viewMode = getAprovacoesViewMode(role);

  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoMelhoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'primary' | 'secondary' | 'danger' | null>(null);

  const statusFiltro = viewMode === 'rh' ? 'pendente_rh' : 'pendente_ceo';

  const loadSolicitacoes = useCallback(
    async (options?: { refreshing?: boolean }) => {
      if (!viewMode) {
        return;
      }

      if (options?.refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const lista = await fetchSolicitacoesPorStatus(statusFiltro);
        setSolicitacoes(lista);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Erro ao carregar solicitações.',
        );
      } finally {
        if (options?.refreshing) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [statusFiltro, viewMode],
  );

  useFocusEffect(
    useCallback(() => {
      void loadSolicitacoes();
    }, [loadSolicitacoes]),
  );

  const handleAction = useCallback(
    async (
      solicitacao: SolicitacaoMelhoria,
      novoStatus: 'pendente_ceo' | 'aprovado' | 'recusado',
      tipo: 'primary' | 'secondary' | 'danger',
      successMessage: string,
    ) => {
      setActionId(solicitacao.id);
      setActionType(tipo);

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
        setActionId(null);
        setActionType(null);
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

  if (!viewMode) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="textSecondary" style={styles.unauthorized}>
          Você não tem permissão para acessar as aprovações.
        </ThemedText>
      </ThemedView>
    );
  }

  const isRhView = viewMode === 'rh';
  const { scrollPaddingBottom } = useTabScreenLayout();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: scrollPaddingBottom }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadSolicitacoes({ refreshing: true })}
            />
          }
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="heading">Aprovações</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.description}>
              {isRhView
                ? 'Valide os requisitos das solicitações enviadas pelos gerentes antes de encaminhar ao CEO.'
                : 'Analise solicitações validadas pelo RH e defina a aprovação final.'}
            </ThemedText>
          </View>

          {isLoading ? (
            <ActivityIndicator style={styles.loader} />
          ) : error ? (
            <ThemedText themeColor="danger" style={styles.error}>
              {error}
            </ThemedText>
          ) : solicitacoes.length === 0 ? (
            <View style={styles.emptyBox}>
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                {isRhView
                  ? 'Nenhuma solicitação aguardando validação do RH.'
                  : 'Nenhuma solicitação aguardando aprovação do CEO.'}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.list}>
              {solicitacoes.map((solicitacao) => (
                <SolicitacaoMelhoriaCard
                  key={solicitacao.id}
                  solicitacao={solicitacao}
                  showRhValidatedBadge={!isRhView}
                  primaryLabel={isRhView ? 'Validar requisitos' : 'Aprovar definitivo'}
                  dangerLabel={isRhView ? 'Devolver / Recusar' : 'Recusar'}
                  isPrimaryLoading={actionId === solicitacao.id && actionType === 'primary'}
                  isDangerLoading={actionId === solicitacao.id && actionType === 'danger'}
                  onPrimary={() =>
                    void handleAction(
                      solicitacao,
                      isRhView ? 'pendente_ceo' : 'aprovado',
                      'primary',
                      isRhView
                        ? 'Solicitação encaminhada ao CEO.'
                        : 'Solicitação aprovada definitivamente.',
                    )
                  }
                  onDanger={() =>
                    void handleAction(
                      solicitacao,
                      'recusado',
                      'danger',
                      isRhView
                        ? 'Solicitação devolvida ao gerente.'
                        : 'Solicitação recusada.',
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
