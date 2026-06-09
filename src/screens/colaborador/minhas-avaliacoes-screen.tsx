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

import { AvaliacaoHistoricoCard } from '@/components/avaliacao/avaliacao-historico-card';
import { EscalaLegenda } from '@/components/avaliacao/escala-legenda';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { fetchHistoricoAvaliacoesMasked } from '@/features/avaliacao/historico-api';
import type { AvaliacaoHistoricoItem } from '@/features/avaliacao/historico-api';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';

export function MinhasAvaliacoesScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<AvaliacaoHistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistorico = useCallback(
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
        const historico = await fetchHistoricoAvaliacoesMasked(user.id);
        setItems(historico);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar avaliações.');
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
      void loadHistorico();
    }, [loadHistorico]),
  );

  const { scrollPaddingBottom } = useTabScreenLayout();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.pageHeader}>
          <ThemedText type="heading">Minhas avaliações</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.description}>
            Metodologia 360° — você vê suas notas e feedbacks, sem identificação de quem avaliou.
          </ThemedText>
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <ThemedText themeColor="danger">{error}</ThemedText>
            <Button label="Tentar novamente" variant="secondary" onPress={() => void loadHistorico()} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => void loadHistorico({ refreshing: true })}
              />
            }
            showsVerticalScrollIndicator={false}>
            <EscalaLegenda />

            {items.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                Nenhuma avaliação registrada ainda. Quando seu supervisor ou gestor concluir um
                ciclo, os resultados aparecerão aqui.
              </ThemedText>
            ) : (
              items.map((item) => (
                <AvaliacaoHistoricoCard key={item.id} item={item} showAvaliador={false} />
              ))
            )}
          </ScrollView>
        )}
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
  pageHeader: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.one,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
