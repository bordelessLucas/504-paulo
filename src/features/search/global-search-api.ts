import { supabase } from '@/lib/supabase';

export type GlobalPersonResult = {
  id: string;
  nome: string;
  funcao: string | null;
  departamento: string | null;
  codigoInterno: string | null;
  status: string | null;
};

function sanitizeSearchTerm(value: string): string {
  return value.trim().replace(/[,%()]/g, ' ');
}

export async function searchPeople(value: string): Promise<GlobalPersonResult[]> {
  const term = sanitizeSearchTerm(value);
  if (term.length < 2) {
    return [];
  }

  const pattern = `%${term}%`;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, funcao, departamento, codigo_interno, status')
    .or(
      `nome.ilike.${pattern},funcao.ilike.${pattern},departamento.ilike.${pattern},codigo_interno.ilike.${pattern}`,
    )
    .order('nome', { ascending: true })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((person) => ({
    id: person.id,
    nome: person.nome,
    funcao: person.funcao,
    departamento: person.departamento,
    codigoInterno: person.codigo_interno,
    status: person.status,
  }));
}
