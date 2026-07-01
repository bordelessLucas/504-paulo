import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme as usePaperTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts, layout } from '@/constants/theme';
import { useOfflineSync } from '@/features/offline/offline-sync-context';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useTheme } from '@/hooks/use-theme';

type BarVariant = 'offline' | 'syncing' | 'online' | 'pending';

function resolveBarState(params: {
  isOnline: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  pendingCount: number;
  showOnlineFlash: boolean;
}): { variant: BarVariant; message: string } | null {
  const { isOnline, isConnecting, isSyncing, pendingCount, showOnlineFlash } = params;

  if (!isOnline) {
    if (pendingCount > 0) {
      return {
        variant: 'offline',
        message: `Offline (${pendingCount} avaliação${pendingCount === 1 ? '' : 'ões'} na fila)`,
      };
    }

    return {
      variant: 'offline',
      message: 'Offline — dados em cache',
    };
  }

  if (showOnlineFlash) {
    return {
      variant: 'online',
      message: 'Conectado',
    };
  }

  if (isSyncing) {
    return {
      variant: 'syncing',
      message: `Sincronizando ${pendingCount} avaliação${pendingCount === 1 ? '' : 'ões'}…`,
    };
  }

  if (pendingCount > 0) {
    return {
      variant: 'pending',
      message: `${pendingCount} avaliação${pendingCount === 1 ? '' : 'ões'} aguardando envio`,
    };
  }

  if (isConnecting) {
    return {
      variant: 'syncing',
      message: 'Verificando conexão…',
    };
  }

  return null;
}

type NetworkStatusBarProps = {
  /** Quando false, oculta o banner verde breve ao reconectar. */
  showOnlineFlash?: boolean;
};

/**
 * Faixa sutil no topo do app com status de rede e fila offline.
 * Usa cores semânticas do tema (warning / success) — sem paletas hardcoded.
 */
export function NetworkStatusBar({ showOnlineFlash: enableOnlineFlash = true }: NetworkStatusBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const paperTheme = usePaperTheme();
  const { isOnline, isConnecting, cameOnlineAt } = useNetworkStatus();
  const { pendingCount, isSyncing, openQueue } = useOfflineSync();
  const [showOnlineFlash, setShowOnlineFlash] = useState(false);

  useEffect(() => {
    if (!enableOnlineFlash || !cameOnlineAt) {
      return;
    }

    setShowOnlineFlash(true);
    const timer = setTimeout(() => setShowOnlineFlash(false), 2_500);
    return () => clearTimeout(timer);
  }, [cameOnlineAt, enableOnlineFlash]);

  const state = resolveBarState({
    isOnline,
    isConnecting,
    isSyncing,
    pendingCount,
    showOnlineFlash,
  });

  if (!state) {
    return null;
  }

  const palette = {
    offline: {
      backgroundColor: theme.semantic.warning.bg,
      textColor: theme.semantic.warning.text,
      icon: 'cloud-offline-outline' as const,
    },
    syncing: {
      backgroundColor: theme.semantic.info.bg,
      textColor: theme.semantic.info.text,
      icon: 'sync-outline' as const,
    },
    online: {
      backgroundColor: theme.semantic.success.bg,
      textColor: theme.semantic.success.text,
      icon: 'checkmark-circle-outline' as const,
    },
    pending: {
      backgroundColor: theme.semantic.warning.bg,
      textColor: theme.semantic.warning.text,
      icon: 'time-outline' as const,
    },
  }[state.variant];

  const canOpenQueue = pendingCount > 0;

  return (
    <Pressable
      accessibilityRole={canOpenQueue ? 'button' : 'text'}
      accessibilityLabel={state.message}
      disabled={!canOpenQueue}
      onPress={canOpenQueue ? openQueue : undefined}
      style={[
        styles.container,
        {
          paddingTop: insets.top > 0 ? 0 : layout.space.xs,
          backgroundColor: palette.backgroundColor,
          borderBottomColor: paperTheme.colors.outline,
        },
      ]}>
      <View style={[styles.inner, { paddingTop: Math.max(insets.top, layout.space.xs) }]}>
        <Ionicons color={palette.textColor} name={palette.icon} size={14} />
        <Text
          numberOfLines={1}
          style={[styles.message, { color: palette.textColor, fontFamily: Fonts.sansMedium }]}>
          {state.message}
        </Text>
        {canOpenQueue ? (
          <Text style={[styles.hint, { color: palette.textColor }]}>Ver fila</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.sm,
    paddingHorizontal: layout.space.lg,
    paddingBottom: layout.space.sm,
    minHeight: 28,
  },
  message: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  hint: {
    fontSize: 11,
    lineHeight: 14,
    opacity: 0.85,
    fontFamily: Fonts.sans,
  },
});
