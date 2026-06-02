import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ActionButtonVariant = 'primary' | 'secondary' | 'danger';

type ActionButtonProps = PressableProps & {
  label: string;
  variant?: ActionButtonVariant;
  isLoading?: boolean;
};

export function ActionButton({
  label,
  variant = 'primary',
  isLoading = false,
  disabled,
  style,
  ...rest
}: ActionButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || isLoading;

  const containerStyle =
    variant === 'primary'
      ? { backgroundColor: theme.text, borderColor: theme.text }
      : variant === 'danger'
        ? { backgroundColor: 'transparent', borderColor: theme.border }
        : { backgroundColor: theme.background, borderColor: theme.border };

  const labelColor =
    variant === 'primary' ? theme.background : variant === 'danger' ? theme.danger : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed, hovered }) => [
        styles.base,
        containerStyle,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        typeof style === 'function' ? style({ pressed, hovered }) : style,
      ]}
      {...rest}>
      {isLoading ? (
        <ActivityIndicator color={labelColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.5,
  },
});
