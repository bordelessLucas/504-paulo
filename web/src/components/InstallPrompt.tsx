import { Download, Share, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { isIosSafari, isStandaloneDisplay } from '../pwa/display';
import styles from './InstallPrompt.module.css';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'vertek.install.dismissed';

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay()) return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setIsVisible(true);
      setIosHint(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    if (isIosSafari()) {
      setIosHint(true);
      setIsVisible(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (!isVisible) {
    return null;
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setIsVisible(false);
    setDeferred(null);
  }

  return (
    <div className={styles.banner} role="dialog" aria-label="Instalar aplicativo">
      <div>
        <strong>Instalar Vertek Avalia</strong>
        <p>
          {iosHint && !deferred
            ? 'No iPhone/iPad: veja o passo a passo no guia de instalação.'
            : 'Instale como app para tela cheia, atalhos e uso offline do shell.'}
        </p>
        <Link className={styles.guideLink} to="/instalar" onClick={dismiss}>
          Ver guia Android / iOS
        </Link>
      </div>
      <div className={styles.actions}>
        {deferred ? (
          <button
            type="button"
            className={styles.install}
            onClick={async () => {
              await deferred.prompt();
              dismiss();
            }}
          >
            <Download size={16} />
            Instalar
          </button>
        ) : (
          <Link className={styles.install} to="/instalar" onClick={dismiss}>
            {iosHint ? <Share size={16} /> : <Download size={16} />}
            Como instalar
          </Link>
        )}
        <button type="button" className={styles.dismiss} aria-label="Fechar" onClick={dismiss}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
