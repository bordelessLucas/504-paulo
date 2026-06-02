import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { ColaboradorRanking } from '@/features/gerencial/dashboard-api';
import { useTheme } from '@/hooks/use-theme';

type ColaboradorRankingListProps = {
  title: string;
  items: ColaboradorRanking[];
  exportingId: string | null;
  onExport: (colaborador: ColaboradorRanking) => void;
};

export function ColaboradorRankingList({
  title,
  items,
  exportingId,
  onExport,
}: ColaboradorRankingListProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">{title}</ThemedText>

      {items.length === 0 ? (
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          Sem colaboradores com notas registradas.
        </ThemedText>
      ) : (
        items.map((item, index) => {
          const isExporting = exportingId === item.id;

          return (
            <View
              key={item.id}
              style={[
                styles.row,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}>
              <View style={styles.info}>
                <ThemedText style={styles.position}>{index + 1}º</ThemedText>
                <View style={styles.textBlock}>
                  <ThemedText style={styles.name}>{item.nome}</ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.meta}>
                    {[item.departamento, item.funcao].filter(Boolean).join(' · ') ||
                      'Sem departamento'}
                  </ThemedText>
                </View>
                <ThemedText style={styles.score}>{item.media.toFixed(1)}</ThemedText>
              </View>

              <Pressable
                accessibilityRole="button"
                disabled={isExporting}
                onPress={() => onExport(item)}
                style={({ pressed }) => [
                  styles.exportButton,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.backgroundElement,
                  },
                  pressed && !isExporting && styles.pressed,
                  isExporting && styles.disabled,
                ]}>
                {isExporting ? (
                  <ActivityIndicator size="small" color={theme.text} />
                ) : (
                  <ThemedText style={styles.exportLabel}>Exportar ficha PDF</ThemedText>
                )}
              </Pressable>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  position: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    lineHeight: 18,
    width: 24,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
  },
  score: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 16,
    lineHeight: 20,
  },
  exportButton: {
    minHeight: 36,
    borderWidth: 1,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  exportLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.6,
  },
});
