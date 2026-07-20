import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Fonts } from '@/constants/theme';
import { FormularioAvaliacaoScreen } from '@/screens/avaliacao/formulario-avaliacao-screen';
import { FormularioLoteScreen } from '@/screens/avaliacao/formulario-lote-screen';
import { HistoricoAvaliacoesScreen } from '@/screens/avaliacao/historico-avaliacoes-screen';
import { ListaColaboradoresScreen } from '@/screens/avaliacao/lista-colaboradores-screen';
import { useTheme } from '@/hooks/use-theme';

export type AvaliacaoStackParamList = {
  FormularioLote: undefined;
  ListaColaboradores: undefined;
  FormularioAvaliacao: {
    avaliadoId: string;
    avaliadoNome: string;
  };
  HistoricoAvaliacoes: {
    avaliadoId: string;
    avaliadoNome: string;
    revealAvaliador: boolean;
  };
};

const Stack = createNativeStackNavigator<AvaliacaoStackParamList>();

export function AvaliacaoStackNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="FormularioLote"
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
        name="FormularioLote"
        component={FormularioLoteScreen}
        options={{
          title: 'Avaliação em lote',
        }}
      />
      <Stack.Screen
        name="ListaColaboradores"
        component={ListaColaboradoresScreen}
        options={{
          title: 'Avaliação individual',
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
      <Stack.Screen
        name="HistoricoAvaliacoes"
        component={HistoricoAvaliacoesScreen}
        options={{
          title: 'Histórico',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack.Navigator>
  );
}
