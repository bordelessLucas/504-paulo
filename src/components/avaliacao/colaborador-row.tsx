import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { ColaboradorResumo } from '@/features/avaliacao/api';
import { useTheme } from '@/hooks/use-theme';

type ColaboradorRowProps = {
  colaborador: ColaboradorResumo;
  onPress: () => void;
  detail?: string;
  isSelected?: boolean;
  avaliadoLocalmente?: boolean;
  disabled?: boolean;
};

export function ColaboradorRow({
  colaborador,
  onPress,
  detail,
  isSelected = false,
  avaliadoLocalmente = false,
  disabled = false,
}: ColaboradorRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: isSelected ? theme.backgroundSelected : theme.backgroundElement,
          borderColor: isSelected ? theme.text : theme.border,
          borderWidth: isSelected ? 1 : 0,
          opacity: disabled ? 0.55 : 1,
        },
        pressed && !disabled && styles.pressed,
      ]}>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <ThemedText style={styles.name}>{colaborador.nome}</ThemedText>
          {avaliadoLocalmente ? (
            <ThemedText style={styles.localBadge}>🕐</ThemedText>
          ) : null}
        </View>
        <ThemedText themeColor="textSecondary" style={styles.meta}>
          {detail ||
            [colaborador.departamento, colaborador.funcao].filter(Boolean).join(' · ') ||
            'Sem departamento'}
        </ThemedText>
      </View>
      <Ionicons color={theme.textSecondary} name="chevron-forward" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.88,
  },
  info: {
    flex: 1,
    gap: Spacing.one,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  name: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  localBadge: {
    fontSize: 14,
    lineHeight: 18,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
});
