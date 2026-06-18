import type { TipoNotificacao } from '@/features/notificacoes/types';
import { canAccessAprovacoesTab } from '@/navigation/role-menus';
import type { MainTabParamList } from '@/navigation/types';
import {
  isAdminDashboardRole,
  isPainelAnualEstrategicoRole,
  type UserRole,
} from '@/types/supabase';

export function resolveNotificationTab(
  tipo: TipoNotificacao,
  role: UserRole | null | undefined,
): keyof MainTabParamList | null {
  if (!role) {
    return null;
  }

  switch (tipo) {
    case 'avaliacao_registrada':
    case 'autoavaliacao_enviada':
    case 'solicitacao_reajuste':
    case 'solicitacao_pendente_ceo':
    case 'solicitacao_aprovada':
    case 'solicitacao_recusada':
      if (canAccessAprovacoesTab(role)) {
        return 'Aprovacoes';
      }

      if (role === 'colaborador') {
        return 'DashboardColaborador';
      }

      return null;

    case 'decisao_anual_registrada':
      return isPainelAnualEstrategicoRole(role) ? 'PainelAnualEstrategico' : null;

    case 'incidente_registrado':
      if (role === 'colaborador') {
        return 'DashboardColaborador';
      }

      return isAdminDashboardRole(role) ? 'AdminDashboard' : null;

    default:
      return null;
  }
}
