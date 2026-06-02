import { useAuth } from '@/features/auth/auth-context';
import type { UserRole } from '@/types/supabase';
import {
  isAdminDashboardRole,
  isGerenteRole,
  isSupervisorGestorRole,
} from '@/types/supabase';

type UseAuthRoleResult = {
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isColaborador: boolean;
  isSupervisorGestor: boolean;
  isGerente: boolean;
  isAdminDashboard: boolean;
  refetch: () => Promise<void>;
};

export function useAuthRole(): UseAuthRoleResult {
  const { user, isLoading, refetchProfile } = useAuth();
  const role = user?.role ?? null;

  return {
    role,
    isLoading,
    isAuthenticated: user != null,
    isColaborador: role === 'colaborador',
    isSupervisorGestor: isSupervisorGestorRole(role),
    isGerente: isGerenteRole(role),
    isAdminDashboard: isAdminDashboardRole(role),
    refetch: refetchProfile,
  };
}
