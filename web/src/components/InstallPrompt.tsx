import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import styles from './InstallPrompt.module.css';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (!isVisible || !deferred) {
    return null;
  }

  return (
    <div className={styles.banner} role="dialog" aria-label="Instalar aplicativo">
      <div>
        <strong>Instalar Vertek Avalia</strong>
        <p>Adicione à tela inicial do celular para acesso rápido (PWA).</p>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.install}
          onClick={async () => {
            await deferred.prompt();
            setIsVisible(false);
            setDeferred(null);
          }}>
          <Download size={16} />
          Instalar
        </button>
        <button
          type="button"
          className={styles.dismiss}
          aria-label="Fechar"
          onClick={() => setIsVisible(false)}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
