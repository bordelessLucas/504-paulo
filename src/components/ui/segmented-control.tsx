import { SegmentedButtons } from 'react-native-paper';
import { StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <SegmentedButtons
      style={styles.control}
      density="medium"
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onChange(nextValue as T);
        }
      }}
      buttons={options.map((option) => ({
        value: option.value,
        label: option.label,
        style: styles.segment,
      }))}
    />
  );
}

const styles = StyleSheet.create({
  control: {
    gap: Spacing.two,
  },
  segment: {
    minHeight: 40,
  },
});
