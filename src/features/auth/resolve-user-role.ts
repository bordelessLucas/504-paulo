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
  _session: Session,
  profileRole?: unknown,
): UserRole | undefined {
  // Fonte de verdade: profiles.role (RLS/trigger). Metadata do JWT não eleva privilégio.
  return normalizeUserRole(profileRole);
}
