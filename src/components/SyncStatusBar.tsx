import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useOfflineSync } from '@/features/offline/offline-sync-context';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useTheme } from '@/hooks/use-theme';

export function SyncStatusBar() {
  const theme = useTheme();
  const { isOnline } = useNetworkStatus();
  const { pendingCount, isSyncing, showSuccessBanner, openQueue } = useOfflineSync();

  const shouldShow = !isOnline || isSyncing || showSuccessBanner || pendingCount > 0;

  if (!shouldShow) {
    return null;
  }

  let backgroundColor: string = theme.backgroundElement;
  let textColor: string = theme.text;
  let message = 'Tudo sincronizado';

  if (!isOnline && pendingCount > 0) {
    backgroundColor = '#FEE2E2';
    textColor = '#991B1B';
    message = `Offline — ${pendingCount} avaliação(ões) salva(s) localmente`;
  } else if (!isOnline) {
    backgroundColor = '#FEE2E2';
    textColor = '#991B1B';
    message = 'Offline — trabalhando com dados em cache';
  } else if (isSyncing) {
    backgroundColor = '#DBEAFE';
    textColor = '#1E40AF';
    message = `Sincronizando ${pendingCount} avaliação(ões)...`;
  } else if (showSuccessBanner) {
    backgroundColor = '#DCFCE7';
    textColor = '#166534';
    message = 'Tudo sincronizado';
  } else if (pendingCount > 0) {
    backgroundColor = '#FEF3C7';
    textColor = '#92400E';
    message = `${pendingCount} avaliação(ões) aguardando sincronização`;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={openQueue}
      style={[styles.container, { backgroundColor, borderColor: theme.border }]}>
      <View style={styles.content}>
        <ThemedText style={[styles.text, { color: textColor }]}>{message}</ThemedText>
        <ThemedText style={[styles.hint, { color: textColor }]}>Toque para ver a fila</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  content: {
    gap: 2,
  },
  text: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 14,
    opacity: 0.85,
  },
});
