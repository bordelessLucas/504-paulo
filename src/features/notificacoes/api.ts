import { supabase } from '@/lib/supabase';

import type { Notificacao, TipoNotificacao } from '@/features/notificacoes/types';

type NotificacaoRow = {
  id: string;
  destinatario_id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  metadata: Record<string, unknown> | null;
  lida: boolean;
  created_at: string;
};

function mapNotificacao(row: NotificacaoRow): Notificacao {
  return {
    id: row.id,
    destinatarioId: row.destinatario_id,
    tipo: row.tipo,
    titulo: row.titulo,
    mensagem: row.mensagem,
    metadata: row.metadata ?? {},
    lida: row.lida,
    createdAt: row.created_at,
  };
}

export async function fetchNotificacoes(limit = 40): Promise<Notificacao[]> {
  const { data, error } = await supabase
    .from('notificacoes')
    .select('id, destinatario_id, tipo, titulo, mensagem, metadata, lida, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapNotificacao(row as NotificacaoRow));
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const { count, error } = await supabase
    .from('notificacoes')
    .select('id', { count: 'exact', head: true })
    .eq('lida', false);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('id', notificationId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const { error } = await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('lida', false);

  if (error) {
    throw new Error(error.message);
  }
}

/** Dispara notificação de teste para o usuário logado (dev / QA). */
export async function sendTestNotification(
  destinatarioId: string,
): Promise<Notificacao> {
  const titulo = 'Notificação de teste';
  const mensagem =
    'Alerta simulado para validar o toast em tempo real. Toque em Ver para testar a navegação.';
  const tipo: TipoNotificacao = 'pdi_vencendo';

  // RPC opcional — migration 20260702120000. Sem ela, usa fallback local.
  // @ts-expect-error RPC gerada após aplicar migration no Supabase
  const { data: rpcData, error: rpcError } = await supabase.rpc('enviar_notificacao_teste', {
    p_titulo: titulo,
    p_mensagem: mensagem,
    p_tipo: tipo,
  });

  const rpcId = typeof rpcData === 'string' ? rpcData : null;

  if (!rpcError && rpcId) {
    const { data, error } = await supabase
      .from('notificacoes')
      .select('id, destinatario_id, tipo, titulo, mensagem, metadata, lida, created_at')
      .eq('id', rpcId)
      .single();

    if (!error && data) {
      return mapNotificacao(data as NotificacaoRow);
    }
  }

  // Fallback local quando o RPC ainda não foi aplicado no Supabase.
  return {
    id: `local-test-${Date.now()}`,
    destinatarioId,
    tipo,
    titulo,
    mensagem,
    metadata: { teste: true, origem: 'local' },
    lida: false,
    createdAt: new Date().toISOString(),
  };
}
