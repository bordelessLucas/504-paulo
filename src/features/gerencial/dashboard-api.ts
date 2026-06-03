import {
  buildRadarDepartamentos,
  DEPARTAMENTOS_EMPRESA,
  matchDepartamentoEmpresa,
  type DepartamentoEmpresa,
} from '@/features/gerencial/departamentos';
import { getSemaforoPorMedia, type SemaforoStatus } from '@/features/gerencial/semaforo';
import { AVALIACAO_DATA_COLUMN } from '@/features/avaliacao/avaliacao-date';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/supabase';

export type ColaboradorRanking = {
  id: string;
  nome: string;
  departamento: string | null;
  funcao: string | null;
  media: number;
  totalRespostas: number;
};

export type GerencialDashboardData = {
  radarLabels: string[];
  radarValores: number[];
  mediaEmpresa: number | null;
  semaforoStatus: SemaforoStatus;
  top5: ColaboradorRanking[];
  bottom5: ColaboradorRanking[];
};

type ColaboradorBase = Pick<Profile, 'id' | 'nome' | 'departamento' | 'funcao'>;

function calcularMedia(notas: number[]): number | null {
  if (notas.length === 0) {
    return null;
  }

  return notas.reduce((total, nota) => total + nota, 0) / notas.length;
}

export async function fetchGerencialDashboard(): Promise<GerencialDashboardData> {
  const { data: colaboradores, error: colaboradoresError } = await supabase
    .from('profiles')
    .select('id, nome, departamento, funcao')
    .eq('role', 'colaborador')
    .eq('status', 'ativo');

  if (colaboradoresError) {
    throw new Error(colaboradoresError.message);
  }

  const listaColaboradores = colaboradores ?? [];

  if (listaColaboradores.length === 0) {
    const { labels, valores } = buildRadarDepartamentos(new Map());

    return {
      radarLabels: labels,
      radarValores: valores,
      mediaEmpresa: null,
      semaforoStatus: 'cinza',
      top5: [],
      bottom5: [],
    };
  }

  const colaboradorIds = listaColaboradores.map((colaborador) => colaborador.id);

  const { data: avaliacoes, error: avaliacoesError } = await supabase
    .from('avaliacoes')
    .select('id, avaliado_id')
    .in('avaliado_id', colaboradorIds);

  if (avaliacoesError) {
    throw new Error(avaliacoesError.message);
  }

  const avaliacaoPorId = new Map<string, string>();
  const avaliacaoIds: string[] = [];

  for (const avaliacao of avaliacoes ?? []) {
    avaliacaoPorId.set(avaliacao.id, avaliacao.avaliado_id);
    avaliacaoIds.push(avaliacao.id);
  }

  const notasPorColaborador = new Map<string, number[]>();

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

  const rankings: ColaboradorRanking[] = listaColaboradores
    .map((colaborador) => {
      const notas = notasPorColaborador.get(colaborador.id) ?? [];
      const media = calcularMedia(notas);

      return {
        id: colaborador.id,
        nome: colaborador.nome,
        departamento: colaborador.departamento,
        funcao: colaborador.funcao,
        media: media ?? 0,
        totalRespostas: notas.length,
      };
    })
    .filter((item) => item.totalRespostas > 0)
    .sort((left, right) => right.media - left.media);

  const mediasPorDepartamento = new Map<DepartamentoEmpresa, number[]>();

  for (const departamento of DEPARTAMENTOS_EMPRESA) {
    mediasPorDepartamento.set(departamento, []);
  }

  for (const colaborador of listaColaboradores) {
    const notas = notasPorColaborador.get(colaborador.id) ?? [];
    const media = calcularMedia(notas);

    if (media === null) {
      continue;
    }

    const departamento = matchDepartamentoEmpresa(colaborador.departamento);

    if (!departamento) {
      continue;
    }

    const atual = mediasPorDepartamento.get(departamento) ?? [];
    atual.push(media);
    mediasPorDepartamento.set(departamento, atual);
  }

  const todasNotas = Array.from(notasPorColaborador.values()).flat();
  const mediaEmpresa = calcularMedia(todasNotas);
  const { labels, valores } = buildRadarDepartamentos(mediasPorDepartamento);

  return {
    radarLabels: labels,
    radarValores: valores,
    mediaEmpresa,
    semaforoStatus: getSemaforoPorMedia(mediaEmpresa),
    top5: rankings.slice(0, 5),
    bottom5: [...rankings].reverse().slice(0, 5),
  };
}

export async function fetchColaboradorFicha(colaboradorId: string) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, nome, departamento, funcao, data_admissao, classificacao, nivel_irata, status')
    .eq('id', colaboradorId)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { data: avaliacoes, error: avaliacoesError } = await supabase
    .from('avaliacoes')
    .select(`id, tipo, ${AVALIACAO_DATA_COLUMN}`)
    .eq('avaliado_id', colaboradorId)
    .order(AVALIACAO_DATA_COLUMN, { ascending: false });

  if (avaliacoesError) {
    throw new Error(avaliacoesError.message);
  }

  const avaliacaoIds = (avaliacoes ?? []).map((avaliacao) => avaliacao.id);
  let respostas: Array<{
    nota: number | null;
    justificativa: string | null;
    evidencia: string | null;
    created_at: string;
  }> = [];

  if (avaliacaoIds.length > 0) {
    const { data, error } = await supabase
      .from('respostas')
      .select('nota, justificativa, evidencia, created_at')
      .in('avaliacao_id', avaliacaoIds);

    if (error) {
      throw new Error(error.message);
    }

    respostas = data ?? [];
  }

  const notas = respostas
    .map((resposta) => resposta.nota)
    .filter((nota): nota is number => typeof nota === 'number');

  return {
    profile,
    mediaGeral: calcularMedia(notas),
    totalRespostas: notas.length,
    feedbacks: respostas
      .flatMap((resposta) => {
        const items: string[] = [];
        const justificativa = resposta.justificativa?.trim();
        const evidencia = resposta.evidencia?.trim();

        if (justificativa) {
          items.push(justificativa);
        }

        if (evidencia && evidencia !== '[Melhorou na avaliação seguinte]') {
          items.push(evidencia);
        }

        return items;
      })
      .slice(0, 8),
    avaliacoes: avaliacoes ?? [],
  };
}

export type ColaboradorFichaData = Awaited<ReturnType<typeof fetchColaboradorFicha>>;
