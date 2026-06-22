import { supabase } from '@/lib/supabase';

export async function registrarAuditLog(params: {
  acao: string;
  tabela: string;
  registroId?: string;
  campoAlterado?: string;
  valorAnterior?: string;
  valorNovo?: string;
  observacao?: string;
}): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const usuarioId = userData.user?.id ?? null;

  const { error } = await supabase.from('audit_log').insert({
    usuario_id: usuarioId,
    acao: params.acao,
    tabela: params.tabela,
    registro_id: params.registroId ?? null,
    campo_alterado: params.campoAlterado ?? null,
    valor_anterior: params.valorAnterior ?? null,
    valor_novo: params.valorNovo ?? null,
    observacao: params.observacao ?? null,
  });

  if (error) {
    console.warn('[audit_log]', error.message);
  }
}

export async function fetchAuditLog(limit = 50) {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*, profiles:usuario_id(nome)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
