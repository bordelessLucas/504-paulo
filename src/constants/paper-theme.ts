import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from "react-native-paper";

import { brand } from "@/constants/brand";
import { Colors } from "@/constants/theme";

const light = Colors.light;
const dark = Colors.dark;

export const PaperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    primary: light.primary,
    onPrimary: light.textOnPrimary,
    primaryContainer: light.accentMuted,
    onPrimaryContainer: light.primary,
    secondary: light.secondary,
    onSecondary: light.textOnPrimary,
    secondaryContainer: light.successMuted,
    onSecondaryContainer: light.success,
    background: light.background,
    onBackground: light.text,
    surface: light.surface,
    onSurface: light.text,
    surfaceVariant: light.backgroundSelected,
    onSurfaceVariant: light.textSecondary,
    outline: light.border,
    outlineVariant: light.border,
    error: light.danger,
    onError: light.textOnPrimary,
    elevation: {
      level0: "transparent",
      level1: light.surface,
      level2: light.backgroundSelected,
      level3: light.background,
      level4: brand.cream,
      level5: "#E5E1D6",
    },
  },
};

export const PaperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 12,
  colors: {
    ...MD3DarkTheme.colors,
    primary: dark.accent,
    onPrimary: dark.textOnPrimary,
    primaryContainer: dark.accentMuted,
    onPrimaryContainer: dark.accentSoft,
    secondary: dark.secondary,
    onSecondary: dark.textOnPrimary,
    secondaryContainer: dark.successMuted,
    onSecondaryContainer: dark.success,
    background: dark.background,
    onBackground: dark.text,
    surface: dark.surface,
    onSurface: dark.text,
    surfaceVariant: dark.backgroundSelected,
    onSurfaceVariant: dark.textSecondary,
    outline: dark.border,
    outlineVariant: dark.border,
    error: dark.danger,
    onError: dark.text,
    elevation: {
      level0: "transparent",
      level1: dark.surface,
      level2: dark.backgroundSelected,
      level3: brand.navyMid,
      level4: "#034680",
      level5: "#04528E",
    },
  },
};
