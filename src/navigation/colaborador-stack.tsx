import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Fonts } from '@/constants/theme';
import { DashboardColaboradorScreen } from '@/screens/colaborador/dashboard-screen';
import { PDIDetailScreen } from '@/screens/pdi/PDIDetailScreen';
import { PDIListColaboradorScreen } from '@/screens/pdi/PDIListColaboradorScreen';
import { useTheme } from '@/hooks/use-theme';

export type ColaboradorStackParamList = {
  Dashboard: undefined;
  PDIList: undefined;
  PDIDetail: { pdiId: string };
};

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
        options={{ title: 'Detalhe do PDI', headerBackTitle: 'Voltar' }}>
        {({ route }) => <PDIDetailScreen pdiId={route.params.pdiId} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
