import { createContext, useContext, type ReactNode } from 'react';

type NavigationLayoutContextValue = {
  hasBottomTabs: boolean;
};

const NavigationLayoutContext = createContext<NavigationLayoutContextValue>({
  hasBottomTabs: true,
});

type NavigationLayoutProviderProps = {
  hasBottomTabs: boolean;
  children: ReactNode;
};

export function NavigationLayoutProvider({
  hasBottomTabs,
  children,
}: NavigationLayoutProviderProps) {
  return (
    <NavigationLayoutContext.Provider value={{ hasBottomTabs }}>
      {children}
    </NavigationLayoutContext.Provider>
  );
}

export function useNavigationLayout() {
  return useContext(NavigationLayoutContext);
}
