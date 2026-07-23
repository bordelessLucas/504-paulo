import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { PDICard } from '@/components/pdi/PDICard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { PDI_STATUS_LABELS, PDI_STATUS_OPTIONS } from '@/features/pdi/labels';
import type { PdiAtualizacao, PdiStatus, PlanoDesenvolvimento } from '@/features/pdi/types';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useTheme } from '@/hooks/use-theme';
import {
  atualizarProgresso,
  buscarHistoricoPDI,
  buscarPDIById,
  cancelarPDI,
} from '@/services/pdiService';
import { confirmAction } from '@/utils/confirm-action';
import { isAdminDashboardRole } from '@/types/supabase';

const PROGRESS_STEPS = [0, 25, 50, 75, 100];

type PDIDetailScreenProps = {
  pdiId: string;
  onUpdated?: () => void;
};

function canManagePdi(role: ReturnType<typeof useAuthRole>['role']): boolean {
  return (
    role === 'supervisor' ||
    role === 'gestor' ||
    role === 'gerente' ||
    isAdminDashboardRole(role)
  );
}

export function PDIDetailRouteScreen({
  route,
}: {
  route: { params: { pdiId: string } };
}) {
  return <PDIDetailScreen pdiId={route.params.pdiId} />;
}

export function PDIDetailScreen({ pdiId, onUpdated }: PDIDetailScreenProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const { role } = useAuthRole();
  const { showToast } = useToast();
  const { scrollPaddingBottom } = useTabScreenLayout();

  const [pdi, setPdi] = useState<PlanoDesenvolvimento | null>(null);
  const [historico, setHistorico] = useState<PdiAtualizacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<PdiStatus>('aberto');
  const [progresso, setProgresso] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [comentarioColaborador, setComentarioColaborador] = useState('');

  const isGestor = canManagePdi(role);
  const isColaborador = role === 'colaborador';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [detalhe, updates] = await Promise.all([
        buscarPDIById(pdiId),
        buscarHistoricoPDI(pdiId),
      ]);

      setPdi(detalhe);
      setHistorico(updates);
      setStatus(detalhe.status);
      setProgresso(detalhe.progressoPct);
      setObservacoes(detalhe.observacoesResponsavel ?? '');
      setComentarioColaborador(detalhe.observacoesColaborador ?? '');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar PDI.');
    } finally {
      setIsLoading(false);
    }
  }, [pdiId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSaveGestor() {
    if (!user || !pdi) {
      return;
    }

    setIsSaving(true);

    try {
      await atualizarProgresso(
        pdi.id,
        {
          status,
          progressoPct: progresso,
          observacoesResponsavel: observacoes.trim() || undefined,
        },
        user.id,
      );

      showToast('PDI atualizado.', 'success');
      await loadData();
      onUpdated?.();
    } catch (saveError) {
      showToast(saveError instanceof Error ? saveError.message : 'Erro ao salvar.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveColaborador() {
    if (!user || !pdi) {
      return;
    }

    setIsSaving(true);

    try {
      await atualizarProgresso(
        pdi.id,
        { observacoesColaborador: comentarioColaborador.trim() },
        user.id,
      );

      showToast('Comentário salvo.', 'success');
      await loadData();
      onUpdated?.();
    } catch (saveError) {
      showToast(saveError instanceof Error ? saveError.message : 'Erro ao salvar.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancelar() {
    if (!user || !pdi) {
      return;
    }

    const motivo = observacoes.trim();

    if (motivo.length < 5) {
      showToast('Informe o motivo do cancelamento nas observações.', 'error');
      return;
    }

    const confirmed = await confirmAction(
      'Cancelar PDI',
      'Tem certeza que deseja cancelar este plano de desenvolvimento?',
    );

    if (!confirmed) {
      return;
    }

    setIsSaving(true);

    try {
      await cancelarPDI(pdi.id, user.id, motivo);
      showToast('PDI cancelado.', 'success');
      await loadData();
      onUpdated?.();
    } catch (saveError) {
      showToast(saveError instanceof Error ? saveError.message : 'Erro ao cancelar.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error || !pdi) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="danger">{error ?? 'PDI não encontrado.'}</ThemedText>
        <Button label="Tentar novamente" variant="secondary" onPress={() => void loadData()} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: scrollPaddingBottom }]}
        showsVerticalScrollIndicator={false}>
        <PDICard hideCriador={isColaborador} pdi={pdi} onPress={() => undefined} />

        {pdi.descricao ? (
          <View style={[styles.section, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="subtitle">Descrição</ThemedText>
            <ThemedText>{pdi.descricao}</ThemedText>
          </View>
        ) : null}

        {isGestor ? (
          <View style={[styles.section, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="subtitle">Atualizar progresso</ThemedText>

            <ThemedText style={styles.label}>Progresso: {progresso}%</ThemedText>
            <View style={styles.progressSteps}>
              {PROGRESS_STEPS.map((step) => (
                <Pressable
                  key={step}
                  accessibilityRole="button"
                  onPress={() => setProgresso(step)}
                  style={[
                    styles.progressChip,
                    {
                      backgroundColor:
                        progresso === step ? theme.backgroundSelected : theme.background,
                      borderColor: theme.border,
                    },
                  ]}>
                  <ThemedText>{step}%</ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText style={styles.label}>Status</ThemedText>
            <View style={styles.statusOptions}>
              {PDI_STATUS_OPTIONS.filter((option) => option !== 'vencido').map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  onPress={() => setStatus(option)}
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: status === option ? theme.backgroundSelected : theme.background,
                      borderColor: theme.border,
                    },
                  ]}>
                  <ThemedText>{PDI_STATUS_LABELS[option]}</ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText style={styles.label}>Observações do responsável</ThemedText>
            <TextInput
              value={observacoes}
              onChangeText={setObservacoes}
              multiline
              placeholder="Notas de acompanhamento"
              placeholderTextColor={theme.placeholder}
              style={[
                styles.textArea,
                { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
              ]}
            />

            <Button
              label={isSaving ? 'Salvando...' : 'Salvar atualização'}
              disabled={isSaving}
              onPress={() => void handleSaveGestor()}
            />

            {pdi.status !== 'cancelado' && pdi.status !== 'concluido' ? (
              <Button
                label="Cancelar PDI"
                variant="ghost"
                disabled={isSaving}
                onPress={() => void handleCancelar()}
              />
            ) : null}
          </View>
        ) : null}

        {isColaborador ? (
          <View style={[styles.section, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="subtitle">Meu comentário</ThemedText>
            <TextInput
              value={comentarioColaborador}
              onChangeText={setComentarioColaborador}
              multiline
              placeholder="Compartilhe seu progresso ou dúvidas"
              placeholderTextColor={theme.placeholder}
              style={[
                styles.textArea,
                { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
              ]}
            />
            <Button
              label={isSaving ? 'Salvando...' : 'Salvar comentário'}
              disabled={isSaving}
              onPress={() => void handleSaveColaborador()}
            />
          </View>
        ) : null}

        <View style={[styles.section, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="subtitle">Histórico de atualizações</ThemedText>
          {historico.length === 0 ? (
            <ThemedText themeColor="textSecondary">Nenhuma atualização registrada.</ThemedText>
          ) : (
            historico.map((item) => (
              <View key={item.id} style={[styles.historyItem, { borderColor: theme.border }]}>
                <ThemedText style={styles.historyMeta}>
                  {new Date(item.createdAt).toLocaleString('pt-BR')}
                  {!isColaborador && item.autorNome ? ` · ${item.autorNome}` : ''}
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  {item.statusAnterior !== item.statusNovo
                    ? `${item.statusAnterior ?? '—'} → ${item.statusNovo ?? '—'}`
                    : `Progresso: ${item.progressoNovo ?? 0}%`}
                </ThemedText>
                {item.comentario ? <ThemedText>{item.comentario}</ThemedText> : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  section: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  progressSteps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  progressChip: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  statusChip: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  textArea: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  historyItem: {
    borderTopWidth: 1,
    paddingTop: Spacing.two,
    gap: Spacing.one,
  },
  historyMeta: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
