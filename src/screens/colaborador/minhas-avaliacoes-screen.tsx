import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { AvaliacaoHistoricoCard } from '@/components/avaliacao/avaliacao-historico-card';
import { EscalaLegenda } from '@/components/avaliacao/escala-legenda';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { fetchHistoricoAvaliacoesMasked } from '@/features/avaliacao/historico-api';
import type { AvaliacaoHistoricoItem } from '@/features/avaliacao/historico-api';
import { useAppNavigation } from '@/navigation/app-navigation-context';

export function MinhasAvaliacoesScreen() {
  const { user } = useAuth();
  const { navigateToTab, openDrawer } = useAppNavigation();
  const [items, setItems] = useState<AvaliacaoHistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        setExpandedId(historico[0]?.id ?? null);
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

  return (
    <TabScreenContainer
      scrollable
      contentContainerStyle={styles.content}
      refreshControl={
        !isLoading && !error ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void loadHistorico({ refreshing: true })}
          />
        ) : undefined
      }>
      <ScreenHeader title="Minhas avaliações" />

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
        <>
          <EscalaLegenda />

          {items.length === 0 ? (
            <EmptyState
              icon="clipboard-text-outline"
              title="Nenhuma avaliação ainda"
              message="Quando supervisores e gestores registrarem suas notas, o histórico aparece aqui (sem mostrar o nome do avaliador)."
              actionLabel="Abrir dashboard"
              onAction={() => {
                if (!navigateToTab('DashboardColaborador')) {
                  openDrawer();
                }
              }}
            />
          ) : (
            items.map((item) => (
              <AvaliacaoHistoricoCard
                key={item.id}
                isExpanded={items.length === 1 || expandedId === item.id}
                item={item}
                showAvaliador={false}
                onToggle={() =>
                  setExpandedId((current) => (current === item.id ? null : item.id))
                }
              />
            ))
          )}
        </>
      )}
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.three,
  },
});
