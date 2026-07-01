import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';
import { RoleDrawerNavigator } from '@/navigation/RoleDrawerNavigator';
import { RoleTabNavigator } from '@/navigation/role-tab-navigator';
import type { UserRole } from '@/types/supabase';

type RoleHybridNavigatorProps = {
  role: UserRole;
};

/**
 * Navegação híbrida por papel:
 * - Mobile: bottom tabs (campo / uma mão)
 * - Desktop: drawer permanente (Notion-style)
 */
export function RoleHybridNavigator({ role }: RoleHybridNavigatorProps) {
  const isDesktopLayout = useIsDesktopLayout();

  if (isDesktopLayout) {
    return <RoleDrawerNavigator role={role} />;
  }

  return <RoleTabNavigator role={role} />;
}
