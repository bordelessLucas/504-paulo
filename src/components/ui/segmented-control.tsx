import { SegmentedButtons } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

import { layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
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
          style: [
            styles.segment,
            {
              backgroundColor:
                value === option.value ? theme.accentMuted : theme.surfaceElevated,
              borderColor: theme.border,
            },
          ],
        }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignSelf: 'stretch',
  },
  control: {
    width: '100%',
  },
  segment: {
    minHeight: 40,
    flex: 1,
  },
});
