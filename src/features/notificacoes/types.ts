export type TipoNotificacao =
  | 'avaliacao_registrada'
  | 'autoavaliacao_enviada'
  | 'solicitacao_reajuste'
  | 'solicitacao_pendente_ceo'
  | 'solicitacao_aprovada'
  | 'solicitacao_recusada'
  | 'incidente_registrado'
  | 'decisao_anual_registrada'
  | 'pdi_criado'
  | 'pdi_atualizado'
  | 'pdi_vencendo'
  | 'pdi_vencido'
  | 'pdi_concluido';

export type Notificacao = {
  id: string;
  destinatarioId: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  metadata: Record<string, unknown>;
  lida: boolean;
  createdAt: string;
};

export const TIPO_NOTIFICACAO_ICON: Record<TipoNotificacao, string> = {
  avaliacao_registrada: 'clipboard-outline',
  autoavaliacao_enviada: 'document-text-outline',
  solicitacao_reajuste: 'trending-up-outline',
  solicitacao_pendente_ceo: 'checkmark-circle-outline',
  solicitacao_aprovada: 'checkmark-done-outline',
  solicitacao_recusada: 'close-circle-outline',
  incidente_registrado: 'warning-outline',
  decisao_anual_registrada: 'calendar-outline',
  pdi_criado: 'bulb-outline',
  pdi_atualizado: 'sync-outline',
  pdi_vencendo: 'time-outline',
  pdi_vencido: 'alert-circle-outline',
  pdi_concluido: 'trophy-outline',
};
