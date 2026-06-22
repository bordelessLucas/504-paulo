import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentType } from 'react';

import type { MainTabParamList, TabIconName } from '@/navigation/types';
import { AdminDashboardScreen } from '@/screens/admin/admin-dashboard-screen';
import { ComplianceScreen } from '@/screens/admin/compliance-screen';
import { DashboardsGerenciaisScreen } from '@/screens/admin/dashboards-gerenciais-screen';
import { VisaoEstrategicaScreen } from '@/screens/admin/visao-estrategica-screen';
import { AprovacoesScreen } from '@/screens/admin/aprovacoes-screen';
import { PainelAnualEstrategicoScreen } from '@/screens/admin/painel-anual-estrategico';
import { PainelAvaliacaoScreen } from '@/screens/avaliacao/painel-screen';
import { MinhaEquipeTabScreen } from '@/screens/avaliacao/minha-equipe-tab-screen';
import { ColaboradorTabScreen } from '@/screens/colaborador/colaborador-tab-screen';
import { MinhasAvaliacoesScreen } from '@/screens/colaborador/minhas-avaliacoes-screen';
import { PainelReajusteScreen } from '@/screens/gerente/painel-reajuste-screen';
import { PerfilScreen } from '@/screens/shared/perfil-screen';
import { MetodologiaScreen } from '@/screens/shared/metodologia-screen';

export const TAB_SCREENS: Record<keyof MainTabParamList, ComponentType> = {
  DashboardColaborador: ColaboradorTabScreen,
  MinhasAvaliacoes: MinhasAvaliacoesScreen,
  PainelAvaliacao: PainelAvaliacaoScreen,
  MinhaEquipe: MinhaEquipeTabScreen,
  PainelReajuste: PainelReajusteScreen,
  AdminDashboard: AdminDashboardScreen,
  DashboardsGerenciais: DashboardsGerenciaisScreen,
  VisaoEstrategica: VisaoEstrategicaScreen,
  Compliance: ComplianceScreen,
  Metodologia: MetodologiaScreen,
  Aprovacoes: AprovacoesScreen,
  PainelAnualEstrategico: PainelAnualEstrategicoScreen,
  Perfil: PerfilScreen,
};

export function TabIcon({ name, color }: { name: TabIconName; color: string }) {
  return <Ionicons color={color} name={name} size={20} />;
}
