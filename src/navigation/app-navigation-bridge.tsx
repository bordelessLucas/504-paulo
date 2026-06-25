import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useEffect } from 'react';

import { useAppNavigation } from '@/navigation/app-navigation-context';
import type { MainTabParamList } from '@/navigation/types';

export function AppNavigationBridge() {
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();
  const { registerNavigator, registerDrawer } = useAppNavigation();

  useEffect(() => {
    registerNavigator((routeName) => {
      navigation.navigate(routeName);
    });

    registerDrawer(() => {
      navigation.dispatch(DrawerActions.openDrawer());
    });

    return () => {
      registerNavigator(null);
      registerDrawer(null);
    };
  }, [navigation, registerDrawer, registerNavigator]);

  return null;
}
