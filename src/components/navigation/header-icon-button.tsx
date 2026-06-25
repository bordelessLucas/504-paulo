import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Badge } from 'react-native-paper';

import { PressedOpacity, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type HeaderIconButtonProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accessibilityLabel: string;
  onPress: () => void;
  badge?: number;
};

export function HeaderIconButton({ icon, accessibilityLabel, onPress, badge }: HeaderIconButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
        },
        pressed && styles.pressed,
      ]}>
      <MaterialCommunityIcons color={theme.text} name={icon} size={22} />
      {badge && badge > 0 ? (
        <Badge style={styles.badge} size={18}>
          {badge > 99 ? '99+' : badge}
        </Badge>
      ) : null}
    </Pressable>
  );
}

export function StackHeaderActions({
  onOpenMenu,
  onOpenNotifications,
  notificationCount = 0,
}: {
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  notificationCount?: number;
}) {
  return (
    <View style={styles.row}>
      <HeaderIconButton
        accessibilityLabel="Abrir menu de navegação"
        icon="menu"
        onPress={onOpenMenu}
      />
      <HeaderIconButton
        accessibilityLabel={
          notificationCount > 0
            ? `Abrir alertas, ${notificationCount} não lidos`
            : 'Abrir alertas'
        }
        badge={notificationCount}
        icon="bell-outline"
        onPress={onOpenNotifications}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  pressed: {
    opacity: PressedOpacity,
  },
});
