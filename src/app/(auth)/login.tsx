import { type Href, Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthLayout } from '@/components/auth/auth-layout';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';

export default function LoginScreen() {
  const { login, isSubmitting } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit() {
    setErrors({});

    const result = await login({ email, password });

    if (result) {
      if (result.field && result.field !== 'general') {
        setErrors({ [result.field]: result.message });
        return;
      }

      setErrors({ general: result.message });
      return;
    }

    router.replace('/(main)' as Href);
  }

  return (
    <AuthLayout
      showStarBackground
      title="Entrar na plataforma"
      subtitle="Acesse o ambiente de avaliações internas da sua equipe."
      footer={
        <View style={styles.footerRow}>
          <ThemedText themeColor="textSecondary">Ainda não tem conta?</ThemedText>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <ThemedText type="link" themeColor="accent">
                Criar conta
              </ThemedText>
            </Pressable>
          </Link>
        </View>
      }>
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
        autoComplete="password"
        error={errors.password}
        label="Senha"
        onChangeText={setPassword}
        placeholder="Sua senha"
        secureTextEntry
        value={password}
      />

      {errors.general ? (
        <ThemedText themeColor="danger" style={styles.generalError}>
          {errors.general}
        </ThemedText>
      ) : null}

      <Button label="Entrar" isLoading={isSubmitting} onPress={() => void handleSubmit()} />
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
