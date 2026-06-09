import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FormSection } from '@/components/rh/form-section';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spacing } from '@/constants/theme';
import { changePassword } from '@/features/perfil/profile-api';
import type { ChangePasswordInput } from '@/features/perfil/validation';

type ChangePasswordFormProps = {
  email: string;
};

const INITIAL_FORM: ChangePasswordInput = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function ChangePasswordForm({ email }: ChangePasswordFormProps) {
  const [form, setForm] = useState<ChangePasswordInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ChangePasswordInput | 'general', string>>
  >({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof ChangePasswordInput>(field: K, value: ChangePasswordInput[K]) => {
      setForm((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined, general: undefined }));
      setFeedback(null);
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setFeedback(null);

    const result = await changePassword({
      email,
      ...form,
    });

    if (result) {
      setErrors({ [result.field]: result.message });
      setIsSubmitting(false);
      return;
    }

    setForm(INITIAL_FORM);
    setFeedback('Senha alterada com sucesso.');
    setIsSubmitting(false);
  }, [email, form, isSubmitting]);

  return (
    <FormSection title="Alterar senha" defaultExpanded={false}>
      <ThemedText themeColor="textSecondary" style={styles.hint}>
        Para sua segurança, confirme a senha atual antes de definir uma nova.
      </ThemedText>

      <Input
        autoComplete="password"
        error={errors.currentPassword}
        label="Senha atual"
        onChangeText={(value) => updateField('currentPassword', value)}
        placeholder="Digite sua senha atual"
        secureTextEntry
        value={form.currentPassword}
      />

      <Input
        autoComplete="new-password"
        error={errors.newPassword}
        label="Nova senha"
        onChangeText={(value) => updateField('newPassword', value)}
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
        value={form.newPassword}
      />

      <Input
        autoComplete="new-password"
        error={errors.confirmPassword}
        label="Confirmar nova senha"
        onChangeText={(value) => updateField('confirmPassword', value)}
        placeholder="Repita a nova senha"
        secureTextEntry
        value={form.confirmPassword}
      />

      {errors.general ? (
        <ThemedText themeColor="danger" style={styles.feedback}>
          {errors.general}
        </ThemedText>
      ) : null}

      {feedback ? (
        <ThemedText themeColor="textSecondary" style={styles.feedback}>
          {feedback}
        </ThemedText>
      ) : null}

      <Button
        label="Atualizar senha"
        isLoading={isSubmitting}
        onPress={() => void handleSubmit()}
      />
    </FormSection>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  feedback: {
    fontSize: 13,
    lineHeight: 18,
  },
});
