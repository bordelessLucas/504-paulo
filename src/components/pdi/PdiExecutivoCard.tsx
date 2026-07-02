import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { PDI_STATUS_COLORS, PDI_STATUS_LABELS } from '@/features/pdi/labels';
import type { PdiEstatisticas } from '@/features/pdi/types';
import { useTheme } from '@/hooks/use-theme';

type PdiExecutivoCardProps = {
  stats: PdiEstatisticas;
  /** Remove borda externa quando embutido em GlassCard do dashboard. */
  embedded?: boolean;
};

export function PdiExecutivoCard({ stats, embedded = false }: PdiExecutivoCardProps) {
  const theme = useTheme();
  const alertaVencidos = stats.percentualVencidos > 10;

  return (
    <View
      style={[
        embedded ? styles.embedded : styles.card,
        !embedded && { backgroundColor: theme.background, borderColor: theme.border },
      ]}>
      {!embedded ? <ThemedText type="subtitle">Saúde dos PDIs</ThemedText> : null}
      <ThemedText themeColor="textSecondary" style={styles.description}>
        Planos de desenvolvimento ativos e taxa de conclusão na empresa.
      </ThemedText>

      <View style={styles.metrics}>
        <Metric label="PDIs ativos" value={String(stats.totalAtivos)} />
        <Metric label="Taxa de conclusão" value={`${stats.taxaConclusao}%`} />
        <Metric
          label="Vencidos sem ação"
          value={`${stats.percentualVencidos}%`}
          alert={alertaVencidos}
        />
      </View>

      {alertaVencidos ? (
        <ThemedText themeColor="danger" style={styles.alert}>
          Atenção: mais de 10% dos PDIs ativos estão vencidos.
        </ThemedText>
      ) : null}

      <View style={styles.chart}>
        {(['aberto', 'em_andamento', 'concluido', 'vencido', 'cancelado'] as const).map((status) => {
          const total = stats.totalPorStatus[status];
          const max = Math.max(...Object.values(stats.totalPorStatus), 1);
          const widthPercent = Math.round((total / max) * 100);
          const colors = PDI_STATUS_COLORS[status];

          return (
            <View key={status} style={styles.barRow}>
              <ThemedText style={styles.barLabel}>{PDI_STATUS_LABELS[status]}</ThemedText>
              <View style={[styles.barTrack, { backgroundColor: theme.backgroundElement }]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${widthPercent}%` as `${number}%`, backgroundColor: colors.text },
                  ]}
                />
              </View>
              <ThemedText style={styles.barValue}>{total}</ThemedText>
            </View>
          );
        })}
      </View>

      {stats.topDepartamentosAbertos.length > 0 ? (
        <View style={styles.deptSection}>
          <ThemedText style={styles.deptTitle}>Top departamentos com PDIs abertos</ThemedText>
          {stats.topDepartamentosAbertos.map((item) => (
            <ThemedText key={item.departamento} themeColor="textSecondary" style={styles.deptItem}>
              {item.departamento}: {item.total}
            </ThemedText>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Metric({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <View style={styles.metric}>
      <ThemedText style={[styles.metricValue, alert && styles.metricAlert]}>{value}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.metricLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  embedded: {
    gap: Spacing.three,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  metric: {
    minWidth: 100,
    gap: Spacing.one,
  },
  metricValue: {
    fontFamily: Fonts.sansBold,
    fontSize: 22,
    lineHeight: 26,
  },
  metricAlert: {
    color: '#DC2626',
  },
  metricLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  alert: {
    fontSize: 13,
    lineHeight: 18,
  },
  chart: {
    gap: Spacing.two,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  barLabel: {
    width: 96,
    fontSize: 12,
    lineHeight: 16,
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  barValue: {
    width: 24,
    textAlign: 'right',
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
  },
  deptSection: {
    gap: Spacing.one,
  },
  deptTitle: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  deptItem: {
    fontSize: 12,
    lineHeight: 16,
  },
});
