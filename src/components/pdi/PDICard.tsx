import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import {
  formatPdiDate,
  formatPrazoRelativo,
  PDI_EIXO_COLORS,
  PDI_EIXO_SHORT,
  PDI_STATUS_COLORS,
  PDI_STATUS_LABELS,
} from '@/features/pdi/labels';
import type { PlanoDesenvolvimento } from '@/features/pdi/types';
import { useTheme } from '@/hooks/use-theme';

type PDICardProps = {
  pdi: PlanoDesenvolvimento;
  onPress: () => void;
  compact?: boolean;
  hideCriador?: boolean;
};

export function PDICard({
  pdi,
  onPress,
  compact = false,
  hideCriador = false,
}: PDICardProps) {
  const theme = useTheme();
  const eixoStyle = PDI_EIXO_COLORS[pdi.eixo];
  const statusStyle = PDI_STATUS_COLORS[pdi.status];

  return (
    <Card onPress={onPress} padding="compact">
      <View style={styles.header}>
        <View style={[styles.eixoBadge, { backgroundColor: eixoStyle.bg }]}>
          <ThemedText style={[styles.eixoText, { color: eixoStyle.text }]}>
            {PDI_EIXO_SHORT[pdi.eixo]}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>
            {PDI_STATUS_LABELS[pdi.status]}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.title}>{pdi.titulo}</ThemedText>

      {!compact ? (
        <ThemedText themeColor="textSecondary" style={styles.indicator}>
          Indicador: {pdi.indicadorSucesso}
        </ThemedText>
      ) : null}

      <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${pdi.progressoPct}%`,
              backgroundColor: statusStyle.text,
            },
          ]}
        />
      </View>
      <ThemedText themeColor="textSecondary" style={styles.progressLabel}>
        {pdi.progressoPct}% concluído
      </ThemedText>

      <View style={styles.footer}>
        <ThemedText themeColor="textSecondary" style={styles.footerText}>
          Prazo: {formatPdiDate(pdi.prazo)} · {formatPrazoRelativo(pdi.prazo)}
        </ThemedText>
        {!hideCriador && pdi.criadoPorNome ? (
          <ThemedText themeColor="textSecondary" style={styles.footerText}>
            Criado por {pdi.criadoPorNome} em {formatPdiDate(pdi.createdAt)}
          </ThemedText>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  eixoBadge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  eixoText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  statusBadge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  title: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  indicator: {
    fontSize: 13,
    lineHeight: 18,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.sm,
  },
  progressLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    gap: 2,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
