import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { applyMask, MASK_MAX_LENGTH, type InputMask } from '@/lib/input-masks';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  variant?: 'default' | 'soft';
  mask?: InputMask;
};

const MASK_KEYBOARD: Partial<Record<InputMask, TextInputProps['keyboardType']>> = {
  date: 'number-pad',
  isoDate: 'number-pad',
  time: 'number-pad',
  ddd: 'number-pad',
  phone: 'phone-pad',
  phoneFull: 'phone-pad',
  cnpj: 'number-pad',
  currency: 'number-pad',
  year: 'number-pad',
};

export function Input({
  label,
  error,
  variant = 'default',
  mask,
  style,
  onChangeText,
  keyboardType,
  maxLength,
  autoCapitalize,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const isSoft = variant === 'soft';

  const handleChangeText = (value: string) => {
    onChangeText?.(mask ? applyMask(mask, value) : value);
  };

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
        autoCapitalize={mask === 'uf' ? 'characters' : autoCapitalize}
        keyboardType={keyboardType ?? (mask ? MASK_KEYBOARD[mask] : undefined)}
        maxLength={maxLength ?? (mask ? MASK_MAX_LENGTH[mask] : undefined)}
        onChangeText={handleChangeText}
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
