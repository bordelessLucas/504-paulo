import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TabIconName } from '@/navigation/types';

type AdminFeatureCardProps = {
  title: string;
  description: string;
  icon: TabIconName;
  onPress: () => void;
};

export function AdminFeatureCard({ title, description, icon, onPress }: AdminFeatureCardProps) {
  const theme = useTheme();

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: theme.backgroundSelected }]}>
        <Ionicons color={theme.text} name={icon} size={22} />
      </View>

      <View style={styles.content}>
        <ThemedText type="cardTitle">{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {description}
        </ThemedText>
      </View>

      <Ionicons color={theme.textSecondary} name="chevron-forward" size={18} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 88,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: Spacing.one,
  },
});
