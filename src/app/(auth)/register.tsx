import { type Href, Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthLayout } from '@/components/auth/auth-layout';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';

export default function RegisterScreen() {
  const { beginRegistration, pendingRegistration } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(pendingRegistration?.name ?? '');
  const [email, setEmail] = useState(pendingRegistration?.email ?? '');
  const [password, setPassword] = useState(pendingRegistration?.password ?? '');
  const [confirmPassword, setConfirmPassword] = useState(
    pendingRegistration?.confirmPassword ?? '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit() {
    setErrors({});

    // A conta só é criada de fato após a assinatura de um plano (no paywall).
    const error = beginRegistration({
      name,
      email,
      password,
      confirmPassword,
    });

    if (error) {
      if (error.field && error.field !== 'general') {
        setErrors({ [error.field]: error.message });
        return;
      }

      showToast(error.message, 'error');
      return;
    }

    router.push('/(paywall)/planos' as Href);
  }

  return (
    <AuthLayout
      title="Criar sua conta"
      subtitle="Cadastre-se para participar das avaliações internas de desempenho."
      footer={
        <View style={styles.footerRow}>
          <ThemedText themeColor="textSecondary">Já possui conta?</ThemedText>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <ThemedText type="link" themeColor="accent">
                Entrar
              </ThemedText>
            </Pressable>
          </Link>
        </View>
      }>
      <Input
        autoComplete="name"
        error={errors.name}
        label="Nome completo"
        onChangeText={setName}
        placeholder="Seu nome"
        value={name}
      />

      <Input
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
        keyboardType="email-address"
        label="E-mail corporativo"
        onChangeText={setEmail}
        placeholder="nome@empresa.com"
        value={email}
      />

      <Input
        autoComplete="new-password"
        error={errors.password}
        label="Senha"
        onChangeText={setPassword}
        placeholder="Mínimo de 6 caracteres"
        secureTextEntry
        value={password}
      />

      <Input
        autoComplete="new-password"
        error={errors.confirmPassword}
        label="Confirmar senha"
        onChangeText={setConfirmPassword}
        placeholder="Repita a senha"
        secureTextEntry
        value={confirmPassword}
      />

      <Button label="Continuar" onPress={handleSubmit} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
