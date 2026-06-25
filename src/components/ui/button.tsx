import { Button as PaperButton, useTheme as usePaperTheme } from 'react-native-paper';
import type { StyleProp, ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'sm';

type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  onPress,
  style,
}: ButtonProps) {
  const paperTheme = usePaperTheme();
  const isDisabled = disabled || isLoading;
  const isSmall = size === 'sm';

  const mode =
    variant === 'primary' ? 'contained' : variant === 'ghost' ? 'text' : 'outlined';

  return (
    <PaperButton
      mode={mode}
      loading={isLoading}
      disabled={isDisabled}
      onPress={onPress}
      compact={isSmall}
      buttonColor={variant === 'primary' ? paperTheme.colors.primary : undefined}
      textColor={
        variant === 'danger'
          ? paperTheme.colors.error
          : variant === 'primary'
            ? paperTheme.colors.onPrimary
            : undefined
      }
      style={style}
      contentStyle={isSmall ? undefined : { minHeight: 44 }}>
      {label}
    </PaperButton>
  );
}
