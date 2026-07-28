import { type Href, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthLayout } from '@/components/auth/auth-layout';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { changePassword } from '@/features/perfil/profile-api';
import { DEFAULT_ACCESS_PASSWORD } from '@/features/rh/validation';

export default function TrocarSenhaScreen() {
  const router = useRouter();
  const { user, refetchProfile, signOut } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!user || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await changePassword({
      email: user.email,
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (result) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }

    await refetchProfile();
    setIsSubmitting(false);
    router.replace('/(main)/' as Href);
  }, [
    confirmPassword,
    currentPassword,
    isSubmitting,
    newPassword,
    refetchProfile,
    router,
    user,
  ]);

  if (!user) {
    return null;
  }

  return (
    <AuthLayout
      title="Nova senha"
      subtitle={`Olá, ${user.name.split(' ')[0]}! No primeiro acesso, troque a senha temporária (padrão: ${DEFAULT_ACCESS_PASSWORD}).`}>
      <View style={styles.content}>
        <Input
          autoComplete="password"
          label="Senha temporária"
          onChangeText={setCurrentPassword}
          placeholder={DEFAULT_ACCESS_PASSWORD}
          secureTextEntry
          value={currentPassword}
        />
        <Input
          autoComplete="new-password"
          label="Nova senha"
          onChangeText={setNewPassword}
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
          value={newPassword}
        />
        <Input
          autoComplete="new-password"
          label="Confirmar nova senha"
          onChangeText={setConfirmPassword}
          placeholder="Repita a nova senha"
          secureTextEntry
          value={confirmPassword}
        />

        {error ? (
          <ThemedText themeColor="danger" type="small">
            {error}
          </ThemedText>
        ) : null}

        <Button
          label="Salvar e entrar"
          isLoading={isSubmitting}
          onPress={() => void handleSubmit()}
        />
        <Button
          label="Sair da conta"
          variant="ghost"
          disabled={isSubmitting}
          onPress={() => void signOut()}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
});
