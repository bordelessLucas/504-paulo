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
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import {
  fetchEquipeStatusCiclo,
  type ColaboradorEquipeStatus,
} from '@/features/avaliacao/api';
import { TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import type { MinhaEquipeStackParamList } from '@/navigation/minha-equipe-stack';

type NavigationProp = NativeStackNavigationProp<MinhaEquipeStackParamList, 'MinhaEquipeLista'>;

function StatusBadge({ avaliadoNaQuinzena }: { avaliadoNaQuinzena: boolean }) {
  if (avaliadoNaQuinzena) {
    return (
      <View style={[styles.badge, styles.badgeAvaliado]}>
        <ThemedText style={styles.badgeTextAvaliado}>Avaliado</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.badgePendente]}>
      <ThemedText style={styles.badgeTextPendente}>Pendente</ThemedText>
    </View>
  );
}

function EquipeRow({
  colaborador,
  onPress,
}: {
  colaborador: ColaboradorEquipeStatus;
  onPress: () => void;
}) {
  const isPendente = !colaborador.avaliadoNaQuinzena;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!isPendente}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isPendente && pressed && styles.rowPressed,
      ]}>
      <View style={styles.rowInfo}>
        <ThemedText style={styles.rowName}>{colaborador.nome}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.rowDepartamento}>
          {colaborador.departamento?.trim() || 'Sem departamento'}
        </ThemedText>
      </View>
      <StatusBadge avaliadoNaQuinzena={colaborador.avaliadoNaQuinzena} />
    </Pressable>
  );
}

export function MinhaEquipeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { role } = useAuthRole();
  const cicloLabel =
    role === 'gestor' || role === 'gerente'
      ? TIPO_AVALIACAO_LABELS.semestral
      : TIPO_AVALIACAO_LABELS.quinzenal;

  const [colaboradores, setColaboradores] = useState<ColaboradorEquipeStatus[]>([]);
  const [cicloInicio, setCicloInicio] = useState<string | null>(null);
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
        const data = await fetchEquipeStatusCiclo(user.id, role);
        setColaboradores(data.colaboradores);
        setCicloInicio(data.cicloInicio);
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
    [user, role],
  );

  useFocusEffect(
    useCallback(() => {
      void loadEquipe();
    }, [loadEquipe]),
  );

  const handleColaboradorPress = useCallback(
    (colaborador: ColaboradorEquipeStatus) => {
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

  if (!user || isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
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
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.header}>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            {cicloLabel} · ciclo desde{' '}
            {cicloInicio ? cicloInicio.split('-').reverse().join('/') : '—'} ·{' '}
            {pendentesCount} pendente{pendentesCount === 1 ? '' : 's'}
          </ThemedText>
        </View>

        <FlatList
          data={colaboradores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => void loadEquipe({ refreshing: true })} />
          }
          ListEmptyComponent={
            <ThemedText themeColor="textSecondary" style={styles.empty}>
              Nenhum colaborador ativo encontrado.
            </ThemedText>
          }
          renderItem={({ item }) => (
            <EquipeRow
              colaborador={item}
              onPress={() => handleColaboradorPress(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
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
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    maxWidth: MaxContentWidth + 360,
    width: '100%',
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: Spacing.six,
    maxWidth: MaxContentWidth + 360,
    width: '100%',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rowPressed: {
    opacity: 0.88,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
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
  badge: {
    borderRadius: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  badgeAvaliado: {
    backgroundColor: '#E8F5E9',
  },
  badgePendente: {
    backgroundColor: '#FFF3E0',
  },
  badgeTextAvaliado: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    color: '#1B5E20',
  },
  badgeTextPendente: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    color: '#E65100',
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
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
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
