import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PDICard } from '@/components/pdi/PDICard';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { PDI_EVOLUCAO_LABELS } from '@/features/pdi/labels';
import type { PdiEvolucaoCiclo, PlanoDesenvolvimento } from '@/features/pdi/types';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { atualizarProgresso, buscarPDIsAtivosColaborador } from '@/services/pdiService';

type PDIsAbertoSectionProps = {
  colaboradorId: string;
};

export function PDIsAbertoSection({ colaboradorId }: PDIsAbertoSectionProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [pdis, setPdis] = useState<PlanoDesenvolvimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [evolucao, setEvolucao] = useState<Record<string, PdiEvolucaoCiclo | null>>({});

  const loadPdis = useCallback(async () => {
    setIsLoading(true);

    try {
      const lista = await buscarPDIsAtivosColaborador(colaboradorId);
      setPdis(lista);
    } catch {
      setPdis([]);
    } finally {
      setIsLoading(false);
    }
  }, [colaboradorId]);

  useEffect(() => {
    void loadPdis();
  }, [loadPdis]);

  async function handleSalvarEvolucao(pdi: PlanoDesenvolvimento) {
    if (!user) {
      return;
    }

    const resposta = evolucao[pdi.id];

    if (!resposta) {
      showToast('Selecione se houve evolução neste ponto.', 'error');
      return;
    }

    setSavingId(pdi.id);

    try {
      await atualizarProgresso(
        pdi.id,
        {
          evolucaoCiclo: resposta,
          comentarioHistorico: `Registrado durante avaliação do ciclo.`,
        },
        user.id,
      );

      showToast('Evolução do PDI registrada.', 'success');
      await loadPdis();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erro ao salvar.', 'error');
    } finally {
      setSavingId(null);
    }
  }

  if (isLoading) {
    return null;
  }

  if (pdis.length === 0) {
    return null;
  }

  return (
    <View style={[styles.section, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <ThemedText type="subtitle">PDIs em aberto</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.hint}>
        Planos de desenvolvimento ativos deste colaborador. Registre a evolução observada no ciclo.
      </ThemedText>

      {pdis.map((pdi) => (
        <View key={pdi.id} style={styles.item}>
          <PDICard compact pdi={pdi} onPress={() => undefined} />

          <ThemedText style={styles.question}>
            O colaborador demonstrou evolução neste ponto durante o ciclo?
          </ThemedText>

          <View style={styles.options}>
            {(Object.keys(PDI_EVOLUCAO_LABELS) as PdiEvolucaoCiclo[]).map((option) => {
              const isActive = evolucao[pdi.id] === option;

              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  onPress={() => setEvolucao((current) => ({ ...current, [pdi.id]: option }))}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: isActive ? theme.backgroundSelected : theme.background,
                      borderColor: theme.border,
                    },
                  ]}>
                  <ThemedText style={styles.optionText}>{PDI_EVOLUCAO_LABELS[option]}</ThemedText>
                </Pressable>
              );
            })}
          </View>

          <Button
            label={savingId === pdi.id ? 'Salvando...' : 'Registrar evolução'}
            variant="secondary"
            disabled={savingId === pdi.id}
            onPress={() => void handleSalvarEvolucao(pdi)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  item: {
    gap: Spacing.two,
  },
  question: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  options: {
    gap: Spacing.two,
  },
  optionChip: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  optionText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
