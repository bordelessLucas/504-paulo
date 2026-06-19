import { OfflineQueueScreen } from '@/screens/OfflineQueueScreen';

import { OfflineSyncProvider, useOfflineSync } from './offline-sync-context';

function OfflineQueueHost() {
  const { isQueueVisible, closeQueue } = useOfflineSync();

  return <OfflineQueueScreen visible={isQueueVisible} onClose={closeQueue} />;
}

export function OfflineBootstrap({ children }: { children: React.ReactNode }) {
  return (
    <OfflineSyncProvider>
      {children}
      <OfflineQueueHost />
    </OfflineSyncProvider>
  );
}

export { OfflineSyncProvider, useOfflineSync } from './offline-sync-context';
