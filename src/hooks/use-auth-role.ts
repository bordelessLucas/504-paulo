import { useAuth } from '@/features/auth/auth-context';
import type { UserRole } from '@/types/supabase';
import {
  isAdminDashboardRole,
  isGerencialDashboardRole,
  isGerenteRole,
  isRhRole,
  isSupervisorGestorRole,
} from '@/types/supabase';

type UseAuthRoleResult = {
  role: UserRole | null;
  isLoading: boolean;
  isProfileReady: boolean;
  isAuthenticated: boolean;
  isColaborador: boolean;
  isSupervisorGestor: boolean;
  isGerente: boolean;
  isRh: boolean;
  isAdminDashboard: boolean;
  isGerencialDashboard: boolean;
  refetch: () => Promise<void>;
};

export function useAuthRole(): UseAuthRoleResult {
  const { user, isLoading, isProfileReady, refetchProfile } = useAuth();
  const role = user?.role ?? null;

  return {
    role,
    isLoading: isLoading || (user != null && !isProfileReady),
    isProfileReady,
    isAuthenticated: user != null,
    isColaborador: role === 'colaborador',
    isSupervisorGestor: isSupervisorGestorRole(role),
    isGerente: isGerenteRole(role),
    isRh: isRhRole(role),
    isAdminDashboard: isAdminDashboardRole(role),
    isGerencialDashboard: isGerencialDashboardRole(role),
    refetch: refetchProfile,
  };
}
