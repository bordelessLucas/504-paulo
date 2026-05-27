import { Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const theme = useTheme();

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="badge">Avalia</ThemedText>
            <ThemedText type="heading">Olá, {user.name.split(' ')[0]}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Bem-vindo ao ambiente de avaliações internas. Em breve você poderá acompanhar
              ciclos, feedbacks e metas da equipe.
            </ThemedText>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            <ThemedText type="subtitle">Próximos passos</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.cardText}>
              Esta é a base inicial do app. A autenticação local já está pronta para ser conectada
              ao backend da empresa.
            </ThemedText>
          </View>

          <View style={styles.actions}>
            <Button label="Sair da conta" variant="secondary" onPress={() => void signOut()} />
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.two,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    marginTop: 'auto',
  },
});
