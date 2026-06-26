import { Pressable, StyleSheet, View } from "react-native";

import { Fonts, layout } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";

type SectionTitleProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionTitle({ title, actionLabel, onActionPress }: SectionTitleProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <ThemedText
        style={[
          styles.title,
          {
            color: theme.accent,
            fontFamily: Fonts.sansBold,
          },
        ]}>
        {title}
      </ThemedText>
      {actionLabel && onActionPress ? (
        <Pressable accessibilityRole="button" onPress={onActionPress} hitSlop={8}>
          <ThemedText type="link" themeColor="accent" style={styles.action}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: layout.space.sm,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.3,
    fontWeight: "800",
  },
  action: {
    fontSize: 13,
  },
});
