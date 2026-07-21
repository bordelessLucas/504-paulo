import { useMemo, type ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { brandRgb } from "@/constants/brand";
import { PressedOpacity, layout } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { hapticLightImpact } from "@/lib/haptics";

type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: boolean;
  padding?: "compact" | "default";
  onPress?: () => void;
  accessibilityLabel?: string;
};

/**
 * Card de superfície sólida.
 * Shadow fica no wrapper (overflow visible); o miolo usa overflow hidden
 * para cantos limpos — sem gradiente semi-transparente (bug “caixa na caixa”).
 */
export function GlassCard({
  children,
  style,
  glow = false,
  padding = "default",
  onPress,
  accessibilityLabel,
}: GlassCardProps) {
  const theme = useTheme();
  const paddingValue = padding === "compact" ? layout.space.md : layout.space.lg;

  const shadowStyle = useMemo<ViewStyle>(
    () => ({
      borderRadius: layout.radius.lg,
      ...theme.shadow.card,
    }),
    [theme],
  );

  const surfaceStyle = useMemo<ViewStyle>(
    () => ({
      borderRadius: layout.radius.lg,
      borderWidth: glow ? 1 : StyleSheet.hairlineWidth,
      borderColor: glow ? brandRgb(theme.accent, 0.4) : theme.border,
      backgroundColor: theme.surfaceCard,
      overflow: "hidden",
    }),
    [glow, theme],
  );

  const content = (
    <View style={[shadowStyle, styles.wrapper]}>
      <View style={[surfaceStyle, styles.surface]}>
        <View style={[styles.body, { padding: paddingValue, gap: layout.space.md }, style]}>
          {children}
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => {
          void hapticLightImpact();
          onPress();
        }}
        style={({ pressed }) => [
          styles.wrapper,
          pressed && { opacity: PressedOpacity, transform: [{ scale: 0.98 }] },
        ]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignSelf: "stretch",
  },
  surface: {
    width: "100%",
  },
  body: {
    width: "100%",
  },
});
