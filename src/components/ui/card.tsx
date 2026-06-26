import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { GlassCard } from "@/components/premium/GlassCard";
import { PressedOpacity, layout } from "@/constants/theme";

type CardPadding = "compact" | "default";
type CardVariant = "elevated" | "glass";

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: CardPadding;
  variant?: CardVariant;
  glow?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Card({
  children,
  style,
  padding = "default",
  variant = "glass",
  glow = false,
  onPress,
  accessibilityLabel,
}: CardProps) {
  if (variant === "glass") {
    return (
      <GlassCard
        accessibilityLabel={accessibilityLabel}
        glow={glow}
        onPress={onPress}
        padding={padding}
        style={style}>
        {children}
      </GlassCard>
    );
  }

  const paddingValue = padding === "compact" ? layout.space.md : layout.space.lg;

  const surface = (
    <View style={[styles.card, { padding: paddingValue, borderRadius: layout.radius.lg }, style]}>
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [pressed && { opacity: PressedOpacity, transform: [{ scale: 0.98 }] }]}>
        {surface}
      </Pressable>
    );
  }

  return surface;
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
  content: {
    gap: layout.space.md,
  },
});
