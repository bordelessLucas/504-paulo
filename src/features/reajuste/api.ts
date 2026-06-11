import type { ColaboradorAtivo } from '@/features/aprovacoes/api';
import { getDataLimiteIncidentes } from '@/features/colaborador/eligibility';
import { isElegivelParaReajuste } from '@/features/reajuste/eligibility';
import { supabase } from '@/lib/supabase';

export type ColaboradorReajusteResumo = ColaboradorAtivo & {
  media: number | null;
  totalRespostas: number;
  temIncidentesRecentes: boolean;
  isElegivel: boolean;
};

function calcularMedia(notas: number[]): number | null {
  if (notas.length === 0) {
    return null;
  }

  return notas.reduce((total, nota) => total + nota, 0) / notas.length;
}

async function fetchColaboradoresComIncidentesRecentes(
  colaboradorIds: string[],
): Promise<Set<string>> {
  if (colaboradorIds.length === 0) {
    return new Set();
  }

  const dataLimite = getDataLimiteIncidentes();

  const { data, error } = await supabase
    .from('incidentes')
    .select('colaborador_id')
    .in('colaborador_id', colaboradorIds)
    .gte('data_ocorrencia', dataLimite);

  if (error) {
    throw new Error(error.message);
  }

  return new Set((data ?? []).map((item) => item.colaborador_id));
}

export async function fetchColaboradoresReajusteResumo(): Promise<ColaboradorReajusteResumo[]> {
  const { data: colaboradores, error: colaboradoresError } = await supabase
    .from('profiles')
    .select('id, nome, departamento, funcao')
    .eq('role', 'colaborador')
    .eq('status', 'ativo')
    .order('nome', { ascending: true });

  if (colaboradoresError) {
    throw new Error(colaboradoresError.message);
  }

  const lista = colaboradores ?? [];

  if (lista.length === 0) {
    return [];
  }

  const colaboradorIds = lista.map((colaborador) => colaborador.id);

  const [avaliacoesResult, colaboradoresComIncidentes] = await Promise.all([
    supabase
      .from('avaliacoes')
      .select('id, avaliado_id')
      .in('avaliado_id', colaboradorIds)
      .eq('status', 'aprovada'),
    fetchColaboradoresComIncidentesRecentes(colaboradorIds),
  ]);

  if (avaliacoesResult.error) {
    throw new Error(avaliacoesResult.error.message);
  }

  const avaliacaoPorId = new Map<string, string>();
  const avaliacaoIds: string[] = [];

  for (const avaliacao of avaliacoesResult.data ?? []) {
    avaliacaoPorId.set(avaliacao.id, avaliacao.avaliado_id);
    avaliacaoIds.push(avaliacao.id);
  }

  const notasPorColaborador = new Map<string, number[]>();

  for (const id of colaboradorIds) {
    notasPorColaborador.set(id, []);
  }

  if (avaliacaoIds.length > 0) {
    const { data: respostas, error: respostasError } = await supabase
      .from('respostas')
      .select('avaliacao_id, nota')
      .in('avaliacao_id', avaliacaoIds);

    if (respostasError) {
      throw new Error(respostasError.message);
    }

    for (const resposta of respostas ?? []) {
      if (typeof resposta.nota !== 'number') {
        continue;
      }

      const colaboradorId = avaliacaoPorId.get(resposta.avaliacao_id);

      if (!colaboradorId) {
        continue;
      }

      const atual = notasPorColaborador.get(colaboradorId) ?? [];
      atual.push(resposta.nota);
      notasPorColaborador.set(colaboradorId, atual);
    }
  }

  return lista.map((colaborador) => {
    const notas = notasPorColaborador.get(colaborador.id) ?? [];
    const media = calcularMedia(notas);
    const totalRespostas = notas.length;
    const temIncidentesRecentes = colaboradoresComIncidentes.has(colaborador.id);
    const isElegivel = isElegivelParaReajuste(media, totalRespostas, temIncidentesRecentes);

    return {
      ...colaborador,
      media,
      totalRespostas,
      temIncidentesRecentes,
      isElegivel,
    };
  });
}
