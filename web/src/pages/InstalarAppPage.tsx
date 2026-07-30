import {
  CheckCircle2,
  Download,
  Globe,
  MoreVertical,
  Share,
  Smartphone,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import {
  detectInstallPlatform,
  isStandaloneDisplay,
  type InstallPlatform,
} from '../pwa/display';
import styles from './InstalarAppPage.module.css';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type GuideTab = 'android' | 'ios';

function initialTab(platform: InstallPlatform): GuideTab {
  return platform === 'ios' ? 'ios' : 'android';
}

export function InstalarAppPage() {
  const platform = useMemo(() => detectInstallPlatform(), []);
  const [tab, setTab] = useState<GuideTab>(() => initialTab(platform));
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneDisplay());
  const [installFeedback, setInstallFeedback] = useState<string | null>(null);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    const media = window.matchMedia('(display-mode: standalone)');
    const syncInstalled = () => setIsInstalled(isStandaloneDisplay());
    media.addEventListener('change', syncInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      media.removeEventListener('change', syncInstalled);
    };
  }, []);

  async function handleNativeInstall() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === 'accepted') {
      setInstallFeedback('Instalação iniciada. Procure o ícone Vertek Avalia na tela inicial.');
      setIsInstalled(true);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>VA</span>
          <div>
            <strong>Vertek Avalia</strong>
            <p>Instalar o aplicativo (PWA)</p>
          </div>
        </div>

        <h1 className={styles.title}>Como baixar o app</h1>
        <p className={styles.lead}>
          O Vertek Avalia funciona como um aplicativo real no celular. Android e iPhone usam
          caminhos diferentes — escolha o seu sistema abaixo.
        </p>

        {isInstalled ? (
          <div className={styles.successBox} role="status">
            <CheckCircle2 size={18} />
            <div>
              <strong>App já instalado neste dispositivo</strong>
              <p>Você está usando o modo tela cheia. Pode fechar esta página e usar o app normalmente.</p>
            </div>
          </div>
        ) : null}

        {platform !== 'desktop' ? (
          <p className={styles.detected}>
            Detectamos: <strong>{platform === 'ios' ? 'iPhone / iPad' : 'Android'}</strong>
          </p>
        ) : (
          <p className={styles.detected}>
            Você parece estar no computador. Abra este link no celular para instalar na tela
            inicial, ou use Chrome no desktop (menu ⋮ → Instalar app).
          </p>
        )}

        <div className={styles.tabs} role="tablist" aria-label="Sistema do celular">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'android'}
            className={`${styles.tab} ${tab === 'android' ? styles.tabActive : ''}`}
            onClick={() => setTab('android')}
          >
            <Smartphone size={16} />
            Android
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'ios'}
            className={`${styles.tab} ${tab === 'ios' ? styles.tabActive : ''}`}
            onClick={() => setTab('ios')}
          >
            <Share size={16} />
            iPhone / iPad
          </button>
        </div>

        {tab === 'android' ? (
          <section className={styles.panel} aria-label="Guia Android">
            <h2 className={styles.panelTitle}>
              <Globe size={18} />
              Android (Chrome recomendado)
            </h2>
            <ol className={styles.steps}>
              <li>
                Abra o <strong>Vertek Avalia</strong> no <strong>Google Chrome</strong> (não use
                navegador embutido do WhatsApp/Instagram).
              </li>
              <li>
                Toque no menu <MoreVertical size={14} className={styles.inlineIcon} /> no canto
                superior direito.
              </li>
              <li>
                Escolha <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.
              </li>
              <li>
                Confirme em <strong>Instalar</strong>. O ícone VA aparece na tela inicial como um
                app.
              </li>
            </ol>

            {deferred ? (
              <Button
                leftIcon={<Download size={16} />}
                onClick={() => void handleNativeInstall()}
                style={{ width: '100%' }}
              >
                Instalar agora
              </Button>
            ) : (
              <p className={styles.hint}>
                Se o botão “Instalar agora” não aparecer, use o menu ⋮ do Chrome nesta página.
              </p>
            )}
          </section>
        ) : (
          <section className={styles.panel} aria-label="Guia iOS">
            <h2 className={styles.panelTitle}>
              <Share size={18} />
              iPhone / iPad (somente Safari)
            </h2>
            <ol className={styles.steps}>
              <li>
                Abra este site no <strong>Safari</strong> (Chrome no iPhone não permite instalar
                PWA corretamente).
              </li>
              <li>
                Toque no botão <strong>Compartilhar</strong>{' '}
                <Share size={14} className={styles.inlineIcon} /> na barra inferior (ou superior no
                iPad).
              </li>
              <li>
                Role as opções e toque em <strong>Adicionar à Tela de Início</strong>.
              </li>
              <li>
                Confirme o nome <strong>Vertek Avalia</strong> e toque em <strong>Adicionar</strong>.
              </li>
            </ol>
            <div className={styles.iosCallout}>
              <strong>Importante:</strong> no iOS a instalação é manual pelo Safari. Não existe
              botão automático “Instalar” como no Android.
            </div>
          </section>
        )}

        {installFeedback ? <p className={styles.feedback}>{installFeedback}</p> : null}

        <div className={styles.footerLinks}>
          <Link className={styles.link} to="/login">
            Ir para o login
          </Link>
          <Link className={styles.link} to="/">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
