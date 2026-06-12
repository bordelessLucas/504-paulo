import { useRoute, type RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AvaliacaoHistoricoCard } from '@/components/avaliacao/avaliacao-historico-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  calcularMediaHistorico,
  fetchHistoricoAvaliacoesCompleto,
  fetchHistoricoAvaliacoesMasked,
  formatHistoricoMedia,
  type AvaliacaoHistoricoItem,
} from '@/features/avaliacao/historico-api';
import {
  TIPO_AVALIACAO_FILTRO,
  TIPO_AVALIACAO_FILTRO_LABELS,
  type TipoAvaliacaoFiltro,
} from '@/features/avaliacao/historico-labels';
import { getSemaforoItem, getSemaforoPorMedia } from '@/features/gerencial/semaforo';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useTheme } from '@/hooks/use-theme';
import type { AvaliacaoStackParamList } from '@/navigation/avaliacao-stack';

type HistoricoRoute = RouteProp<AvaliacaoStackParamList, 'HistoricoAvaliacoes'>;

function HistoricoResumoCard({
  total,
  mediaGeral,
}: {
  total: number;
  mediaGeral: number | null;
}) {
  const theme = useTheme();
  const semaforo = getSemaforoItem(getSemaforoPorMedia(mediaGeral));

  return (
    <View
      style={[
        styles.resumoCard,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <View style={styles.resumoItem}>
        <ThemedText themeColor="textSecondary" style={styles.resumoLabel}>
          Total
        </ThemedText>
        <ThemedText style={styles.resumoValue}>{total}</ThemedText>
      </View>
      <View style={[styles.resumoDivider, { backgroundColor: theme.border }]} />
      <View style={styles.resumoItem}>
        <ThemedText themeColor="textSecondary" style={styles.resumoLabel}>
          Média geral
        </ThemedText>
        <ThemedText style={[styles.resumoValue, { color: semaforo.color }]}>
          {formatHistoricoMedia(mediaGeral)}
        </ThemedText>
      </View>
    </View>
  );
}

function HistoricoFiltroTipos({
  filtro,
  onChange,
  items,
}: {
  filtro: TipoAvaliacaoFiltro;
  onChange: (value: TipoAvaliacaoFiltro) => void;
  items: AvaliacaoHistoricoItem[];
}) {
  const theme = useTheme();

  const tiposDisponiveis = useMemo(() => {
    const counts = new Map<TipoAvaliacaoFiltro, number>();
    counts.set('todas', items.length);

    for (const tipo of TIPO_AVALIACAO_FILTRO) {
      if (tipo === 'todas') {
        continue;
      }

      counts.set(tipo, items.filter((item) => item.tipo === tipo).length);
    }

    return TIPO_AVALIACAO_FILTRO.filter((tipo) => (counts.get(tipo) ?? 0) > 0);
  }, [items]);

  if (tiposDisponiveis.length <= 2) {
    return null;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
      {tiposDisponiveis.map((tipo) => {
        const isSelected = filtro === tipo;

        return (
          <Pressable
            key={tipo}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(tipo)}
            style={[
              styles.filtroChip,
              {
                backgroundColor: isSelected ? theme.backgroundSelected : theme.background,
                borderColor: isSelected ? theme.text : theme.border,
              },
            ]}>
            <ThemedText style={[styles.filtroLabel, isSelected && styles.filtroLabelSelected]}>
              {TIPO_AVALIACAO_FILTRO_LABELS[tipo]}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function HistoricoAvaliacoesScreen() {
  const theme = useTheme();
  const route = useRoute<HistoricoRoute>();
  const { avaliadoId, avaliadoNome, revealAvaliador } = route.params;

  const [items, setItems] = useState<AvaliacaoHistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<TipoAvaliacaoFiltro>('todas');
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
        setExpandedId((current) => {
          if (current && historico.some((item) => item.id === current)) {
            return current;
          }

          return historico[0]?.id ?? null;
        });
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

  const itemsFiltrados = useMemo(() => {
    if (filtroTipo === 'todas') {
      return items;
    }

    return items.filter((item) => item.tipo === filtroTipo);
  }, [filtroTipo, items]);

  const mediaGeral = useMemo(() => calcularMediaHistorico(itemsFiltrados), [itemsFiltrados]);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

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
                  ? 'Histórico de avaliações — toque em cada item para expandir os detalhes.'
                  : 'Suas avaliações — o avaliador não é exibido.'}
              </ThemedText>
            </View>

            {items.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                Nenhuma avaliação registrada ainda.
              </ThemedText>
            ) : (
              <>
                {revealAvaliador && items.length > 0 ? (
                  <HistoricoResumoCard mediaGeral={mediaGeral} total={itemsFiltrados.length} />
                ) : null}

                {revealAvaliador ? (
                  <HistoricoFiltroTipos filtro={filtroTipo} items={items} onChange={setFiltroTipo} />
                ) : null}

                {itemsFiltrados.length === 0 ? (
                  <ThemedText themeColor="textSecondary" style={styles.empty}>
                    Nenhuma avaliação neste filtro.
                  </ThemedText>
                ) : (
                  <View style={styles.list}>
                    {itemsFiltrados.map((item, index) => (
                      <View key={item.id} style={styles.timelineRow}>
                        {revealAvaliador && itemsFiltrados.length > 1 ? (
                          <View style={styles.timelineRail}>
                            <View style={[styles.timelineDot, { backgroundColor: theme.text }]} />
                            {index < itemsFiltrados.length - 1 ? (
                              <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
                            ) : null}
                          </View>
                        ) : null}

                        <View style={styles.timelineCard}>
                          <AvaliacaoHistoricoCard
                            index={revealAvaliador ? index : undefined}
                            isExpanded={expandedId === item.id}
                            item={item}
                            showAvaliador={revealAvaliador}
                            onToggle={() => handleToggle(item.id)}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
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
    maxWidth: MaxContentWidth + 360,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    gap: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  resumoCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.four,
  },
  resumoItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  resumoDivider: {
    width: 1,
    marginVertical: Spacing.one,
  },
  resumoLabel: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  resumoValue: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 22,
    lineHeight: 28,
  },
  filtros: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  filtroChip: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  filtroLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  filtroLabelSelected: {
    fontFamily: Fonts.sansSemiBold,
  },
  list: {
    gap: Spacing.two,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  timelineRail: {
    width: 12,
    alignItems: 'center',
    paddingTop: Spacing.four,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: Spacing.one,
    borderRadius: 1,
  },
  timelineCard: {
    flex: 1,
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
