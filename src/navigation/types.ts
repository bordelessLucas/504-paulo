import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

/**
 * Rotas canônicas DNA PERFORMANCE (Excel Rev Jul 20 2026).
 * Menus por papel apontam para estas telas sem duplicar 101 screens.
 */
export type MainTabParamList = {
  DashboardColaborador: undefined;
  MinhasAvaliacoes: undefined;
  PainelAvaliacao: undefined;
  MinhaEquipe: undefined;
  PainelReajuste: undefined;
  AdminDashboard: undefined;
  DashboardsGerenciais: undefined;
  VisaoEstrategica: undefined;
  Compliance: undefined;
  Metodologia: undefined;
  MatrizPeso: undefined;
  Regras: undefined;
  Aprovacoes: undefined;
  PainelAnualEstrategico: undefined;
  RelatorioIndividual: { colaboradorId?: string; nome?: string } | undefined;
  HistoricoQuinzenal: undefined;
  HistoricoSemestral: undefined;
  HistoricoDesligados: undefined;
  ListaAtivos: undefined;
  CadastroCliente: undefined;
  CadastroAvaliadores: undefined;
  StatusSolicitacoes: undefined;
  AnaliseAvaliadores: undefined;
  HistoricoReajuste: undefined;
  ImpactoCaixa: undefined;
  RankingPerformance: undefined;
  AnalisePerfil: undefined;
  CadastroCargos: undefined;
  Perfil: undefined;
};

export type TabIconName = ComponentProps<typeof Ionicons>['name'];

/** @deprecated Use MainTabParamList */
export type MainDrawerParamList = MainTabParamList;
