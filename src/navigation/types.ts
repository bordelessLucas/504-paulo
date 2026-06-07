import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

export type MainTabParamList = {
  DashboardColaborador: undefined;
  MinhasAvaliacoes: undefined;
  PainelAvaliacao: undefined;
  MinhaEquipe: undefined;
  PainelReajuste: undefined;
  AdminDashboard: undefined;
  DashboardsGerenciais: undefined;
  Aprovacoes: undefined;
  PainelAnualEstrategico: undefined;
  Perfil: undefined;
};

export type TabIconName = ComponentProps<typeof Ionicons>['name'];

/** @deprecated Use MainTabParamList */
export type MainDrawerParamList = MainTabParamList;
