import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useEffect } from 'react';

import { useAppNavigation } from '@/navigation/app-navigation-context';
import type { MainTabParamList } from '@/navigation/types';

export function AppNavigationBridge() {
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();
  const { registerNavigator } = useAppNavigation();

  useEffect(() => {
    registerNavigator((routeName) => {
      navigation.navigate(routeName);
    });

    return () => {
      registerNavigator(null);
    };
  }, [navigation, registerNavigator]);

  return null;
}
