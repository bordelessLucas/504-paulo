import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandColors } from '@/constants/theme';
import { createLazyNamedScreen } from '@/navigation/lazy-tab-screen';
import type { MainTabParamList, TabIconName } from '@/navigation/types';

export const TAB_SCREENS: Record<keyof MainTabParamList, ComponentType> = {
  DashboardColaborador: createLazyNamedScreen(
    () => import('@/screens/colaborador/colaborador-tab-screen'),
    'ColaboradorTabScreen',
  ),
  MinhasAvaliacoes: createLazyNamedScreen(
    () => import('@/screens/colaborador/minhas-avaliacoes-screen'),
    'MinhasAvaliacoesScreen',
  ),
  PainelAvaliacao: createLazyNamedScreen(
    () => import('@/screens/avaliacao/painel-screen'),
    'PainelAvaliacaoScreen',
  ),
  MinhaEquipe: createLazyNamedScreen(
    () => import('@/screens/avaliacao/minha-equipe-tab-screen'),
    'MinhaEquipeTabScreen',
  ),
  PainelReajuste: createLazyNamedScreen(
    () => import('@/screens/gerente/painel-reajuste-screen'),
    'PainelReajusteScreen',
  ),
  AdminDashboard: createLazyNamedScreen(
    () => import('@/screens/admin/painel-admin-screen'),
    'PainelAdminScreen',
  ),
  DashboardsGerenciais: createLazyNamedScreen(
    () => import('@/screens/admin/dashboards-gerenciais-screen'),
    'DashboardsGerenciaisScreen',
  ),
  VisaoEstrategica: createLazyNamedScreen(
    () => import('@/screens/admin/visao-estrategica-screen'),
    'VisaoEstrategicaScreen',
  ),
  Compliance: createLazyNamedScreen(
    () => import('@/screens/admin/compliance-screen'),
    'ComplianceScreen',
  ),
  Metodologia: createLazyNamedScreen(
    () => import('@/screens/shared/metodologia-screen'),
    'MetodologiaScreen',
  ),
  Aprovacoes: createLazyNamedScreen(
    () => import('@/screens/admin/aprovacoes-screen'),
    'AprovacoesScreen',
  ),
  PainelAnualEstrategico: createLazyNamedScreen(
    () => import('@/screens/admin/painel-anual-estrategico'),
    'PainelAnualEstrategicoScreen',
  ),
  Perfil: createLazyNamedScreen(
    () => import('@/screens/shared/perfil-screen'),
    'PerfilScreen',
  ),
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
