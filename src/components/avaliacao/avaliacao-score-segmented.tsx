import { StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

import { layout } from '@/constants/theme';
import { ALLOWED_SCORES } from '@/features/avaliacao/validation';

type AvaliacaoScoreSegmentedProps = {
  value: number | null;
  onChange: (score: number) => void;
  disabled?: boolean;
};

const SCORE_LABELS: Record<number, string> = {
  0: '0',
  1: '1',
  2: '2',
  3: '3',
};

/**
 * Seletor de nota 0–3 com alvos grandes para uso em campo (polegar).
 */
export function AvaliacaoScoreSegmented({ value, onChange, disabled = false }: AvaliacaoScoreSegmentedProps) {
  return (
    <SegmentedButtons
      density="regular"
      style={styles.control}
      value={value !== null ? String(value) : ''}
      onValueChange={(nextValue) => {
        if (nextValue && !disabled) {
          onChange(Number(nextValue));
        }
      }}
      buttons={ALLOWED_SCORES.map((score) => ({
        value: String(score),
        label: SCORE_LABELS[score],
        style: styles.segment,
        disabled,
        accessibilityLabel: `Nota ${score}`,
      }))}
    />
  );
}

const styles = StyleSheet.create({
  control: {
    width: '100%',
  },
  segment: {
    minHeight: layout.touchMin,
    flex: 1,
  },
});
