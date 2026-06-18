import { supabase } from '@/lib/supabase';
import { isAdminDashboardRole, type UserRole } from '@/types/supabase';

export type ColaboradorScope = {
  departamento: string | null;
  liderId: string | null;
  restrictToDepartamento: boolean;
  restrictToLideranca: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProfilesQuery = any;

export function shouldScopeColaboradoresByDepartamento(role: UserRole | null | undefined): boolean {
  return role === 'supervisor' || role === 'gestor' || role === 'gerente';
}

export function shouldListAllColaboradores(role: UserRole | null | undefined): boolean {
  return isAdminDashboardRole(role);
}

export async function resolveColaboradorScope(
  avaliadorId: string,
  role: UserRole | null | undefined,
): Promise<ColaboradorScope> {
  if (!shouldScopeColaboradoresByDepartamento(role)) {
    return {
      departamento: null,
      liderId: null,
      restrictToDepartamento: false,
      restrictToLideranca: false,
    };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('departamento')
    .eq('id', avaliadorId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const departamento = data.departamento?.trim() || null;

  return {
    departamento,
    liderId: avaliadorId,
    restrictToDepartamento: Boolean(departamento),
    restrictToLideranca: true,
  };
}

export function applyColaboradorScopeToQuery(
  query: ProfilesQuery,
  scope: ColaboradorScope,
): ProfilesQuery {
  if (scope.restrictToLideranca && scope.liderId) {
    if (scope.departamento) {
      return query.or(
        `lider_id.eq.${scope.liderId},and(lider_id.is.null,departamento.eq.${scope.departamento})`,
      );
    }

    return query.eq('lider_id', scope.liderId);
  }

  if (scope.restrictToDepartamento && scope.departamento) {
    return query.eq('departamento', scope.departamento);
  }

  return query;
}
