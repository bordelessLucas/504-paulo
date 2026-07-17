import { useThemeContext, type ThemePreference } from "@/contexts/ThemeContext";
import type { ThemeColors } from "@/constants/theme";

export type ThemeHook = ThemeColors & {
  colors: ThemeColors;
  mode: "light" | "dark";
  isDark: boolean;
  shadow: ReturnType<typeof import("@/constants/theme").createShadow>;
  layout: typeof import("@/constants/theme").layout;
  semantic: ReturnType<typeof import("@/constants/theme").getSemanticColors>;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  toggleLightMode: () => void;
  setMode: (mode: "light" | "dark") => void;
};

/**
 * Retorna cores + tokens do design system.
 * Compatível com uso legado (`theme.primary`) e novo (`theme.colors.accent`).
 */
export function useTheme(): ThemeHook {
  const ctx = useThemeContext();
  return {
    ...ctx.colors,
    colors: ctx.colors,
    mode: ctx.mode,
    isDark: ctx.isDark,
    shadow: ctx.shadow,
    layout: ctx.layout,
    semantic: ctx.semantic,
    preference: ctx.preference,
    setPreference: ctx.setPreference,
    toggleLightMode: ctx.toggleLightMode,
    setMode: ctx.setMode,
  };
}
