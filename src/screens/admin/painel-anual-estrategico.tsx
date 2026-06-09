import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ColaboradorRow } from '@/components/avaliacao/colaborador-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ActionButton } from '@/components/ui/action-button';
import { useToast } from '@/components/ui/toast';
import { Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  fetchColaboradoresConsolidados,
  fetchDecisaoAnualExistente,
  fetchMediasAnuaisColaborador,
  formatMediaAnual,
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
  TIPO_BENEFICIO_ANUAL_LABELS,
  type TipoBeneficioAnual,
} from '@/types/supabase';

const TIPOS_BENEFICIO: TipoBeneficioAnual[] = ['reajuste', 'plr', 'bonificacao', 'nenhum'];

function MediaCard({
  titulo,
  media,
  detalhe,
}: {
  titulo: string;
  media: number | null;
  detalhe: string;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.mediaCard, { borderColor: theme.border, backgroundColor: theme.background }]}>
      <ThemedText themeColor="textSecondary" style={styles.mediaCardLabel}>
        {titulo}
      </ThemedText>
      <ThemedText style={styles.mediaCardValue}>{formatMediaAnual(media)}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.mediaCardDetalhe}>
        {detalhe}
      </ThemedText>
    </View>
  );
}

function BeneficioPicker({
  value,
  onChange,
  disabled,
}: {
  value: TipoBeneficioAnual;
  onChange: (value: TipoBeneficioAnual) => void;
  disabled?: boolean;
}) {
  const theme = useTheme();

  return (
    <View style={styles.beneficioRow}>
      {TIPOS_BENEFICIO.map((tipo) => {
        const isSelected = value === tipo;

        return (
          <Pressable
            key={tipo}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled }}
            onPress={() => onChange(tipo)}
            style={[
              styles.beneficioChip,
              {
                borderColor: isSelected ? theme.text : theme.border,
                backgroundColor: isSelected ? theme.backgroundSelected : theme.background,
                opacity: disabled ? 0.6 : 1,
              },
            ]}>
            <ThemedText
              style={[
                styles.beneficioChipLabel,
                isSelected && { fontFamily: Fonts.sansSemiBold },
              ]}>
              {TIPO_BENEFICIO_ANUAL_LABELS[tipo]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function PainelAnualEstrategicoScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { role, isLoading: isRoleLoading } = useAuthRole();
  const { showToast } = useToast();

  const anoReferencia = new Date().getFullYear();
  const canAccess = isPainelAnualEstrategicoRole(role);
  const { scrollPaddingBottom } = useTabScreenLayout();

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
        setSelected(null);
      } finally {
        setIsLoadingDetalhe(false);
      }
    },
    [anoReferencia, showToast],
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
      setSelected(null);
      setMedias(null);
      setDecisaoExistente(null);
      setJustificativaFinanceira('');
      setTipoBeneficio('nenhum');
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
    selected,
    showToast,
    tipoBeneficio,
    user,
  ]);

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
          <View style={styles.header}>
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
          ) : (
            <View style={styles.section}>
              <ThemedText type="subtitle">Colaboradores</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
                Selecione um colaborador para consolidar médias quinzenais e semestrais do ano.
              </ThemedText>

              {colaboradores.map((colaborador) => (
                <ColaboradorRow
                  key={colaborador.id}
                  colaborador={colaborador}
                  detail={[colaborador.departamento, colaborador.funcao].filter(Boolean).join(' · ')}
                  onPress={() => void handleSelectColaborador(colaborador)}
                />
              ))}
            </View>
          )}

          {selected ? (
            <View
              style={[
                styles.painelDecisao,
                { borderColor: theme.border, backgroundColor: theme.backgroundElement },
              ]}>
              <ThemedText type="subtitle">{selected.nome}</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
                {selected.departamento ?? 'Sem departamento'} · {selected.funcao ?? 'Sem função'}
              </ThemedText>

              {isLoadingDetalhe ? (
                <ActivityIndicator style={styles.loaderDetalhe} />
              ) : medias ? (
                <>
                  <View style={styles.mediasRow}>
                    <MediaCard
                      titulo="Média quinzenal"
                      media={medias.mediaQuinzenal}
                      detalhe={`${medias.totalAvaliacoesQuinzenal} avaliações · ${medias.totalRespostasQuinzenal} notas`}
                    />
                    <MediaCard
                      titulo="Média semestral"
                      media={medias.mediaSemestral}
                      detalhe={`${medias.totalAvaliacoesSemestral} avaliações · ${medias.totalRespostasSemestral} notas`}
                    />
                  </View>

                  {decisaoExistente ? (
                    <View style={[styles.decisaoRegistrada, { borderColor: theme.border }]}>
                      <ThemedText style={styles.impactoTitulo}>
                        Decisão já registrada em {anoReferencia}
                      </ThemedText>
                      <ThemedText type="subtitle" style={styles.impactoValor}>
                        {TIPO_BENEFICIO_ANUAL_LABELS[decisaoExistente.tipoBeneficio]}
                      </ThemedText>
                      <ThemedText themeColor="textSecondary" style={styles.justificativaExistente}>
                        {decisaoExistente.justificativaFinanceira}
                      </ThemedText>
                    </View>
                  ) : (
                    <>
                      <View style={styles.formGroup}>
                        <ThemedText style={styles.fieldLabel}>Tipo de benefício</ThemedText>
                        <BeneficioPicker value={tipoBeneficio} onChange={setTipoBeneficio} />
                      </View>

                      <View style={styles.formGroup}>
                        <ThemedText style={styles.fieldLabel}>
                          Justificativa financeira / impacto no caixa
                        </ThemedText>
                        <TextInput
                          multiline
                          placeholder="Descreva o impacto financeiro, sustentabilidade do caixa e fundamentação da decisão..."
                          placeholderTextColor={theme.placeholder}
                          style={[
                            styles.textInput,
                            {
                              color: theme.text,
                              backgroundColor: theme.background,
                              borderColor: theme.border,
                            },
                          ]}
                          value={justificativaFinanceira}
                          onChangeText={setJustificativaFinanceira}
                        />
                      </View>

                      <ActionButton
                        label="Registrar decisão anual"
                        isLoading={isSubmitting}
                        disabled={justificativaFinanceira.trim().length < 10}
                        onPress={() => void handleSubmit()}
                      />
                    </>
                  )}

                  <Pressable onPress={() => setSelected(null)} style={styles.cancelarPress}>
                    <ThemedText themeColor="textSecondary">Fechar painel do colaborador</ThemedText>
                  </Pressable>
                </>
              ) : null}
            </View>
          ) : null}
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
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: Spacing.two,
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
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
  painelDecisao: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  loaderDetalhe: {
    marginVertical: Spacing.two,
  },
  mediasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  mediaCard: {
    flexGrow: 1,
    flexBasis: 140,
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  mediaCardLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  mediaCardValue: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 28,
    lineHeight: 34,
  },
  mediaCardDetalhe: {
    fontSize: 12,
    lineHeight: 16,
  },
  formGroup: {
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  beneficioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  beneficioChip: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  beneficioChipLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  textInput: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  decisaoRegistrada: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  impactoTitulo: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  impactoValor: {
    fontSize: 18,
    lineHeight: 24,
  },
  justificativaExistente: {
    fontSize: 14,
    lineHeight: 20,
  },
  cancelarPress: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
});
