import { StyleSheet, Text, View } from 'react-native';

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
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: brandRgb(theme.primary, 0.55),
          borderColor: brandRgb(theme.accent, 0.2),
        },
      ]}>
      <View style={[styles.avatar, { backgroundColor: brandRgb(theme.accent, 0.2) }]}>
        <Text style={[styles.avatarText, { color: theme.accent, fontFamily: Fonts.sansBold }]}>
          {initials}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.userName, { color: theme.text, fontFamily: Fonts.sansSemiBold }]}>
          {firstName}
        </Text>
        <Text style={[styles.roleLabel, { color: theme.textMuted, fontFamily: Fonts.sansMedium }]}>
          {roleLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.md,
    marginHorizontal: layout.space.md,
    marginBottom: layout.space.md,
    paddingHorizontal: layout.space.md,
    paddingVertical: layout.space.md,
    borderRadius: layout.radius.lg,
    borderWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: layout.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    lineHeight: 18,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 16,
    lineHeight: 20,
  },
  roleLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
});
