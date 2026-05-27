import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthLayout } from '@/components/auth/auth-layout';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';

export default function RegisterScreen() {
  const { register, isSubmitting } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit() {
    setErrors({});

    const result = await register({
      name,
      email,
      password,
      confirmPassword,
    });

    if (result) {
      if (result.field && result.field !== 'general') {
        setErrors({ [result.field]: result.message });
        return;
      }

      setErrors({ general: result.message });
      return;
    }

    router.replace('/(main)/home');
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

      {errors.general ? (
        <ThemedText themeColor="danger" style={styles.generalError}>
          {errors.general}
        </ThemedText>
      ) : null}

      <Button label="Criar conta" isLoading={isSubmitting} onPress={() => void handleSubmit()} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  generalError: {
    fontSize: 14,
    lineHeight: 20,
  },
});
