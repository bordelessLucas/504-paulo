import { useRoute, type RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { AvaliacaoHistoricoCard } from '@/components/avaliacao/avaliacao-historico-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import {
  fetchHistoricoAvaliacoesCompleto,
  fetchHistoricoAvaliacoesMasked,
  type AvaliacaoHistoricoItem,
} from '@/features/avaliacao/historico-api';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import type { AvaliacaoStackParamList } from '@/navigation/avaliacao-stack';

type HistoricoRoute = RouteProp<AvaliacaoStackParamList, 'HistoricoAvaliacoes'>;

export function HistoricoAvaliacoesScreen() {
  const route = useRoute<HistoricoRoute>();
  const { avaliadoId, avaliadoNome, revealAvaliador } = route.params;

  const [items, setItems] = useState<AvaliacaoHistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { scrollPaddingBottom } = useTabScreenLayout();

  const loadHistorico = useCallback(
    async (options?: { refreshing?: boolean }) => {
      if (options?.refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const historico = revealAvaliador
          ? await fetchHistoricoAvaliacoesCompleto(avaliadoId)
          : await fetchHistoricoAvaliacoesMasked(avaliadoId);

        setItems(historico);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar histórico.');
      } finally {
        if (options?.refreshing) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [avaliadoId, revealAvaliador],
  );

  useEffect(() => {
    void loadHistorico();
  }, [loadHistorico]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.safeArea}>
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
            <View style={styles.header}>
              <ThemedText type="heading">{avaliadoNome}</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                {revealAvaliador
                  ? 'Histórico completo de avaliações (visão gestão).'
                  : 'Suas avaliações — o avaliador não é exibido.'}
              </ThemedText>
            </View>

            {items.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                Nenhuma avaliação registrada ainda.
              </ThemedText>
            ) : (
              items.map((item) => (
                <AvaliacaoHistoricoCard
                  key={item.id}
                  item={item}
                  showAvaliador={revealAvaliador}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
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
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: Spacing.four,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
