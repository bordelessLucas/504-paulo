import {
  fetchPerguntasPorAvaliador,
} from '@/features/avaliacao/api';
import { resolveTipoAvaliacaoPorRole } from '@/features/avaliacao/ciclos';
import { avaliarGovernancaAvaliacao } from '@/features/avaliacao/governanca';
import { criarPdiAutomaticoSeNecessario } from '@/features/avaliacao/pdi-auto';
import { notificarImaCritico } from '@/features/avaliacao/ima-alerta';
import { supabase } from '@/lib/supabase';
import type { PerguntaAvaliacao, TipoAvaliacao, UserRole } from '@/types/supabase';
import { fetchClientesComUnidades, type ClienteComUnidades } from '@/features/clientes/api';

export type ColaboradorLote = {
  id: string;
  nome: string;
  funcao: string | null;
  nivelIrata: string | null;
  codigoInterno: string | null;
};

export type NotaLoteState = {
  n1: number | null;
  n2: number | null;
  n3: number | null;
  justificativa: string;
  evidencia: string;
};

export type SessaoLoteResumo = {
  total: number;
  completos: number;
  parciais: number;
  pendentes: number;
  mediaGeral: number | null;
};

export function emptyNotaLote(): NotaLoteState {
  return { n1: null, n2: null, n3: null, justificativa: '', evidencia: '' };
}

export function statusLinhaLote(nota: NotaLoteState): 'completo' | 'parcial' | 'pendente' {
  const filled = [nota.n1, nota.n2, nota.n3].filter((n) => n !== null).length;
  if (filled === 0) return 'pendente';
  if (filled === 3) return 'completo';
  return 'parcial';
}

export function mediaLinhaLote(nota: NotaLoteState): number | null {
  const values = [nota.n1, nota.n2, nota.n3].filter((n): n is number => n !== null);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function resumirSessaoLote(
  notas: Record<string, NotaLoteState>,
  colaboradorIds: string[],
): SessaoLoteResumo {
  let completos = 0;
  let parciais = 0;
  let pendentes = 0;
  const medias: number[] = [];

  for (const id of colaboradorIds) {
    const nota = notas[id] ?? emptyNotaLote();
    const status = statusLinhaLote(nota);
    if (status === 'completo') completos += 1;
    else if (status === 'parcial') parciais += 1;
    else pendentes += 1;

    const media = mediaLinhaLote(nota);
    if (media !== null) medias.push(media);
  }

  return {
    total: colaboradorIds.length,
    completos,
    parciais,
    pendentes,
    mediaGeral:
      medias.length > 0 ? medias.reduce((a, b) => a + b, 0) / medias.length : null,
  };
}

export async function fetchSessaoLoteContext(params: {
  role: UserRole | null | undefined;
  departamentoAvaliador?: string | null;
}): Promise<{
  tipo: TipoAvaliacao;
  perguntas: PerguntaAvaliacao[];
  colaboradores: ColaboradorLote[];
  clientes: ClienteComUnidades[];
}> {
  const tipo = resolveTipoAvaliacaoPorRole(params.role);
  const [perguntas, colaboradoresResult, clientes] = await Promise.all([
    fetchPerguntasPorAvaliador({
      role: params.role,
      tipo,
      departamentoAvaliador: params.departamentoAvaliador,
    }),
    supabase
      .from('profiles')
      .select('id, nome, funcao, nivel_irata, codigo_interno, status, data_demissao')
      .eq('role', 'colaborador')
      .or('status.eq.ativo,status.is.null')
      .is('data_demissao', null)
      .order('nome')
      .limit(200),
    fetchClientesComUnidades(),
  ]);

  if (colaboradoresResult.error) {
    throw new Error(colaboradoresResult.error.message);
  }

  const colaboradores: ColaboradorLote[] = (colaboradoresResult.data ?? []).map((row) => ({
    id: row.id,
    nome: row.nome,
    funcao: row.funcao,
    nivelIrata: row.nivel_irata,
    codigoInterno: row.codigo_interno,
  }));

  return { tipo, perguntas: perguntas.slice(0, 3), colaboradores, clientes };
}

export async function submitAvaliacoesLote(params: {
  avaliadorId: string;
  tipo: TipoAvaliacao;
  perguntas: PerguntaAvaliacao[];
  notas: Record<string, NotaLoteState>;
  periodoInicio?: string;
  periodoFim?: string;
  quinzena?: string;
  clienteId?: string | null;
  unidadeId?: string | null;
}): Promise<{ salvos: number }> {
  if (params.perguntas.length < 3) {
    throw new Error('É necessário ter 3 perguntas da seção do avaliador.');
  }

  let salvos = 0;

  for (const [colaboradorId, nota] of Object.entries(params.notas)) {
    if (statusLinhaLote(nota) !== 'completo') {
      continue;
    }

    const respostasPayload = [
      { perguntaId: params.perguntas[0].id, nota: nota.n1!, justificativa: nota.justificativa, evidencia: nota.evidencia },
      { perguntaId: params.perguntas[1].id, nota: nota.n2!, justificativa: nota.justificativa, evidencia: nota.evidencia },
      { perguntaId: params.perguntas[2].id, nota: nota.n3!, justificativa: nota.justificativa, evidencia: nota.evidencia },
    ];

    for (const resposta of respostasPayload) {
      if (resposta.nota <= 1 && !resposta.justificativa.trim()) {
        throw new Error(`Justificativa obrigatória para notas 0/1 (${colaboradorId}).`);
      }
      if (resposta.nota >= 3 && !resposta.evidencia.trim()) {
        throw new Error(`Evidência obrigatória para nota 3 (${colaboradorId}).`);
      }
    }

    const { data: avaliacao, error } = await supabase
      .from('avaliacoes')
      .insert({
        avaliador_id: params.avaliadorId,
        avaliado_id: colaboradorId,
        tipo: params.tipo,
        status: 'pendente_rh',
        periodo_inicio: params.periodoInicio || null,
        periodo_fim: params.periodoFim || null,
        quinzena: params.quinzena || null,
        cliente_id: params.clienteId || null,
        unidade_id: params.unidadeId || null,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const { error: respostasError } = await supabase.from('respostas').insert(
      respostasPayload.map((r) => ({
        avaliacao_id: avaliacao.id,
        pergunta_id: r.perguntaId,
        nota: r.nota,
        justificativa: r.justificativa.trim() || null,
        evidencia: r.evidencia.trim() || null,
      })),
    );

    if (respostasError) {
      throw new Error(respostasError.message);
    }

    const media = mediaLinhaLote(nota);
    const governanca = avaliarGovernancaAvaliacao({ mediaPonderada: media });

    if (governanca.acoes.includes('pdi_urgente') || governanca.acoes.includes('alerta_critico')) {
      await criarPdiAutomaticoSeNecessario({
        colaboradorId,
        criadoPorId: params.avaliadorId,
        avaliacaoOrigemId: avaliacao.id,
        media,
        classificacao: governanca.classificacao,
      });
    }

    if (governanca.acoes.includes('alerta_critico') && media !== null) {
      await notificarImaCritico({
        colaboradorId,
        media,
        avaliacaoId: avaliacao.id,
      });
    }

    salvos += 1;
  }

  return { salvos };
}
