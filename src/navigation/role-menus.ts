import type { MainTabParamList, TabIconName } from '@/navigation/types';
import { isCeoApprovalRole, isRhValidationRole } from '@/features/aprovacoes/approval-roles';
import type { UserRole } from '@/types/supabase';

export const ROLE_LABELS: Record<UserRole, string> = {
  colaborador: 'Colaborador',
  supervisor: 'Supervisor de Bordo',
  gestor: 'Gestores de Base',
  gerente: 'Gerente Offshore',
  rh: 'RH',
  ceo: 'CEO',
  admin: 'Administrador',
};

export type TabMenuItem = {
  name: keyof MainTabParamList;
  label: string;
  icon: TabIconName;
};

export type MenuSection = {
  title: string;
  items: TabMenuItem[];
};

function menuSection(title: string, ...names: (keyof MainTabParamList)[]): MenuSection {
  return {
    title,
    items: names.map((name) => TAB_DEFINITIONS[name]),
  };
}

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
    label: 'Painel de Avaliações',
    icon: 'clipboard-outline',
  },
  MinhaEquipe: {
    name: 'MinhaEquipe',
    label: 'Lista de Colaboradores',
    icon: 'people-outline',
  },
  PainelReajuste: {
    name: 'PainelReajuste',
    label: 'Reajuste Salarial',
    icon: 'trending-up-outline',
  },
  AdminDashboard: {
    name: 'AdminDashboard',
    label: 'Cadastros / Admin',
    icon: 'grid-outline',
  },
  DashboardsGerenciais: {
    name: 'DashboardsGerenciais',
    label: 'Gerencial',
    icon: 'stats-chart-outline',
  },
  VisaoEstrategica: {
    name: 'VisaoEstrategica',
    label: 'Estratégico',
    icon: 'analytics-outline',
  },
  Compliance: {
    name: 'Compliance',
    label: 'Registro de Incidente',
    icon: 'warning-outline',
  },
  Metodologia: {
    name: 'Metodologia',
    label: 'Metodologia de Escala',
    icon: 'book-outline',
  },
  MatrizPeso: {
    name: 'MatrizPeso',
    label: 'Matriz de Peso',
    icon: 'git-network-outline',
  },
  Regras: {
    name: 'Regras',
    label: 'Regras / Direitos / Deveres',
    icon: 'shield-checkmark-outline',
  },
  Aprovacoes: {
    name: 'Aprovacoes',
    label: 'Aprovações',
    icon: 'checkmark-circle-outline',
  },
  PainelAnualEstrategico: {
    name: 'PainelAnualEstrategico',
    label: 'Análise Anual',
    icon: 'calendar-outline',
  },
  RelatorioIndividual: {
    name: 'RelatorioIndividual',
    label: 'Relatório Individual',
    icon: 'person-outline',
  },
  HistoricoQuinzenal: {
    name: 'HistoricoQuinzenal',
    label: 'Histórico Quinzenal',
    icon: 'time-outline',
  },
  HistoricoSemestral: {
    name: 'HistoricoSemestral',
    label: 'Histórico Semestral',
    icon: 'calendar-outline',
  },
  HistoricoDesligados: {
    name: 'HistoricoDesligados',
    label: 'Colaboradores Desligados',
    icon: 'exit-outline',
  },
  ListaAtivos: {
    name: 'ListaAtivos',
    label: 'Colaboradores Ativos',
    icon: 'people-circle-outline',
  },
  CadastroCliente: {
    name: 'CadastroCliente',
    label: 'Cadastro de Cliente',
    icon: 'business-outline',
  },
  CadastroAvaliadores: {
    name: 'CadastroAvaliadores',
    label: 'Cadastro de Avaliadores',
    icon: 'ribbon-outline',
  },
  StatusSolicitacoes: {
    name: 'StatusSolicitacoes',
    label: 'Status das Solicitações',
    icon: 'list-outline',
  },
  AnaliseAvaliadores: {
    name: 'AnaliseAvaliadores',
    label: 'Análise dos Avaliadores',
    icon: 'bar-chart-outline',
  },
  HistoricoReajuste: {
    name: 'HistoricoReajuste',
    label: 'Histórico de Reajuste',
    icon: 'cash-outline',
  },
  ImpactoCaixa: {
    name: 'ImpactoCaixa',
    label: 'Impacto no Caixa',
    icon: 'wallet-outline',
  },
  RankingPerformance: {
    name: 'RankingPerformance',
    label: 'Ranking de Performance',
    icon: 'trophy-outline',
  },
  AnalisePerfil: {
    name: 'AnalisePerfil',
    label: 'Análise de Perfil',
    icon: 'pulse-outline',
  },
  Perfil: {
    name: 'Perfil',
    label: 'Perfil',
    icon: 'person-circle-outline',
  },
};

const { Perfil: PERFIL_TAB } = TAB_DEFINITIONS;

/**
 * Tabs por papel — alinhado ao DNA PERFORMANCE (Excel Rev Jul 20 2026).
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
  const seen = new Set<keyof MainTabParamList>();
  const tabs: TabMenuItem[] = [];

  for (const section of getMenuSectionsForRole(role)) {
    for (const item of section.items) {
      if (seen.has(item.name)) {
        continue;
      }
      seen.add(item.name);
      tabs.push(item);
    }
  }

  return tabs;
}

export function canAccessTab(role: UserRole, tabName: keyof MainTabParamList): boolean {
  return getTabsForRole(role).some((item) => item.name === tabName);
}

/** Sidebar DNA PERFORMANCE — grupos semânticos por papel. */
export function getMenuSectionsForRole(role: UserRole): MenuSection[] {
  switch (role) {
    case 'colaborador':
      return [
        menuSection('DNA-TEK', 'Regras', 'Metodologia'),
        menuSection('Autoavaliação', 'DashboardColaborador', 'StatusSolicitacoes', 'MinhasAvaliacoes'),
        menuSection('Conta', 'Perfil'),
      ];

    case 'supervisor':
      return [
        menuSection('DNA-TEK', 'PainelAvaliacao', 'Regras', 'Metodologia', 'MatrizPeso'),
        menuSection(
          'Avaliação Quinzenal',
          'MinhaEquipe',
          'RelatorioIndividual',
          'HistoricoQuinzenal',
          'HistoricoSemestral',
          'HistoricoDesligados',
        ),
        menuSection('Autoavaliação', 'StatusSolicitacoes'),
        menuSection('Conta', 'Perfil'),
      ];

    case 'gestor':
      return [
        menuSection('DNA-TEK', 'PainelAvaliacao', 'Regras', 'Metodologia', 'MatrizPeso'),
        menuSection(
          'Avaliação Semestral',
          'MinhaEquipe',
          'RelatorioIndividual',
          'HistoricoQuinzenal',
          'HistoricoSemestral',
          'HistoricoDesligados',
        ),
        menuSection('Análise Anual', 'ListaAtivos', 'HistoricoDesligados', 'AnalisePerfil', 'PainelAnualEstrategico'),
        menuSection('Conta', 'Perfil'),
      ];

    case 'gerente':
      return [
        menuSection('DNA-TEK', 'PainelAvaliacao', 'Regras', 'Metodologia', 'MatrizPeso'),
        menuSection(
          'Avaliação Semestral',
          'MinhaEquipe',
          'RelatorioIndividual',
          'HistoricoQuinzenal',
          'HistoricoSemestral',
          'HistoricoDesligados',
        ),
        menuSection('Autoavaliação', 'Aprovacoes'),
        menuSection('Melhoria Salarial', 'PainelReajuste', 'HistoricoReajuste'),
        menuSection('Análise Anual', 'ListaAtivos', 'HistoricoDesligados', 'AnalisePerfil', 'PainelAnualEstrategico'),
        menuSection('Conta', 'Perfil'),
      ];

    case 'rh':
      return [
        menuSection('DNA-TEK', 'PainelAvaliacao', 'Regras', 'Metodologia', 'MatrizPeso'),
        menuSection('Cadastro', 'AdminDashboard', 'CadastroCliente', 'Compliance'),
        menuSection('Dashboard', 'HistoricoReajuste', 'RankingPerformance', 'AnalisePerfil'),
        menuSection(
          'Avaliação Semestral',
          'MinhaEquipe',
          'RelatorioIndividual',
          'HistoricoQuinzenal',
          'HistoricoSemestral',
          'HistoricoDesligados',
        ),
        menuSection('Autoavaliação', 'StatusSolicitacoes', 'Aprovacoes'),
        menuSection('Melhoria Salarial', 'PainelReajuste', 'HistoricoReajuste'),
        menuSection('Análise Anual', 'ListaAtivos', 'HistoricoDesligados', 'AnalisePerfil', 'PainelAnualEstrategico'),
        menuSection('Conta', 'Perfil'),
      ];

    case 'ceo':
      return [
        menuSection('DNA-TEK', 'PainelAvaliacao', 'Regras', 'Metodologia', 'MatrizPeso'),
        menuSection(
          'Dashboard',
          'DashboardsGerenciais',
          'AnaliseAvaliadores',
          'HistoricoReajuste',
          'ImpactoCaixa',
          'VisaoEstrategica',
        ),
        menuSection(
          'Avaliações',
          'RelatorioIndividual',
          'HistoricoQuinzenal',
          'HistoricoSemestral',
          'Aprovacoes',
        ),
        menuSection('Melhoria Salarial', 'PainelReajuste', 'HistoricoReajuste'),
        menuSection('Análise Anual', 'ListaAtivos', 'HistoricoDesligados', 'AnalisePerfil', 'PainelAnualEstrategico'),
        menuSection('Admin', 'AdminDashboard', 'Compliance'),
        menuSection('Conta', 'Perfil'),
      ];

    case 'admin':
      return [
        menuSection('DNA-TEK', 'PainelAvaliacao', 'Regras', 'Metodologia', 'MatrizPeso', 'Compliance'),
        menuSection('Cadastro', 'AdminDashboard', 'CadastroCliente', 'CadastroAvaliadores'),
        menuSection(
          'Dashboard',
          'DashboardsGerenciais',
          'AnaliseAvaliadores',
          'HistoricoReajuste',
          'ImpactoCaixa',
          'RankingPerformance',
          'VisaoEstrategica',
        ),
        menuSection(
          'Avaliações',
          'MinhaEquipe',
          'RelatorioIndividual',
          'HistoricoQuinzenal',
          'HistoricoSemestral',
          'HistoricoDesligados',
          'Aprovacoes',
        ),
        menuSection('Melhoria Salarial', 'PainelReajuste', 'StatusSolicitacoes'),
        menuSection('Análise Anual', 'ListaAtivos', 'HistoricoDesligados', 'AnalisePerfil', 'PainelAnualEstrategico'),
        menuSection('Conta', 'Perfil'),
      ];

    default:
      return [menuSection('Principal', 'DashboardColaborador'), menuSection('Conta', 'Perfil')];
  }
}

export function getMenuItemsForRole(role: UserRole) {
  return getMenuSectionsForRole(role).flatMap((section) => section.items);
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
