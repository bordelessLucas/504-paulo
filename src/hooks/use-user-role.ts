import { useAuth } from '@/features/auth/auth-context';
import { isGestaoRole, type UserRole } from '@/types/supabase';

type UseUserRoleResult = {
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isGestao: boolean;
  refetch: () => Promise<void>;
};

export function useUserRole(): UseUserRoleResult {
  const { user, isLoading, refetchProfile } = useAuth();

  return {
    role: user?.role ?? null,
    isLoading,
    error: null,
    isAuthenticated: user != null,
    isGestao: isGestaoRole(user?.role),
    refetch: refetchProfile,
  };
}
