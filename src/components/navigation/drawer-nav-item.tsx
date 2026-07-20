import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { brandRgb } from '@/constants/brand';
import { Fonts, layout, PressedOpacity } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TabIconName } from '@/navigation/types';

type DrawerNavItemProps = {
  label: string;
  icon: TabIconName;
  isActive: boolean;
  badgeCount?: number;
  onPress: () => void;
};

export function DrawerNavItem({
  label,
  icon,
  isActive,
  badgeCount = 0,
  onPress,
}: DrawerNavItemProps) {
  const theme = useTheme();
  const showBadge = badgeCount > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isActive && {
          backgroundColor: brandRgb(theme.accent, 0.14),
        },
        pressed && { opacity: PressedOpacity },
      ]}>
      {isActive ? (
        <View style={[styles.activeBar, { backgroundColor: theme.accent }]} />
      ) : null}

      <View
        style={[
          styles.iconWrap,
          isActive && {
            backgroundColor: brandRgb(theme.accent, 0.18),
          },
        ]}>
        <Ionicons
          color={isActive ? theme.accent : theme.textSecondary}
          name={icon}
          size={20}
        />
      </View>

      <Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            color: isActive ? theme.accent : theme.text,
            fontFamily: isActive ? Fonts.sansSemiBold : Fonts.sansMedium,
          },
        ]}>
        {label}
      </Text>

      {showBadge ? (
        <View style={[styles.badge, { backgroundColor: theme.danger }]}>
          <Text style={[styles.badgeText, { color: theme.textOnPrimary }]}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    marginHorizontal: layout.space.sm,
    marginBottom: 2,
    paddingRight: layout.space.md,
    paddingLeft: layout.space.xs,
    borderRadius: layout.radius.md,
    gap: layout.space.sm,
    overflow: 'hidden',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: layout.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: layout.space.sm,
  },
  label: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    lineHeight: 14,
  },
});
