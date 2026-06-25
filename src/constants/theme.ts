import "@/global.css";

import { Platform } from "react-native";

export const BrandColors = {
  primary: "#012D60",
  secondary: "#00A675",
  background: "#F0EDE4",
  card: "#FFFFFF",
  focus: "#6D5BFF",
  textOnPrimary: "#FFFFFF",
} as const;

export const Colors = {
  light: {
    text: "#1A2332",
    background: BrandColors.background,
    backgroundElement: BrandColors.card,
    backgroundSelected: "#E5E1D6",
    textSecondary: "#5C6570",
    border: "rgba(1, 45, 96, 0.1)",
    primary: BrandColors.primary,
    secondary: BrandColors.secondary,
    accent: BrandColors.primary,
    accentMuted: "rgba(1, 45, 96, 0.08)",
    focus: BrandColors.focus,
    danger: "#D64545",
    dangerMuted: "#FDEBEC",
    inputBackground: BrandColors.card,
    placeholder: "#8A9199",
    overlay: "rgba(1, 45, 96, 0.45)",
    textOnPrimary: BrandColors.textOnPrimary,
  },
  dark: {
    text: "#F0EDE4",
    background: "#011A38",
    backgroundElement: "#012D60",
    backgroundSelected: "#023A72",
    textSecondary: "#A8B4C4",
    border: "rgba(240, 237, 228, 0.12)",
    primary: BrandColors.primary,
    secondary: BrandColors.secondary,
    accent: "#3D8FD4",
    accentMuted: "rgba(61, 143, 212, 0.15)",
    focus: BrandColors.focus,
    danger: "#FF7369",
    dangerMuted: "#3D2624",
    inputBackground: "#012D60",
    placeholder: "#8A9BB0",
    overlay: "rgba(0, 0, 0, 0.72)",
    textOnPrimary: BrandColors.textOnPrimary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

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

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
} as const;

export const Radius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
} as const;

export const PressedOpacity = 0.88;
export const DisabledOpacity = 0.55;

export type SemanticTone = "success" | "warning" | "danger" | "info" | "neutral";

export const SemanticColors = {
  light: {
    success: { bg: "#DCFCE7", text: "#166534" },
    warning: { bg: "#FEF3C7", text: "#92400E" },
    danger: { bg: "#FEE2E2", text: "#991B1B" },
    info: { bg: "#DBEAFE", text: "#1E40AF" },
    neutral: { bg: "#ECEFF1", text: "#455A64" },
  },
  dark: {
    success: { bg: "#14532D", text: "#86EFAC" },
    warning: { bg: "#78350F", text: "#FCD34D" },
    danger: { bg: "#7F1D1D", text: "#FCA5A5" },
    info: { bg: "#1E3A5F", text: "#93C5FD" },
    neutral: { bg: "#1E293B", text: "#94A3B8" },
  },
} as const;

export const SemaforoColors = {
  verde: "#2ECC71",
  amarelo: "#F1C40F",
  laranja: "#E67E22",
  vermelho: "#E74C3C",
  cinza: "#9CA3AF",
} as const;

export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: BrandColors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: { elevation: 3 },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: BrandColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: { elevation: 6 },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: BrandColors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
    },
    android: { elevation: 16 },
    default: {},
  }),
} as const;

export const MaxContentWidth = 420;
