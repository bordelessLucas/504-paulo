import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScorePickerProps = {
  value: number | null;
  onChange: (score: number) => void;
};

const SCORES = [1, 2, 3, 4, 5] as const;

export function ScorePicker({ value, onChange }: ScorePickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {SCORES.map((score) => {
        const isSelected = value === score;

        return (
          <Pressable
            key={score}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`Nota ${score}`}
            onPress={() => onChange(score)}
            style={[
              styles.block,
              {
                backgroundColor: isSelected ? theme.text : theme.backgroundElement,
                borderColor: isSelected ? theme.text : theme.border,
              },
            ]}>
            <ThemedText
              style={[
                styles.scoreLabel,
                { color: isSelected ? theme.background : theme.text },
              ]}>
              {score}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  block: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreLabel: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 16,
    lineHeight: 20,
  },
});
