import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  PainelAnualDetalheColaborador,
  PainelAnualDetalheModal,
} from '@/components/anual/painel-anual-detalhe-colaborador';
import { ColaboradorRow } from '@/components/avaliacao/colaborador-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/ui/toast';
import { SPLIT_LAYOUT_MIN_WIDTH } from '@/constants/layout';
import { Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  fetchColaboradoresConsolidados,
  fetchDecisaoAnualExistente,
  fetchMediasAnuaisColaborador,
  salvarDecisaoAnualEstrategica,
  type ColaboradorConsolidado,
  type DecisaoAnualExistente,
  type MediasAnuaisColaborador,
} from '@/features/anual/painel-anual-api';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useTheme } from '@/hooks/use-theme';
import {
  isPainelAnualEstrategicoRole,
  type TipoBeneficioAnual,
} from '@/types/supabase';

export function PainelAnualEstrategicoScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { role, isLoading: isRoleLoading } = useAuthRole();
  const { showToast } = useToast();

  const anoReferencia = new Date().getFullYear();
  const canAccess = isPainelAnualEstrategicoRole(role);
  const { scrollPaddingBottom } = useTabScreenLayout();
  const isSplitLayout = width >= SPLIT_LAYOUT_MIN_WIDTH;

  const [colaboradores, setColaboradores] = useState<ColaboradorConsolidado[]>([]);
  const [selected, setSelected] = useState<ColaboradorConsolidado | null>(null);
  const [medias, setMedias] = useState<MediasAnuaisColaborador | null>(null);
  const [decisaoExistente, setDecisaoExistente] = useState<DecisaoAnualExistente | null>(null);
  const [tipoBeneficio, setTipoBeneficio] = useState<TipoBeneficioAnual>('nenhum');
  const [justificativaFinanceira, setJustificativaFinanceira] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetalhe, setIsLoadingDetalhe] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetDetalhe = useCallback(() => {
    setSelected(null);
    setMedias(null);
    setDecisaoExistente(null);
    setJustificativaFinanceira('');
    setTipoBeneficio('nenhum');
  }, []);

  const loadColaboradores = useCallback(async (options?: { refreshing?: boolean }) => {
    if (options?.refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoadingList(true);
    }

    setError(null);

    try {
      const lista = await fetchColaboradoresConsolidados();
      setColaboradores(lista);
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
      if (canAccess) {
        void loadColaboradores();
      }
    }, [canAccess, loadColaboradores]),
  );

  const handleSelectColaborador = useCallback(
    async (colaborador: ColaboradorConsolidado) => {
      setSelected(colaborador);
      setTipoBeneficio('nenhum');
      setJustificativaFinanceira('');
      setMedias(null);
      setDecisaoExistente(null);
      setIsLoadingDetalhe(true);

      try {
        const [mediasAno, decisao] = await Promise.all([
          fetchMediasAnuaisColaborador(colaborador.id, anoReferencia),
          fetchDecisaoAnualExistente(colaborador.id, anoReferencia),
        ]);

        setMedias(mediasAno);
        setDecisaoExistente(decisao);

        if (decisao) {
          setTipoBeneficio(decisao.tipoBeneficio);
          setJustificativaFinanceira(decisao.justificativaFinanceira);
        }
      } catch (loadError) {
        showToast(
          loadError instanceof Error ? loadError.message : 'Erro ao carregar dados anuais.',
          'error',
        );
        resetDetalhe();
      } finally {
        setIsLoadingDetalhe(false);
      }
    },
    [anoReferencia, resetDetalhe, showToast],
  );

  const handleSubmit = useCallback(async () => {
    if (!user || !selected || !medias || decisaoExistente) {
      return;
    }

    setIsSubmitting(true);

    try {
      await salvarDecisaoAnualEstrategica({
        colaboradorId: selected.id,
        decididoPorId: user.id,
        anoReferencia,
        tipoBeneficio,
        justificativaFinanceira,
        medias,
      });

      showToast(`Decisão anual ${anoReferencia} registrada — ${selected.nome}.`, 'success');
      resetDetalhe();
    } catch (submitError) {
      showToast(
        submitError instanceof Error ? submitError.message : 'Erro ao salvar decisão anual.',
        'error',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    anoReferencia,
    decisaoExistente,
    justificativaFinanceira,
    medias,
    resetDetalhe,
    selected,
    showToast,
    tipoBeneficio,
    user,
  ]);

  const detalheProps = selected
    ? {
        colaborador: selected,
        anoReferencia,
        medias,
        decisaoExistente,
        tipoBeneficio,
        justificativaFinanceira,
        isLoadingDetalhe,
        isSubmitting,
        onTipoBeneficioChange: setTipoBeneficio,
        onJustificativaChange: setJustificativaFinanceira,
        onSubmit: () => void handleSubmit(),
      }
    : null;

  const listaColaboradores = (
    <View style={styles.listaSection}>
      <ThemedText type="subtitle">Colaboradores</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
        Selecione um colaborador para consolidar médias quinzenais e semestrais do ano.
      </ThemedText>

      {colaboradores.map((colaborador) => (
        <ColaboradorRow
          key={colaborador.id}
          colaborador={colaborador}
          isSelected={selected?.id === colaborador.id}
          detail={[colaborador.departamento, colaborador.funcao].filter(Boolean).join(' · ')}
          onPress={() => void handleSelectColaborador(colaborador)}
        />
      ))}
    </View>
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
        <ThemedText type="subtitle">Acesso restrito</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.restrictedText}>
          O Painel Anual Estratégico é exclusivo para RH, Gerente Administrativo e CEO.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.page, isSplitLayout && styles.pageSplit]}>
          <View style={[styles.header, isSplitLayout && styles.headerSplit]}>
            <ThemedText type="heading">Análise Anual Estratégica</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Consolidação {anoReferencia} · decisões de PLR, bonificação e reajuste com visão de
              caixa.
            </ThemedText>
          </View>

          {isLoadingList ? (
            <View style={styles.centeredSection}>
              <ActivityIndicator size="large" />
            </View>
          ) : error ? (
            <View style={styles.centeredSection}>
              <ThemedText themeColor="danger">{error}</ThemedText>
            </View>
          ) : isSplitLayout ? (
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
                  {selected && detalheProps ? (
                    <PainelAnualDetalheColaborador {...detalheProps} />
                  ) : (
                    <View style={styles.placeholderDetalhe}>
                      <ThemedText type="subtitle">Nenhum colaborador selecionado</ThemedText>
                      <ThemedText themeColor="textSecondary" style={styles.placeholderText}>
                        Escolha um colaborador na lista ao lado para visualizar as médias anuais e
                        registrar a decisão estratégica.
                      </ThemedText>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: scrollPaddingBottom },
              ]}
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

      {!isSplitLayout && selected && detalheProps ? (
        <PainelAnualDetalheModal
          visible
          {...detalheProps}
          onClose={resetDetalhe}
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
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  headerSplit: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
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
    flex: 0.42,
    minWidth: 280,
  },
  listaColunaContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  detalheColuna: {
    flex: 0.58,
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
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
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
    padding: Spacing.four,
    gap: Spacing.two,
  },
  centeredSection: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  restrictedText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 320,
  },
});
