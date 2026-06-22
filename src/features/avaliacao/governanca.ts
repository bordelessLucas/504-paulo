import { classificarPorIma, type ClassificacaoDesempenho } from '@/features/avaliacao/ima';

export type AcaoGovernanca =
  | 'nenhuma'
  | 'justificativa_obrigatoria'
  | 'evidencia_obrigatoria'
  | 'pdi_urgente'
  | 'alerta_critico'
  | 'bloqueio_melhoria_salarial';

export type RegraGovernancaResult = {
  acoes: AcaoGovernanca[];
  classificacao: ClassificacaoDesempenho | null;
  mensagem: string | null;
};

export function avaliarGovernancaResposta(nota: number): AcaoGovernanca[] {
  const acoes: AcaoGovernanca[] = [];
  if (nota <= 1) {
    acoes.push('justificativa_obrigatoria');
  }
  if (nota >= 3) {
    acoes.push('evidencia_obrigatoria');
  }
  return acoes;
}

export function avaliarGovernancaAvaliacao(params: {
  mediaPonderada: number | null;
  faltouAutoavaliacao?: boolean;
}): RegraGovernancaResult {
  const acoes: AcaoGovernanca[] = [];
  const classificacao = classificarPorIma(params.mediaPonderada);
  let mensagem: string | null = null;

  if (params.faltouAutoavaliacao) {
    acoes.push('bloqueio_melhoria_salarial');
    mensagem = 'Autoavaliação não realizada — bloqueio de melhoria salarial.';
  }

  if (params.mediaPonderada !== null) {
    if (params.mediaPonderada < 1.0) {
      acoes.push('alerta_critico');
      mensagem = 'Média crítica — notificação à diretoria e análise de desligamento.';
    } else if (params.mediaPonderada < 1.8) {
      acoes.push('pdi_urgente');
      mensagem = 'PDI de urgência (30 dias) obrigatório.';
    }
  }

  return { acoes, classificacao, mensagem };
}

export const MARCOS_TEMPORAIS = {
  quinzenal: {
    label: 'Avaliação de Bordo',
    descricao: 'Feedback operacional após desembarque.',
  },
  semestral: {
    meses: 6,
    label: 'Avaliação Semestral',
    descricao: 'Consolidação para incentivos e financiamento de cursos.',
  },
  anual: {
    meses: 12,
    label: 'Análise Estratégica Anual',
    descricao: 'Reajustes, promoções e PLR.',
  },
} as const;

export const DIREITOS_COLABORADOR = [
  'Receber feedback construtivo baseado nas perguntas de cada seção.',
  'Solicitar revisão de nota em até 5 dias úteis após o ciclo.',
  'Acessar integralmente o histórico de avaliações.',
  'Participar da elaboração do PDI.',
  'Ser avaliado com critérios objetivos e imparciais.',
] as const;

export const DEVERES_COLABORADOR = [
  'Realizar a autoavaliação no prazo do cronograma.',
  'Participar das sessões de feedback com a liderança.',
  'Cumprir metas e ações do PDI.',
  'Manter CIR e certificações de embarque atualizados.',
  'Comunicar impedimentos de escala com antecedência.',
] as const;
