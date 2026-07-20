import { avaliarGovernancaAvaliacao } from '@/features/avaliacao/governanca';
import {
  CLASSIFICACAO_DESEMPENHO_LABELS,
  classificarPorIma,
  type ClassificacaoDesempenho,
} from '@/features/avaliacao/ima';
import {
  fetchColaboradorFicha,
  type ColaboradorFichaData,
} from '@/features/gerencial/ficha-colaborador-api';
import { supabase } from '@/lib/supabase';

export type ColaboradorBusca = {
  id: string;
  nome: string;
  funcao: string | null;
  departamento: string | null;
};

export type RelatorioIndividual = {
  ficha: ColaboradorFichaData;
  ima: number | null;
  classificacao: ClassificacaoDesempenho | null;
  classificacaoLabel: string | null;
  acaoRecomendada: string | null;
};

/** Busca colaboradores ativos por nome — usado na seleção do relatório individual. */
export async function fetchColaboradoresParaRelatorio(query?: string): Promise<ColaboradorBusca[]> {
  let request = supabase
    .from('profiles')
    .select('id, nome, funcao, departamento')
    .eq('role', 'colaborador')
    .eq('status', 'ativo')
    .order('nome', { ascending: true })
    .limit(50);

  const termo = query?.trim();

  if (termo) {
    request = request.ilike('nome', `%${termo}%`);
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

/**
 * Relatório individual consolidado: notas por seção (GO..IN), IMA, classificação e
 * ação recomendada pela governança automática (Excel aba 1.4).
 */
export async function fetchRelatorioIndividual(colaboradorId: string): Promise<RelatorioIndividual> {
  const ficha = await fetchColaboradorFicha(colaboradorId);
  const ima = ficha.mediaGeral;
  const classificacao = classificarPorIma(ima);
  const governanca = avaliarGovernancaAvaliacao({ mediaPonderada: ima });

  return {
    ficha,
    ima,
    classificacao,
    classificacaoLabel: classificacao ? CLASSIFICACAO_DESEMPENHO_LABELS[classificacao] : null,
    acaoRecomendada: governanca.mensagem,
  };
}

export type { ColaboradorFichaData };
