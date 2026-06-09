import type { Session } from '@supabase/supabase-js';

import type { UserRole } from '@/types/supabase';

const USER_ROLES: readonly UserRole[] = [
  'colaborador',
  'supervisor',
  'gestor',
  'gerente',
  'rh',
  'ceo',
  'admin',
] as const;

const USER_ROLE_SET = new Set<UserRole>(USER_ROLES);

export function isValidUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLE_SET.has(value as UserRole);
}

export function normalizeUserRole(value: unknown): UserRole | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === 'administrador') {
    return 'admin';
  }

  return isValidUserRole(normalized) ? normalized : undefined;
}

export function resolveUserRole(
  session: Session,
  profileRole?: unknown,
): UserRole | undefined {
  const roleFromProfile = normalizeUserRole(profileRole);
  if (roleFromProfile) {
    return roleFromProfile;
  }

  const candidates = [session.user.app_metadata?.role, session.user.user_metadata?.role];

  for (const candidate of candidates) {
    const role = normalizeUserRole(candidate);
    if (role) {
      return role;
    }
  }

  return undefined;
}
