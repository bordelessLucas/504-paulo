import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ColaboradorRow } from '@/components/avaliacao/colaborador-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Fonts, Spacing } from '@/constants/theme';
import {
  COLABORADORES_PAGE_SIZE,
  fetchColaboradoresPage,
  type ColaboradorResumo,
} from '@/features/avaliacao/api';
import { useAuth } from '@/features/auth/auth-context';
import type { AvaliacaoStackParamList } from '@/navigation/avaliacao-stack';

type NavigationProp = NativeStackNavigationProp<
  AvaliacaoStackParamList,
  'ListaColaboradores'
>;

export function ListaColaboradoresScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<ColaboradorResumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / COLABORADORES_PAGE_SIZE));

  const loadPage = useCallback(
    async (targetPage: number) => {
      if (!user) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchColaboradoresPage(user.id, targetPage);
        setItems(result.items);
        setTotal(result.total);
        setPage(result.page);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar colaboradores.');
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    void loadPage(0);
  }, [loadPage]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.header}>
          <ThemedText type="heading">Colaboradores a avaliar</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Selecione um colaborador para iniciar a avaliação ({total} no total).
          </ThemedText>
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <ThemedText themeColor="danger">{error}</ThemedText>
            <Button label="Tentar novamente" variant="secondary" onPress={() => void loadPage(page)} />
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={items}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                Nenhum colaborador encontrado para avaliação.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <ColaboradorRow
                colaborador={item}
                onPress={() =>
                  navigation.navigate('FormularioAvaliacao', {
                    avaliadoId: item.id,
                    avaliadoNome: item.nome,
                  })
                }
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}

        {!isLoading && !error && total > 0 ? (
          <View style={styles.pagination}>
            <Button
              label="Anterior"
              variant="secondary"
              disabled={page === 0}
              onPress={() => void loadPage(page - 1)}
            />
            <ThemedText style={styles.pageLabel}>
              Página {page + 1} de {totalPages}
            </ThemedText>
            <Button
              label="Próxima"
              variant="secondary"
              disabled={page + 1 >= totalPages}
              onPress={() => void loadPage(page + 1)}
            />
          </View>
        ) : null}
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  empty: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: Spacing.four,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  pageLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
});
