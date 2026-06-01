import { DrawerToggleButton } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Fonts } from '@/constants/theme';
import { FormularioAvaliacaoScreen } from '@/screens/avaliacao/formulario-avaliacao-screen';
import { ListaColaboradoresScreen } from '@/screens/avaliacao/lista-colaboradores-screen';
import { useTheme } from '@/hooks/use-theme';

export type AvaliacaoStackParamList = {
  ListaColaboradores: undefined;
  FormularioAvaliacao: {
    avaliadoId: string;
    avaliadoNome: string;
  };
};

const Stack = createNativeStackNavigator<AvaliacaoStackParamList>();

export function AvaliacaoStackNavigator() {
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
        name="ListaColaboradores"
        component={ListaColaboradoresScreen}
        options={{
          title: 'Painel de avaliação',
          headerLeft: () => <DrawerToggleButton tintColor={theme.text} />,
        }}
      />
      <Stack.Screen
        name="FormularioAvaliacao"
        component={FormularioAvaliacaoScreen}
        options={{
          title: 'Avaliação',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack.Navigator>
  );
}
