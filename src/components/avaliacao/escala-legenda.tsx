import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { NOTA_ESCALA_LEGENDA } from '@/features/avaliacao/ciclos';
import { ALLOWED_SCORES } from '@/features/avaliacao/validation';
import { useTheme } from '@/hooks/use-theme';

export function EscalaLegenda() {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <ThemedText type="subtitle">Escala de notas (0 a 3)</ThemedText>
      {ALLOWED_SCORES.map((nota) => (
        <View key={nota} style={styles.row}>
          <ThemedText style={styles.notaLabel}>{nota}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.notaDescricao}>
            {NOTA_ESCALA_LEGENDA[nota]}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  notaLabel: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    lineHeight: 20,
    minWidth: 16,
  },
  notaDescricao: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
