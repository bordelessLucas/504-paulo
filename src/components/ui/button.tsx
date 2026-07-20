import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { ActivityIndicator, Text } from "react-native";

import { Fonts, DisabledOpacity, PressedOpacity, layout } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { hapticLightImpact } from "@/lib/haptics";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const sizeStyles: Record<ButtonSize, { minHeight: number; fontSize: number; paddingHorizontal: number }> = {
  sm: { minHeight: 40, fontSize: 13, paddingHorizontal: layout.space.md },
  md: { minHeight: layout.touchMin, fontSize: 15, paddingHorizontal: layout.space.lg },
  lg: { minHeight: 56, fontSize: 16, paddingHorizontal: layout.space.xl },
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  onPress,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || isLoading;
  const metrics = sizeStyles[size];

  const backgroundColor =
    variant === "primary"
      ? theme.secondary
      : variant === "danger"
        ? theme.danger
        : variant === "secondary"
          ? theme.backgroundSelected
          : variant === "outline"
            ? theme.surfaceCard
            : "transparent";

  const textColor =
    variant === "primary" || variant === "danger"
      ? theme.textOnPrimary
      : variant === "ghost"
        ? theme.accent
        : variant === "outline"
          ? theme.text
          : theme.text;

  const borderWidth = variant === "outline" || variant === "secondary" ? 1 : 0;
  const borderColor = variant === "outline" ? theme.border : theme.border;
  const hasElevation = variant === "primary" || variant === "danger";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={() => {
        if (isDisabled) return;
        void hapticLightImpact();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.base,
        hasElevation ? theme.shadow.button : null,
        {
          minHeight: metrics.minHeight,
          paddingHorizontal: metrics.paddingHorizontal,
          backgroundColor,
          borderWidth,
          borderColor,
          borderRadius: layout.radius.md,
          opacity: isDisabled ? DisabledOpacity : pressed ? PressedOpacity : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
        style,
      ]}>
      {isLoading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text
          style={{
            color: textColor,
            fontFamily: Fonts.sansSemiBold,
            fontSize: metrics.fontSize,
            lineHeight: metrics.fontSize + 4,
            textAlign: "center",
          }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
});
