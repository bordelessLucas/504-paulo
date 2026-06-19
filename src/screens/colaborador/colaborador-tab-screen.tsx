import { NavigationIndependentTree } from '@react-navigation/native';

import { ColaboradorStackNavigator } from '@/navigation/colaborador-stack';

export function ColaboradorTabScreen() {
  return (
    <NavigationIndependentTree>
      <ColaboradorStackNavigator />
    </NavigationIndependentTree>
  );
}
