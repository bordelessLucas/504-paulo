import { PaperProvider } from "react-native-paper";

import { PaperDarkTheme, PaperLightTheme } from "@/constants/paper-theme";
import { useThemeContext } from "@/contexts/ThemeContext";

export function AppPaperProvider({ children }: { children: React.ReactNode }) {
  const { isDark } = useThemeContext();

  return <PaperProvider theme={isDark ? PaperDarkTheme : PaperLightTheme}>{children}</PaperProvider>;
}
