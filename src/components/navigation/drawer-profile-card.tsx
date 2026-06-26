import { StyleSheet, View } from 'react-native';
import { Text as PaperText } from 'react-native-paper';

import { brandRgb } from '@/constants/brand';
import { Fonts, layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type DrawerProfileCardProps = {
  userName: string;
  roleLabel: string;
};

export function DrawerProfileCard({ userName, roleLabel }: DrawerProfileCardProps) {
  const theme = useTheme();
  const firstName = userName.split(' ')[0] ?? userName;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: brandRgb(theme.primary, 0.72),
          borderColor: brandRgb(theme.accent, 0.22),
        },
      ]}>
      <PaperText variant="titleMedium" style={[styles.userName, { color: theme.text }]}>
        {firstName}
      </PaperText>
      <PaperText variant="bodySmall" style={{ color: theme.textMuted, fontFamily: Fonts.sansMedium }}>
        {roleLabel}
      </PaperText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: layout.space.md,
    marginBottom: layout.space.sm,
    paddingHorizontal: layout.space.md,
    paddingVertical: layout.space.sm,
    borderRadius: layout.radius.md,
    borderWidth: 1,
    gap: 2,
  },
  userName: {
    fontWeight: '700',
  },
});
