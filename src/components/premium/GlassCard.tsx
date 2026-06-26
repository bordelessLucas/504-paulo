import { LinearGradient } from "expo-linear-gradient";
import { useMemo, type ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { brandRgb } from "@/constants/brand";
import { Fonts, PressedOpacity, layout } from "@/constants/theme";
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

  const cardStyle = useMemo(
    () => ({
      borderRadius: layout.radius.lg,
      borderWidth: 1,
      borderColor: theme.isDark ? brandRgb(theme.colors.accent, 0.12) : theme.border,
      overflow: "hidden" as const,
      ...(glow ? theme.shadow.glow : theme.shadow.card),
    }),
    [glow, theme],
  );

  const gradientColors = (theme.isDark
    ? [brandRgb(theme.colors.backgroundElement, 0.95), brandRgb(theme.colors.backgroundSelected, 0.85)]
    : [theme.colors.backgroundElement, brandRgb(theme.colors.background, 0.6)]) as [string, string];

  const content = (
    <View style={[cardStyle, style]}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />
      <View style={{ padding: paddingValue, gap: layout.space.md }}>{children}</View>
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
        style={({ pressed }) => [pressed && { opacity: PressedOpacity, transform: [{ scale: 0.98 }] }]}>
        {content}
      </Pressable>
    );
  }

  return content;
}
