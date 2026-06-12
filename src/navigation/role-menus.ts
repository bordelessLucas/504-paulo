import type { MainTabParamList, TabIconName } from '@/navigation/types';
import { isCeoApprovalRole, isRhValidationRole } from '@/features/aprovacoes/approval-roles';
import type { UserRole } from '@/types/supabase';

export const ROLE_LABELS: Record<UserRole, string> = {
  colaborador: 'Colaborador',
  supervisor: 'Supervisor',
  gestor: 'Gestor',
  gerente: 'Gerente',
  rh: 'RH',
  ceo: 'CEO',
  admin: 'Administrador',
};

export type TabMenuItem = {
  name: keyof MainTabParamList;
  label: string;
  icon: TabIconName;
};

const TAB_DEFINITIONS: Record<keyof MainTabParamList, TabMenuItem> = {
  DashboardColaborador: {
    name: 'DashboardColaborador',
    label: 'Dashboard',
    icon: 'home-outline',
  },
  MinhasAvaliacoes: {
    name: 'MinhasAvaliacoes',
    label: 'Avaliações',
    icon: 'document-text-outline',
  },
  PainelAvaliacao: {
    name: 'PainelAvaliacao',
    label: 'Avaliação',
    icon: 'clipboard-outline',
  },
  MinhaEquipe: {
    name: 'MinhaEquipe',
    label: 'Equipe',
    icon: 'people-outline',
  },
  PainelReajuste: {
    name: 'PainelReajuste',
    label: 'Reajuste',
    icon: 'trending-up-outline',
  },
  AdminDashboard: {
    name: 'AdminDashboard',
    label: 'Admin',
    icon: 'grid-outline',
  },
  DashboardsGerenciais: {
    name: 'DashboardsGerenciais',
    label: 'Gerencial',
    icon: 'stats-chart-outline',
  },
  Aprovacoes: {
    name: 'Aprovacoes',
    label: 'Aprovações',
    icon: 'checkmark-circle-outline',
  },
  PainelAnualEstrategico: {
    name: 'PainelAnualEstrategico',
    label: 'Anual',
    icon: 'calendar-outline',
  },
  Perfil: {
    name: 'Perfil',
    label: 'Perfil',
    icon: 'person-outline',
  },
};

const { Perfil: PERFIL_TAB } = TAB_DEFINITIONS;

/**
 * Tabs por papel — alinhado ao fluxo RH valida → CEO aprova.
 *
 * | Papel        | Responsabilidade principal                          |
 * |--------------|-----------------------------------------------------|
 * | colaborador  | Dashboard, histórico próprio, autoavaliação         |
 * | supervisor   | Avaliar equipe (quinzenal)                          |
 * | gestor       | Avaliar equipe (semestral) + reajuste               |
 * | gerente      | Reajuste, painel anual, avaliação, equipe           |
 * | rh           | Validar solicitações/avaliações, cadastro, incidentes |
 * | admin        | Como RH + dashboard gerencial + cadastros             |
 * | ceo          | Aprovação final, visão executiva, gerar acessos     |
 */
export function getPrimaryTabForRole(role: UserRole): keyof MainTabParamList {
  switch (role) {
    case 'colaborador':
      return 'DashboardColaborador';
    case 'supervisor':
    case 'gestor':
      return 'PainelAvaliacao';
    case 'gerente':
      return 'PainelReajuste';
    case 'rh':
    case 'admin':
      return 'Aprovacoes';
    case 'ceo':
      return 'DashboardsGerenciais';
    default:
      return 'DashboardColaborador';
  }
}

export function getTabLabelForRole(tabName: keyof MainTabParamList, role: UserRole): string {
  if (tabName === 'Aprovacoes') {
    return isCeoApprovalRole(role) ? 'Aprovações' : 'Validações';
  }

  return TAB_DEFINITIONS[tabName].label;
}

export function getTabsForRole(role: UserRole): TabMenuItem[] {
  switch (role) {
    case 'colaborador':
      return [
        TAB_DEFINITIONS.DashboardColaborador,
        TAB_DEFINITIONS.MinhasAvaliacoes,
        PERFIL_TAB,
      ];

    case 'supervisor':
      return [TAB_DEFINITIONS.PainelAvaliacao, TAB_DEFINITIONS.MinhaEquipe, PERFIL_TAB];

    case 'gestor':
      return [
        TAB_DEFINITIONS.PainelAvaliacao,
        TAB_DEFINITIONS.MinhaEquipe,
        TAB_DEFINITIONS.PainelReajuste,
        PERFIL_TAB,
      ];

    case 'gerente':
      return [
        TAB_DEFINITIONS.PainelReajuste,
        TAB_DEFINITIONS.PainelAnualEstrategico,
        TAB_DEFINITIONS.PainelAvaliacao,
        TAB_DEFINITIONS.MinhaEquipe,
        PERFIL_TAB,
      ];

    case 'rh':
      return [
        TAB_DEFINITIONS.Aprovacoes,
        TAB_DEFINITIONS.AdminDashboard,
        TAB_DEFINITIONS.PainelAnualEstrategico,
        TAB_DEFINITIONS.PainelAvaliacao,
        PERFIL_TAB,
      ];

    case 'ceo':
      return [
        TAB_DEFINITIONS.DashboardsGerenciais,
        TAB_DEFINITIONS.PainelAnualEstrategico,
        TAB_DEFINITIONS.PainelAvaliacao,
        TAB_DEFINITIONS.AdminDashboard,
        TAB_DEFINITIONS.Aprovacoes,
        PERFIL_TAB,
      ];

    case 'admin':
      return [
        TAB_DEFINITIONS.Aprovacoes,
        TAB_DEFINITIONS.AdminDashboard,
        TAB_DEFINITIONS.DashboardsGerenciais,
        TAB_DEFINITIONS.PainelAnualEstrategico,
        TAB_DEFINITIONS.PainelAvaliacao,
        PERFIL_TAB,
      ];

    default:
      return [TAB_DEFINITIONS.DashboardColaborador, PERFIL_TAB];
  }
}

export function canAccessTab(role: UserRole, tabName: keyof MainTabParamList): boolean {
  return getTabsForRole(role).some((item) => item.name === tabName);
}

/** @deprecated Drawer removido — use getTabsForRole */
export function getMenuItemsForRole(role: UserRole) {
  return getTabsForRole(role);
}

/** @deprecated Drawer removido — use getPrimaryTabForRole */
export function getInitialRouteForRole(role: UserRole) {
  return getPrimaryTabForRole(role);
}

/** @deprecated Drawer removido — use canAccessTab */
export function canAccessRoute(role: UserRole, routeName: keyof MainTabParamList) {
  return canAccessTab(role, routeName);
}

/** @deprecated Drawer removido */
export function getDrawerItemStyle() {
  return undefined;
}

/** Indica se o papel participa do fluxo de validação (RH ou CEO). */
export function canAccessAprovacoesTab(role: UserRole | null | undefined): boolean {
  return isRhValidationRole(role) || isCeoApprovalRole(role);
}
