import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Fonts } from '@/constants/theme';
import { createLazyNamedScreen } from '@/navigation/lazy-tab-screen';
import { useTheme } from '@/hooks/use-theme';

export type MinhaEquipeStackParamList = {
  MinhaEquipeLista: undefined;
  FormularioAvaliacao: {
    avaliadoId: string;
    avaliadoNome: string;
  };
  PDIEquipe: undefined;
  PDIDetail: { pdiId: string };
};

const MinhaEquipeScreen = createLazyNamedScreen(
  () => import('@/screens/avaliacao/minha-equipe-screen'),
  'MinhaEquipeScreen',
);
const FormularioAvaliacaoScreen = createLazyNamedScreen(
  () => import('@/screens/avaliacao/formulario-avaliacao-screen'),
  'FormularioAvaliacaoScreen',
);
const PDIEquipeScreen = createLazyNamedScreen(
  () => import('@/screens/pdi/PDIEquipeScreen'),
  'PDIEquipeScreen',
);
const PDIDetailScreen = createLazyNamedScreen(
  () => import('@/screens/pdi/PDIDetailScreen'),
  'PDIDetailRouteScreen',
);

const Stack = createNativeStackNavigator<MinhaEquipeStackParamList>();

export function MinhaEquipeStackNavigator() {
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
        name="MinhaEquipeLista"
        component={MinhaEquipeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FormularioAvaliacao"
        component={FormularioAvaliacaoScreen}
        options={{
          title: 'Avaliação',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="PDIEquipe"
        component={PDIEquipeScreen}
        options={{ title: 'PDI da equipe', headerBackTitle: 'Voltar' }}
      />
      <Stack.Screen
        name="PDIDetail"
        component={PDIDetailScreen}
        options={{ title: 'Detalhe do PDI', headerBackTitle: 'Voltar' }}
      />
    </Stack.Navigator>
  );
}
