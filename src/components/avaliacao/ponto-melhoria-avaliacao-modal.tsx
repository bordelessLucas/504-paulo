import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ui/action-button';
import { BaseModal, BaseModalActions, getModalTextAreaStyle } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MIN_PONTO_MELHORIA_LENGTH = 5;

type PontoMelhoriaAvaliacaoModalProps = {
  visible: boolean;
  colaboradorNome: string;
  onClose: () => void;
  onSkip: () => void;
  onSubmit: (texto: string) => Promise<void>;
};

export function PontoMelhoriaAvaliacaoModal({
  visible,
  colaboradorNome,
  onClose,
  onSkip,
  onSubmit,
}: PontoMelhoriaAvaliacaoModalProps) {
  const theme = useTheme();
  const [step, setStep] = useState<'confirm' | 'input'>('confirm');
  const [texto, setTexto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setStep('confirm');
    setTexto('');
    setError(null);
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    if (!visible) {
      resetState();
    }
  }, [visible, resetState]);

  const handleClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    onClose();
  }, [isSubmitting, onClose]);

  const handleSkip = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    onSkip();
  }, [isSubmitting, onSkip]);

  const handleConfirmYes = useCallback(() => {
    setStep('input');
    setError(null);
  }, []);

  const handleSavePonto = useCallback(async () => {
    const trimmed = texto.trim();

    if (trimmed.length < MIN_PONTO_MELHORIA_LENGTH) {
      setError(`O ponto de melhoria deve ter pelo menos ${MIN_PONTO_MELHORIA_LENGTH} caracteres.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(trimmed);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível salvar o ponto de melhoria.',
      );
      setIsSubmitting(false);
    }
  }, [onSubmit, texto]);

  const canSubmitPonto = !isSubmitting && texto.trim().length >= MIN_PONTO_MELHORIA_LENGTH;

  return (
    <BaseModal
      dismissOnBackdropPress={!isSubmitting}
      variant="centered"
      visible={visible}
      onClose={handleClose}>
      {step === 'confirm' ? (
        <>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: theme.accentMuted, borderColor: theme.border },
            ]}>
            <Ionicons color={theme.accent} name="bulb-outline" size={22} />
          </View>

          <View style={styles.textBlock}>
            <ThemedText type="subtitle">Ponto de melhoria</ThemedText>
            <ThemedText style={styles.question}>
              Gostaria de deixar um ponto de melhoria para{' '}
              <ThemedText style={styles.nomeDestaque}>{colaboradorNome}</ThemedText>?
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.hint}>
              Opcional. O feedback aparecerá no dashboard do colaborador.
            </ThemedText>
          </View>

          <BaseModalActions>
            <Button label="Não, obrigado" variant="secondary" onPress={handleSkip} />
            <Button label="Sim, registrar" onPress={handleConfirmYes} />
          </BaseModalActions>
        </>
      ) : (
        <>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: theme.accentMuted, borderColor: theme.border },
            ]}>
            <Ionicons color={theme.accent} name="create-outline" size={22} />
          </View>

          <View style={styles.textBlock}>
            <ThemedText type="subtitle">Registrar ponto de melhoria</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.description}>
              Este feedback será exibido para{' '}
              <ThemedText style={styles.nomeDestaque}>{colaboradorNome}</ThemedText> em Pontos de
              melhoria.
            </ThemedText>
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.fieldLabel}>Ponto de melhoria *</ThemedText>
            <TextInput
              multiline
              autoFocus
              placeholder="Descreva o que o colaborador pode desenvolver ou melhorar..."
              placeholderTextColor={theme.placeholder}
              style={[
                getModalTextAreaStyle(theme),
                error ? { backgroundColor: theme.dangerMuted } : null,
              ]}
              value={texto}
              onChangeText={(value) => {
                setTexto(value);
                setError(null);
              }}
            />
            <ThemedText themeColor="textSecondary" style={styles.counter}>
              Mínimo {MIN_PONTO_MELHORIA_LENGTH} caracteres · {texto.trim().length} digitados
            </ThemedText>
          </View>

          {error ? (
            <ThemedText themeColor="danger" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          <BaseModalActions style={styles.inputActions}>
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => setStep('confirm')}
              style={({ pressed }) => [pressed && styles.cancelPressed]}>
              <ThemedText themeColor="textSecondary" style={styles.cancelLabel}>
                Voltar
              </ThemedText>
            </Pressable>
            <ActionButton
              label="Salvar ponto de melhoria"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!canSubmitPonto}
              onPress={() => void handleSavePonto()}
            />
          </BaseModalActions>
        </>
      )}
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  textBlock: {
    gap: Spacing.two,
  },
  question: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  nomeDestaque: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 22,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
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
  counter: {
    fontSize: 12,
    lineHeight: 16,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
  },
  inputActions: {
    flexWrap: 'wrap',
  },
  cancelLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  cancelPressed: {
    opacity: 0.7,
  },
});
