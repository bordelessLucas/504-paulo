import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

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
  Regras: createLazyNamedScreen(
    () => import('@/screens/shared/regras-screen'),
    'RegrasScreen',
  ),
  Aprovacoes: createLazyNamedScreen(
    () => import('@/screens/admin/aprovacoes-screen'),
    'AprovacoesScreen',
  ),
  PainelAnualEstrategico: createLazyNamedScreen(
    () => import('@/screens/admin/painel-anual-estrategico'),
    'PainelAnualEstrategicoScreen',
  ),
  RelatorioIndividual: createLazyNamedScreen(
    () => import('@/screens/desempenho/relatorio-individual-screen'),
    'RelatorioIndividualScreen',
  ),
  HistoricoQuinzenal: createLazyNamedScreen(
    () => import('@/screens/desempenho/historico-quinzenal-screen'),
    'HistoricoQuinzenalScreen',
  ),
  HistoricoSemestral: createLazyNamedScreen(
    () => import('@/screens/desempenho/historico-semestral-screen'),
    'HistoricoSemestralScreen',
  ),
  HistoricoDesligados: createLazyNamedScreen(
    () => import('@/screens/desempenho/historico-desligados-screen'),
    'HistoricoDesligadosScreen',
  ),
  ListaAtivos: createLazyNamedScreen(
    () => import('@/screens/desempenho/lista-ativos-screen'),
    'ListaAtivosScreen',
  ),
  CadastroCliente: createLazyNamedScreen(
    () => import('@/screens/admin/cadastro-cliente-screen'),
    'CadastroClienteScreen',
  ),
  CadastroAvaliadores: createLazyNamedScreen(
    () => import('@/screens/admin/cadastro-avaliadores-screen'),
    'CadastroAvaliadoresScreen',
  ),
  StatusSolicitacoes: createLazyNamedScreen(
    () => import('@/screens/desempenho/status-solicitacoes-screen'),
    'StatusSolicitacoesScreen',
  ),
  AnaliseAvaliadores: createLazyNamedScreen(
    () => import('@/screens/ceo/analise-avaliadores-screen'),
    'AnaliseAvaliadoresScreen',
  ),
  HistoricoReajuste: createLazyNamedScreen(
    () => import('@/screens/ceo/historico-reajuste-screen'),
    'HistoricoReajusteScreen',
  ),
  ImpactoCaixa: createLazyNamedScreen(
    () => import('@/screens/ceo/impacto-caixa-screen'),
    'ImpactoCaixaScreen',
  ),
  RankingPerformance: createLazyNamedScreen(
    () => import('@/screens/desempenho/ranking-performance-screen'),
    'RankingPerformanceScreen',
  ),
  AnalisePerfil: createLazyNamedScreen(
    () => import('@/screens/desempenho/analise-perfil-screen'),
    'AnalisePerfilScreen',
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
