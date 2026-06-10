import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AutoavaliacaoModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: { qualificacoes: string; investimento: string }) => Promise<void>;
};

export function AutoavaliacaoModal({ visible, onClose, onSubmit }: AutoavaliacaoModalProps) {
  const theme = useTheme();
  const [qualificacoes, setQualificacoes] = useState('');
  const [investimento, setInvestimento] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setQualificacoes('');
    setInvestimento('');
    setError(null);
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible, resetForm]);

  const handleClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    onClose();
  }, [isSubmitting, onClose]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({ qualificacoes, investimento });
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível enviar a solicitação.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [investimento, onClose, onSubmit, qualificacoes]);

  const canSubmit =
    !isSubmitting && (qualificacoes.trim().length > 0 || investimento.trim().length > 0);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}>
          <Pressable
            style={[
              styles.dialog,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
              },
            ]}
            onPress={(event) => event.stopPropagation()}>
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={styles.content}>
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: theme.accentMuted, borderColor: theme.border },
                  ]}>
                  <Ionicons color={theme.accent} name="document-text-outline" size={22} />
                </View>

                <View style={styles.headerBlock}>
                  <ThemedText type="subtitle">Nova autoavaliação</ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.description}>
                    Descreva suas qualificações e solicitações. O RH analisará seu pedido em até
                    alguns dias úteis.
                  </ThemedText>
                </View>

                <View style={styles.field}>
                  <ThemedText style={styles.fieldLabel}>
                    Novas qualificações e certificados
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.fieldHint}>
                    Cursos, certificações ou treinamentos concluídos recentemente.
                  </ThemedText>
                  <TextInput
                    multiline
                    placeholder="Ex.: Certificação IRATA N2, curso de NR-35..."
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
                    value={qualificacoes}
                    onChangeText={setQualificacoes}
                  />
                </View>

                <View style={styles.field}>
                  <ThemedText style={styles.fieldLabel}>
                    Solicitação de investimento ou melhoria
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.fieldHint}>
                    Descreva o que você solicita e os motivos que justificam o pedido.
                  </ThemedText>
                  <TextInput
                    multiline
                    placeholder="Ex.: Solicito apoio para curso técnico avançado..."
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
                    value={investimento}
                    onChangeText={setInvestimento}
                  />
                </View>

                <ThemedText themeColor="textSecondary" style={styles.requirementHint}>
                  Preencha ao menos um dos campos para enviar.
                </ThemedText>

                {error ? (
                  <ThemedText themeColor="danger" style={styles.error}>
                    {error}
                  </ThemedText>
                ) : null}

                <View style={styles.actions}>
                  <Button
                    label="Enviar solicitação"
                    isLoading={isSubmitting}
                    disabled={!canSubmit}
                    onPress={() => void handleSubmit()}
                  />
                  <Button
                    label="Cancelar"
                    variant="secondary"
                    disabled={isSubmitting}
                    onPress={handleClose}
                  />
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(47, 52, 55, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  dialog: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    maxHeight: '90%',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
      default: {
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
    }),
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  headerBlock: {
    gap: Spacing.two,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    gap: Spacing.one,
  },
  fieldLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  fieldHint: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: Spacing.one,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  requirementHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
});
