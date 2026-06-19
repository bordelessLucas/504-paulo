import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getPendingCount, initOfflineDB } from '@/services/offlineStorage';
import { downloadEquipeParaCache, syncPendingAvaliacoes } from '@/services/syncService';
import type { SyncResult } from '@/types/offline';
import { isSupervisorGestorRole } from '@/types/supabase';

const LAST_SYNC_KEY = '@avalia/last_sync_at';

type OfflineSyncContextValue = {
  pendingCount: number;
  isSyncing: boolean;
  lastSyncAt: string | null;
  lastSyncResult: SyncResult | null;
  showSuccessBanner: boolean;
  isQueueVisible: boolean;
  refreshPendingCount: () => Promise<void>;
  forceSync: () => Promise<SyncResult | null>;
  openQueue: () => void;
  closeQueue: () => void;
};

const OfflineSyncContext = createContext<OfflineSyncContextValue | null>(null);

function shouldPrefetchEquipe(role: ReturnType<typeof useAuthRole>['role']): boolean {
  return (
    role === 'supervisor' ||
    role === 'gestor' ||
    role === 'gerente' ||
    isSupervisorGestorRole(role)
  );
}

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { role } = useAuthRole();
  const { isOnline, cameOnlineAt, clearCameOnline } = useNetworkStatus();

  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isDbReady, setIsDbReady] = useState(false);

  const isSyncingRef = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  const loadLastSyncAt = useCallback(async () => {
    const value = await AsyncStorage.getItem(LAST_SYNC_KEY);
    setLastSyncAt(value);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await initOfflineDB();
        setIsDbReady(true);
        await refreshPendingCount();
        await loadLastSyncAt();
      } catch {
        setIsDbReady(false);
      }
    })();
  }, [loadLastSyncAt, refreshPendingCount]);

  const forceSync = useCallback(async (): Promise<SyncResult | null> => {
    if (!isOnline || isSyncingRef.current) {
      return null;
    }

    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      const result = await syncPendingAvaliacoes();
      const now = new Date().toISOString();

      setLastSyncResult(result);
      setLastSyncAt(now);
      await AsyncStorage.setItem(LAST_SYNC_KEY, now);
      await refreshPendingCount();

      if (result.sincronizadas > 0 && result.erros === 0) {
        setShowSuccessBanner(true);
        setTimeout(() => setShowSuccessBanner(false), 3000);
      }

      return result;
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [isOnline, refreshPendingCount]);

  const prefetchEquipe = useCallback(async () => {
    if (!user || !isOnline || !shouldPrefetchEquipe(role)) {
      return;
    }

    try {
      await downloadEquipeParaCache(user.id, role);
    } catch {
      // Cache é best-effort — falha silenciosa
    }
  }, [isOnline, role, user]);

  useEffect(() => {
    if (!isDbReady || !cameOnlineAt) {
      return;
    }

    clearCameOnline();
    void forceSync();
  }, [cameOnlineAt, clearCameOnline, forceSync, isDbReady]);

  useEffect(() => {
    if (!isDbReady || !isOnline) {
      return;
    }

    const interval = setInterval(() => {
      void (async () => {
        const count = await getPendingCount();
        setPendingCount(count);

        if (count > 0 && !isSyncingRef.current) {
          await forceSync();
        }
      })();
    }, 30_000);

    return () => clearInterval(interval);
  }, [forceSync, isDbReady, isOnline]);

  useEffect(() => {
    if (!isDbReady || !user || !isOnline) {
      return;
    }

    void prefetchEquipe();
  }, [isDbReady, isOnline, prefetchEquipe, user]);

  useEffect(() => {
    if (!isDbReady) {
      return;
    }

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active' && isOnline && user) {
        void prefetchEquipe();
        void refreshPendingCount();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);

    return () => subscription.remove();
  }, [isDbReady, isOnline, prefetchEquipe, refreshPendingCount, user]);

  const value = useMemo<OfflineSyncContextValue>(
    () => ({
      pendingCount,
      isSyncing,
      lastSyncAt,
      lastSyncResult,
      showSuccessBanner,
      isQueueVisible,
      refreshPendingCount,
      forceSync,
      openQueue: () => setIsQueueVisible(true),
      closeQueue: () => setIsQueueVisible(false),
    }),
    [
      forceSync,
      isQueueVisible,
      isSyncing,
      lastSyncAt,
      lastSyncResult,
      pendingCount,
      refreshPendingCount,
      showSuccessBanner,
    ],
  );

  return <OfflineSyncContext.Provider value={value}>{children}</OfflineSyncContext.Provider>;
}

export function useOfflineSync(): OfflineSyncContextValue {
  const context = useContext(OfflineSyncContext);

  if (!context) {
    throw new Error('useOfflineSync deve ser usado dentro de OfflineSyncProvider.');
  }

  return context;
}

/** @deprecated Use useOfflineSync */
export const useSyncManager = useOfflineSync;
