import { useAuthRole } from '@/hooks/use-auth-role';
import { isGestaoRole } from '@/types/supabase';

type UseUserRoleResult = ReturnType<typeof useAuthRole> & {
  error: string | null;
  isGestao: boolean;
};

/** @deprecated Prefira useAuthRole */
export function useUserRole(): UseUserRoleResult {
  const authRole = useAuthRole();

  return {
    ...authRole,
    error: null,
    isGestao: isGestaoRole(authRole.role),
  };
}

export { useAuthRole } from '@/hooks/use-auth-role';
