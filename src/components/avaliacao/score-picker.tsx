import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SCORE_TONES } from '@/constants/evaluation-colors';
import { ALLOWED_SCORES } from '@/features/avaliacao/validation';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScorePickerProps = {
  value: number | null;
  onChange: (score: number) => void;
};

export function ScorePicker({ value, onChange }: ScorePickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {ALLOWED_SCORES.map((score) => {
        const isSelected = value === score;
        const tone = SCORE_TONES[score];
        const palette = theme.semantic[tone];

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
                backgroundColor: isSelected ? palette.bg : theme.surfaceCard,
                borderColor: isSelected ? palette.border : theme.border,
              },
            ]}>
            <ThemedText
              style={[
                styles.scoreLabel,
                { color: isSelected ? palette.text : theme.text },
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
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  block: {
    minWidth: 44,
    flexGrow: 1,
    minHeight: 44,
    borderRadius: Radius.sm,
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
