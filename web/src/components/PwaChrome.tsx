import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import styles from './PwaChrome.module.css';

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        void registration.update();
      }
    },
  });

  if (!needRefresh) {
    return null;
  }

  return (
    <div className={styles.updateBanner} role="status">
      <p>Nova versão do app disponível.</p>
      <button
        type="button"
        className={styles.updateButton}
        onClick={() => {
          void updateServiceWorker(true);
          setNeedRefresh(false);
        }}
      >
        <RefreshCw size={14} />
        Atualizar
      </button>
    </div>
  );
}

export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online) return null;

  return (
    <div className={styles.offlineBanner} role="alert">
      Você está offline. O app continua navegável; ações que precisam de rede serão tentadas ao
      reconectar.
    </div>
  );
}
