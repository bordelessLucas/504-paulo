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
        {
          backgroundColor: isActive
            ? brandRgb(theme.accent, 0.16)
            : brandRgb(theme.primary, 0.35),
          borderColor: isActive ? brandRgb(theme.accent, 0.45) : theme.border,
        },
        pressed && { opacity: PressedOpacity },
      ]}>
      {isActive ? (
        <View style={[styles.activeBar, { backgroundColor: theme.accent }]} />
      ) : (
        <View style={styles.activeBarPlaceholder} />
      )}

      <Ionicons
        color={isActive ? theme.accent : theme.textSecondary}
        name={icon}
        size={22}
        style={styles.icon}
      />

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
    minHeight: 48,
    marginHorizontal: layout.space.sm,
    marginBottom: layout.space.xs,
    paddingRight: layout.space.md,
    borderRadius: layout.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  activeBar: {
    width: 3,
    alignSelf: 'stretch',
    marginRight: layout.space.sm,
  },
  activeBarPlaceholder: {
    width: 3,
    marginRight: layout.space.sm,
    opacity: 0,
  },
  icon: {
    marginRight: layout.space.sm,
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
    marginLeft: layout.space.xs,
  },
  badgeText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    lineHeight: 14,
  },
});
