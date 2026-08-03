import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import type { MainTabParamList } from '@/navigation/types';

type NavigateToTab = (routeName: keyof MainTabParamList, params?: object) => void;
type OpenDrawer = () => void;
type ToggleDrawer = () => void;
export type DrawerStatus = 'open' | 'closed';

type AppNavigationContextValue = {
  registerNavigator: (navigate: NavigateToTab | null) => void;
  registerDrawer: (openDrawer: OpenDrawer | null) => void;
  registerToggleDrawer: (toggleDrawer: ToggleDrawer | null) => void;
  setDrawerStatus: (status: DrawerStatus) => void;
  navigateToTab: (routeName: keyof MainTabParamList, params?: object) => boolean;
  openDrawer: () => void;
  toggleDrawer: () => void;
  drawerStatus: DrawerStatus;
};

const AppNavigationContext = createContext<AppNavigationContextValue | null>(null);

export function AppNavigationProvider({ children }: { children: ReactNode }) {
  const navigatorRef = useRef<NavigateToTab | null>(null);
  const drawerRef = useRef<OpenDrawer | null>(null);
  const toggleDrawerRef = useRef<ToggleDrawer | null>(null);
  const [drawerStatus, setDrawerStatus] = useState<DrawerStatus>('closed');

  const registerNavigator = useCallback((navigate: NavigateToTab | null) => {
    navigatorRef.current = navigate;
  }, []);

  const registerDrawer = useCallback((openDrawer: OpenDrawer | null) => {
    drawerRef.current = openDrawer;
  }, []);

  const registerToggleDrawer = useCallback((toggleDrawer: ToggleDrawer | null) => {
    toggleDrawerRef.current = toggleDrawer;
  }, []);

  const navigateToTab = useCallback((routeName: keyof MainTabParamList, params?: object) => {
    if (!navigatorRef.current) {
      return false;
    }

    navigatorRef.current(routeName, params);
    return true;
  }, []);

  const openDrawer = useCallback(() => {
    drawerRef.current?.();
  }, []);

  const toggleDrawer = useCallback(() => {
    toggleDrawerRef.current?.();
  }, []);

  const value = useMemo(
    () => ({
      registerNavigator,
      registerDrawer,
      registerToggleDrawer,
      setDrawerStatus,
      navigateToTab,
      openDrawer,
      toggleDrawer,
      drawerStatus,
    }),
    [drawerStatus, navigateToTab, openDrawer, registerDrawer, registerNavigator, registerToggleDrawer, toggleDrawer],
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
