import { supabase } from '@/lib/supabase';
import { fetchStatusSolicitacoes } from '@/features/desempenho/historico-api';

export type ImpactoCaixaItem = {
  data: string;
  valor: number;
  percentual: number | null;
  nome: string;
};

export type ImpactoCaixaMetrics = {
  aprovados: ImpactoCaixaItem[];
  folhaSalarial: number;
  colaboradoresComSalario: number;
  totalColaboradoresAtivos: number;
  impactoTotal: number;
  percentualMedioReajuste: number | null;
};

export async function fetchImpactoCaixaMetrics(): Promise<ImpactoCaixaMetrics> {
  const [aprovadosRows, salariosResult, ativosResult] = await Promise.all([
    fetchStatusSolicitacoes({ status: 'aprovado' }),
    supabase
      .from('profiles')
      .select('salario_base')
      .eq('role', 'colaborador')
      .is('data_demissao', null)
      .not('salario_base', 'is', null),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'colaborador')
      .is('data_demissao', null),
  ]);

  if (salariosResult.error) {
    throw new Error(salariosResult.error.message);
  }

  if (ativosResult.error) {
    throw new Error(ativosResult.error.message);
  }

  const aprovados: ImpactoCaixaItem[] = aprovadosRows.map((row) => ({
    data: row.dataSolicitacao,
    valor: Number(row.valorEstimado ?? 0),
    percentual:
      row.percentualReajuste != null && Number.isFinite(Number(row.percentualReajuste))
        ? Number(row.percentualReajuste)
        : null,
    nome: row.colaboradorNome,
  }));

  const folhaSalarial = (salariosResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.salario_base ?? 0),
    0,
  );

  const impactoTotal = aprovados.reduce((sum, item) => sum + item.valor, 0);
  const percentuais = aprovados
    .map((item) => item.percentual)
    .filter((value): value is number => value !== null);

  return {
    aprovados,
    folhaSalarial,
    colaboradoresComSalario: salariosResult.data?.length ?? 0,
    totalColaboradoresAtivos: ativosResult.count ?? 0,
    impactoTotal,
    percentualMedioReajuste:
      percentuais.length > 0
        ? percentuais.reduce((sum, value) => sum + value, 0) / percentuais.length
        : null,
  };
}
