import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react';

import type { MainTabParamList } from '@/navigation/types';

type NavigateToTab = (routeName: keyof MainTabParamList) => void;
type OpenDrawer = () => void;

type AppNavigationContextValue = {
  registerNavigator: (navigate: NavigateToTab | null) => void;
  registerDrawer: (openDrawer: OpenDrawer | null) => void;
  navigateToTab: (routeName: keyof MainTabParamList) => boolean;
  openDrawer: () => void;
};

const AppNavigationContext = createContext<AppNavigationContextValue | null>(null);

export function AppNavigationProvider({ children }: { children: ReactNode }) {
  const navigatorRef = useRef<NavigateToTab | null>(null);
  const drawerRef = useRef<OpenDrawer | null>(null);

  const registerNavigator = useCallback((navigate: NavigateToTab | null) => {
    navigatorRef.current = navigate;
  }, []);

  const registerDrawer = useCallback((openDrawer: OpenDrawer | null) => {
    drawerRef.current = openDrawer;
  }, []);

  const navigateToTab = useCallback((routeName: keyof MainTabParamList) => {
    if (!navigatorRef.current) {
      return false;
    }

    navigatorRef.current(routeName);
    return true;
  }, []);

  const openDrawer = useCallback(() => {
    drawerRef.current?.();
  }, []);

  const value = useMemo(
    () => ({
      registerNavigator,
      registerDrawer,
      navigateToTab,
      openDrawer,
    }),
    [navigateToTab, openDrawer, registerDrawer, registerNavigator],
  );

  return <AppNavigationContext.Provider value={value}>{children}</AppNavigationContext.Provider>;
}

export function useAppNavigation() {
  const context = useContext(AppNavigationContext);

  if (!context) {
    throw new Error('useAppNavigation deve ser usado dentro de AppNavigationProvider.');
  }

  return context;
}
