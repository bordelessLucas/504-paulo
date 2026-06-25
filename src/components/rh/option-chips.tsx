import { StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';

import { Spacing } from '@/constants/theme';

type OptionChipsProps<T extends string> = {
  options: readonly T[];
  labels?: Partial<Record<T, string>>;
  value?: T;
  onChange: (value: T) => void;
};

export function OptionChips<T extends string>({
  options,
  labels,
  value,
  onChange,
}: OptionChipsProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isSelected = value === option;

        return (
          <Chip
            key={option}
            mode={isSelected ? 'flat' : 'outlined'}
            selected={isSelected}
            showSelectedOverlay
            onPress={() => onChange(option)}
            style={styles.chip}>
            {labels?.[option] ?? option}
          </Chip>
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
  chip: {
    borderRadius: 8,
  },
});
