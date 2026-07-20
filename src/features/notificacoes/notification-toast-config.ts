import type { ToastVariant } from '@/components/ui/toast';
import type { Notificacao, TipoNotificacao } from '@/features/notificacoes/types';
import { TIPO_NOTIFICACAO_ICON } from '@/features/notificacoes/types';
import type { TabIconName } from '@/navigation/types';

export type NotificationToastConfig = {
  icon: TabIconName;
  variant: ToastVariant;
};

const VARIANT_BY_TIPO: Record<TipoNotificacao, ToastVariant> = {
  avaliacao_registrada: 'info',
  autoavaliacao_enviada: 'info',
  solicitacao_reajuste: 'info',
  solicitacao_pendente_ceo: 'info',
  solicitacao_aprovada: 'success',
  solicitacao_recusada: 'error',
  incidente_registrado: 'error',
  decisao_anual_registrada: 'success',
  pdi_criado: 'info',
  pdi_atualizado: 'info',
  pdi_vencendo: 'info',
  pdi_vencido: 'error',
  pdi_concluido: 'success',
  ima_critico: 'error',
};

export function getNotificationToastConfig(notification: Notificacao): NotificationToastConfig {
  return {
    icon: TIPO_NOTIFICACAO_ICON[notification.tipo] as TabIconName,
    variant: VARIANT_BY_TIPO[notification.tipo] ?? 'info',
  };
}

export function truncateNotificationMessage(message: string, maxLength = 96): string {
  const trimmed = message.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}
