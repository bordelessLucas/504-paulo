import type { ClassificacaoDesempenho } from '@/features/avaliacao/ima';
import { supabase } from '@/lib/supabase';

function prazoEmDias(dias: number): string {
  const date = new Date();
  date.setDate(date.getDate() + dias);
  return date.toISOString().slice(0, 10);
}

export async function criarPdiAutomaticoSeNecessario(params: {
  colaboradorId: string;
  criadoPorId: string;
  avaliacaoOrigemId: string;
  media: number | null;
  classificacao: ClassificacaoDesempenho | null;
}): Promise<void> {
  if (params.media === null || params.media >= 1.8) {
    return;
  }

  const titulo =
    params.classificacao === 'critico'
      ? 'PDI Crítico — Reavaliação em 30 dias'
      : 'PDI de Desenvolvimento — Urgência 30 dias';

  const { data: existente } = await supabase
    .from('planos_desenvolvimento')
    .select('id')
    .eq('colaborador_id', params.colaboradorId)
    .in('status', ['aberto', 'em_andamento'])
    .limit(1)
    .maybeSingle();

  if (existente) {
    return;
  }

  const { error } = await supabase.from('planos_desenvolvimento').insert({
    colaborador_id: params.colaboradorId,
    avaliacao_origem_id: params.avaliacaoOrigemId,
    criado_por_id: params.criadoPorId,
    eixo: 'geral',
    titulo,
    descricao: `Aberto automaticamente por desempenho abaixo do esperado (média ${params.media.toFixed(2)}).`,
    indicador_sucesso: 'Atingir média ≥ 2,0 na próxima avaliação do ciclo.',
    prazo: prazoEmDias(30),
    status: 'aberto',
    progresso_pct: 0,
  });

  if (error) {
    console.warn('[PDI auto]', error.message);
  }
}
