import { StyleSheet, View, type ViewProps } from 'react-native';
import { Text } from 'react-native-paper';

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
        <Text variant="headlineMedium" style={styles.title}>
          {title}
        </Text>
        {description ? (
          <Text variant="bodyLarge" style={styles.description}>
            {description}
          </Text>
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
  title: {
    fontFamily: 'Korataki_Regular',
  },
  description: {
    opacity: 0.78,
  },
});
