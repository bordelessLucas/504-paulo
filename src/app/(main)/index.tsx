import { StyleSheet, View } from 'react-native';

import { NetworkStatusBar } from '@/components/ui/network-status-bar';
import { AppNavigator } from '@/navigation/AppNavigator';

/**
 * Rota padrão do grupo `(main)` — shell autenticado do app.
 */
export default function MainScreen() {
  return (
    <View style={styles.shell}>
      <NetworkStatusBar />
      <View style={styles.content}>
        <AppNavigator />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
