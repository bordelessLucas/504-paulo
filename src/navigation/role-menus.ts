import type { DrawerMenuItem, MainDrawerParamList } from '@/navigation/types';
import type { UserRole } from '@/types/supabase';

export const ROLE_LABELS: Record<UserRole, string> = {
  colaborador: 'Colaborador',
  supervisor: 'Supervisor',
  gestor: 'Gestor',
  gerente: 'Gerente',
  ceo: 'CEO',
  admin: 'Administrador',
};

const ALL_MENU_ITEMS: DrawerMenuItem[] = [
  {
    name: 'ColaboradorDashboard',
    label: 'Dashboard',
    icon: 'home-outline',
    roles: ['colaborador'],
  },
  {
    name: 'MinhasAvaliacoes',
    label: 'Minhas avaliações',
    icon: 'document-text-outline',
    roles: ['colaborador'],
  },
  {
    name: 'PainelAvaliacao',
    label: 'Painel de avaliação',
    icon: 'clipboard-outline',
    roles: ['supervisor', 'gestor', 'gerente', 'ceo', 'admin'],
  },
  {
    name: 'MinhaEquipe',
    label: 'Minha equipe',
    icon: 'people-outline',
    roles: ['supervisor', 'gestor', 'gerente'],
  },
  {
    name: 'PainelAdmin',
    label: 'Painel administrativo',
    icon: 'grid-outline',
    roles: ['ceo', 'admin'],
  },
  {
    name: 'Aprovacoes',
    label: 'Aprovações',
    icon: 'checkmark-circle-outline',
    roles: ['ceo', 'admin'],
  },
  {
    name: 'Perfil',
    label: 'Perfil',
    icon: 'person-outline',
    roles: ['colaborador', 'supervisor', 'gestor', 'gerente', 'ceo', 'admin'],
  },
];

export function getMenuItemsForRole(role: UserRole): DrawerMenuItem[] {
  return ALL_MENU_ITEMS.filter((item) => item.roles.includes(role));
}

export function getInitialRouteForRole(role: UserRole): keyof MainDrawerParamList {
  if (role === 'colaborador') {
    return 'ColaboradorDashboard';
  }

  if (role === 'supervisor' || role === 'gestor' || role === 'gerente') {
    return 'PainelAvaliacao';
  }

  return 'PainelAdmin';
}

export function canAccessRoute(role: UserRole, routeName: keyof MainDrawerParamList): boolean {
  return getMenuItemsForRole(role).some((item) => item.name === routeName);
}

export function getDrawerItemStyle(role: UserRole, routeName: keyof MainDrawerParamList) {
  return canAccessRoute(role, routeName) ? undefined : { display: 'none' as const };
}
