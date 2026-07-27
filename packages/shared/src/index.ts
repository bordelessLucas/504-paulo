/**
 * Pacote compartilhado Vertek Avalia.
 * Reexporta tokens e tipos estáveis para o app web.
 * As APIs de domínio continuam em `src/features` (mobile) e são
 * consumidas pelo Vite via alias `@/`.
 */
export { brand, brandRgb, BrandColors } from '../../../src/constants/brand';
export type { BrandColor } from '../../../src/constants/brand';
export type { UserRole, UserRoleEnum } from '../../../src/types/supabase';
export type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  AuthError,
} from '../../../src/types/auth';
export {
  ROLE_LABELS,
  getMenuSectionsForRole,
  getPrimaryTabForRole,
  getTabsForRole,
  canAccessTab,
} from '../../../src/navigation/role-menus';
export { SUBSCRIPTION_PLANS, getPlanById } from '../../../src/features/subscription/plans';
