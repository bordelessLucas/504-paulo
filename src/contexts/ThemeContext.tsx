import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { StatusBar, useColorScheme as useSystemColorScheme } from "react-native";

import {
  Colors,
  THEME_STORAGE_KEY,
  createShadow,
  getSemanticColors,
  layout,
  type ThemeColors,
  type ThemeMode,
  type ThemeShadows,
} from "@/constants/theme";

type ThemeContextValue = {
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  shadow: ThemeShadows;
  layout: typeof layout;
  semantic: ReturnType<typeof getSemanticColors>;
  isReady: boolean;
  toggleLightMode: () => void;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
  /** Segue preferência do sistema quando não há valor salvo. */
  followSystem?: boolean;
};

export function ThemeProvider({ children, followSystem = false }: ThemeProviderProps) {
  const systemScheme = useSystemColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadMode() {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!mounted) return;

        if (stored === "light" || stored === "dark") {
          setModeState(stored);
        } else if (followSystem && systemScheme) {
          setModeState(systemScheme === "dark" ? "dark" : "light");
        }
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    }

    void loadMode();

    return () => {
      mounted = false;
    };
  }, [followSystem, systemScheme]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const toggleLightMode = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  const value = useMemo<ThemeContextValue>(() => {
    const colors = Colors[mode];
    return {
      colors,
      mode,
      isDark: mode === "dark",
      shadow: createShadow(colors),
      layout,
      semantic: getSemanticColors(mode),
      isReady,
      toggleLightMode,
      setMode,
    };
  }, [isReady, mode, setMode, toggleLightMode]);

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar barStyle={value.isDark ? "light-content" : "dark-content"} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return context;
}
