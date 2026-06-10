import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { BloqueioDeveresHint } from '@/components/colaborador/bloqueio-deveres-hint';
import { TipoSolicitacaoSelect } from '@/components/reajuste/tipo-solicitacao-select';
import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ui/action-button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { formatMediaGeral } from '@/features/aprovacoes/api';
import type { ColaboradorReajusteResumo } from '@/features/reajuste/api';
import {
  MEDIA_MINIMA_REAJUSTE,
  MENSAGEM_INELEGIVEL_REAJUSTE,
} from '@/features/reajuste/eligibility';
import {
  TIPO_SOLICITACAO_REAJUSTE_LABELS,
  type TipoSolicitacaoReajuste,
} from '@/features/reajuste/types';
import { useTheme } from '@/hooks/use-theme';

export type PainelReajusteSolicitacaoProps = {
  colaborador: ColaboradorReajusteResumo;
  mediaGeral: number | null;
  totalRespostas: number;
  temIncidentesRecentes: boolean;
  isElegivel: boolean;
  isLoadingMedia: boolean;
  tipoSolicitacao: TipoSolicitacaoReajuste;
  justificativa: string;
  isSubmitting: boolean;
  canSubmit: boolean;
  onTipoSolicitacaoChange: (value: TipoSolicitacaoReajuste) => void;
  onJustificativaChange: (value: string) => void;
  onSubmit: () => void;
  onClose?: () => void;
  showCloseAction?: boolean;
};

export function PainelReajusteSolicitacao({
  colaborador,
  mediaGeral,
  totalRespostas,
  temIncidentesRecentes,
  isElegivel,
  isLoadingMedia,
  tipoSolicitacao,
  justificativa,
  isSubmitting,
  canSubmit,
  onTipoSolicitacaoChange,
  onJustificativaChange,
  onSubmit,
  onClose,
  showCloseAction = false,
}: PainelReajusteSolicitacaoProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Nova solicitação</ThemedText>
      <ThemedText style={styles.selectedName}>{colaborador.nome}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
        {[colaborador.departamento, colaborador.funcao].filter(Boolean).join(' · ') ||
          'Sem departamento'}
      </ThemedText>

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
              {totalRespostas === 1 ? 'resposta registrada' : 'respostas registradas'} · mínimo{' '}
              {MEDIA_MINIMA_REAJUSTE.toFixed(1)}
            </ThemedText>
          </View>

          {temIncidentesRecentes ? <BloqueioDeveresHint visible /> : null}

          {!isElegivel && !temIncidentesRecentes ? (
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
          ) : null}

          {isElegivel ? (
            <>
              <View style={styles.field}>
                <ThemedText themeColor="textSecondary" style={styles.fieldLabel}>
                  Tipo de solicitação
                </ThemedText>
                <TipoSolicitacaoSelect value={tipoSolicitacao} onChange={onTipoSolicitacaoChange} />
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
                  onChangeText={onJustificativaChange}
                />
                <ThemedText themeColor="textSecondary" style={styles.charHint}>
                  Mínimo 10 caracteres · {justificativa.trim().length} digitados
                </ThemedText>
              </View>

              <ActionButton
                label={`Enviar ${TIPO_SOLICITACAO_REAJUSTE_LABELS[tipoSolicitacao]} para o RH`}
                isLoading={isSubmitting}
                disabled={!canSubmit}
                variant="primary"
                onPress={onSubmit}
              />
            </>
          ) : null}

          {showCloseAction && onClose ? (
            <Pressable accessibilityRole="button" onPress={onClose}>
              <ThemedText themeColor="textSecondary" style={styles.cancel}>
                Cancelar seleção
              </ThemedText>
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}

type PainelReajusteSolicitacaoModalProps = PainelReajusteSolicitacaoProps & {
  visible: boolean;
};

export function PainelReajusteSolicitacaoModal({
  visible,
  onClose,
  ...solicitacaoProps
}: PainelReajusteSolicitacaoModalProps) {
  const theme = useTheme();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalKeyboard}>
          <Pressable
            style={[
              styles.modalSheet,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
            onPress={(event) => event.stopPropagation()}>
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}>
              <PainelReajusteSolicitacao
                {...solicitacaoProps}
                onClose={onClose}
                showCloseAction
              />
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
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
  cancel: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(47, 52, 55, 0.4)',
  },
  modalKeyboard: {
    width: '100%',
  },
  modalSheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderWidth: 1,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  modalScrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
});
