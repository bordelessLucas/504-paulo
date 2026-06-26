import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { layout } from '@/constants/theme';

type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
  return <ThemedText themeColor="textMuted" style={styles.text}>{message}</ThemedText>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});
