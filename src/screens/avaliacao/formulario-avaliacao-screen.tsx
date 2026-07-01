import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AvaliacaoGovernancaFields } from '@/components/avaliacao/avaliacao-governanca-fields';
import { AvaliacaoScoreSegmented } from '@/components/avaliacao/avaliacao-score-segmented';
import { AvaliacaoWizardProgress } from '@/components/avaliacao/avaliacao-wizard-progress';
import { EscalaLegenda } from '@/components/avaliacao/escala-legenda';
import { NotionCheckbox } from '@/components/avaliacao/notion-checkbox';
import { PontoMelhoriaAvaliacaoModal } from '@/components/avaliacao/ponto-melhoria-avaliacao-modal';
import { PDIsAbertoSection } from '@/components/pdi/PDIsAbertoSection';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { useToast } from '@/components/ui/toast';
import { SCREEN_PADDING_LEFT, SCREEN_PADDING_RIGHT } from '@/constants/layout';
import { Fonts, Radius, Spacing, layout } from '@/constants/theme';
import {
  addPontoMelhoriaAvaliacao,
  fetchPerguntasPorAvaliador,
  filterPerguntasPorAvaliador,
  fetchPontosMelhoriaAnteriores,
  submitAvaliacao,
} from '@/features/avaliacao/api';
import { resolveTipoAvaliacaoPorRole, TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import { SECAO_OFFSHORE_LABELS, type SecaoOffshore } from '@/features/avaliacao/secoes-offshore';
import {
  getRespostaValidationMessage,
  isRespostaCompleta,
  type RespostaFormState,
} from '@/features/avaliacao/validation';
import { useAuth } from '@/features/auth/auth-context';
import { useOfflineSync } from '@/features/offline/offline-sync-context';
import { confirmAction } from '@/utils/confirm-action';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import type { AvaliacaoStackParamList } from '@/navigation/avaliacao-stack';
import type { PerguntaAvaliacao, PontoMelhoria } from '@/types/supabase';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useTheme } from '@/hooks/use-theme';
import { getCachedPerguntas, saveAvaliacaoOffline } from '@/services/offlineStorage';

type FormularioRoute = RouteProp<AvaliacaoStackParamList, 'FormularioAvaliacao'>;

type RespostasState = Record<string, RespostaFormState>;
type MelhoriasState = Record<string, boolean>;

type WizardStep =
  | { kind: 'intro' }
  | { kind: 'secao'; secao: string; secaoLabel: string; perguntas: PerguntaAvaliacao[] };

function createEmptyResposta(): RespostaFormState {
  return { nota: null, justificativa: '', evidencia: '' };
}

export function FormularioAvaliacaoScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { role } = useAuthRole();
  const { isOnline } = useNetworkStatus();
  const { refreshPendingCount } = useOfflineSync();
  const { showToast } = useToast();
  const route = useRoute<FormularioRoute>();
  const { avaliadoId, avaliadoNome } = route.params;

  const tipoAvaliacao = resolveTipoAvaliacaoPorRole(role);
  const { scrollPaddingBottom, footerPaddingBottom } = useTabScreenLayout();

  const [perguntas, setPerguntas] = useState<PerguntaAvaliacao[]>([]);
  const [pontosMelhoria, setPontosMelhoria] = useState<PontoMelhoria[]>([]);
  const [respostas, setRespostas] = useState<RespostasState>({});
  const [melhorias, setMelhorias] = useState<MelhoriasState>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastAvaliacaoId, setLastAvaliacaoId] = useState<string | null>(null);
  const [isPontoMelhoriaModalVisible, setIsPontoMelhoriaModalVisible] = useState(false);
  const [touchedPerguntas, setTouchedPerguntas] = useState<Record<string, boolean>>({});

  const wizardSteps = useMemo<WizardStep[]>(() => {
    const grupos = new Map<string, PerguntaAvaliacao[]>();

    for (const pergunta of perguntas) {
      const secao = pergunta.secao_departamento ?? 'GERAL';
      const lista = grupos.get(secao) ?? [];
      lista.push(pergunta);
      grupos.set(secao, lista);
    }

    const secaoSteps: WizardStep[] = [...grupos.entries()].map(([secao, perguntasSecao]) => {
      const secaoLabel =
        secao in SECAO_OFFSHORE_LABELS
          ? SECAO_OFFSHORE_LABELS[secao as SecaoOffshore]
          : secao;

      return {
        kind: 'secao' as const,
        secao,
        secaoLabel,
        perguntas: perguntasSecao,
      };
    });

    return [{ kind: 'intro' as const }, ...secaoSteps];
  }, [perguntas]);

  const currentStep = wizardSteps[currentStepIndex] ?? { kind: 'intro' as const };
  const isLastStep = currentStepIndex >= wizardSteps.length - 1;
  const isIntroStep = currentStep.kind === 'intro';

  const canSubmit = useMemo(() => {
    if (perguntas.length === 0) {
      return false;
    }

    return perguntas.every((pergunta) => isRespostaCompleta(respostas[pergunta.id] ?? createEmptyResposta()));
  }, [perguntas, respostas]);

  const loadForm = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cachedPerguntas = !isOnline ? await getCachedPerguntas() : null;

      const perguntasPromise = isOnline
        ? fetchPerguntasPorAvaliador({
            role,
            tipo: tipoAvaliacao,
            departamentoAvaliador: user?.departamento,
          })
        : Promise.resolve(
            filterPerguntasPorAvaliador(cachedPerguntas?.perguntas ?? [], {
              role,
              tipo: tipoAvaliacao,
              departamentoAvaliador: user?.departamento,
            }),
          );

      const pontosPromise = isOnline ? fetchPontosMelhoriaAnteriores(avaliadoId) : Promise.resolve([]);

      const [perguntasLista, pontos] = await Promise.all([perguntasPromise, pontosPromise]);

      if (perguntasLista.length === 0 && !isOnline) {
        throw new Error('Perguntas não disponíveis offline. Conecte-se à internet pelo menos uma vez.');
      }

      setPerguntas(perguntasLista);
      setPontosMelhoria(pontos);
      setCurrentStepIndex(0);

      const initialRespostas: RespostasState = {};
      perguntasLista.forEach((pergunta) => {
        initialRespostas[pergunta.id] = createEmptyResposta();
      });
      setRespostas(initialRespostas);

      const initialMelhorias: MelhoriasState = {};
      pontos.forEach((ponto) => {
        initialMelhorias[ponto.id] = false;
      });
      setMelhorias(initialMelhorias);
      setTouchedPerguntas({});
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar formulário.');
    } finally {
      setIsLoading(false);
    }
  }, [avaliadoId, isOnline, role, tipoAvaliacao, user?.departamento]);

  useEffect(() => {
    void loadForm();
  }, [loadForm]);

  function updateResposta(perguntaId: string, patch: Partial<RespostaFormState>) {
    setRespostas((current) => {
      const previous = current[perguntaId] ?? createEmptyResposta();
      const nextNota = patch.nota !== undefined ? patch.nota : previous.nota;

      return {
        ...current,
        [perguntaId]: {
          ...previous,
          ...patch,
          justificativa: nextNota !== null && nextNota > 1 ? '' : (patch.justificativa ?? previous.justificativa),
          evidencia: nextNota !== null && nextNota < 3 ? '' : (patch.evidencia ?? previous.evidencia),
        },
      };
    });
    setFeedback(null);
  }

  function validateCurrentStep(): boolean {
    if (currentStep.kind !== 'secao') {
      return true;
    }

    for (const pergunta of currentStep.perguntas) {
      const resposta = respostas[pergunta.id] ?? createEmptyResposta();
      const validationMessage = getRespostaValidationMessage(resposta);

      if (validationMessage) {
        setTouchedPerguntas((current) => ({ ...current, [pergunta.id]: true }));
        setFeedback(validationMessage);
        return false;
      }
    }

    setFeedback(null);
    return true;
  }

  function handleNextStep() {
    if (!validateCurrentStep()) {
      return;
    }

    if (isLastStep) {
      void handleSubmit();
      return;
    }

    setCurrentStepIndex((index) => Math.min(index + 1, wizardSteps.length - 1));
  }

  function handlePreviousStep() {
    setFeedback(null);
    setCurrentStepIndex((index) => Math.max(index - 1, 0));
  }

  async function handleSubmit() {
    if (!user || !canSubmit) {
      return;
    }

    for (const pergunta of perguntas) {
      const validationMessage = getRespostaValidationMessage(respostas[pergunta.id] ?? createEmptyResposta());

      if (validationMessage) {
        setFeedback(validationMessage);
        return;
      }
    }

    const confirmed = await confirmAction(
      'Confirmar envio',
      isOnline
        ? 'A avaliação será enviada para validação do RH. Deseja continuar?'
        : 'A avaliação será salva no dispositivo e enviada ao reconectar. Deseja continuar?',
    );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const respostasPayload = perguntas.map((pergunta) => {
      const resposta = respostas[pergunta.id];

      return {
        perguntaId: pergunta.id,
        nota: resposta.nota as number,
        justificativa: resposta.justificativa,
        evidencia: resposta.evidencia,
      };
    });

    const melhoriasPayload = pontosMelhoria.map((ponto) => ({
      pontoId: ponto.id,
      melhorou: melhorias[ponto.id] ?? false,
    }));

    try {
      if (!isOnline) {
        await saveAvaliacaoOffline({
          avaliadorId: user.id,
          avaliadoId,
          avaliadoNome,
          tipo: tipoAvaliacao,
          respostas: respostasPayload,
          melhorias: melhoriasPayload,
        });

        await refreshPendingCount();
        showToast('Avaliação salva localmente. Será enviada ao reconectar.', 'success');
        navigation.goBack();
        return;
      }

      const { avaliacaoId } = await submitAvaliacao({
        avaliadorId: user.id,
        avaliadoId,
        tipo: tipoAvaliacao,
        respostas: respostasPayload,
        melhorias: melhoriasPayload,
      });

      setLastAvaliacaoId(avaliacaoId);
      setIsPontoMelhoriaModalVisible(true);
    } catch (submitError) {
      setFeedback(
        submitError instanceof Error ? submitError.message : 'Não foi possível salvar a avaliação.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const finishAvaliacaoFlow = useCallback(
    (message: string) => {
      setIsPontoMelhoriaModalVisible(false);
      setLastAvaliacaoId(null);
      setFeedback(message);
      navigation.goBack();
    },
    [navigation],
  );

  const handleSkipPontoMelhoria = useCallback(() => {
    finishAvaliacaoFlow('Avaliação enviada para validação do RH.');
  }, [finishAvaliacaoFlow]);

  const handleSubmitPontoMelhoria = useCallback(
    async (texto: string) => {
      if (!lastAvaliacaoId) {
        throw new Error('Não foi possível vincular o ponto de melhoria à avaliação.');
      }

      await addPontoMelhoriaAvaliacao(lastAvaliacaoId, texto);
      finishAvaliacaoFlow('Avaliação enviada para validação do RH.');
    },
    [finishAvaliacaoFlow, lastAvaliacaoId],
  );

  const subtituloFormulario = useMemo(() => {
    const total = perguntas.length;
    if (total <= 3) {
      return `${TIPO_AVALIACAO_LABELS[tipoAvaliacao]} · ${total} critério(s) · escala 0 a 3`;
    }
    return `${TIPO_AVALIACAO_LABELS[tipoAvaliacao]} · ${total} critérios · uma seção por vez`;
  }, [perguntas.length, tipoAvaliacao]);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <SkeletonLoader variant="title" />
        <SkeletonLoader variant="card" count={2} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="danger">{error}</ThemedText>
        <Button label="Tentar novamente" variant="secondary" onPress={() => void loadForm()} />
      </ThemedView>
    );
  }

  const progressLabel =
    currentStep.kind === 'secao' ? currentStep.secaoLabel : 'Preparação da avaliação';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="heading">{avaliadoNome}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              {subtituloFormulario}
            </ThemedText>
          </View>

          <AvaliacaoWizardProgress
            currentStep={currentStepIndex + 1}
            totalSteps={wizardSteps.length}
            sectionLabel={progressLabel}
          />

          {isIntroStep ? (
            <View style={styles.section}>
              <EscalaLegenda />
              <PDIsAbertoSection colaboradorId={avaliadoId} />

              {pontosMelhoria.length > 0 ? (
                <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText type="subtitle">Pontos da avaliação anterior</ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
                    Itens com nota 2 ou 3 na última avaliação do colaborador.
                  </ThemedText>

                  {pontosMelhoria.map((ponto) => (
                    <View key={ponto.id} style={styles.melhoriaItem}>
                      <ThemedText style={styles.melhoriaDescricao}>{ponto.descricao}</ThemedText>
                      <NotionCheckbox
                        checked={melhorias[ponto.id] ?? false}
                        label="O colaborador melhorou neste aspecto?"
                        onToggle={() =>
                          setMelhorias((current) => ({
                            ...current,
                            [ponto.id]: !current[ponto.id],
                          }))
                        }
                      />
                    </View>
                  ))}
                </View>
              ) : null}

              {perguntas.length === 0 ? (
                <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
                  Nenhuma pergunta encontrada para seu papel. Verifique o seed de perguntas no Supabase.
                </ThemedText>
              ) : (
                <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
                  Toque em &quot;Próxima seção&quot; para iniciar a avaliação.
                </ThemedText>
              )}
            </View>
          ) : null}

          {currentStep.kind === 'secao'
            ? currentStep.perguntas.map((pergunta, index) => {
                const resposta = respostas[pergunta.id] ?? createEmptyResposta();
                const validationMessage = getRespostaValidationMessage(resposta);
                const showValidation =
                  Boolean(touchedPerguntas[pergunta.id]) &&
                  validationMessage !== null &&
                  !isRespostaCompleta(resposta);

                return (
                  <View
                    key={pergunta.id}
                    style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
                    <ThemedText style={styles.perguntaIndex}>
                      {pergunta.codigo ?? `Pergunta ${index + 1}`}
                    </ThemedText>
                    <ThemedText style={styles.perguntaTexto}>{pergunta.descricao}</ThemedText>

                    <AvaliacaoScoreSegmented
                      value={resposta.nota}
                      onChange={(nota) => {
                        setTouchedPerguntas((current) => ({ ...current, [pergunta.id]: true }));
                        updateResposta(pergunta.id, { nota });
                      }}
                    />

                    <AvaliacaoGovernancaFields
                      resposta={resposta}
                      showValidation={showValidation}
                      validationMessage={validationMessage}
                      onChange={(patch) => updateResposta(pergunta.id, patch)}
                    />
                  </View>
                );
              })
            : null}

          {feedback ? (
            <ThemedText
              themeColor={feedback.includes('enviada') ? 'textSecondary' : 'danger'}
              style={styles.feedback}>
              {feedback}
            </ThemedText>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              paddingBottom: footerPaddingBottom,
              borderTopColor: theme.border,
              backgroundColor: theme.background,
            },
          ]}>
          <Button
            label="Voltar"
            variant="ghost"
            disabled={currentStepIndex === 0 || isSubmitting}
            onPress={handlePreviousStep}
            style={styles.footerButton}
          />
          <Button
            label={isLastStep ? 'Salvar avaliação' : 'Próxima seção'}
            isLoading={isSubmitting}
            disabled={isLastStep ? !canSubmit : perguntas.length === 0}
            onPress={handleNextStep}
            style={styles.footerButton}
          />
        </View>
      </View>

      <PontoMelhoriaAvaliacaoModal
        visible={isPontoMelhoriaModalVisible}
        colaboradorNome={avaliadoNome}
        onClose={handleSkipPontoMelhoria}
        onSkip={handleSkipPontoMelhoria}
        onSubmit={handleSubmitPontoMelhoria}
      />
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
    paddingLeft: SCREEN_PADDING_LEFT,
    paddingRight: SCREEN_PADDING_RIGHT,
    paddingVertical: Spacing.three,
    gap: Spacing.four,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: Spacing.three,
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    borderRadius: Radius.sm,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  melhoriaItem: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  melhoriaDescricao: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  perguntaIndex: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.7,
  },
  perguntaTexto: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    lineHeight: 22,
  },
  feedback: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: layout.space.md,
    paddingHorizontal: SCREEN_PADDING_LEFT,
    paddingTop: layout.space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerButton: {
    flex: 1,
  },
});
