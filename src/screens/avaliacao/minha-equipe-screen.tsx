import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { SyncStatusBar } from '@/components/SyncStatusBar';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { StatusBadge } from '@/components/premium/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SCREEN_PADDING_HORIZONTAL } from '@/constants/layout';
import { Fonts, layout } from '@/constants/theme';
import {
  fetchEquipeStatusCiclo,
} from '@/features/avaliacao/api';
import { TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import {
  formatCacheDate,
  mergeEquipeComOffline,
  type ColaboradorEquipeStatusOffline,
} from '@/features/offline/equipe-offline';
import { useAuth } from '@/features/auth/auth-context';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useListContentStyle } from '@/lib/layoutPadding';
import { useTheme } from '@/hooks/use-theme';
import {
  getCachedEquipe,
  getOfflineAvaliadoIdsForAvaliador,
} from '@/services/offlineStorage';
import type { MinhaEquipeStackParamList } from '@/navigation/minha-equipe-stack';

type NavigationProp = NativeStackNavigationProp<MinhaEquipeStackParamList, 'MinhaEquipeLista'>;

function EquipeStatusBadge({
  avaliadoNaQuinzena,
  avaliadoLocalmente,
}: {
  avaliadoNaQuinzena: boolean;
  avaliadoLocalmente?: boolean;
}) {
  if (avaliadoLocalmente) {
    return <StatusBadge label="Local" tone="info" size="sm" />;
  }

  if (avaliadoNaQuinzena) {
    return <StatusBadge label="Avaliado" tone="success" size="sm" />;
  }

  return <StatusBadge label="Pendente" tone="warning" size="sm" />;
}

function EquipeRow({
  colaborador,
  onPress,
}: {
  colaborador: ColaboradorEquipeStatusOffline;
  onPress: () => void;
}) {
  const theme = useTheme();
  const isPendente = !colaborador.avaliadoNaQuinzena;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!isPendente}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.border },
        isPendente && pressed && styles.rowPressed,
      ]}>
      <View style={styles.rowInfo}>
        <ThemedText style={styles.rowName}>{colaborador.nome}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.rowDepartamento}>
          {colaborador.departamento?.trim() || 'Sem departamento'}
        </ThemedText>
      </View>
      <EquipeStatusBadge
        avaliadoNaQuinzena={colaborador.avaliadoNaQuinzena}
        avaliadoLocalmente={colaborador.avaliadoLocalmente}
      />
    </Pressable>
  );
}

export function MinhaEquipeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const { user } = useAuth();
  const { role } = useAuthRole();
  const { isOnline } = useNetworkStatus();
  const isDesktopLayout = useIsDesktopLayout();
  const listInsets = useListContentStyle({ safeTop: !isDesktopLayout, withTabBar: false });
  const cicloLabel =
    role === 'gestor' || role === 'gerente'
      ? TIPO_AVALIACAO_LABELS.semestral
      : TIPO_AVALIACAO_LABELS.quinzenal;

  const [colaboradores, setColaboradores] = useState<ColaboradorEquipeStatusOffline[]>([]);
  const [cicloInicio, setCicloInicio] = useState<string | null>(null);
  const [cacheLabel, setCacheLabel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEquipe = useCallback(
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
        const offlineIds = await getOfflineAvaliadoIdsForAvaliador(user.id);

        if (isOnline) {
          const data = await fetchEquipeStatusCiclo(user.id, role);
          setColaboradores(mergeEquipeComOffline(data.colaboradores, offlineIds));
          setCicloInicio(data.cicloInicio);
          setCacheLabel(null);
        } else {
          const cached = await getCachedEquipe(user.id);

          if (!cached) {
            throw new Error(
              'Sem dados em cache. Conecte-se à internet para carregar a equipe.',
            );
          }

          setColaboradores(
            mergeEquipeComOffline(cached.data.data.colaboradores, offlineIds),
          );
          setCicloInicio(cached.data.data.cicloInicio);
          setCacheLabel(formatCacheDate(cached.atualizadoEm));
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'Erro ao carregar a equipe.',
        );
      } finally {
        if (options?.refreshing) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [isOnline, user, role],
  );

  useFocusEffect(
    useCallback(() => {
      void loadEquipe();
    }, [loadEquipe]),
  );

  const handleColaboradorPress = useCallback(
    (colaborador: ColaboradorEquipeStatusOffline) => {
      if (colaborador.avaliadoNaQuinzena) {
        return;
      }

      navigation.navigate('FormularioAvaliacao', {
        avaliadoId: colaborador.id,
        avaliadoNome: colaborador.nome,
      });
    },
    [navigation],
  );

  const pendentesCount = colaboradores.filter((item) => !item.avaliadoNaQuinzena).length;
  const { scrollPaddingBottom } = useTabScreenLayout();

  if (!user || isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.accent} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="danger" style={styles.error}>
          {error}
        </ThemedText>
        <Button label="Tentar novamente" variant="secondary" onPress={() => void loadEquipe()} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SyncStatusBar />
      <View style={[styles.safeArea, { paddingTop: listInsets.paddingTop }]}>
        <View style={styles.header}>
          <ScreenHeader title="Minha equipe" variant="compact" />
          {cacheLabel ? (
            <ThemedText themeColor="textSecondary" style={styles.cacheBanner}>
              Visualizando dados em cache de {cacheLabel}
            </ThemedText>
          ) : null}
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {cicloLabel} · ciclo desde{' '}
            {cicloInicio ? cicloInicio.split('-').reverse().join('/') : '—'} ·{' '}
            {pendentesCount} pendente{pendentesCount === 1 ? '' : 's'}
          </ThemedText>
          <Button
            label="PDI da equipe"
            variant="secondary"
            onPress={() => navigation.navigate('PDIEquipe')}
          />
        </View>

        <FlatList
          data={colaboradores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            colaboradores.length === 0 && styles.listContentEmpty,
            { paddingBottom: scrollPaddingBottom },
          ]}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => void loadEquipe({ refreshing: true })} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="account-group-outline"
              title="Nenhum colaborador ativo"
              message="Não há colaboradores vinculados à sua equipe neste ciclo. Verifique o cadastro no RH ou aguarde a próxima atualização do ciclo de avaliação."
              actionLabel="Atualizar lista"
              onAction={() => void loadEquipe({ refreshing: true })}
            />
          }
          renderItem={({ item }) => (
            <EquipeRow
              colaborador={item}
              onPress={() => handleColaboradorPress(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
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
  header: {
    paddingHorizontal: SCREEN_PADDING_HORIZONTAL,
    paddingBottom: layout.space.lg,
    width: '100%',
    gap: layout.space.md,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  cacheBanner: {
    fontSize: 13,
    lineHeight: 18,
  },
  listContent: {
    width: '100%',
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: layout.space.lg,
    paddingHorizontal: SCREEN_PADDING_HORIZONTAL,
    paddingVertical: layout.space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowPressed: {
    opacity: 0.88,
  },
  rowInfo: {
    flex: 1,
    gap: layout.space.xs,
  },
  rowName: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    lineHeight: 20,
  },
  rowDepartamento: {
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.space.xl,
    gap: layout.space.lg,
  },
});
