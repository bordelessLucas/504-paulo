import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ColaboradorRow } from '@/components/avaliacao/colaborador-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Fonts, Spacing } from '@/constants/theme';
import {
  COLABORADORES_PAGE_SIZE,
  fetchColaboradoresAvaliacaoExecutive,
  fetchColaboradoresPage,
  type ColaboradorResumo,
  type ColaboradoresAvaliacaoExecutive,
} from '@/features/avaliacao/api';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { isAdminDashboardRole } from '@/types/supabase';
import type { AvaliacaoStackParamList } from '@/navigation/avaliacao-stack';

type NavigationProp = NativeStackNavigationProp<
  AvaliacaoStackParamList,
  'ListaColaboradores'
>;

function formatMetaColaborador(colaborador: ColaboradorResumo) {
  return (
    [colaborador.departamento, colaborador.funcao].filter(Boolean).join(' · ') ||
    'Sem departamento'
  );
}

function formatDataBr(isoDate: string) {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function ColaboradorSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.sectionCount}>
          {count}
        </ThemedText>
      </View>
      {children}
    </View>
  );
}

function ListaColaboradoresExecutiveView({
  navigation,
  avaliadorId,
}: {
  navigation: NavigationProp;
  avaliadorId: string;
}) {
  const [data, setData] = useState<ColaboradoresAvaliacaoExecutive | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { scrollPaddingBottom } = useTabScreenLayout();

  const loadData = useCallback(
    async (options?: { refreshing?: boolean }) => {
      if (options?.refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const result = await fetchColaboradoresAvaliacaoExecutive(avaliadorId);
        setData(result);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Erro ao carregar colaboradores.',
        );
      } finally {
        if (options?.refreshing) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [avaliadorId],
  );

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const navigateToHistorico = useCallback(
    (colaborador: ColaboradorResumo) => {
      navigation.navigate('HistoricoAvaliacoes', {
        avaliadoId: colaborador.id,
        avaliadoNome: colaborador.nome,
        revealAvaliador: true,
      });
    },
    [navigation],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ThemedText themeColor="danger">{error}</ThemedText>
        <Button label="Tentar novamente" variant="secondary" onPress={() => void loadData()} />
      </View>
    );
  }

  const pendentes = data?.pendentes ?? [];
  const concluidas = data?.concluidas ?? [];
  const total = pendentes.length + concluidas.length;

  return (
    <ScrollView
      contentContainerStyle={[styles.executiveContent, { paddingBottom: scrollPaddingBottom }]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void loadData({ refreshing: true })} />
      }
      showsVerticalScrollIndicator={false}>
      <ThemedText themeColor="textSecondary" style={styles.subtitle}>
        Visão da quinzena atual — toque em um colaborador para ver o histórico de avaliações (
        {total} colaboradores).
      </ThemedText>

      <ColaboradorSection count={pendentes.length} title="Avaliações pendentes">
        {pendentes.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.emptySection}>
            Nenhuma avaliação pendente neste ciclo.
          </ThemedText>
        ) : (
          pendentes.map((colaborador) => (
            <ColaboradorRow
              key={colaborador.id}
              colaborador={colaborador}
              detail={formatMetaColaborador(colaborador)}
              onPress={() => navigateToHistorico(colaborador)}
            />
          ))
        )}
      </ColaboradorSection>

      <ColaboradorSection count={concluidas.length} title="Avaliações concluídas">
        {concluidas.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.emptySection}>
            Nenhuma avaliação concluída neste ciclo.
          </ThemedText>
        ) : (
          concluidas.map((colaborador) => (
            <ColaboradorRow
              key={colaborador.id}
              colaborador={colaborador}
              detail={
                colaborador.ultimaAvaliacaoData
                  ? `Avaliado em ${formatDataBr(colaborador.ultimaAvaliacaoData)} · ${formatMetaColaborador(colaborador)}`
                  : formatMetaColaborador(colaborador)
              }
              onPress={() => navigateToHistorico(colaborador)}
            />
          ))
        )}
      </ColaboradorSection>
    </ScrollView>
  );
}

function ListaColaboradoresGerenteView({
  navigation,
  avaliadorId,
}: {
  navigation: NavigationProp;
  avaliadorId: string;
}) {
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<ColaboradorResumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / COLABORADORES_PAGE_SIZE));
  const { scrollPaddingBottom, footerPaddingBottom } = useTabScreenLayout();

  const loadPage = useCallback(
    async (targetPage: number, options?: { refreshing?: boolean }) => {
      if (options?.refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const result = await fetchColaboradoresPage(avaliadorId, targetPage);
        setItems(result.items);
        setTotal(result.total);
        setPage(result.page);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar colaboradores.');
      } finally {
        if (options?.refreshing) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [avaliadorId],
  );

  useEffect(() => {
    void loadPage(0);
  }, [loadPage]);

  return (
    <View style={styles.body}>
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
          style={styles.list}
          contentContainerStyle={[styles.listContent, { paddingBottom: scrollPaddingBottom }]}
          data={items}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void loadPage(page, { refreshing: true })}
            />
          }
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
        <View style={[styles.pagination, { paddingBottom: footerPaddingBottom }]}>
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
    </View>
  );
}

export function ListaColaboradoresScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { role, isLoading: isRoleLoading } = useAuthRole();
  const isExecutiveView = isAdminDashboardRole(role);

  if (!user || isRoleLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.safeArea, styles.centered]}>
          <ActivityIndicator size="large" />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.safeArea}>
        {isExecutiveView ? (
          <>
            <View style={styles.header}>
              <ThemedText type="heading">Painel de avaliação</ThemedText>
            </View>
            <ListaColaboradoresExecutiveView avaliadorId={user.id} navigation={navigation} />
          </>
        ) : (
          <ListaColaboradoresGerenteView avaliadorId={user.id} navigation={navigation} />
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  body: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  executiveContent: {
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  sectionCount: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  listContent: {
    gap: Spacing.two,
  },
  emptySection: {
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: Spacing.two,
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
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  pageLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
});
