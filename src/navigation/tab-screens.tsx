import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandColors } from '@/constants/theme';
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

type TabIconProps = {
  name: TabIconName;
  color: string;
  focused?: boolean;
};

export function TabIcon({ name, color, focused = false }: TabIconProps) {
  return (
    <View style={styles.wrapper}>
      <Ionicons color={color} name={name} size={22} />
      {focused ? <View style={styles.indicator} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 28,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: BrandColors.secondary,
  },
});
