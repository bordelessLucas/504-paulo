import type { StyleProp, ViewStyle } from 'react-native';

import { Button } from '@/components/ui/button';

type ActionButtonVariant = 'primary' | 'secondary' | 'danger';

type ActionButtonProps = {
  label: string;
  variant?: ActionButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** @deprecated Use Button with size="sm" */
export function ActionButton({
  label,
  variant = 'primary',
  isLoading = false,
  disabled,
  onPress,
  style,
}: ActionButtonProps) {
  return (
    <Button
      label={label}
      variant={variant}
      size="sm"
      isLoading={isLoading}
      disabled={disabled}
      onPress={onPress}
      style={style}
    />
  );
}
