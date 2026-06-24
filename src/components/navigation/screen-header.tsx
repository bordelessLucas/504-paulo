import { StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type ScreenHeaderProps = ViewProps & {
  title: string;
  description?: string;
  accessory?: React.ReactNode;
};

export function ScreenHeader({ title, description, accessory, style, ...rest }: ScreenHeaderProps) {
  return (
    <View style={[styles.header, style]} {...rest}>
      <View style={styles.textBlock}>
        <ThemedText type="heading">{title}</ThemedText>
        {description ? (
          <ThemedText themeColor="textSecondary" style={styles.description}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      {accessory}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  textBlock: {
    gap: Spacing.two,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
});
