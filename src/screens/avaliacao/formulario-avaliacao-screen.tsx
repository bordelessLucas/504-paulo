import { useRoute, type RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotionCheckbox } from '@/components/avaliacao/notion-checkbox';
import { ScorePicker } from '@/components/avaliacao/score-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { PERFIL_ALVO_LABELS } from '@/features/avaliacao/perfil-alvo';
import {
  fetchPerguntasPorAvaliador,
  fetchPontosMelhoriaPendentes,
  submitAvaliacao,
} from '@/features/avaliacao/api';
import { useAuth } from '@/features/auth/auth-context';
import type { AvaliacaoStackParamList } from '@/navigation/avaliacao-stack';
import type { PerguntaAvaliacao, PontoMelhoria } from '@/types/supabase';
import { useTheme } from '@/hooks/use-theme';

type FormularioRoute = RouteProp<AvaliacaoStackParamList, 'FormularioAvaliacao'>;

type RespostasState = Record<string, { nota: number | null; comentario: string }>;
type MelhoriasState = Record<string, boolean>;

export function FormularioAvaliacaoScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const route = useRoute<FormularioRoute>();
  const { avaliadoId, avaliadoNome } = route.params;

  const [perguntas, setPerguntas] = useState<PerguntaAvaliacao[]>([]);
  const [pontosMelhoria, setPontosMelhoria] = useState<PontoMelhoria[]>([]);
  const [perfilAlvoLabel, setPerfilAlvoLabel] = useState('');
  const [respostas, setRespostas] = useState<RespostasState>({});
  const [melhorias, setMelhorias] = useState<MelhoriasState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadForm = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [perguntasResult, pontos] = await Promise.all([
        fetchPerguntasPorAvaliador(user?.departamento, user?.funcao),
        fetchPontosMelhoriaPendentes(avaliadoId),
      ]);

      setPerguntas(perguntasResult.perguntas);
      setPerfilAlvoLabel(PERFIL_ALVO_LABELS[perguntasResult.perfilAlvo]);
      setPontosMelhoria(pontos);

      const initialRespostas: RespostasState = {};
      perguntasResult.perguntas.forEach((pergunta) => {
        initialRespostas[pergunta.id] = { nota: null, comentario: '' };
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
  }, [avaliadoId, user?.departamento, user?.funcao]);

  useEffect(() => {
    void loadForm();
  }, [loadForm]);

  async function handleSubmit() {
    if (!user) {
      return;
    }

    const perguntasSemNota = perguntas.filter((pergunta) => !respostas[pergunta.id]?.nota);

    if (perguntasSemNota.length > 0) {
      setFeedback('Responda todas as perguntas com uma nota de 1 a 5.');
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await submitAvaliacao({
        avaliadorId: user.id,
        avaliadoId,
        respostas: perguntas.map((pergunta) => ({
          perguntaId: pergunta.id,
          nota: respostas[pergunta.id].nota as number,
          comentario: respostas[pergunta.id].comentario,
        })),
        melhorias: pontosMelhoria.map((ponto) => ({
          pontoId: ponto.id,
          melhorou: melhorias[ponto.id] ?? false,
        })),
      });

      setFeedback('Avaliação registrada com sucesso.');
    } catch (submitError) {
      setFeedback(
        submitError instanceof Error ? submitError.message : 'Não foi possível salvar a avaliação.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="heading">{avaliadoNome}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Perguntas do perfil {perfilAlvoLabel} · escala de 1 a 5
            </ThemedText>
          </View>

          {pontosMelhoria.length > 0 ? (
            <View style={[styles.section, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="subtitle">Pontos de melhoria em aberto</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
                Marque se o colaborador evoluiu em cada aspecto listado.
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
                Nenhuma pergunta cadastrada para o seu perfil ({perfilAlvoLabel}).
              </ThemedText>
            ) : (
              perguntas.map((pergunta, index) => (
                <View
                  key={pergunta.id}
                  style={[styles.perguntaCard, { backgroundColor: theme.backgroundElement }]}>
                  <ThemedText style={styles.perguntaIndex}>Pergunta {index + 1}</ThemedText>
                  <ThemedText style={styles.perguntaTexto}>{pergunta.texto_pergunta}</ThemedText>

                  <ScorePicker
                    value={respostas[pergunta.id]?.nota ?? null}
                    onChange={(nota) =>
                      setRespostas((current) => ({
                        ...current,
                        [pergunta.id]: {
                          ...current[pergunta.id],
                          nota,
                        },
                      }))
                    }
                  />

                  <TextInput
                    multiline
                    placeholder="Comentário opcional"
                    placeholderTextColor={theme.placeholder}
                    style={[
                      styles.comentarioInput,
                      {
                        color: theme.text,
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                    value={respostas[pergunta.id]?.comentario ?? ''}
                    onChangeText={(comentario) =>
                      setRespostas((current) => ({
                        ...current,
                        [pergunta.id]: {
                          ...current[pergunta.id],
                          comentario,
                        },
                      }))
                    }
                  />
                </View>
              ))
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
            disabled={perguntas.length === 0}
            onPress={() => void handleSubmit()}
          />
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
    paddingVertical: Spacing.three,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
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
  melhoriaItem: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  melhoriaDescricao: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  perguntaCard: {
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
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
  comentarioInput: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  feedback: {
    fontSize: 14,
    lineHeight: 20,
  },
});
