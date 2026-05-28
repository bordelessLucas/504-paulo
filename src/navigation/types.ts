import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

import type { UserRole } from '@/types/supabase';

export type MainDrawerParamList = {
  ColaboradorDashboard: undefined;
  MinhasAvaliacoes: undefined;
  PainelAvaliacao: undefined;
  MinhaEquipe: undefined;
  PainelAdmin: undefined;
  Aprovacoes: undefined;
  Perfil: undefined;
};

export type DrawerIconName = ComponentProps<typeof Ionicons>['name'];

export type DrawerMenuItem = {
  name: keyof MainDrawerParamList;
  label: string;
  icon: DrawerIconName;
  roles: UserRole[];
};
