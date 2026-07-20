import { StyleSheet, Text, View } from 'react-native';

import { brand, brandRgb } from '@/constants/brand';
import { Fonts, layout } from '@/constants/theme';

type DrawerProfileCardProps = {
  userName: string;
  roleLabel: string;
};

export function DrawerProfileCard({ userName, roleLabel }: DrawerProfileCardProps) {
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
          backgroundColor: brand.navy,
          borderColor: brandRgb(brand.green, 0.35),
        },
      ]}>
      <View style={[styles.avatar, { backgroundColor: brandRgb(brand.green, 0.22) }]}>
        <Text style={[styles.avatarText, { color: brand.greenSoft, fontFamily: Fonts.sansBold }]}>
          {initials}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.userName, { color: brand.cream, fontFamily: Fonts.sansSemiBold }]}>
          {firstName}
        </Text>
        <Text
          style={[
            styles.roleLabel,
            { color: brandRgb(brand.cream, 0.72), fontFamily: Fonts.sansMedium },
          ]}>
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
