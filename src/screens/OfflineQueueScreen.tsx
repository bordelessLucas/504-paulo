import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useOfflineSync } from '@/features/offline/offline-sync-context';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useTheme } from '@/hooks/use-theme';
import {
  getAllAvaliacoesOffline,
  removeAvaliacaoOffline,
} from '@/services/offlineStorage';
import type { OfflineAvaliacaoRecord } from '@/types/offline';
import { confirmAction } from '@/utils/confirm-action';

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type OfflineQueueScreenProps = {
  visible: boolean;
  onClose: () => void;
};

export function OfflineQueueScreen({ visible, onClose }: OfflineQueueScreenProps) {
  const theme = useTheme();
  const { showToast } = useToast();
  const { isOnline } = useNetworkStatus();
  const { forceSync, refreshPendingCount, isSyncing } = useOfflineSync();

  const [items, setItems] = useState<OfflineAvaliacaoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setIsLoading(true);

    try {
      const fila = await getAllAvaliacoesOffline();
      setItems(fila.filter((item) => !item.sincronizado));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      void loadQueue();
    }
  }, [loadQueue, visible]);

  const handleSyncNow = useCallback(async () => {
    if (!isOnline) {
      showToast('Conecte-se à internet para sincronizar.', 'error');
      return;
    }

    const result = await forceSync();

    if (result) {
      showToast(
        `${result.sincronizadas} sincronizada(s), ${result.erros} erro(s).`,
        result.erros > 0 ? 'error' : 'success',
      );
    }

    await loadQueue();
  }, [forceSync, isOnline, loadQueue, showToast]);

  const handleRemove = useCallback(
    async (item: OfflineAvaliacaoRecord) => {
      const confirmed = await confirmAction(
        'Remover da fila',
        `Remover a avaliação de ${item.payload.avaliadoNome}? Esta ação não pode ser desfeita.`,
      );

      if (!confirmed) {
        return;
      }

      setRemovingId(item.id_local);

      try {
        await removeAvaliacaoOffline(item.id_local);
        await refreshPendingCount();
        await loadQueue();
        showToast('Avaliação removida da fila local.', 'success');
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : 'Não foi possível remover.',
          'error',
        );
      } finally {
        setRemovingId(null);
      }
    },
    [loadQueue, refreshPendingCount, showToast],
  );

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <ThemedText type="heading">Fila offline</ThemedText>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <ThemedText themeColor="textSecondary">Fechar</ThemedText>
          </Pressable>
        </View>

        <ThemedText themeColor="textSecondary" style={styles.description}>
          Avaliações salvas no dispositivo aguardando envio ao Supabase.
        </ThemedText>

        {isLoading ? (
          <ActivityIndicator style={styles.loader} />
        ) : items.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            Nenhuma avaliação na fila local.
          </ThemedText>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {items.map((item) => (
              <View
                key={item.id_local}
                style={[
                  styles.card,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}>
                <ThemedText style={styles.name}>{item.payload.avaliadoNome}</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.meta}>
                  {formatDate(item.created_at)} · {item.payload.status}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.meta}>
                  Ciclo: {item.payload.tipo}
                </ThemedText>

                <Button
                  label={removingId === item.id_local ? 'Removendo...' : 'Remover da fila'}
                  variant="ghost"
                  disabled={removingId === item.id_local}
                  onPress={() => void handleRemove(item)}
                />
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.footer}>
          <Button
            label={isSyncing ? 'Sincronizando...' : 'Sincronizar agora'}
            disabled={!isOnline || isSyncing || items.length === 0}
            onPress={() => void handleSyncNow()}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.three,
  },
  loader: {
    marginTop: Spacing.four,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: Spacing.four,
  },
  list: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  name: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    paddingVertical: Spacing.three,
  },
});
