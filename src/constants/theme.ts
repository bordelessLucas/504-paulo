import "@/global.css";

import { Platform, type ViewStyle } from "react-native";

import { brand, brandRgb } from "@/constants/brand";

export { brand, brandRgb, BrandColors } from "@/constants/brand";

export type ThemeColors = {
  text: string;
  textSecondary: string;
  textMuted: string;
  background: string;
  backgroundElement: string;
  surface: string;
  backgroundSelected: string;
  border: string;
  primary: string;
  secondary: string;
  accent: string;
  accentSoft: string;
  accentMuted: string;
  focus: string;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  danger: string;
  dangerMuted: string;
  info: string;
  infoMuted: string;
  inputBackground: string;
  placeholder: string;
  overlay: string;
  textOnPrimary: string;
};

export type ThemeMode = "light" | "dark";

export const layout = {
  radius: { sm: 12, md: 16, lg: 20, xl: 24, pill: 999 },
  space: { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 48 },
  touchMin: 52,
} as const;

/** @deprecated Prefer layout.space */
export const Spacing = {
  half: 2,
  one: 4,
  two: layout.space.xs,
  three: layout.space.md,
  four: layout.space.lg,
  five: layout.space.xl,
  six: layout.space.xxl,
} as const;

/** @deprecated Prefer layout.radius */
export const Radius = {
  sm: layout.radius.sm,
  md: layout.radius.md,
  lg: layout.radius.lg,
  xl: layout.radius.xl,
  "2xl": layout.radius.xl,
  pill: layout.radius.pill,
} as const;

export const PressedOpacity = 0.92;
export const DisabledOpacity = 0.55;

const darkColors: ThemeColors = {
  text: brand.cream,
  textSecondary: "#A8B4C4",
  textMuted: "#6B7A8D",
  background: brand.navyDeep,
  backgroundElement: brand.navy,
  surface: brand.navy,
  backgroundSelected: brand.navyMid,
  border: "rgba(240, 237, 228, 0.12)",
  primary: brand.navy,
  secondary: brand.green,
  accent: brand.green,
  accentSoft: brand.greenSoft,
  accentMuted: brandRgb(brand.green, 0.15),
  focus: "#6D5BFF",
  success: "#2ECC71",
  successMuted: brandRgb("#2ECC71", 0.15),
  warning: "#F1C40F",
  warningMuted: brandRgb("#F1C40F", 0.15),
  danger: "#FF7369",
  dangerMuted: "#3D2624",
  info: "#3D8FD4",
  infoMuted: brandRgb("#3D8FD4", 0.15),
  inputBackground: brand.navy,
  placeholder: "#8A9BB0",
  overlay: "rgba(0, 0, 0, 0.72)",
  textOnPrimary: brand.white,
};

const lightColors: ThemeColors = {
  text: "#1A2332",
  textSecondary: "#5C6570",
  textMuted: "#8A9199",
  background: brand.cream,
  backgroundElement: brand.white,
  surface: brand.white,
  backgroundSelected: "#E5E1D6",
  border: brandRgb(brand.navy, 0.1),
  primary: brand.navy,
  secondary: brand.green,
  accent: brand.green,
  accentSoft: brand.greenBright,
  accentMuted: brandRgb(brand.green, 0.1),
  focus: "#6D5BFF",
  success: "#166534",
  successMuted: "#DCFCE7",
  warning: "#92400E",
  warningMuted: "#FEF3C7",
  danger: "#D64545",
  dangerMuted: "#FDEBEC",
  info: "#1E40AF",
  infoMuted: "#DBEAFE",
  inputBackground: brand.white,
  placeholder: "#8A9199",
  overlay: brandRgb(brand.navy, 0.45),
  textOnPrimary: brand.white,
};

export const Colors = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ThemeColor = keyof ThemeColors;

export type SemanticTone = "success" | "warning" | "danger" | "info" | "neutral" | "accent";

export const SemanticColors = {
  light: {
    success: { bg: lightColors.successMuted, text: lightColors.success, border: brandRgb(lightColors.success, 0.35) },
    warning: { bg: lightColors.warningMuted, text: lightColors.warning, border: brandRgb(lightColors.warning, 0.35) },
    danger: { bg: lightColors.dangerMuted, text: lightColors.danger, border: brandRgb(lightColors.danger, 0.35) },
    info: { bg: lightColors.infoMuted, text: lightColors.info, border: brandRgb(lightColors.info, 0.35) },
    neutral: { bg: "#ECEFF1", text: "#455A64", border: brandRgb("#455A64", 0.35) },
    accent: { bg: lightColors.accentMuted, text: lightColors.accent, border: brandRgb(lightColors.accent, 0.35) },
  },
  dark: {
    success: { bg: darkColors.successMuted, text: darkColors.success, border: brandRgb(darkColors.success, 0.35) },
    warning: { bg: darkColors.warningMuted, text: darkColors.warning, border: brandRgb(darkColors.warning, 0.35) },
    danger: { bg: darkColors.dangerMuted, text: darkColors.danger, border: brandRgb(darkColors.danger, 0.35) },
    info: { bg: darkColors.infoMuted, text: darkColors.info, border: brandRgb(darkColors.info, 0.35) },
    neutral: { bg: "#1E293B", text: "#94A3B8", border: brandRgb("#94A3B8", 0.35) },
    accent: { bg: darkColors.accentMuted, text: darkColors.accent, border: brandRgb(darkColors.accent, 0.35) },
  },
} as const;

export const SemaforoColors = {
  verde: "#2ECC71",
  amarelo: "#F1C40F",
  laranja: "#E67E22",
  vermelho: "#E74C3C",
  cinza: "#9CA3AF",
} as const;

export type ShadowVariant = "card" | "glow" | "fab" | "button";

export type ThemeShadows = Record<ShadowVariant, ViewStyle>;

export function createShadow(colors: ThemeColors): ThemeShadows {
  const shadowBase = colors.primary;

  return {
    card: Platform.select({
      ios: {
        shadowColor: shadowBase,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      default: {},
    }) ?? {},
    glow: Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      default: {},
    }) ?? {},
    fab: Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
      },
      android: { elevation: 10 },
      default: {},
    }) ?? {},
    button: Platform.select({
      ios: {
        shadowColor: shadowBase,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      default: {},
    }) ?? {},
  };
}

/** @deprecated Use createShadow(colors).card */
export const Shadows = {
  sm: createShadow(lightColors).card,
  md: createShadow(lightColors).glow,
  lg: createShadow(lightColors).fab,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: "Biko_Regular",
    sansMedium: "Biko_Medium",
    sansSemiBold: "Biko_Bold",
    sansBold: "Biko_Bold",
    display: "Korataki_Regular",
    mono: "ui-monospace",
  },
  default: {
    sans: "Biko_Regular",
    sansMedium: "Biko_Medium",
    sansSemiBold: "Biko_Bold",
    sansBold: "Biko_Bold",
    display: "Korataki_Regular",
    mono: "monospace",
  },
  web: {
    sans: "Biko_Regular, var(--font-body)",
    sansMedium: "Biko_Medium, var(--font-body)",
    sansSemiBold: "Biko_Bold, var(--font-body)",
    sansBold: "Biko_Bold, var(--font-body)",
    display: "Korataki_Regular, var(--font-display)",
    mono: "var(--font-mono)",
  },
});

export const MaxContentWidth = 420;

export const THEME_STORAGE_KEY = "@avalia/theme-mode";

export function getSemanticColors(mode: ThemeMode) {
  return SemanticColors[mode];
}
