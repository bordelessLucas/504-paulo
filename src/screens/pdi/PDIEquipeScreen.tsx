import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { CriarPDIModal } from '@/components/pdi/CriarPDIModal';
import { PDICard } from '@/components/pdi/PDICard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { PDI_EIXO_OPTIONS, PDI_STATUS_LABELS } from '@/features/pdi/labels';
import type { PdiColaboradorResumo, PdiEixo, PdiStatus } from '@/features/pdi/types';
import { useAuth } from '@/features/auth/auth-context';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useTheme } from '@/hooks/use-theme';
import type { MinhaEquipeStackParamList } from '@/navigation/minha-equipe-stack';
import { buscarPDIsDaEquipe } from '@/services/pdiService';

type NavigationProp = NativeStackNavigationProp<MinhaEquipeStackParamList, 'PDIEquipe'>;

type StatusFiltro = 'todos' | PdiStatus;
type EixoFiltro = 'todos' | PdiEixo;

function ColaboradorPdiCard({
  resumo,
  expanded,
  onToggle,
  onOpenPdi,
  onCreatePdi,
}: {
  resumo: PdiColaboradorResumo;
  expanded: boolean;
  onToggle: () => void;
  onOpenPdi: (pdiId: string) => void;
  onCreatePdi: (colaboradorId: string, colaboradorNome: string) => void;
}) {
  const theme = useTheme();
  const hasVencido = resumo.vencidos > 0;

  return (
    <View style={[styles.colabCard, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
      <Pressable accessibilityRole="button" onPress={onToggle} style={styles.colabHeader}>
        <View style={styles.colabInfo}>
          <ThemedText style={styles.colabName}>{resumo.colaboradorNome}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.colabMeta}>
            {resumo.abertos + resumo.emAndamento} abertos · {resumo.concluidos} concluídos ·{' '}
            {resumo.vencidos} vencidos
          </ThemedText>
        </View>
        {hasVencido ? <ThemedText style={styles.alertBadge}>⚠️</ThemedText> : null}
      </Pressable>

      {expanded ? (
        <View style={styles.pdiList}>
          {resumo.pdis.length === 0 ? (
            <ThemedText themeColor="textSecondary">Nenhum PDI registrado.</ThemedText>
          ) : (
            resumo.pdis.map((pdi) => (
              <PDICard key={pdi.id} pdi={pdi} onPress={() => onOpenPdi(pdi.id)} />
            ))
          )}
          <Button
            label="Criar PDI"
            variant="secondary"
            onPress={() => onCreatePdi(resumo.colaboradorId, resumo.colaboradorNome)}
          />
        </View>
      ) : null}
    </View>
  );
}

export function PDIEquipeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const theme = useTheme();
  const { scrollPaddingBottom } = useTabScreenLayout();

  const [resumos, setResumos] = useState<PdiColaboradorResumo[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('todos');
  const [eixoFiltro, setEixoFiltro] = useState<EixoFiltro>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  const loadData = useCallback(
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
        const data = await buscarPDIsDaEquipe(user.id);
        setResumos(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar PDIs.');
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
      void loadData();
    }, [loadData]),
  );

  const filtrados = useMemo(() => {
    return resumos
      .map((resumo) => {
        const pdis = resumo.pdis.filter((pdi) => {
          const statusOk = statusFiltro === 'todos' || pdi.status === statusFiltro;
          const eixoOk = eixoFiltro === 'todos' || pdi.eixo === eixoFiltro;
          return statusOk && eixoOk;
        });

        return { ...resumo, pdis, total: pdis.length };
      })
      .filter((resumo) => resumo.pdis.length > 0 || statusFiltro === 'todos');
  }, [eixoFiltro, resumos, statusFiltro]);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: scrollPaddingBottom }]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void loadData({ refreshing: true })} />
        }>
        <ThemedText type="heading">PDI da equipe</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Acompanhe os planos de desenvolvimento dos colaboradores.
        </ThemedText>

        {error ? (
          <View style={styles.centered}>
            <ThemedText themeColor="danger">{error}</ThemedText>
            <Button label="Tentar novamente" variant="secondary" onPress={() => void loadData()} />
          </View>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {(['todos', 'aberto', 'em_andamento', 'vencido', 'concluido'] as StatusFiltro[]).map((filtro) => (
            <Pressable
              key={filtro}
              onPress={() => setStatusFiltro(filtro)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: statusFiltro === filtro ? theme.backgroundSelected : theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <ThemedText>{filtro === 'todos' ? 'Todos' : PDI_STATUS_LABELS[filtro]}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {(['todos', ...PDI_EIXO_OPTIONS] as EixoFiltro[]).map((filtro) => (
            <Pressable
              key={filtro}
              onPress={() => setEixoFiltro(filtro)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: eixoFiltro === filtro ? theme.backgroundSelected : theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <ThemedText>{filtro === 'todos' ? 'Todos eixos' : filtro}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {filtrados.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            Nenhum PDI encontrado com os filtros selecionados.
          </ThemedText>
        ) : (
          filtrados.map((resumo) => (
            <ColaboradorPdiCard
              key={resumo.colaboradorId}
              expanded={expandedId === resumo.colaboradorId}
              resumo={resumo}
              onCreatePdi={(colaboradorId, colaboradorNome) => {
                setSelectedColaborador({ id: colaboradorId, nome: colaboradorNome });
                setModalVisible(true);
              }}
              onToggle={() =>
                setExpandedId((current) =>
                  current === resumo.colaboradorId ? null : resumo.colaboradorId,
                )
              }
              onOpenPdi={(pdiId) => navigation.navigate('PDIDetail', { pdiId })}
            />
          ))
        )}
      </ScrollView>

      {user && selectedColaborador ? (
        <CriarPDIModal
          visible={modalVisible}
          colaboradorId={selectedColaborador.id}
          colaboradorNome={selectedColaborador.nome}
          criadoPorId={user.id}
          onClose={() => setModalVisible(false)}
          onCreated={() => void loadData()}
        />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  filters: {
    gap: Spacing.two,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  colabCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  colabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  colabInfo: { flex: 1, gap: 2 },
  colabName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  colabMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  alertBadge: { fontSize: 18 },
  pdiList: { gap: Spacing.two },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
});
