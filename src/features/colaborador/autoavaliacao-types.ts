export type AutoavaliacaoTipo =
  | 'financiamento_curso'
  | 'revisao_cargo_salario'
  | 'nova_qualificacao';

export type AutoavaliacaoChecklist = {
  semNoShow: boolean;
  semAdvertencias: boolean;
  treinamentosEmDia: boolean;
  mediaAcimaElegivel: boolean;
};

export type AutoavaliacaoSubmitPayload = {
  tipoSolicitacao: AutoavaliacaoTipo;
  qualificacoes: string;
  investimento: string;
  cursoNome: string;
  cursoInstituicao: string;
  valorEstimado: string;
  checklist: AutoavaliacaoChecklist;
};

export const AUTOAVALIACAO_TIPO_OPTIONS: AutoavaliacaoTipo[] = [
  'financiamento_curso',
  'revisao_cargo_salario',
  'nova_qualificacao',
];

export const AUTOAVALIACAO_TIPO_LABELS: Record<AutoavaliacaoTipo, string> = {
  financiamento_curso: 'Financiamento de curso',
  revisao_cargo_salario: 'Revisão de cargo/salário',
  nova_qualificacao: 'Nova qualificação',
};
