import { StyleSheet, View } from 'react-native';

import { StructuredRow } from '@/components/ui/structured-row';
import { ThemedText } from '@/components/themed-text';
import {
  parseNotaLegenda,
  SCORE_TONES,
  type AllowedScore,
} from '@/constants/evaluation-colors';
import { Fonts, layout } from '@/constants/theme';
import { ALLOWED_SCORES } from '@/features/avaliacao/validation';
import { useTheme } from '@/hooks/use-theme';

function ScoreBadge({ score }: { score: AllowedScore }) {
  const theme = useTheme();
  const tone = SCORE_TONES[score];
  const palette = theme.semantic[tone];

  return (
    <View
      style={[
        styles.scoreBadge,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
      ]}>
      <ThemedText style={[styles.scoreNumber, { color: palette.text }]}>{score}</ThemedText>
    </View>
  );
}

export function ScoreScaleList() {
  return (
    <View style={styles.list}>
      {ALLOWED_SCORES.map((nota) => {
        const { label, description } = parseNotaLegenda(nota);

        return (
          <StructuredRow
            key={nota}
            leading={<ScoreBadge score={nota} />}
            title={label}
            description={description}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: layout.space.sm,
  },
  scoreBadge: {
    width: 36,
    height: 36,
    borderRadius: layout.radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    lineHeight: 20,
  },
});
