import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useDrawerStatus } from '@react-navigation/drawer';
import type { NavigationProp } from '@react-navigation/native';
import { useEffect, useRef } from 'react';

import { useAppNavigation } from '@/navigation/app-navigation-context';
import type { MainTabParamList } from '@/navigation/types';

export function AppNavigationBridge() {
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();
  const drawerStatus = useDrawerStatus();
  const drawerStatusRef = useRef(drawerStatus);
  const { registerNavigator, registerDrawer, registerToggleDrawer, setDrawerStatus } = useAppNavigation();

  drawerStatusRef.current = drawerStatus;

  useEffect(() => {
    setDrawerStatus(drawerStatus);
  }, [drawerStatus, setDrawerStatus]);

  useEffect(() => {
    registerNavigator((routeName) => {
      navigation.navigate(routeName as never);
    });

    registerDrawer(() => {
      navigation.dispatch(DrawerActions.openDrawer());
    });

    registerToggleDrawer(() => {
      if (drawerStatusRef.current === 'open') {
        navigation.dispatch(DrawerActions.closeDrawer());
        return;
      }

      navigation.dispatch(DrawerActions.openDrawer());
    });

    return () => {
      registerNavigator(null);
      registerDrawer(null);
      registerToggleDrawer(null);
    };
  }, [navigation, registerDrawer, registerNavigator, registerToggleDrawer]);

  return null;
}
