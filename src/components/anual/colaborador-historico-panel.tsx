import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AvaliacaoHistoricoCard } from '@/components/avaliacao/avaliacao-historico-card';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import {
  calcularMediaHistorico,
  formatHistoricoMedia,
  type AvaliacaoHistoricoItem,
} from '@/features/avaliacao/historico-api';
import {
  TIPO_AVALIACAO_FILTRO,
  TIPO_AVALIACAO_FILTRO_LABELS,
  type TipoAvaliacaoFiltro,
} from '@/features/avaliacao/historico-labels';
import { filtrarHistoricoPorAno } from '@/features/estrategico/api';
import { getSemaforoItem, getSemaforoPorMedia } from '@/features/gerencial/semaforo';
import { useTheme } from '@/hooks/use-theme';

function HistoricoResumoCard({
  total,
  mediaGeral,
  anoReferencia,
}: {
  total: number;
  mediaGeral: number | null;
  anoReferencia: number;
}) {
  const theme = useTheme();
  const semaforo = getSemaforoItem(getSemaforoPorMedia(mediaGeral));

  return (
    <View
      style={[
        styles.resumoCard,
        { borderColor: theme.border, backgroundColor: theme.background },
      ]}>
      <View style={styles.resumoItem}>
        <ThemedText themeColor="textSecondary" style={styles.resumoLabel}>
          Avaliações {anoReferencia}
        </ThemedText>
        <ThemedText style={styles.resumoValue}>{total}</ThemedText>
      </View>
      <View style={[styles.resumoDivider, { backgroundColor: theme.border }]} />
      <View style={styles.resumoItem}>
        <ThemedText themeColor="textSecondary" style={styles.resumoLabel}>
          Média consolidada
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

type ColaboradorHistoricoPanelProps = {
  historico: AvaliacaoHistoricoItem[];
  anoReferencia: number;
};

export function ColaboradorHistoricoPanel({
  historico,
  anoReferencia,
}: ColaboradorHistoricoPanelProps) {
  const theme = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<TipoAvaliacaoFiltro>('todas');

  const historicoAno = useMemo(
    () => filtrarHistoricoPorAno(historico, anoReferencia),
    [anoReferencia, historico],
  );

  const itemsFiltrados = useMemo(() => {
    if (filtroTipo === 'todas') {
      return historicoAno;
    }

    return historicoAno.filter((item) => item.tipo === filtroTipo);
  }, [filtroTipo, historicoAno]);

  const mediaGeral = useMemo(() => calcularMediaHistorico(itemsFiltrados), [itemsFiltrados]);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  if (historicoAno.length === 0) {
    return (
      <View
        style={[
          styles.sectionCard,
          { borderColor: theme.border, backgroundColor: theme.backgroundElement },
        ]}>
        <ThemedText style={styles.sectionTitle}>Histórico de avaliações</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.emptyText}>
          Nenhuma avaliação registrada em {anoReferencia}.
        </ThemedText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.sectionCard,
        { borderColor: theme.border, backgroundColor: theme.backgroundElement },
      ]}>
      <ThemedText style={styles.sectionTitle}>Histórico de avaliações</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
        Consolidação {anoReferencia} — toque em cada item para expandir os detalhes.
      </ThemedText>

      <HistoricoResumoCard
        anoReferencia={anoReferencia}
        mediaGeral={mediaGeral}
        total={itemsFiltrados.length}
      />

      <HistoricoFiltroTipos filtro={filtroTipo} items={historicoAno} onChange={setFiltroTipo} />

      {itemsFiltrados.length === 0 ? (
        <ThemedText themeColor="textSecondary" style={styles.emptyText}>
          Nenhuma avaliação neste filtro.
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {itemsFiltrados.map((item, index) => (
            <View key={item.id} style={styles.timelineRow}>
              {itemsFiltrados.length > 1 ? (
                <View style={styles.timelineRail}>
                  <View style={[styles.timelineDot, { backgroundColor: theme.text }]} />
                  {index < itemsFiltrados.length - 1 ? (
                    <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
                  ) : null}
                </View>
              ) : null}

              <View style={styles.timelineCard}>
                <AvaliacaoHistoricoCard
                  index={index}
                  isExpanded={expandedId === item.id}
                  item={item}
                  showAvaliador
                  onToggle={() => handleToggle(item.id)}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sectionTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  resumoCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.three,
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
    fontSize: 11,
    lineHeight: 14,
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
});
