import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";

import { Fonts, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
};

export function Button({
  label,
  variant = "primary",
  isLoading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || isLoading;

  const getContainerStyle = () => {
    if (variant === "primary") {
      return { backgroundColor: theme.accent };
    }

    if (variant === "secondary") {
      return {
        backgroundColor: theme.backgroundElement,
        borderColor: theme.border,
        borderWidth: 1,
      };
    }

    return { backgroundColor: "transparent" };
  };

  const getLabelColor = () => {
    if (variant === "primary") {
      return theme.background;
    }

    return theme.text;
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed, hovered }) => [
        styles.base,
        getContainerStyle(),
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        typeof style === "function" ? style({ pressed, hovered }) : style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={getLabelColor()} />
      ) : (
        <Text style={[styles.label, { color: getLabelColor() }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.55,
  },
});
