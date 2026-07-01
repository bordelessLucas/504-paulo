import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

import { useAppNavigation } from '@/navigation/app-navigation-context';
import type { MainTabParamList } from '@/navigation/types';

/** Registra navegação por tabs (mobile) no contexto global. */
export function AppNavigationTabBridge() {
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();
  const { registerNavigator, registerDrawer, registerToggleDrawer, setDrawerStatus } = useAppNavigation();

  useEffect(() => {
    registerNavigator((routeName) => {
      navigation.navigate(routeName);
    });

    registerDrawer(() => {
      // Mobile usa bottom tabs — drawer não aplicável.
    });

    registerToggleDrawer(() => {
      // Mobile usa bottom tabs — drawer não aplicável.
    });

    setDrawerStatus('closed');

    return () => {
      registerNavigator(null);
      registerDrawer(null);
      registerToggleDrawer(null);
    };
  }, [navigation, registerDrawer, registerNavigator, registerToggleDrawer, setDrawerStatus]);

  return null;
}
