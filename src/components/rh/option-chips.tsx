import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type OptionChipsProps<T extends string> = {
  options: readonly T[];
  labels?: Record<T, string>;
  value?: T;
  onChange: (value: T) => void;
};

export function OptionChips<T extends string>({
  options,
  labels,
  value,
  onChange,
}: OptionChipsProps<T>) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isSelected = value === option;

        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(option)}
            style={[
              styles.chip,
              {
                borderColor: isSelected ? theme.text : theme.border,
                backgroundColor: isSelected ? theme.backgroundSelected : theme.background,
              },
            ]}>
            <ThemedText
              style={[
                styles.label,
                isSelected && { fontFamily: Fonts.sansSemiBold },
              ]}>
              {labels?.[option] ?? option}
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
  chip: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
  },
});
