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
};

export function ColaboradorRow({ colaborador, onPress, detail }: ColaboradorRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <View style={styles.info}>
        <ThemedText style={styles.name}>{colaborador.nome}</ThemedText>
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
  name: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    lineHeight: 20,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
});
