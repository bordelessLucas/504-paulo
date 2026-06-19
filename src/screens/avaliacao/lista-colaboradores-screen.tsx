import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ColaboradorRow } from '@/components/avaliacao/colaborador-row';
import { SyncStatusBar } from '@/components/SyncStatusBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Fonts, Spacing } from '@/constants/theme';
import {
  COLABORADORES_PAGE_SIZE,
  fetchColaboradoresAvaliacaoExecutive,
  fetchColaboradoresPage,
  type ColaboradorResumo,
} from '@/features/avaliacao/api';
import { TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import {
  formatCacheDate,
  mergeEquipeComOffline,
  splitEquipeOffline,
  type ColaboradorEquipeStatusOffline,
} from '@/features/offline/equipe-offline';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useTheme } from '@/hooks/use-theme';
import {
  getCachedEquipe,
  getOfflineAvaliadoIdsForAvaliador,
} from '@/services/offlineStorage';
import type { AvaliacaoStackParamList } from '@/navigation/avaliacao-stack';
import { isAdminDashboardRole, type TipoAvaliacao } from '@/types/supabase';

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

function CicloToggle({
  tipo,
  onChange,
  disabled = false,
}: {
  tipo: TipoAvaliacao;
  onChange: (tipo: TipoAvaliacao) => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const options: TipoAvaliacao[] = ['quinzenal', 'semestral'];

  return (
    <View style={styles.cicloToggle}>
      {options.map((option) => {
        const isActive = tipo === option;

        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive, disabled }}
            disabled={disabled}
            onPress={() => onChange(option)}
            style={[
              styles.cicloOption,
              {
                backgroundColor: isActive ? theme.backgroundSelected : theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}>
            <ThemedText
              style={[
                styles.cicloOptionLabel,
                { color: isActive ? theme.text : theme.textSecondary },
              ]}>
              {TIPO_AVALIACAO_LABELS[option]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

function ListaColaboradoresExecutiveView({
  navigation,
  avaliadorId,
  role,
  isOnline,
}: {
  navigation: NavigationProp;
  avaliadorId: string;
  role: ReturnType<typeof useAuthRole>['role'];
  isOnline: boolean;
}) {
  const [tipoCiclo, setTipoCiclo] = useState<TipoAvaliacao>('quinzenal');
  const [pendentes, setPendentes] = useState<ColaboradorEquipeStatusOffline[]>([]);
  const [concluidas, setConcluidas] = useState<ColaboradorEquipeStatusOffline[]>([]);
  const [cacheLabel, setCacheLabel] = useState<string | null>(null);
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
        const offlineIds = await getOfflineAvaliadoIdsForAvaliador(avaliadorId);

        if (isOnline) {
          const result = await fetchColaboradoresAvaliacaoExecutive(avaliadorId, tipoCiclo, role);
          const colaboradores = mergeEquipeComOffline(
            [
              ...result.concluidas.map((colaborador) => ({
                ...colaborador,
                avaliadoNaQuinzena: true,
              })),
              ...result.pendentes.map((colaborador) => ({
                ...colaborador,
                avaliadoNaQuinzena: false,
              })),
            ],
            offlineIds,
          );
          const split = splitEquipeOffline(colaboradores);

          setPendentes(split.pendentes);
          setConcluidas(split.concluidas);
          setCacheLabel(null);
        } else {
          const cached = await getCachedEquipe(avaliadorId);

          if (!cached) {
            throw new Error(
              'Sem dados em cache. Conecte-se à internet para carregar colaboradores.',
            );
          }

          const colaboradores = mergeEquipeComOffline(
            cached.data.data.colaboradores,
            offlineIds,
          );
          const split = splitEquipeOffline(colaboradores);

          setPendentes(split.pendentes);
          setConcluidas(split.concluidas);
          setCacheLabel(formatCacheDate(cached.atualizadoEm));
        }
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
    [avaliadorId, isOnline, role, tipoCiclo],
  );

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const navigateToHistorico = useCallback(
    (colaborador: ColaboradorEquipeStatusOffline) => {
      if (!isOnline) {
        return;
      }

      navigation.navigate('HistoricoAvaliacoes', {
        avaliadoId: colaborador.id,
        avaliadoNome: colaborador.nome,
        revealAvaliador: true,
      });
    },
    [isOnline, navigation],
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

  const total = pendentes.length + concluidas.length;

  return (
    <ScrollView
      contentContainerStyle={[styles.executiveContent, { paddingBottom: scrollPaddingBottom }]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          enabled={isOnline}
          onRefresh={() => void loadData({ refreshing: true })}
        />
      }
      showsVerticalScrollIndicator={false}>
      {cacheLabel ? (
        <ThemedText themeColor="textSecondary" style={styles.cacheBanner}>
          Visualizando dados em cache de {cacheLabel}
        </ThemedText>
      ) : null}

      <CicloToggle disabled={!isOnline} tipo={tipoCiclo} onChange={setTipoCiclo} />

      <ThemedText themeColor="textSecondary" style={styles.subtitle}>
        Visão do ciclo {tipoCiclo === 'quinzenal' ? 'quinzenal' : 'semestral'} — toque em um
        colaborador para ver o histórico de avaliações ({total} colaboradores).
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
              disabled={!isOnline}
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
              avaliadoLocalmente={colaborador.avaliadoLocalmente}
              colaborador={colaborador}
              detail={
                colaborador.avaliadoLocalmente
                  ? `Avaliado localmente · ${formatMetaColaborador(colaborador)}`
                  : colaborador.ultimaAvaliacaoData
                    ? `Avaliado em ${formatDataBr(colaborador.ultimaAvaliacaoData)} · ${formatMetaColaborador(colaborador)}`
                    : formatMetaColaborador(colaborador)
              }
              disabled={!isOnline}
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
  role,
  isOnline,
}: {
  navigation: NavigationProp;
  avaliadorId: string;
  role: ReturnType<typeof useAuthRole>['role'];
  isOnline: boolean;
}) {
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<ColaboradorEquipeStatusOffline[]>([]);
  const [cacheLabel, setCacheLabel] = useState<string | null>(null);
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
        const offlineIds = await getOfflineAvaliadoIdsForAvaliador(avaliadorId);

        if (isOnline) {
          const result = await fetchColaboradoresPage(avaliadorId, targetPage, role);
          const colaboradores = mergeEquipeComOffline(
            result.items.map((colaborador) => ({
              ...colaborador,
              avaliadoNaQuinzena: false,
            })),
            offlineIds,
          );

          setItems(colaboradores);
          setTotal(result.total);
          setPage(result.page);
          setCacheLabel(null);
        } else {
          const cached = await getCachedEquipe(avaliadorId);

          if (!cached) {
            throw new Error(
              'Sem dados em cache. Conecte-se à internet para carregar colaboradores.',
            );
          }

          const colaboradores = mergeEquipeComOffline(
            cached.data.data.colaboradores,
            offlineIds,
          );
          const pageSize = COLABORADORES_PAGE_SIZE;
          const from = targetPage * pageSize;
          const pageItems = colaboradores.slice(from, from + pageSize);

          setItems(pageItems);
          setTotal(colaboradores.length);
          setPage(targetPage);
          setCacheLabel(formatCacheDate(cached.atualizadoEm));
        }
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
    [avaliadorId, isOnline, role],
  );

  useEffect(() => {
    void loadPage(0);
  }, [loadPage]);

  return (
    <View style={styles.body}>
      <View style={styles.header}>
        {cacheLabel ? (
          <ThemedText themeColor="textSecondary" style={styles.cacheBanner}>
            Visualizando dados em cache de {cacheLabel}
          </ThemedText>
        ) : null}
        <ThemedText type="heading">Colaboradores a avaliar</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Selecione um colaborador para iniciar a avaliação ({total} no total).
          {role === 'supervisor' || role === 'gestor' || role === 'gerente'
            ? ' A lista considera colaboradores do seu departamento.'
            : ''}
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
              enabled={isOnline}
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
              avaliadoLocalmente={item.avaliadoLocalmente}
              colaborador={item}
              detail={
                item.avaliadoLocalmente
                  ? 'Avaliado localmente — aguardando sincronização'
                  : item.avaliadoNaQuinzena
                    ? 'Avaliado neste ciclo'
                    : undefined
              }
              disabled={item.avaliadoNaQuinzena}
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
  const { isOnline } = useNetworkStatus();
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
      <SyncStatusBar />
      <View style={styles.safeArea}>
        {isExecutiveView ? (
          <>
            <View style={styles.header}>
              <ThemedText type="heading">Painel de avaliação</ThemedText>
            </View>
            <ListaColaboradoresExecutiveView
              avaliadorId={user.id}
              isOnline={isOnline}
              navigation={navigation}
              role={role}
            />
          </>
        ) : (
          <ListaColaboradoresGerenteView
            avaliadorId={user.id}
            isOnline={isOnline}
            navigation={navigation}
            role={role}
          />
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
  cacheBanner: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.one,
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
  cicloToggle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  cicloOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  cicloOptionLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
});
