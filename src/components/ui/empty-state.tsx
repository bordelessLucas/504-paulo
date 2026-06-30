import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type EmptyStateProps = {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = 'inbox-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: theme.accentMuted,
            borderColor: theme.border,
          },
        ]}>
        <MaterialCommunityIcons name={icon} size={32} color={theme.accent} />
      </View>
      {title ? <ThemedText type="cardTitle">{title}</ThemedText> : null}
      <ThemedText themeColor="textSecondary" style={styles.message}>
        {message}
      </ThemedText>
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="secondary" onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: layout.space.md,
    paddingVertical: layout.space.xxl,
    paddingHorizontal: layout.space.xl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: layout.radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: layout.space.sm,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
});
