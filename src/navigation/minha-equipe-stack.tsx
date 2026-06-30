import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Fonts } from '@/constants/theme';
import { FormularioAvaliacaoScreen } from '@/screens/avaliacao/formulario-avaliacao-screen';
import { MinhaEquipeScreen } from '@/screens/avaliacao/minha-equipe-screen';
import { PDIDetailScreen } from '@/screens/pdi/PDIDetailScreen';
import { PDIEquipeScreen } from '@/screens/pdi/PDIEquipeScreen';
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
        options={{ title: 'Detalhe do PDI', headerBackTitle: 'Voltar' }}>
        {({ route }) => <PDIDetailScreen pdiId={route.params.pdiId} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
