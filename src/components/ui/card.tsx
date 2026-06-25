import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Surface } from 'react-native-paper';

import { PressedOpacity, Radius, Spacing } from '@/constants/theme';

type CardPadding = 'compact' | 'default';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: CardPadding;
  elevation?: 0 | 1 | 2 | 3;
  onPress?: () => void;
  accessibilityLabel?: string;
};

const paddingMap: Record<CardPadding, number> = {
  compact: Spacing.three,
  default: Spacing.four,
};

export function Card({
  children,
  style,
  padding = 'default',
  elevation = 1,
  onPress,
  accessibilityLabel,
}: CardProps) {
  const surface = (
    <Surface
      mode="elevated"
      elevation={elevation}
      style={[styles.card, { padding: paddingMap[padding], borderRadius: Radius.lg }, style]}>
      <View style={styles.content}>{children}</View>
    </Surface>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}>
        {surface}
      </Pressable>
    );
  }

  return surface;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  content: {
    gap: Spacing.three,
  },
  pressed: {
    opacity: PressedOpacity,
  },
});
