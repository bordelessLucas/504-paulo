import { NavigationIndependentTree } from '@react-navigation/native';

import { MinhaEquipeStackNavigator } from '@/navigation/minha-equipe-stack';

export function MinhaEquipeTabScreen() {
  return (
    <NavigationIndependentTree>
      <MinhaEquipeStackNavigator />
    </NavigationIndependentTree>
  );
}
