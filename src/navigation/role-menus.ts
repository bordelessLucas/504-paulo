import type { MainTabParamList, TabIconName } from '@/navigation/types';
import {
  isAdminDashboardRole,
  isGerencialDashboardRole,
  isGerenteRole,
  isSupervisorGestorRole,
  type UserRole,
} from '@/types/supabase';

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
  Estrategico: {
    name: 'Estrategico',
    label: 'Estratégico',
    icon: 'analytics-outline',
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
  Perfil: {
    name: 'Perfil',
    label: 'Perfil',
    icon: 'person-outline',
  },
};

export function getPrimaryTabForRole(role: UserRole): keyof MainTabParamList {
  if (role === 'colaborador') {
    return 'DashboardColaborador';
  }

  if (isSupervisorGestorRole(role)) {
    return 'PainelAvaliacao';
  }

  if (isGerenteRole(role)) {
    return 'Estrategico';
  }

  if (role === 'ceo') {
    return 'DashboardsGerenciais';
  }

  if (isAdminDashboardRole(role)) {
    return 'AdminDashboard';
  }

  return 'DashboardColaborador';
}

export function getTabsForRole(role: UserRole): TabMenuItem[] {
  if (role === 'colaborador') {
    return [
      TAB_DEFINITIONS.DashboardColaborador,
      TAB_DEFINITIONS.MinhasAvaliacoes,
      TAB_DEFINITIONS.Perfil,
    ];
  }

  if (isSupervisorGestorRole(role)) {
    return [TAB_DEFINITIONS.PainelAvaliacao, TAB_DEFINITIONS.MinhaEquipe, TAB_DEFINITIONS.Perfil];
  }

  if (isGerenteRole(role)) {
    return [TAB_DEFINITIONS.Estrategico, TAB_DEFINITIONS.MinhaEquipe, TAB_DEFINITIONS.Perfil];
  }

  if (isGerencialDashboardRole(role)) {
    return [
      TAB_DEFINITIONS.DashboardsGerenciais,
      TAB_DEFINITIONS.AdminDashboard,
      TAB_DEFINITIONS.Aprovacoes,
      TAB_DEFINITIONS.Perfil,
    ];
  }

  if (isAdminDashboardRole(role)) {
    return [TAB_DEFINITIONS.AdminDashboard, TAB_DEFINITIONS.Aprovacoes, TAB_DEFINITIONS.Perfil];
  }

  return [TAB_DEFINITIONS.DashboardColaborador, TAB_DEFINITIONS.Perfil];
}

/** @deprecated Drawer removido — use getTabsForRole */
export function getMenuItemsForRole(role: UserRole) {
  return getTabsForRole(role);
}

/** @deprecated Drawer removido — use getPrimaryTabForRole */
export function getInitialRouteForRole(role: UserRole) {
  return getPrimaryTabForRole(role);
}

/** @deprecated Drawer removido */
export function canAccessRoute(role: UserRole, routeName: keyof MainTabParamList) {
  return getTabsForRole(role).some((item) => item.name === routeName);
}

/** @deprecated Drawer removido */
export function getDrawerItemStyle() {
  return undefined;
}
