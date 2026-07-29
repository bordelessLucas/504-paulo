import { supabase } from '@/lib/supabase';

export type CargoRow = {
  id: string;
  nome: string;
  codigoCbo: string | null;
  departamento: string | null;
  descricao: string | null;
  ativo: boolean;
  organizacaoId: string | null;
};

export type CargoInput = {
  nome: string;
  codigoCbo?: string | null;
  departamento?: string | null;
  descricao?: string | null;
  ativo?: boolean;
};

function mapCargo(row: {
  id: string;
  nome: string;
  codigo_cbo: string | null;
  departamento: string | null;
  descricao: string | null;
  ativo: boolean;
  organizacao_id: string | null;
}): CargoRow {
  return {
    id: row.id,
    nome: row.nome,
    codigoCbo: row.codigo_cbo,
    departamento: row.departamento,
    descricao: row.descricao,
    ativo: row.ativo,
    organizacaoId: row.organizacao_id,
  };
}

export async function fetchCargos(options?: { onlyAtivos?: boolean }): Promise<CargoRow[]> {
  let query = supabase
    .from('cargos')
    .select('id, nome, codigo_cbo, departamento, descricao, ativo, organizacao_id')
    .order('nome', { ascending: true });

  if (options?.onlyAtivos) {
    query = query.eq('ativo', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapCargo);
}

export async function createCargo(input: CargoInput): Promise<CargoRow> {
  const nome = input.nome.trim();
  if (!nome) {
    throw new Error('Informe o nome do cargo/função.');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organizacao_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '')
    .maybeSingle();

  const { data, error } = await supabase
    .from('cargos')
    .insert({
      nome,
      codigo_cbo: input.codigoCbo?.trim() || null,
      departamento: input.departamento?.trim() || null,
      descricao: input.descricao?.trim() || null,
      ativo: input.ativo ?? true,
      organizacao_id: profile?.organizacao_id ?? null,
    })
    .select('id, nome, codigo_cbo, departamento, descricao, ativo, organizacao_id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapCargo(data);
}

export async function updateCargo(id: string, input: CargoInput): Promise<CargoRow> {
  const nome = input.nome.trim();
  if (!nome) {
    throw new Error('Informe o nome do cargo/função.');
  }

  const { data, error } = await supabase
    .from('cargos')
    .update({
      nome,
      codigo_cbo: input.codigoCbo?.trim() || null,
      departamento: input.departamento?.trim() || null,
      descricao: input.descricao?.trim() || null,
      ativo: input.ativo ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, nome, codigo_cbo, departamento, descricao, ativo, organizacao_id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapCargo(data);
}

export async function setCargoAtivo(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase
    .from('cargos')
    .update({ ativo, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
