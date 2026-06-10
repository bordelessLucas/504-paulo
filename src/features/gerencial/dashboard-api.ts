import { AVALIACAO_DATA_COLUMN } from '@/features/avaliacao/avaliacao-date';
import { getCicloInicioPorTipo } from '@/features/avaliacao/ciclos';
import {
  CODIGOS_PERGUNTAS_UNIVERSAIS,
  PERGUNTAS_UNIVERSAIS_RADAR,
} from '@/features/gerencial/perguntas-universais';
import { matchDepartamentoEmpresa } from '@/features/gerencial/departamentos';
import { getSemaforoPorMedia, type SemaforoStatus } from '@/features/gerencial/semaforo';
import { supabase } from '@/lib/supabase';
import type { Profile, TipoAvaliacao, UserRole } from '@/types/supabase';

export type ColaboradorRanking = {
  id: string;
  nome: string;
  departamento: string | null;
  funcao: string | null;
  media: number;
  totalRespostas: number;
};

export type RadarUniversalData = {
  labels: string[];
  valores: number[];
};

export type GestorPreenchimentoStatus = {
  id: string;
  nome: string;
  departamento: string | null;
  role: Extract<UserRole, 'supervisor' | 'gestor'>;
  pendentes: number;
  total: number;
  cicloLabel: string;
};

export type GerencialDashboardData = {
  radarUniversal: RadarUniversalData;
  ima: number | null;
  semaforoStatus: SemaforoStatus;
  statusPreenchimento: GestorPreenchimentoStatus[];
  top5: ColaboradorRanking[];
  bottom5: ColaboradorRanking[];
};

type ColaboradorBase = Pick<Profile, 'id' | 'nome' | 'departamento' | 'funcao'>;

type GestorBase = Pick<Profile, 'id' | 'nome' | 'departamento' | 'role'>;

function calcularMedia(notas: number[]): number | null {
  if (notas.length === 0) {
    return null;
  }

  return notas.reduce((total, nota) => total + nota, 0) / notas.length;
}

function normalizeDepartamento(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function colaboradorPertenceAoGestor(
  colaborador: ColaboradorBase,
  gestor: Pick<Profile, 'departamento' | 'id'>,
): boolean {
  if (colaborador.id === gestor.id) {
    return false;
  }

  if (!gestor.departamento?.trim()) {
    return true;
  }

  const gestorDepartamento = matchDepartamentoEmpresa(gestor.departamento);
  const colaboradorDepartamento = matchDepartamentoEmpresa(colaborador.departamento);

  if (gestorDepartamento && colaboradorDepartamento) {
    return gestorDepartamento === colaboradorDepartamento;
  }

  const gestorNormalizado = normalizeDepartamento(gestor.departamento);
  const colaboradorNormalizado = normalizeDepartamento(colaborador.departamento ?? '');

  return (
    colaboradorNormalizado === gestorNormalizado ||
    colaboradorNormalizado.includes(gestorNormalizado) ||
    gestorNormalizado.includes(colaboradorNormalizado)
  );
}

function calcularIma(
  colaboradores: ColaboradorBase[],
  notasPorColaborador: Map<string, number[]>,
): number | null {
  const mediasColaboradores = colaboradores
    .map((colaborador) => calcularMedia(notasPorColaborador.get(colaborador.id) ?? []))
    .filter((media): media is number => media !== null);

  return calcularMedia(mediasColaboradores);
}

function buildRankings(
  colaboradores: ColaboradorBase[],
  notasPorColaborador: Map<string, number[]>,
): ColaboradorRanking[] {
  return colaboradores
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
}

async function fetchPerguntasUniversaisIds(): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from('perguntas')
    .select('id, codigo')
    .eq('secao_departamento', 'UNIVERSAL')
    .in('codigo', [...CODIGOS_PERGUNTAS_UNIVERSAIS]);

  if (error) {
    throw new Error(error.message);
  }

  const map = new Map<string, string>();

  for (const pergunta of data ?? []) {
    if (pergunta.codigo) {
      map.set(pergunta.codigo, pergunta.id);
    }
  }

  return map;
}

function buildRadarUniversal(notasPorCodigo: Map<string, number[]>): RadarUniversalData {
  return {
    labels: PERGUNTAS_UNIVERSAIS_RADAR.map((item) => item.label),
    valores: CODIGOS_PERGUNTAS_UNIVERSAIS.map((codigo) => {
      const media = calcularMedia(notasPorCodigo.get(codigo) ?? []);
      return media ?? 0;
    }),
  };
}

async function fetchAvaliadosNoCiclo(
  colaboradorIds: string[],
  tipo: TipoAvaliacao,
  cicloInicio: string,
): Promise<Set<string>> {
  if (colaboradorIds.length === 0) {
    return new Set();
  }

  const { data, error } = await supabase
    .from('avaliacoes')
    .select('avaliado_id')
    .in('avaliado_id', colaboradorIds)
    .eq('tipo', tipo)
    .gte(AVALIACAO_DATA_COLUMN, `${cicloInicio}T00:00:00.000Z`);

  if (error) {
    throw new Error(error.message);
  }

  return new Set((data ?? []).map((item) => item.avaliado_id));
}

function buildStatusPreenchimento(
  gestores: GestorBase[],
  colaboradores: ColaboradorBase[],
  avaliadosQuinzena: Set<string>,
  avaliadosSemestre: Set<string>,
): GestorPreenchimentoStatus[] {
  return gestores
    .filter(
      (gestor): gestor is GestorBase & { role: Extract<UserRole, 'supervisor' | 'gestor'> } =>
        gestor.role === 'supervisor' || gestor.role === 'gestor',
    )
    .map((gestor) => {
      const equipe = colaboradores.filter((colaborador) =>
        colaboradorPertenceAoGestor(colaborador, gestor),
      );
      const tipo: TipoAvaliacao = gestor.role === 'gestor' ? 'semestral' : 'quinzenal';
      const avaliadosSet = tipo === 'semestral' ? avaliadosSemestre : avaliadosQuinzena;
      const concluidas = equipe.filter((colaborador) => avaliadosSet.has(colaborador.id)).length;

      return {
        id: gestor.id,
        nome: gestor.nome,
        departamento: gestor.departamento,
        role: gestor.role,
        pendentes: equipe.length - concluidas,
        total: equipe.length,
        cicloLabel: tipo === 'semestral' ? 'semestre' : 'quinzena',
      };
    })
    .filter((item) => item.total > 0)
    .sort((left, right) => right.pendentes - left.pendentes);
}

export async function fetchGerencialDashboard(): Promise<GerencialDashboardData> {
  const radarVazio = buildRadarUniversal(new Map());

  const { data: colaboradores, error: colaboradoresError } = await supabase
    .from('profiles')
    .select('id, nome, departamento, funcao')
    .eq('role', 'colaborador')
    .eq('status', 'ativo');

  if (colaboradoresError) {
    throw new Error(colaboradoresError.message);
  }

  const listaColaboradores = colaboradores ?? [];

  const { data: gestores, error: gestoresError } = await supabase
    .from('profiles')
    .select('id, nome, departamento, role')
    .in('role', ['supervisor', 'gestor'])
    .eq('status', 'ativo')
    .order('nome', { ascending: true });

  if (gestoresError) {
    throw new Error(gestoresError.message);
  }

  if (listaColaboradores.length === 0) {
    return {
      radarUniversal: radarVazio,
      ima: null,
      semaforoStatus: 'cinza',
      statusPreenchimento: [],
      top5: [],
      bottom5: [],
    };
  }

  const colaboradorIds = listaColaboradores.map((colaborador) => colaborador.id);
  const cicloQuinzena = getCicloInicioPorTipo('quinzenal');
  const cicloSemestre = getCicloInicioPorTipo('semestral');

  const [perguntasPorCodigo, avaliacoesResult, avaliadosQuinzena, avaliadosSemestre] =
    await Promise.all([
      fetchPerguntasUniversaisIds(),
      supabase.from('avaliacoes').select('id, avaliado_id').in('avaliado_id', colaboradorIds),
      fetchAvaliadosNoCiclo(colaboradorIds, 'quinzenal', cicloQuinzena),
      fetchAvaliadosNoCiclo(colaboradorIds, 'semestral', cicloSemestre),
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
  const notasPorCodigo = new Map<string, number[]>();

  for (const codigo of CODIGOS_PERGUNTAS_UNIVERSAIS) {
    notasPorCodigo.set(codigo, []);
  }

  const perguntaIdPorCodigo = new Map<string, string>();

  for (const [codigo, perguntaId] of perguntasPorCodigo.entries()) {
    perguntaIdPorCodigo.set(perguntaId, codigo);
  }

  if (avaliacaoIds.length > 0) {
    const { data: respostas, error: respostasError } = await supabase
      .from('respostas')
      .select('avaliacao_id, pergunta_id, nota')
      .in('avaliacao_id', avaliacaoIds);

    if (respostasError) {
      throw new Error(respostasError.message);
    }

    for (const resposta of respostas ?? []) {
      if (typeof resposta.nota !== 'number') {
        continue;
      }

      const colaboradorId = avaliacaoPorId.get(resposta.avaliacao_id);

      if (colaboradorId) {
        const atualColaborador = notasPorColaborador.get(colaboradorId) ?? [];
        atualColaborador.push(resposta.nota);
        notasPorColaborador.set(colaboradorId, atualColaborador);
      }

      if (resposta.pergunta_id) {
        const codigo = perguntaIdPorCodigo.get(resposta.pergunta_id);

        if (codigo) {
          const atualCodigo = notasPorCodigo.get(codigo) ?? [];
          atualCodigo.push(resposta.nota);
          notasPorCodigo.set(codigo, atualCodigo);
        }
      }
    }
  }

  const rankings = buildRankings(listaColaboradores, notasPorColaborador);
  const ima = calcularIma(listaColaboradores, notasPorColaborador);

  return {
    radarUniversal: buildRadarUniversal(notasPorCodigo),
    ima,
    semaforoStatus: getSemaforoPorMedia(ima),
    statusPreenchimento: buildStatusPreenchimento(
      gestores ?? [],
      listaColaboradores,
      avaliadosQuinzena,
      avaliadosSemestre,
    ),
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
