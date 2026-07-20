import { supabase } from '@/lib/supabase';

export type Cliente = {
  id: string;
  codigo: string | null;
  cnpj: string | null;
  razaoSocial: string;
  nomeFantasia: string | null;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
};

export type ClienteUnidade = {
  id: string;
  clienteId: string;
  nome: string;
  aeroportoEmbarque: string | null;
  cidade: string | null;
  contatoBaseNome: string | null;
  contatoBaseTelefone: string | null;
  contatoBaseEmail: string | null;
  contatoBordoNome: string | null;
  contatoBordoTelefone: string | null;
  contatoBordoEmail: string | null;
};

export type ClienteComUnidades = Cliente & { unidades: ClienteUnidade[] };

export type CreateClienteInput = {
  codigo?: string;
  cnpj?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  unidadeNome?: string;
  aeroportoEmbarque?: string;
};

export async function fetchClientesComUnidades(): Promise<ClienteComUnidades[]> {
  const { data, error } = await supabase
    .from('clientes')
    .select(
      `
      id, codigo, cnpj, razao_social, nome_fantasia, endereco, cidade, uf,
      unidades:cliente_unidades(
        id, cliente_id, nome, aeroporto_embarque, cidade,
        contato_base_nome, contato_base_telefone, contato_base_email,
        contato_bordo_nome, contato_bordo_telefone, contato_bordo_email
      )
    `,
    )
    .order('nome_fantasia');

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    codigo: (row.codigo as string | null) ?? null,
    cnpj: (row.cnpj as string | null) ?? null,
    razaoSocial: row.razao_social as string,
    nomeFantasia: (row.nome_fantasia as string | null) ?? null,
    endereco: (row.endereco as string | null) ?? null,
    cidade: (row.cidade as string | null) ?? null,
    uf: (row.uf as string | null) ?? null,
    unidades: ((row.unidades as Array<Record<string, unknown>>) ?? []).map((u) => ({
      id: u.id as string,
      clienteId: u.cliente_id as string,
      nome: u.nome as string,
      aeroportoEmbarque: (u.aeroporto_embarque as string | null) ?? null,
      cidade: (u.cidade as string | null) ?? null,
      contatoBaseNome: (u.contato_base_nome as string | null) ?? null,
      contatoBaseTelefone: (u.contato_base_telefone as string | null) ?? null,
      contatoBaseEmail: (u.contato_base_email as string | null) ?? null,
      contatoBordoNome: (u.contato_bordo_nome as string | null) ?? null,
      contatoBordoTelefone: (u.contato_bordo_telefone as string | null) ?? null,
      contatoBordoEmail: (u.contato_bordo_email as string | null) ?? null,
    })),
  }));
}

export async function createCliente(input: CreateClienteInput): Promise<void> {
  const razao = input.razaoSocial.trim();
  if (razao.length < 2) {
    throw new Error('Informe a razão social.');
  }

  const { data: cliente, error } = await supabase
    .from('clientes')
    .insert({
      codigo: input.codigo?.trim() || null,
      cnpj: input.cnpj?.trim() || null,
      razao_social: razao,
      nome_fantasia: input.nomeFantasia?.trim() || null,
      endereco: input.endereco?.trim() || null,
      cidade: input.cidade?.trim() || null,
      uf: input.uf?.trim() || null,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const unidadeNome = input.unidadeNome?.trim();
  if (unidadeNome) {
    const { error: unidadeError } = await supabase.from('cliente_unidades').insert({
      cliente_id: cliente.id,
      nome: unidadeNome,
      aeroporto_embarque: input.aeroportoEmbarque?.trim() || null,
      cidade: input.cidade?.trim() || null,
    });
    if (unidadeError) {
      throw new Error(unidadeError.message);
    }
  }
}

export async function fetchAvaliadores(): Promise<
  Array<{
    id: string;
    nome: string;
    funcao: string | null;
    departamento: string | null;
    role: string;
    telefone: string | null;
    ddd: string | null;
    liderNome: string | null;
  }>
> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, funcao, departamento, role, telefone, ddd, lider_id')
    .neq('role', 'colaborador')
    .order('nome');

  if (error) {
    throw new Error(error.message);
  }

  const liderIds = [...new Set((data ?? []).map((r) => r.lider_id).filter(Boolean))] as string[];
  const liderMap = new Map<string, string>();

  if (liderIds.length > 0) {
    const { data: lideres } = await supabase.from('profiles').select('id, nome').in('id', liderIds);
    for (const lider of lideres ?? []) {
      liderMap.set(lider.id, lider.nome);
    }
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    nome: row.nome,
    funcao: row.funcao,
    departamento: row.departamento,
    role: row.role,
    telefone: row.telefone,
    ddd: row.ddd,
    liderNome: row.lider_id ? (liderMap.get(row.lider_id) ?? null) : null,
  }));
}
