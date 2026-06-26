import { StyleSheet, Text, View } from "react-native";

import { Fonts, type SemanticTone } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type StatusBadgeProps = {
  label: string;
  tone?: SemanticTone;
  size?: "sm" | "md";
};

export function StatusBadge({ label, tone = "neutral", size = "md" }: StatusBadgeProps) {
  const theme = useTheme();
  const palette = theme.semantic[tone === "accent" ? "accent" : tone];

  return (
    <View
      style={[
        styles.badge,
        size === "sm" && styles.badgeSm,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
      ]}>
      <Text
        style={[
          styles.label,
          size === "sm" && styles.labelSm,
          { color: palette.text, fontFamily: Fonts.sansSemiBold },
        ]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.55,
  },
  labelSm: {
    fontSize: 10,
    lineHeight: 12,
  },
});
