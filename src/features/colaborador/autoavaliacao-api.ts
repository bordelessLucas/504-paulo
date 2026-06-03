import { supabase } from '@/lib/supabase';

export function buildAutoavaliacaoJustificativa(
  qualificacoes: string,
  investimento: string,
): string {
  const qualificacoesTexto = qualificacoes.trim();
  const investimentoTexto = investimento.trim();

  return [
    'Novas qualificações e certificados adquiridos:',
    qualificacoesTexto || '(não informado)',
    '',
    'Solicitação de investimento ou melhoria salarial:',
    investimentoTexto || '(não informado)',
  ].join('\n');
}

export async function createAutoavaliacaoSolicitacao(params: {
  colaboradorId: string;
  qualificacoes: string;
  investimento: string;
}): Promise<void> {
  const qualificacoesTexto = params.qualificacoes.trim();
  const investimentoTexto = params.investimento.trim();

  if (!qualificacoesTexto && !investimentoTexto) {
    throw new Error('Preencha ao menos um dos campos antes de enviar.');
  }

  const justificativa = buildAutoavaliacaoJustificativa(qualificacoesTexto, investimentoTexto);

  const { error } = await supabase.from('melhorias_salariais').insert({
    colaborador_id: params.colaboradorId,
    gerente_id: null,
    justificativa,
    status: 'pendente_rh',
  });

  if (error) {
    throw new Error(error.message);
  }
}
