import { RoleDrawerNavigator } from '@/navigation/RoleDrawerNavigator';
import type { UserRole } from '@/types/supabase';

type RoleHybridNavigatorProps = {
  role: UserRole;
};

/**
 * Navegação por sidebar em todos os breakpoints:
 * - Mobile: drawer deslizante (hamburger na top bar)
 * - Desktop: sidebar permanente (estilo Notion)
 */
export function RoleHybridNavigator({ role }: RoleHybridNavigatorProps) {
  return <RoleDrawerNavigator role={role} />;
}
