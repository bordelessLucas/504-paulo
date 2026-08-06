import type { MainTabParamList } from '@/navigation/types';
import { getPrimaryTabForRole, getTabsForRole, type TabMenuItem } from '@/navigation/role-menus';
import type { UserRole } from '@/types/supabase';

const MAX_BOTTOM_TABS = 4;

/** Atalhos da bottom bar mobile — prioriza home do papel + itens mais usados. */
export function getBottomTabsForRole(role: UserRole): TabMenuItem[] {
  const all = getTabsForRole(role);
  if (all.length === 0) return [];

  const primary = getPrimaryTabForRole(role);
  const preferredOrder = preferredTabsByRole(role);
  const selected: TabMenuItem[] = [];
  const seen = new Set<keyof MainTabParamList>();

  const push = (name: keyof MainTabParamList) => {
    if (seen.has(name) || selected.length >= MAX_BOTTOM_TABS) return;
    const item = all.find((tab) => tab.name === name);
    if (!item) return;
    seen.add(name);
    selected.push(item);
  };

  push(primary);
  for (const name of preferredOrder) {
    push(name);
  }
  for (const tab of all) {
    push(tab.name);
  }

  return selected;
}

function preferredTabsByRole(role: UserRole): Array<keyof MainTabParamList> {
  switch (role) {
    case 'colaborador':
      return ['DashboardColaborador', 'MinhasAvaliacoes', 'StatusSolicitacoes', 'Perfil'];
    case 'supervisor':
      return ['PainelAvaliacao', 'MinhaEquipe', 'RelatorioIndividual', 'Perfil'];
    case 'gestor':
      return ['PainelAvaliacao', 'MinhaEquipe', 'PainelReajuste', 'Perfil'];
    case 'gerente':
      return ['PainelReajuste', 'PainelAvaliacao', 'PainelAnualEstrategico', 'Perfil'];
    case 'rh':
      return ['Aprovacoes', 'AdminDashboard', 'DashboardsGerenciais', 'Perfil'];
    case 'ceo':
      return ['DashboardsGerenciais', 'Aprovacoes', 'ImpactoCaixa', 'Perfil'];
    case 'admin':
      return ['AdminDashboard', 'Aprovacoes', 'DashboardsGerenciais', 'Perfil'];
    default:
      return ['Perfil'];
  }
}
