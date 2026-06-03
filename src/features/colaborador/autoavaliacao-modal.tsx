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
import { ActionButton } from '@/components/ui/action-button';
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
          <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={styles.content}>
                <ThemedText type="subtitle">Nova autoavaliação</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.description}>
                  Descreva suas qualificações e solicitações. O RH analisará seu pedido.
                </ThemedText>

                <View style={styles.field}>
                  <ThemedText style={styles.fieldLabel}>
                    Novas qualificações e certificados adquiridos
                  </ThemedText>
                  <TextInput
                    multiline
                    placeholder="Cursos, certificações, treinamentos..."
                    placeholderTextColor={theme.placeholder}
                    style={styles.textBlock}
                    textAlignVertical="top"
                    value={qualificacoes}
                    onChangeText={setQualificacoes}
                  />
                </View>

                <View style={styles.field}>
                  <ThemedText style={styles.fieldLabel}>
                    Solicitação de investimento ou melhoria salarial
                  </ThemedText>
                  <TextInput
                    multiline
                    placeholder="Descreva sua solicitação e os motivos..."
                    placeholderTextColor={theme.placeholder}
                    style={styles.textBlock}
                    textAlignVertical="top"
                    value={investimento}
                    onChangeText={setInvestimento}
                  />
                </View>

                {error ? (
                  <ThemedText themeColor="danger" style={styles.error}>
                    {error}
                  </ThemedText>
                ) : null}

                <View style={styles.actions}>
                  <ActionButton
                    label="Enviar"
                    variant="primary"
                    isLoading={isSubmitting}
                    disabled={!canSubmit}
                    onPress={() => void handleSubmit()}
                  />
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSubmitting}
                    onPress={handleClose}
                    style={({ pressed }) => [pressed && styles.cancelPressed]}>
                    <ThemedText themeColor="textSecondary" style={styles.cancelLabel}>
                      Cancelar
                    </ThemedText>
                  </Pressable>
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
    backgroundColor: 'rgba(47, 52, 55, 0.32)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  textBlock: {
    minHeight: 100,
    backgroundColor: '#F7F6F3',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: '#2F3437',
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    gap: Spacing.three,
    paddingTop: Spacing.one,
  },
  cancelLabel: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  cancelPressed: {
    opacity: 0.7,
  },
});
