import { supabase } from '@/lib/supabase';
import type { StatusSolicitacaoSalarial } from '@/types/supabase';

export type SolicitacaoColaborador = {
  id: string;
  tipo: 'autoavaliacao' | 'solicitacao_gestor';
  status: StatusSolicitacaoSalarial;
  createdAt: string;
  resumo: string;
};

export const STATUS_SOLICITACAO_LABELS: Record<StatusSolicitacaoSalarial, string> = {
  pendente_rh: 'Aguardando validação do RH',
  pendente_ceo: 'Aguardando aprovação do CEO',
  aprovado: 'Aprovada',
  recusado: 'Recusada',
  devolvida: 'Devolvida para ajuste',
};

function buildResumo(justificativa: string, isAutoavaliacao: boolean): string {
  const trimmed = justificativa.trim();

  if (trimmed.length <= 120) {
    return trimmed;
  }

  return `${trimmed.slice(0, 117)}...`;
}

export async function fetchSolicitacoesColaborador(
  colaboradorId: string,
): Promise<SolicitacaoColaborador[]> {
  const { data, error } = await supabase
    .from('melhorias_salariais')
    .select('id, status, created_at, justificativa, gerente_id')
    .eq('colaborador_id', colaboradorId)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const isAutoavaliacao = row.gerente_id === null;

    return {
      id: row.id,
      tipo: isAutoavaliacao ? 'autoavaliacao' : 'solicitacao_gestor',
      status: row.status,
      createdAt: row.created_at,
      resumo: buildResumo(row.justificativa, isAutoavaliacao),
    };
  });
}
