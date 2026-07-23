import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Fonts } from '@/constants/theme';
import { createLazyNamedScreen } from '@/navigation/lazy-tab-screen';
import { useTheme } from '@/hooks/use-theme';

export type ColaboradorStackParamList = {
  Dashboard: undefined;
  PDIList: undefined;
  PDIDetail: { pdiId: string };
};

const DashboardColaboradorScreen = createLazyNamedScreen(
  () => import('@/screens/colaborador/dashboard-screen'),
  'DashboardColaboradorScreen',
);
const PDIListColaboradorScreen = createLazyNamedScreen(
  () => import('@/screens/pdi/PDIListColaboradorScreen'),
  'PDIListColaboradorScreen',
);
const PDIDetailScreen = createLazyNamedScreen(
  () => import('@/screens/pdi/PDIDetailScreen'),
  'PDIDetailRouteScreen',
);

const Stack = createNativeStackNavigator<ColaboradorStackParamList>();

export function ColaboradorStackNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontFamily: Fonts.sansSemiBold,
          fontSize: 16,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.background },
      }}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardColaboradorScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PDIList"
        component={PDIListColaboradorScreen}
        options={{ title: 'Meus PDIs', headerBackTitle: 'Voltar' }}
      />
      <Stack.Screen
        name="PDIDetail"
        component={PDIDetailScreen}
        options={{ title: 'Detalhe do PDI', headerBackTitle: 'Voltar' }}
      />
    </Stack.Navigator>
  );
}
