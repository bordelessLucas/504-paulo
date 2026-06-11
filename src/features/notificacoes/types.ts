export type TipoNotificacao =
  | 'avaliacao_registrada'
  | 'autoavaliacao_enviada'
  | 'solicitacao_reajuste'
  | 'solicitacao_pendente_ceo'
  | 'solicitacao_aprovada'
  | 'solicitacao_recusada'
  | 'incidente_registrado'
  | 'decisao_anual_registrada';

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
};
