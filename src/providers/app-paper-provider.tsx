import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { PaperDarkTheme, PaperLightTheme } from '@/constants/paper-theme';

export function AppPaperProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();

  return (
    <PaperProvider theme={colorScheme === 'dark' ? PaperDarkTheme : PaperLightTheme}>
      {children}
    </PaperProvider>
  );
}
