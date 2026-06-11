import type { UserRole } from '@/types/supabase';

/** Papéis que podem receber acesso via painel administrativo (exceto CEO). */
export const PLATFORM_ACCESS_ROLES: readonly UserRole[] = [
  'colaborador',
  'supervisor',
  'gestor',
  'gerente',
  'rh',
  'admin',
] as const;

const RH_ASSIGNABLE_ROLES: readonly UserRole[] = [
  'colaborador',
  'supervisor',
  'gestor',
  'gerente',
] as const;

export function getAssignableRolesForCaller(callerRole: UserRole | null | undefined): UserRole[] {
  if (callerRole === 'ceo' || callerRole === 'admin') {
    return [...PLATFORM_ACCESS_ROLES];
  }

  if (callerRole === 'rh') {
    return [...RH_ASSIGNABLE_ROLES];
  }

  return [];
}

export function canCallerCreatePlatformAccess(callerRole: UserRole | null | undefined): boolean {
  return callerRole === 'ceo' || callerRole === 'admin';
}

export function isRoleAssignableByCaller(
  callerRole: UserRole | null | undefined,
  targetRole: UserRole,
): boolean {
  return getAssignableRolesForCaller(callerRole).includes(targetRole);
}
