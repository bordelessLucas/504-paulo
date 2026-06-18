import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  variant?: 'default' | 'soft';
};

export function Input({ label, error, variant = 'default', style, ...rest }: InputProps) {
  const theme = useTheme();
  const isSoft = variant === 'soft';

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.placeholder}
        style={[
          styles.input,
          isSoft ? styles.inputSoft : styles.inputDefault,
          {
            color: theme.text,
            backgroundColor: isSoft ? theme.backgroundElement : theme.inputBackground,
            borderColor: error ? theme.danger : isSoft ? 'transparent' : theme.border,
          },
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one + 2,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    minHeight: 44,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 20,
  },
  inputDefault: {
    borderWidth: 1,
  },
  inputSoft: {
    borderWidth: 0,
    paddingVertical: Spacing.three,
  },
  error: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
  },
});
