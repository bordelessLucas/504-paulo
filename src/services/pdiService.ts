import { supabase } from '@/lib/supabase';
import type {
  AtualizarPDIInput,
  CriarPDIInput,
  PdiAtualizacao,
  PdiColaboradorResumo,
  PdiEstatisticas,
  PdiEixo,
  PdiFiltros,
  PdiMetricasColaborador,
  PdiStatus,
  PlanoDesenvolvimento,
} from '@/features/pdi/types';
import { PDI_EVOLUCAO_LABELS } from '@/features/pdi/labels';
import type { Database } from '@/types/supabase';

type PdiUpdate = Database['public']['Tables']['planos_desenvolvimento']['Update'];

type PdiRow = {
  id: string;
  colaborador_id: string;
  avaliacao_origem_id: string | null;
  criado_por_id: string;
  eixo: PdiEixo;
  titulo: string;
  descricao: string | null;
  indicador_sucesso: string;
  prazo: string;
  status: PdiStatus;
  progresso_pct: number;
  observacoes_responsavel: string | null;
  observacoes_colaborador: string | null;
  concluido_em: string | null;
  created_at: string;
  updated_at: string;
  colaborador?: { nome: string; departamento: string | null } | null;
  criado_por?: { nome: string } | null;
};

type AtualizacaoRow = {
  id: string;
  pdi_id: string;
  autor_id: string;
  status_anterior: string | null;
  status_novo: string | null;
  progresso_anterior: number | null;
  progresso_novo: number | null;
  comentario: string | null;
  created_at: string;
  autor?: { nome: string } | null;
};

function mapPdi(row: PdiRow): PlanoDesenvolvimento {
  return {
    id: row.id,
    colaboradorId: row.colaborador_id,
    colaboradorNome: row.colaborador?.nome,
    avaliacaoOrigemId: row.avaliacao_origem_id,
    criadoPorId: row.criado_por_id,
    criadoPorNome: row.criado_por?.nome,
    eixo: row.eixo,
    titulo: row.titulo,
    descricao: row.descricao,
    indicadorSucesso: row.indicador_sucesso,
    prazo: row.prazo,
    status: row.status,
    progressoPct: row.progresso_pct,
    observacoesResponsavel: row.observacoes_responsavel,
    observacoesColaborador: row.observacoes_colaborador,
    concluidoEm: row.concluido_em,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAtualizacao(row: AtualizacaoRow): PdiAtualizacao {
  return {
    id: row.id,
    pdiId: row.pdi_id,
    autorId: row.autor_id,
    autorNome: row.autor?.nome,
    statusAnterior: row.status_anterior,
    statusNovo: row.status_novo,
    progressoAnterior: row.progresso_anterior,
    progressoNovo: row.progresso_novo,
    comentario: row.comentario,
    createdAt: row.created_at,
  };
}

function applyFiltros<T extends { in: (column: string, values: string[]) => T; eq: (column: string, value: string) => T; gte: (column: string, value: string) => T; lte: (column: string, value: string) => T }>(
  query: T,
  filtros?: PdiFiltros,
): T {
  let next = query;

  if (filtros?.status) {
    const statuses = Array.isArray(filtros.status) ? filtros.status : [filtros.status];
    next = next.in('status', statuses);
  }

  if (filtros?.eixo) {
    next = next.eq('eixo', filtros.eixo);
  }

  if (filtros?.ano) {
    const inicio = `${filtros.ano}-01-01`;
    const fim = `${filtros.ano}-12-31`;
    next = next.gte('created_at', inicio).lte('created_at', `${fim}T23:59:59`);
  }

  return next;
}

export async function processarAlertasPdi(): Promise<void> {
  try {
    await Promise.all([
      supabase.rpc('processar_pdis_vencidos'),
      supabase.rpc('processar_alertas_pdi_vencendo', { p_dias: 7 }),
    ]);
  } catch {
    // Migration PDI pode não estar aplicada ainda — não bloquear o app.
  }
}

export async function criarPDI(dados: CriarPDIInput): Promise<PlanoDesenvolvimento> {
  const { data, error } = await supabase
    .from('planos_desenvolvimento')
    .insert({
      colaborador_id: dados.colaboradorId,
      avaliacao_origem_id: dados.avaliacaoOrigemId ?? null,
      criado_por_id: dados.criadoPorId,
      eixo: dados.eixo,
      titulo: dados.titulo.trim(),
      descricao: dados.descricao?.trim() || null,
      indicador_sucesso: dados.indicadorSucesso.trim(),
      prazo: dados.prazo,
      status: 'aberto',
      progresso_pct: 0,
    })
    .select(
      `*,
      colaborador:profiles!planos_desenvolvimento_colaborador_id_fkey(nome, departamento),
      criado_por:profiles!planos_desenvolvimento_criado_por_id_fkey(nome)`,
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapPdi(data as PdiRow);
}

export async function buscarPDIsDoColaborador(
  colaboradorId: string,
  filtros?: PdiFiltros,
): Promise<PlanoDesenvolvimento[]> {
  await processarAlertasPdi();

  let query = supabase
    .from('planos_desenvolvimento')
    .select(
      `*,
      colaborador:profiles!planos_desenvolvimento_colaborador_id_fkey(nome, departamento),
      criado_por:profiles!planos_desenvolvimento_criado_por_id_fkey(nome)`,
    )
    .eq('colaborador_id', colaboradorId)
    .order('created_at', { ascending: false });

  query = applyFiltros(query, filtros);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data as PdiRow[]).map(mapPdi);
}

export async function buscarPDIById(pdiId: string): Promise<PlanoDesenvolvimento> {
  await processarAlertasPdi();

  const { data, error } = await supabase
    .from('planos_desenvolvimento')
    .select(
      `*,
      colaborador:profiles!planos_desenvolvimento_colaborador_id_fkey(nome, departamento),
      criado_por:profiles!planos_desenvolvimento_criado_por_id_fkey(nome)`,
    )
    .eq('id', pdiId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapPdi(data as PdiRow);
}

export async function buscarPDIsAtivosColaborador(
  colaboradorId: string,
): Promise<PlanoDesenvolvimento[]> {
  return buscarPDIsDoColaborador(colaboradorId, {
    status: ['aberto', 'em_andamento', 'vencido'],
  });
}

export async function buscarPDIsDaEquipe(liderId: string): Promise<PdiColaboradorResumo[]> {
  await processarAlertasPdi();

  const { data: liderProfile, error: liderError } = await supabase
    .from('profiles')
    .select('departamento')
    .eq('id', liderId)
    .single();

  if (liderError) {
    throw new Error(liderError.message);
  }

  const departamento = liderProfile.departamento?.trim();

  let equipeQuery = supabase
    .from('profiles')
    .select('id, nome, departamento')
    .eq('role', 'colaborador')
    .eq('status', 'ativo')
    .order('nome', { ascending: true });

  if (departamento) {
    equipeQuery = equipeQuery.or(
      `lider_id.eq.${liderId},and(lider_id.is.null,departamento.eq.${departamento})`,
    );
  } else {
    equipeQuery = equipeQuery.eq('lider_id', liderId);
  }

  const { data: equipe, error: equipeError } = await equipeQuery;

  if (equipeError) {
    throw new Error(equipeError.message);
  }

  const colaboradorIds = (equipe ?? []).map((item) => item.id);

  if (colaboradorIds.length === 0) {
    return [];
  }

  const { data: pdis, error: pdisError } = await supabase
    .from('planos_desenvolvimento')
    .select(
      `*,
      colaborador:profiles!planos_desenvolvimento_colaborador_id_fkey(nome, departamento),
      criado_por:profiles!planos_desenvolvimento_criado_por_id_fkey(nome)`,
    )
    .in('colaborador_id', colaboradorIds)
    .order('created_at', { ascending: true });

  if (pdisError) {
    throw new Error(pdisError.message);
  }

  const pdiMap = new Map<string, PlanoDesenvolvimento[]>();

  for (const row of (pdis ?? []) as PdiRow[]) {
    const mapped = mapPdi(row);
    const lista = pdiMap.get(mapped.colaboradorId) ?? [];
    lista.push(mapped);
    pdiMap.set(mapped.colaboradorId, lista);
  }

  return (equipe ?? []).map((colaborador) => {
    const lista = pdiMap.get(colaborador.id) ?? [];

    return {
      colaboradorId: colaborador.id,
      colaboradorNome: colaborador.nome,
      departamento: colaborador.departamento,
      total: lista.length,
      concluidos: lista.filter((item) => item.status === 'concluido').length,
      vencidos: lista.filter((item) => item.status === 'vencido').length,
      emAndamento: lista.filter((item) => item.status === 'em_andamento').length,
      abertos: lista.filter((item) => item.status === 'aberto').length,
      pdis: lista,
    };
  });
}

export async function atualizarProgresso(
  pdiId: string,
  dados: AtualizarPDIInput,
  autorId: string,
): Promise<PlanoDesenvolvimento> {
  const patch: PdiUpdate = {};

  if (dados.status !== undefined) {
    patch.status = dados.status;
  }

  if (dados.progressoPct !== undefined) {
    patch.progresso_pct = dados.progressoPct;
  }

  if (dados.observacoesResponsavel !== undefined) {
    patch.observacoes_responsavel = dados.observacoesResponsavel;
  }

  if (dados.observacoesColaborador !== undefined) {
    patch.observacoes_colaborador = dados.observacoesColaborador;
  }

  const { data, error } = await supabase
    .from('planos_desenvolvimento')
    .update(patch)
    .eq('id', pdiId)
    .select(
      `*,
      colaborador:profiles!planos_desenvolvimento_colaborador_id_fkey(nome, departamento),
      criado_por:profiles!planos_desenvolvimento_criado_por_id_fkey(nome)`,
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (dados.comentarioHistorico || dados.evolucaoCiclo) {
    const comentario = dados.evolucaoCiclo
      ? `Evolução no ciclo: ${PDI_EVOLUCAO_LABELS[dados.evolucaoCiclo]}${dados.comentarioHistorico ? ` — ${dados.comentarioHistorico}` : ''}`
      : dados.comentarioHistorico;

    if (comentario) {
      await supabase.from('pdi_atualizacoes').insert({
        pdi_id: pdiId,
        autor_id: autorId,
        status_anterior: data.status,
        status_novo: data.status,
        progresso_anterior: data.progresso_pct,
        progresso_novo: data.progresso_pct,
        comentario,
      });
    }
  }

  return mapPdi(data as PdiRow);
}

export async function cancelarPDI(
  pdiId: string,
  autorId: string,
  motivo: string,
): Promise<PlanoDesenvolvimento> {
  return atualizarProgresso(
    pdiId,
    {
      status: 'cancelado',
      observacoesResponsavel: motivo.trim(),
      comentarioHistorico: `PDI cancelado: ${motivo.trim()}`,
    },
    autorId,
  );
}

export async function buscarHistoricoPDI(pdiId: string): Promise<PdiAtualizacao[]> {
  const { data, error } = await supabase
    .from('pdi_atualizacoes')
    .select(`*, autor:profiles!pdi_atualizacoes_autor_id_fkey(nome)`)
    .eq('pdi_id', pdiId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as AtualizacaoRow[]).map(mapAtualizacao);
}

export async function buscarPDIsComVencimentoProximo(dias = 7): Promise<PlanoDesenvolvimento[]> {
  await processarAlertasPdi();

  const hoje = new Date();
  const limite = new Date();
  limite.setDate(limite.getDate() + dias);

  const hojeIso = hoje.toISOString().split('T')[0];
  const limiteIso = limite.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('planos_desenvolvimento')
    .select(
      `*,
      colaborador:profiles!planos_desenvolvimento_colaborador_id_fkey(nome, departamento),
      criado_por:profiles!planos_desenvolvimento_criado_por_id_fkey(nome)`,
    )
    .in('status', ['aberto', 'em_andamento'])
    .gte('prazo', hojeIso)
    .lte('prazo', limiteIso)
    .order('prazo', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as PdiRow[]).map(mapPdi);
}

export async function buscarMetricasColaborador(
  colaboradorId: string,
): Promise<PdiMetricasColaborador> {
  const ano = new Date().getFullYear();
  const pdis = await buscarPDIsDoColaborador(colaboradorId);

  return {
    concluidosAno: pdis.filter(
      (item) => item.status === 'concluido' && item.createdAt.startsWith(String(ano)),
    ).length,
    emAndamento: pdis.filter((item) =>
      ['aberto', 'em_andamento', 'vencido'].includes(item.status),
    ).length,
  };
}

export async function buscarEstatisticasPDI(): Promise<PdiEstatisticas> {
  await processarAlertasPdi();

  const { data, error } = await supabase
    .from('planos_desenvolvimento')
    .select(
      `id, status, eixo, created_at, concluido_em, colaborador:profiles!planos_desenvolvimento_colaborador_id_fkey(departamento)`,
    );

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Array<{
    id: string;
    status: PdiStatus;
    eixo: PdiEixo;
    created_at: string;
    concluido_em: string | null;
    colaborador: { departamento: string | null } | null;
  }>;

  const totalPorStatus: PdiEstatisticas['totalPorStatus'] = {
    aberto: 0,
    em_andamento: 0,
    concluido: 0,
    vencido: 0,
    cancelado: 0,
  };

  const porEixo: PdiEstatisticas['porEixo'] = {
    P1: 0,
    P2: 0,
    P3: 0,
    geral: 0,
  };

  const departamentos = new Map<string, number>();
  const diasConclusao: number[] = [];

  for (const row of rows) {
    totalPorStatus[row.status] += 1;
    porEixo[row.eixo] += 1;

    if (['aberto', 'em_andamento', 'vencido'].includes(row.status)) {
      const dept = row.colaborador?.departamento?.trim() || 'Sem departamento';
      departamentos.set(dept, (departamentos.get(dept) ?? 0) + 1);
    }

    if (row.status === 'concluido' && row.concluido_em) {
      const inicio = new Date(row.created_at).getTime();
      const fim = new Date(row.concluido_em).getTime();
      diasConclusao.push(Math.max(1, Math.round((fim - inicio) / (1000 * 60 * 60 * 24))));
    }
  }

  const total = rows.length;
  const concluidos = totalPorStatus.concluido;
  const ativos = totalPorStatus.aberto + totalPorStatus.em_andamento + totalPorStatus.vencido;
  const vencidos = totalPorStatus.vencido;

  return {
    totalAtivos: ativos,
    totalPorStatus,
    taxaConclusao: total > 0 ? Math.round((concluidos / total) * 100) : 0,
    mediaDiasConclusao:
      diasConclusao.length > 0
        ? Math.round(diasConclusao.reduce((sum, value) => sum + value, 0) / diasConclusao.length)
        : null,
    porEixo,
    topDepartamentosAbertos: [...departamentos.entries()]
      .map(([departamento, count]) => ({ departamento, total: count }))
      .sort((left, right) => right.total - left.total)
      .slice(0, 5),
    percentualVencidos: ativos > 0 ? Math.round((vencidos / ativos) * 100) : 0,
  };
}
