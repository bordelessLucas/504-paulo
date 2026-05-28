import { NavigationIndependentTree } from '@react-navigation/native';

import { AvaliacaoStackNavigator } from '@/navigation/avaliacao-stack';

export function PainelAvaliacaoScreen() {
  return (
    <NavigationIndependentTree>
      <AvaliacaoStackNavigator />
    </NavigationIndependentTree>
  );
}
