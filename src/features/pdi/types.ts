export type PdiEixo = 'P1' | 'P2' | 'P3' | 'geral';

export type PdiStatus =
  | 'aberto'
  | 'em_andamento'
  | 'concluido'
  | 'vencido'
  | 'cancelado';

export type PdiEvolucaoCiclo = 'sim' | 'parcial' | 'nao';

export type PlanoDesenvolvimento = {
  id: string;
  colaboradorId: string;
  colaboradorNome?: string;
  avaliacaoOrigemId: string | null;
  criadoPorId: string;
  criadoPorNome?: string;
  eixo: PdiEixo;
  titulo: string;
  descricao: string | null;
  indicadorSucesso: string;
  prazo: string;
  status: PdiStatus;
  progressoPct: number;
  observacoesResponsavel: string | null;
  observacoesColaborador: string | null;
  concluidoEm: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PdiAtualizacao = {
  id: string;
  pdiId: string;
  autorId: string;
  autorNome?: string;
  statusAnterior: string | null;
  statusNovo: string | null;
  progressoAnterior: number | null;
  progressoNovo: number | null;
  comentario: string | null;
  createdAt: string;
};

export type CriarPDIInput = {
  colaboradorId: string;
  avaliacaoOrigemId?: string | null;
  criadoPorId: string;
  eixo: PdiEixo;
  titulo: string;
  descricao?: string;
  indicadorSucesso: string;
  prazo: string;
};

export type AtualizarPDIInput = {
  status?: PdiStatus;
  progressoPct?: number;
  observacoesResponsavel?: string;
  observacoesColaborador?: string;
  comentarioHistorico?: string;
  evolucaoCiclo?: PdiEvolucaoCiclo;
};

export type PdiFiltros = {
  status?: PdiStatus | PdiStatus[];
  eixo?: PdiEixo;
  ano?: number;
};

export type PdiColaboradorResumo = {
  colaboradorId: string;
  colaboradorNome: string;
  departamento: string | null;
  total: number;
  concluidos: number;
  vencidos: number;
  emAndamento: number;
  abertos: number;
  pdis: PlanoDesenvolvimento[];
};

export type PdiEstatisticas = {
  totalAtivos: number;
  totalPorStatus: Record<PdiStatus, number>;
  taxaConclusao: number;
  mediaDiasConclusao: number | null;
  porEixo: Record<PdiEixo, number>;
  topDepartamentosAbertos: Array<{ departamento: string; total: number }>;
  percentualVencidos: number;
};

export type PdiMetricasColaborador = {
  concluidosAno: number;
  emAndamento: number;
};
