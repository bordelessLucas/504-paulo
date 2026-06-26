import { StyleSheet, Text, View } from "react-native";

import { Fonts, layout } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import type { SemanticTone } from "@/constants/theme";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: SemanticTone;
};

export function StatCard({ label, value, hint, tone }: StatCardProps) {
  const theme = useTheme();
  const palette = tone ? theme.semantic[tone === "accent" ? "accent" : tone] : null;

  return (
    <View
      style={[
        styles.card,
        theme.shadow.card,
        {
          backgroundColor: palette?.bg ?? theme.backgroundElement,
          borderColor: palette?.border ?? theme.border,
        },
      ]}>
      <Text style={[styles.value, { color: theme.text, fontFamily: Fonts.sansBold }]}>
        {value}
      </Text>
      <ThemedText
        style={[
          styles.label,
          palette ? { color: palette.text } : undefined,
        ]}
        themeColor={palette ? undefined : "textSecondary"}>
        {label}
      </ThemedText>
      {hint ? (
        <ThemedText themeColor="textMuted" style={styles.hint}>
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    borderRadius: layout.radius.md,
    borderWidth: 1,
    padding: layout.space.sm,
    paddingVertical: layout.space.md,
    gap: 2,
  },
  value: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.3,
    fontWeight: "800",
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.sansMedium,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
  },
});
