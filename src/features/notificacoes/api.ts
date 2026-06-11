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
