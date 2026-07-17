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

/** Preferência escolhida pelo usuário. `system` segue o esquema do SO. */
export type ThemePreference = "light" | "dark" | "system";

type ThemeContextValue = {
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  shadow: ThemeShadows;
  layout: typeof layout;
  semantic: ReturnType<typeof getSemanticColors>;
  isReady: boolean;
  /** Preferência persistida (`light` | `dark` | `system`). */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  toggleLightMode: () => void;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
};

function isValidPreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function resolveMode(preference: ThemePreference, systemScheme: "light" | "dark" | null | undefined): ThemeMode {
  if (preference === "system") {
    return systemScheme === "light" ? "light" : "dark";
  }
  return preference;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("dark");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadPreference() {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (mounted && isValidPreference(stored)) {
          setPreferenceState(stored);
        }
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    }

    void loadPreference();

    return () => {
      mounted = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const mode = resolveMode(preference, systemScheme);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setPreference(next);
    },
    [setPreference],
  );

  const toggleLightMode = useCallback(() => {
    setPreference(mode === "dark" ? "light" : "dark");
  }, [mode, setPreference]);

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
      preference,
      setPreference,
      toggleLightMode,
      setMode,
    };
  }, [isReady, mode, preference, setMode, setPreference, toggleLightMode]);

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
