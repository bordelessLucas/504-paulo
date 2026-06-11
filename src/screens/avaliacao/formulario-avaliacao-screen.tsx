import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { EscalaLegenda } from '@/components/avaliacao/escala-legenda';
import { PontoMelhoriaAvaliacaoModal } from '@/components/avaliacao/ponto-melhoria-avaliacao-modal';
import { NotionCheckbox } from '@/components/avaliacao/notion-checkbox';
import { ScorePicker } from '@/components/avaliacao/score-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import {
  addPontoMelhoriaAvaliacao,
  fetchPerguntasUniversais,
  fetchPontosMelhoriaAnteriores,
  submitAvaliacao,
} from '@/features/avaliacao/api';
import { resolveTipoAvaliacaoPorRole, TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import {
  getRespostaValidationMessage,
  isRespostaCompleta,
  type RespostaFormState,
} from '@/features/avaliacao/validation';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import type { AvaliacaoStackParamList } from '@/navigation/avaliacao-stack';
import type { PerguntaAvaliacao, PontoMelhoria } from '@/types/supabase';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useTheme } from '@/hooks/use-theme';

type FormularioRoute = RouteProp<AvaliacaoStackParamList, 'FormularioAvaliacao'>;

type RespostasState = Record<string, RespostaFormState>;
type MelhoriasState = Record<string, boolean>;

function createEmptyResposta(): RespostaFormState {
  return { nota: null, justificativa: '', evidencia: '' };
}

export function FormularioAvaliacaoScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { role } = useAuthRole();
  const route = useRoute<FormularioRoute>();
  const { avaliadoId, avaliadoNome } = route.params;

  const tipoAvaliacao = resolveTipoAvaliacaoPorRole(role);
  const { scrollPaddingBottom } = useTabScreenLayout();

  const [perguntas, setPerguntas] = useState<PerguntaAvaliacao[]>([]);
  const [pontosMelhoria, setPontosMelhoria] = useState<PontoMelhoria[]>([]);
  const [respostas, setRespostas] = useState<RespostasState>({});
  const [melhorias, setMelhorias] = useState<MelhoriasState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastAvaliacaoId, setLastAvaliacaoId] = useState<string | null>(null);
  const [isPontoMelhoriaModalVisible, setIsPontoMelhoriaModalVisible] = useState(false);

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
      const [perguntasLista, pontos] = await Promise.all([
        fetchPerguntasUniversais(),
        fetchPontosMelhoriaAnteriores(avaliadoId),
      ]);

      setPerguntas(perguntasLista);
      setPontosMelhoria(pontos);

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
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar formulário.');
    } finally {
      setIsLoading(false);
    }
  }, [avaliadoId]);

  useEffect(() => {
    void loadForm();
  }, [loadForm]);

  function updateResposta(perguntaId: string, patch: Partial<RespostaFormState>) {
    setRespostas((current) => ({
      ...current,
      [perguntaId]: {
        ...(current[perguntaId] ?? createEmptyResposta()),
        ...patch,
      },
    }));
    setFeedback(null);
  }

  async function handleSubmit() {
    if (!user || !canSubmit) {
      return;
    }

    for (const pergunta of perguntas) {
      const validationMessage = getRespostaValidationMessage(
        respostas[pergunta.id] ?? createEmptyResposta(),
      );

      if (validationMessage) {
        setFeedback(validationMessage);
        return;
      }
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const { avaliacaoId } = await submitAvaliacao({
        avaliadorId: user.id,
        avaliadoId,
        tipo: tipoAvaliacao,
        respostas: perguntas.map((pergunta) => {
          const resposta = respostas[pergunta.id];

          return {
            perguntaId: pergunta.id,
            nota: resposta.nota as number,
            justificativa: resposta.justificativa,
            evidencia: resposta.evidencia,
          };
        }),
        melhorias: pontosMelhoria.map((ponto) => ({
          pontoId: ponto.id,
          melhorou: melhorias[ponto.id] ?? false,
        })),
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
        <Button label="Tentar novamente" variant="secondary" onPress={() => void loadForm()} />
      </ThemedView>
    );
  }

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
              {TIPO_AVALIACAO_LABELS[tipoAvaliacao]} · 3 critérios universais · escala 0 a 3
            </ThemedText>
          </View>

          <EscalaLegenda />

          {pontosMelhoria.length > 0 ? (
            <View style={[styles.section, styles.card, { backgroundColor: theme.backgroundElement }]}>
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

          <View style={styles.section}>
            <ThemedText type="subtitle">Perguntas da avaliação</ThemedText>

            {perguntas.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
                Perguntas universais não encontradas. Execute o script sql/seed_perguntas_universais.sql
                no Supabase.
              </ThemedText>
            ) : (
              perguntas.map((pergunta, index) => {
                const resposta = respostas[pergunta.id] ?? createEmptyResposta();
                const validationMessage = getRespostaValidationMessage(resposta);
                const showValidation =
                  resposta.nota !== null &&
                  validationMessage !== null &&
                  !isRespostaCompleta(resposta);

                return (
                  <View
                    key={pergunta.id}
                    style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
                    <ThemedText style={styles.perguntaIndex}>Pergunta {index + 1}</ThemedText>
                    <ThemedText style={styles.perguntaTexto}>{pergunta.descricao}</ThemedText>

                    <ScorePicker
                      value={resposta.nota}
                      onChange={(nota) =>
                        updateResposta(pergunta.id, {
                          nota,
                          evidencia: '',
                        })
                      }
                    />

                    {resposta.nota !== null ? (
                      <View style={styles.fieldGroup}>
                        <ThemedText style={styles.fieldLabel}>Justificativa *</ThemedText>
                        <TextInput
                          multiline
                          placeholder="Descreva o motivo da nota atribuída"
                          placeholderTextColor={theme.placeholder}
                          style={[
                            styles.textInput,
                            {
                              color: theme.text,
                              backgroundColor: theme.background,
                              borderColor: showValidation ? theme.danger : theme.border,
                            },
                          ]}
                          value={resposta.justificativa}
                          onChangeText={(justificativa) =>
                            updateResposta(pergunta.id, { justificativa })
                          }
                        />
                      </View>
                    ) : null}

                    {showValidation ? (
                      <ThemedText themeColor="danger" style={styles.fieldError}>
                        {validationMessage}
                      </ThemedText>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>

          {feedback ? (
            <ThemedText
              themeColor={feedback.includes('sucesso') ? 'textSecondary' : 'danger'}
              style={styles.feedback}>
              {feedback}
            </ThemedText>
          ) : null}

          <Button
            label="Salvar avaliação"
            isLoading={isSubmitting}
            disabled={!canSubmit}
            onPress={() => void handleSubmit()}
          />
        </ScrollView>
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
    paddingHorizontal: Spacing.four,
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
  fieldGroup: {
    gap: Spacing.one,
  },
  fieldLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.85,
  },
  textInput: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  fieldError: {
    fontSize: 12,
    lineHeight: 16,
  },
  feedback: {
    fontSize: 14,
    lineHeight: 20,
  },
});
