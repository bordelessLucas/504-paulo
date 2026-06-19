import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useRef, useState } from 'react';

function resolveIsOnline(state: NetInfoState): boolean {
  if (state.isInternetReachable === null) {
    return Boolean(state.isConnected);
  }

  return Boolean(state.isConnected && state.isInternetReachable);
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const wasOnlineRef = useRef(true);
  const [cameOnlineAt, setCameOnlineAt] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = resolveIsOnline(state);
      const connecting = Boolean(state.isConnected && state.isInternetReachable === null);

      setIsOnline(online);
      setIsConnecting(connecting);

      if (!wasOnlineRef.current && online) {
        setCameOnlineAt(Date.now());
      }

      wasOnlineRef.current = online;
    });

    void NetInfo.fetch().then((state) => {
      const online = resolveIsOnline(state);
      setIsOnline(online);
      setIsConnecting(Boolean(state.isConnected && state.isInternetReachable === null));
      wasOnlineRef.current = online;
    });

    return unsubscribe;
  }, []);

  return {
    isOnline,
    isConnecting,
    cameOnlineAt,
    clearCameOnline: () => setCameOnlineAt(null),
  };
}
