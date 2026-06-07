import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
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
import { TipoSolicitacaoSelect } from '@/components/reajuste/tipo-solicitacao-select';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ActionButton } from '@/components/ui/action-button';
import { useToast } from '@/components/ui/toast';
import { Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  createSolicitacaoMelhoria,
  fetchColaboradoresAtivos,
  fetchMediaGeralColaborador,
  formatMediaGeral,
  type ColaboradorAtivo,
} from '@/features/aprovacoes/api';
import {
  isElegivelParaReajuste,
  MEDIA_MINIMA_REAJUSTE,
  MENSAGEM_INELEGIVEL_REAJUSTE,
} from '@/features/reajuste/eligibility';
import {
  TIPO_SOLICITACAO_REAJUSTE_LABELS,
  type TipoSolicitacaoReajuste,
} from '@/features/reajuste/types';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';

export function PainelReajusteScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [colaboradores, setColaboradores] = useState<ColaboradorAtivo[]>([]);
  const [selected, setSelected] = useState<ColaboradorAtivo | null>(null);
  const [mediaGeral, setMediaGeral] = useState<number | null>(null);
  const [totalRespostas, setTotalRespostas] = useState(0);
  const [tipoSolicitacao, setTipoSolicitacao] = useState<TipoSolicitacaoReajuste>('reajuste');
  const [justificativa, setJustificativa] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isElegivel = useMemo(
    () => isElegivelParaReajuste(mediaGeral, totalRespostas),
    [mediaGeral, totalRespostas],
  );

  const loadColaboradores = useCallback(async (options?: { refreshing?: boolean }) => {
    if (options?.refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoadingList(true);
    }

    setError(null);

    try {
      const lista = await fetchColaboradoresAtivos();
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
      void loadColaboradores();
    }, [loadColaboradores]),
  );

  const resetSelecao = useCallback(() => {
    setSelected(null);
    setJustificativa('');
    setTipoSolicitacao('reajuste');
    setMediaGeral(null);
    setTotalRespostas(0);
  }, []);

  const handleSelectColaborador = useCallback(
    async (colaborador: ColaboradorAtivo) => {
      setSelected(colaborador);
      setJustificativa('');
      setTipoSolicitacao('reajuste');
      setIsLoadingMedia(true);
      setMediaGeral(null);
      setTotalRespostas(0);

      try {
        const resultado = await fetchMediaGeralColaborador(colaborador.id);
        setMediaGeral(resultado.media);
        setTotalRespostas(resultado.totalRespostas);
      } catch (loadError) {
        showToast(
          loadError instanceof Error ? loadError.message : 'Erro ao carregar média do colaborador.',
          'error',
        );
        resetSelecao();
      } finally {
        setIsLoadingMedia(false);
      }
    },
    [resetSelecao, showToast],
  );

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
    mediaGeral,
    resetSelecao,
    selected,
    showToast,
    tipoSolicitacao,
    totalRespostas,
    user,
  ]);

  const canSubmit =
    isElegivel && justificativa.trim().length >= 10 && !isSubmitting && !isLoadingMedia;

  if (isLoadingList) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadColaboradores({ refreshing: true })}
            />
          }
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
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

          <View
            style={[
              styles.card,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}>
            <ThemedText type="subtitle">Selecionar colaborador</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.hint}>
              Toque em um colaborador ativo para verificar elegibilidade e preencher a solicitação.
            </ThemedText>

            {colaboradores.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                Nenhum colaborador ativo cadastrado.
              </ThemedText>
            ) : (
              <View style={styles.list}>
                {colaboradores.map((colaborador) => {
                  const isSelected = selected?.id === colaborador.id;

                  return (
                    <ColaboradorRow
                      key={colaborador.id}
                      colaborador={colaborador}
                      detail={
                        isSelected
                          ? 'Selecionado · toque para trocar'
                          : [colaborador.departamento, colaborador.funcao]
                              .filter(Boolean)
                              .join(' · ') || undefined
                      }
                      onPress={() => void handleSelectColaborador(colaborador)}
                    />
                  );
                })}
              </View>
            )}
          </View>

          {selected ? (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}>
              <ThemedText type="subtitle">Nova solicitação</ThemedText>
              <ThemedText style={styles.selectedName}>{selected.nome}</ThemedText>

              {isLoadingMedia ? (
                <ActivityIndicator style={styles.mediaLoader} />
              ) : (
                <>
                  <View
                    style={[
                      styles.mediaBox,
                      {
                        backgroundColor: theme.background,
                        borderColor: isElegivel ? theme.border : '#E67E22',
                      },
                    ]}>
                    <ThemedText themeColor="textSecondary" style={styles.mediaLabel}>
                      Média geral histórica
                    </ThemedText>
                    <ThemedText style={styles.mediaValue}>{formatMediaGeral(mediaGeral)}</ThemedText>
                    <ThemedText themeColor="textSecondary" style={styles.mediaMeta}>
                      {totalRespostas}{' '}
                      {totalRespostas === 1 ? 'resposta registrada' : 'respostas registradas'} ·
                      mínimo {MEDIA_MINIMA_REAJUSTE.toFixed(1)}
                    </ThemedText>
                  </View>

                  {!isElegivel ? (
                    <View
                      style={[
                        styles.alertBox,
                        {
                          backgroundColor: theme.dangerMuted,
                          borderColor: '#E67E22',
                        },
                      ]}>
                      <ThemedText style={[styles.alertTitle, { color: '#E67E22' }]}>
                        Inelegível para reajuste
                      </ThemedText>
                      <ThemedText style={[styles.alertMessage, { color: '#C0392B' }]}>
                        {MENSAGEM_INELEGIVEL_REAJUSTE}
                      </ThemedText>
                    </View>
                  ) : (
                    <>
                      <View style={styles.field}>
                        <ThemedText themeColor="textSecondary" style={styles.fieldLabel}>
                          Tipo de solicitação
                        </ThemedText>
                        <TipoSolicitacaoSelect
                          value={tipoSolicitacao}
                          onChange={setTipoSolicitacao}
                        />
                      </View>

                      <View style={styles.field}>
                        <ThemedText themeColor="textSecondary" style={styles.fieldLabel}>
                          Justificativa
                        </ThemedText>
                        <TextInput
                          multiline
                          placeholder="Descreva os motivos, resultados e benefícios esperados..."
                          placeholderTextColor={theme.placeholder}
                          style={[
                            styles.textArea,
                            {
                              color: theme.text,
                              backgroundColor: theme.inputBackground,
                              borderColor: theme.border,
                            },
                          ]}
                          textAlignVertical="top"
                          value={justificativa}
                          onChangeText={setJustificativa}
                        />
                        <ThemedText themeColor="textSecondary" style={styles.charHint}>
                          Mínimo 10 caracteres · {justificativa.trim().length} digitados
                        </ThemedText>
                      </View>

                      <View style={styles.formActions}>
                        <ActionButton
                          label={`Enviar ${TIPO_SOLICITACAO_REAJUSTE_LABELS[tipoSolicitacao]} para o RH`}
                          isLoading={isSubmitting}
                          disabled={!canSubmit}
                          variant="primary"
                          onPress={() => void handleSubmit()}
                        />
                      </View>
                    </>
                  )}

                  <Pressable accessibilityRole="button" onPress={resetSelecao}>
                    <ThemedText themeColor="textSecondary" style={styles.cancel}>
                      Cancelar seleção
                    </ThemedText>
                  </Pressable>
                </>
              )}
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
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth + 360,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: Spacing.six,
  },
  header: {
    gap: Spacing.two,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.four,
    gap: Spacing.three,
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
  },
  selectedName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  mediaLoader: {
    alignSelf: 'flex-start',
  },
  mediaBox: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  mediaLabel: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  mediaValue: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 28,
    lineHeight: 34,
  },
  mediaMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  alertBox: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  alertTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  alertMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  textArea: {
    minHeight: 140,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  charHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  formActions: {
    gap: Spacing.three,
  },
  cancel: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
