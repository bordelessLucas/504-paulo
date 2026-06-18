import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/supabase';

export type LiderOption = {
  id: string;
  nome: string;
  role: UserRole;
  departamento: string | null;
};

const LIDER_ROLES: UserRole[] = ['supervisor', 'gestor', 'gerente'];

export async function fetchLideresOptions(): Promise<LiderOption[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, role, departamento')
    .in('role', LIDER_ROLES)
    .eq('status', 'ativo')
    .order('nome');

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((profile) => ({
    id: profile.id,
    nome: profile.nome,
    role: profile.role as UserRole,
    departamento: profile.departamento,
  }));
}
