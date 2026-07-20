import { supabase } from '@/lib/supabase';

/** Notifica CEO/Admin/RH quando IMA < 1.0 (governança DNA PERFORMANCE). */
export async function notificarImaCritico(params: {
  colaboradorId: string;
  media: number;
  avaliacaoId: string;
}): Promise<void> {
  const { data: colaborador } = await supabase
    .from('profiles')
    .select('nome')
    .eq('id', params.colaboradorId)
    .maybeSingle();

  const { data: destinatarios, error } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['ceo', 'admin', 'rh']);

  if (error || !destinatarios?.length) {
    return;
  }

  const titulo = 'IMA crítico — risco operacional';
  const mensagem = `${colaborador?.nome ?? 'Colaborador'} com média ${params.media.toFixed(2)} (< 1,0). Abrir comitê de análise.`;

  await supabase.from('notificacoes').insert(
    destinatarios.map((dest) => ({
      destinatario_id: dest.id,
      tipo: 'ima_critico',
      titulo,
      mensagem,
      metadata: {
        colaborador_id: params.colaboradorId,
        avaliacao_id: params.avaliacaoId,
        media: params.media,
      },
      lida: false,
    })),
  );
}
