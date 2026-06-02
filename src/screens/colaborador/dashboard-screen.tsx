import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  fetchColaboradorDashboard,
  formatFeedbackDate,
  formatMediaGeral,
  type ColaboradorDashboardData,
} from '@/features/colaborador/dashboard-api';
import {
  formatDataAdmissao,
  isElegivelParaAutoavaliacao,
} from '@/features/colaborador/eligibility';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';

function DashboardCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {children}
    </View>
  );
}

export function DashboardColaboradorScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState<ColaboradorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(
    async (options?: { refreshing?: boolean }) => {
      if (!user) {
        return;
      }

      if (options?.refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const dashboard = await fetchColaboradorDashboard(user.id);
        setData(dashboard);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Erro ao carregar o dashboard.',
        );
      } finally {
        if (options?.refreshing) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  const isAutoavaliacaoEnabled = isElegivelParaAutoavaliacao(data?.dataAdmissao);

  function handleAutoavaliacaoPress() {
    if (!isAutoavaliacaoEnabled) {
      return;
    }

    showToast('Solicitação de autoavaliação registrada. Em breve você poderá completá-la aqui.', 'info');
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="danger">{error}</ThemedText>
        <Button label="Tentar novamente" variant="secondary" onPress={() => void loadDashboard()} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => void loadDashboard({ refreshing: true })} />
          }
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="heading">Olá, {user?.name.split(' ')[0] ?? 'colaborador'}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              Acompanhe seu desempenho e os feedbacks recebidos nas avaliações.
            </ThemedText>
          </View>

          <DashboardCard title="Resumo">
            <View style={styles.mediaBlock}>
              <ThemedText style={styles.mediaValue}>{formatMediaGeral(data?.mediaGeral ?? null)}</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.mediaLabel}>
                Média geral das suas notas
              </ThemedText>
            </View>
            <ThemedText themeColor="textSecondary" style={styles.metaText}>
              {data?.totalRespostas
                ? `Calculada a partir de ${data.totalRespostas} resposta(s) registrada(s).`
                : 'Você ainda não possui notas registradas nas avaliações.'}
            </ThemedText>
          </DashboardCard>

          <DashboardCard title="Pontos de melhoria">
            <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
              Feedbacks construtivos recebidos — sem identificação de quem avaliou.
            </ThemedText>

            {data?.feedbacks.length ? (
              data.feedbacks.map((feedback) => (
                <View
                  key={feedback.id}
                  style={[
                    styles.feedbackItem,
                    { backgroundColor: theme.background, borderColor: theme.border },
                  ]}>
                  <ThemedText style={styles.feedbackText}>{feedback.texto}</ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.feedbackDate}>
                    {formatFeedbackDate(feedback.dataReferencia)}
                  </ThemedText>
                </View>
              ))
            ) : (
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                Nenhum feedback registrado ainda. Quando houver justificativas ou evidências nas suas
                avaliações, elas aparecerão aqui para apoiar seu desenvolvimento.
              </ThemedText>
            )}
          </DashboardCard>

          <DashboardCard title="Autoavaliação">
            <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
              Disponível após 6 meses de admissão na empresa.
            </ThemedText>

            {data?.dataAdmissao ? (
              <ThemedText themeColor="textSecondary" style={styles.metaText}>
                Data de admissão: {formatDataAdmissao(data.dataAdmissao)}
              </ThemedText>
            ) : null}

            {!isAutoavaliacaoEnabled ? (
              <ThemedText themeColor="textSecondary" style={styles.disabledHint}>
                Você poderá solicitar uma nova autoavaliação quando completar 6 meses de casa.
              </ThemedText>
            ) : null}

            <Button
              label="Nova Autoavaliação / Solicitação"
              disabled={!isAutoavaliacaoEnabled}
              onPress={handleAutoavaliacaoPress}
            />
          </DashboardCard>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/** @deprecated Use DashboardColaboradorScreen */
export const ColaboradorDashboardScreen = DashboardColaboradorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth + 120,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: Spacing.six,
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
    borderRadius: Radius.sm,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  mediaBlock: {
    gap: Spacing.one,
  },
  mediaValue: {
    fontFamily: Fonts.sansBold,
    fontSize: 40,
    lineHeight: 44,
  },
  mediaLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  feedbackItem: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  feedbackText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  feedbackDate: {
    fontSize: 12,
    lineHeight: 16,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
  },
  disabledHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
