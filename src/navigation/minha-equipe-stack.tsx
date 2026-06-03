import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Fonts } from '@/constants/theme';
import { FormularioAvaliacaoScreen } from '@/screens/avaliacao/formulario-avaliacao-screen';
import { MinhaEquipeScreen } from '@/screens/avaliacao/minha-equipe-screen';
import { useTheme } from '@/hooks/use-theme';

export type MinhaEquipeStackParamList = {
  MinhaEquipeLista: undefined;
  FormularioAvaliacao: {
    avaliadoId: string;
    avaliadoNome: string;
  };
};

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
        options={{ title: 'Minha equipe' }}
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
