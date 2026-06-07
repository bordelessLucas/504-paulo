export type TipoSolicitacaoReajuste = 'reajuste' | 'vale' | 'bonificacao' | 'curso';

export const TIPOS_SOLICITACAO_REAJUSTE: TipoSolicitacaoReajuste[] = [
  'reajuste',
  'vale',
  'bonificacao',
  'curso',
];

export const TIPO_SOLICITACAO_REAJUSTE_LABELS: Record<TipoSolicitacaoReajuste, string> = {
  reajuste: 'Reajuste',
  vale: 'Vale',
  bonificacao: 'Bonificação',
  curso: 'Curso',
};
