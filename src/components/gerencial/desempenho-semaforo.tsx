import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { getSemaforoItem, SEMAFORO_ITENS, type SemaforoStatus } from '@/features/gerencial/semaforo';
import { useTheme } from '@/hooks/use-theme';

type DesempenhoSemaforoProps = {
  status: SemaforoStatus;
  mediaEmpresa: number | null;
};

export function DesempenhoSemaforo({ status, mediaEmpresa }: DesempenhoSemaforoProps) {
  const theme = useTheme();
  const ativo = getSemaforoItem(status);

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        {SEMAFORO_ITENS.map((item) => {
          const isActive = item.status === status;

          return (
            <View key={item.status} style={styles.lightItem}>
              <View
                style={[
                  styles.light,
                  {
                    backgroundColor: item.color,
                    opacity: isActive ? 1 : 0.28,
                    borderColor: isActive ? theme.text : 'transparent',
                    borderWidth: isActive ? 2 : 0,
                  },
                ]}
              />
              <ThemedText
                style={[
                  styles.lightLabel,
                  { color: isActive ? theme.text : theme.textSecondary },
                ]}>
                {item.label}
              </ThemedText>
            </View>
          );
        })}
      </View>

      <View
        style={[
          styles.summary,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}>
        <ThemedText themeColor="textSecondary" style={styles.summaryLabel}>
          Status atual da empresa
        </ThemedText>
        <ThemedText type="subtitle">{ativo.label}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.summaryMeta}>
          Média geral: {mediaEmpresa !== null ? mediaEmpresa.toFixed(1) : '—'} · {ativo.description}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  lightItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  light: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
  },
  lightLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
  summary: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  summaryLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  summaryMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
});
