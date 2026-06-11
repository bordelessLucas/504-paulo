import type { UserRole } from '@/types/supabase';

/** RH e Admin validam requisitos; não decidem aprovação final. */
export function isRhValidationRole(role?: UserRole | null): boolean {
  return role === 'rh' || role === 'admin';
}

/** Somente o CEO aprova ou recusa definitivamente. */
export function isCeoApprovalRole(role?: UserRole | null): boolean {
  return role === 'ceo';
}

export function canAccessValidacoesTab(role?: UserRole | null): boolean {
  return isRhValidationRole(role) || isCeoApprovalRole(role);
}
