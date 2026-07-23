import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Fonts } from '@/constants/theme';
import { createLazyNamedScreen } from '@/navigation/lazy-tab-screen';
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

const FormularioLoteScreen = createLazyNamedScreen(
  () => import('@/screens/avaliacao/formulario-lote-screen'),
  'FormularioLoteScreen',
);
const ListaColaboradoresScreen = createLazyNamedScreen(
  () => import('@/screens/avaliacao/lista-colaboradores-screen'),
  'ListaColaboradoresScreen',
);
const FormularioAvaliacaoScreen = createLazyNamedScreen(
  () => import('@/screens/avaliacao/formulario-avaliacao-screen'),
  'FormularioAvaliacaoScreen',
);
const HistoricoAvaliacoesScreen = createLazyNamedScreen(
  () => import('@/screens/avaliacao/historico-avaliacoes-screen'),
  'HistoricoAvaliacoesScreen',
);

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
