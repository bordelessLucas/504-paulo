import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ColaboradorReajusteRow } from '@/components/reajuste/colaborador-reajuste-row';
import {
  PainelReajusteSolicitacao,
  PainelReajusteSolicitacaoModal,
} from '@/components/reajuste/painel-reajuste-solicitacao';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/ui/toast';
import { SPLIT_LAYOUT_MIN_WIDTH } from '@/constants/layout';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { createSolicitacaoMelhoria } from '@/features/aprovacoes/api';
import {
  fetchColaboradoresReajusteResumo,
  type ColaboradorReajusteResumo,
} from '@/features/reajuste/api';
import {
  isElegivelParaReajuste,
  MEDIA_MINIMA_REAJUSTE,
} from '@/features/reajuste/eligibility';
import { type TipoSolicitacaoReajuste } from '@/features/reajuste/types';
import { useAuth } from '@/features/auth/auth-context';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useTheme } from '@/hooks/use-theme';

export function PainelReajusteScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { scrollPaddingBottom } = useTabScreenLayout();
  const isSplitLayout = width >= SPLIT_LAYOUT_MIN_WIDTH;

  const [colaboradores, setColaboradores] = useState<ColaboradorReajusteResumo[]>([]);
  const [selected, setSelected] = useState<ColaboradorReajusteResumo | null>(null);
  const [tipoSolicitacao, setTipoSolicitacao] = useState<TipoSolicitacaoReajuste>('reajuste');
  const [justificativa, setJustificativa] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaGeral = selected?.media ?? null;
  const totalRespostas = selected?.totalRespostas ?? 0;
  const temIncidentesRecentes = selected?.temIncidentesRecentes ?? false;

  const isElegivel = useMemo(
    () => isElegivelParaReajuste(mediaGeral, totalRespostas, temIncidentesRecentes),
    [mediaGeral, temIncidentesRecentes, totalRespostas],
  );

  const loadColaboradores = useCallback(async (options?: { refreshing?: boolean }) => {
    if (options?.refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoadingList(true);
    }

    setError(null);

    try {
      const lista = await fetchColaboradoresReajusteResumo();
      setColaboradores(lista);
      setSelected((current) => {
        if (!current) {
          return null;
        }

        return lista.find((item) => item.id === current.id) ?? null;
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Erro ao carregar colaboradores.',
      );
    } finally {
      if (options?.refreshing) {
        setIsRefreshing(false);
      } else {
        setIsLoadingList(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadColaboradores();
    }, [loadColaboradores]),
  );

  const resetSelecao = useCallback(() => {
    setSelected(null);
    setJustificativa('');
    setTipoSolicitacao('reajuste');
  }, []);

  const handleSelectColaborador = useCallback((colaborador: ColaboradorReajusteResumo) => {
    setSelected(colaborador);
    setJustificativa('');
    setTipoSolicitacao('reajuste');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!user || !selected || !isElegivel) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createSolicitacaoMelhoria({
        colaboradorId: selected.id,
        solicitanteId: user.id,
        tipoSolicitacao,
        justificativa,
        mediaGeral,
        totalRespostas,
      });

      showToast(`Solicitação enviada para o RH — ${selected.nome}.`, 'success');
      resetSelecao();
      void loadColaboradores({ refreshing: true });
    } catch (submitError) {
      showToast(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível registrar a solicitação.',
        'error',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isElegivel,
    justificativa,
    loadColaboradores,
    mediaGeral,
    resetSelecao,
    selected,
    showToast,
    tipoSolicitacao,
    totalRespostas,
    user,
  ]);

  const canSubmit = isElegivel && justificativa.trim().length >= 10 && !isSubmitting;

  const solicitacaoProps = selected
    ? {
        colaborador: selected,
        mediaGeral,
        totalRespostas,
        temIncidentesRecentes,
        isElegivel,
        isLoadingMedia: false,
        tipoSolicitacao,
        justificativa,
        isSubmitting,
        canSubmit,
        onTipoSolicitacaoChange: setTipoSolicitacao,
        onJustificativaChange: setJustificativa,
        onSubmit: () => void handleSubmit(),
      }
    : null;

  const listaColaboradores = (
    <View style={styles.listaSection}>
      <ThemedText type="subtitle">Colaboradores</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.hint}>
        Média e elegibilidade ao lado de cada nome. Toque para abrir a solicitação.
      </ThemedText>

      {colaboradores.length === 0 ? (
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          Nenhum colaborador ativo cadastrado.
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {colaboradores.map((colaborador) => (
            <ColaboradorReajusteRow
              key={colaborador.id}
              colaborador={colaborador}
              isSelected={selected?.id === colaborador.id}
              onPress={() => handleSelectColaborador(colaborador)}
            />
          ))}
        </View>
      )}
    </View>
  );

  if (isLoadingList) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.page, isSplitLayout && styles.pageSplit]}>
          <View style={[styles.header, isSplitLayout && styles.headerSplit]}>
            <ThemedText type="heading">Solicitação de reajuste</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.description}>
              Gestores e gerentes podem solicitar reajuste ou benefícios para colaboradores com
              média mínima de {MEDIA_MINIMA_REAJUSTE.toFixed(1)}. O fluxo segue para o RH e o CEO.
            </ThemedText>
          </View>

          {error ? (
            <ThemedText themeColor="danger" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          {isSplitLayout ? (
            <View style={styles.splitRow}>
              <ScrollView
                style={styles.listaColuna}
                contentContainerStyle={[
                  styles.listaColunaContent,
                  { paddingBottom: scrollPaddingBottom },
                ]}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={() => void loadColaboradores({ refreshing: true })}
                  />
                }
                showsVerticalScrollIndicator={false}>
                {listaColaboradores}
              </ScrollView>

              <View
                style={[
                  styles.detalheColuna,
                  { borderLeftColor: theme.border, backgroundColor: theme.backgroundElement },
                ]}>
                <ScrollView
                  contentContainerStyle={[
                    styles.detalheColunaContent,
                    { paddingBottom: scrollPaddingBottom },
                  ]}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}>
                  {selected && solicitacaoProps ? (
                    <PainelReajusteSolicitacao {...solicitacaoProps} />
                  ) : (
                    <View style={styles.placeholderDetalhe}>
                      <ThemedText type="subtitle">Nenhum colaborador selecionado</ThemedText>
                      <ThemedText themeColor="textSecondary" style={styles.placeholderText}>
                        Escolha um colaborador na lista ao lado para verificar elegibilidade e
                        preencher a solicitação de reajuste.
                      </ThemedText>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => void loadColaboradores({ refreshing: true })}
                />
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {listaColaboradores}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>

      {!isSplitLayout && selected && solicitacaoProps ? (
        <PainelReajusteSolicitacaoModal
          visible
          {...solicitacaoProps}
          onClose={resetSelecao}
        />
      ) : null}
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
  page: {
    flex: 1,
  },
  pageSplit: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
    maxWidth: MaxContentWidth + 520,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  headerSplit: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth + 360,
    width: '100%',
    alignSelf: 'center',
  },
  splitRow: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.three,
    minHeight: 0,
  },
  listaColuna: {
    flex: 0.44,
    minWidth: 300,
  },
  listaColunaContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  detalheColuna: {
    flex: 0.56,
    borderLeftWidth: 1,
    borderRadius: Radius.sm,
    minWidth: 320,
  },
  detalheColunaContent: {
    padding: Spacing.four,
    flexGrow: 1,
  },
  listaSection: {
    gap: Spacing.two,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: Spacing.two,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: Spacing.four,
  },
  placeholderDetalhe: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 320,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
