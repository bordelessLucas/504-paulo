import { Bell, Download, LogOut, MonitorSmartphone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '@/features/auth/auth-context';
import { ROLE_LABELS } from '@/navigation/role-menus';
import { isStandaloneDisplay } from '../pwa/display';
import {
  getNotificationPermission,
  requestNotificationPermission,
  showLocalNotification,
  type NotificationPermissionState,
} from '../pwa/notifications';
import { getOfflineQueue } from '../pwa/offline-queue';
import page from '../styles/page.module.css';

export function PerfilPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [permission, setPermission] = useState<NotificationPermissionState>(() =>
    getNotificationPermission(),
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const standalone = isStandaloneDisplay();
  const pendingOffline = useMemo(() => getOfflineQueue().length, []);

  if (!user) {
    return null;
  }

  const rows = [
    { label: 'Nome', value: user.name },
    { label: 'E-mail', value: user.email },
    user.role ? { label: 'Papel', value: ROLE_LABELS[user.role] } : null,
    user.departamento ? { label: 'Departamento', value: user.departamento } : null,
    user.funcao ? { label: 'Função', value: user.funcao } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  async function handleEnableNotifications() {
    const next = await requestNotificationPermission();
    setPermission(next);
    if (next === 'granted') {
      await showLocalNotification(
        'Vertek Avalia',
        'Notificações ativadas neste dispositivo.',
      );
      setFeedback('Notificações ativadas neste dispositivo.');
      return;
    }
    if (next === 'denied') {
      setFeedback('Permissão negada. Ative nas configurações do navegador/sistema.');
      return;
    }
    setFeedback('Este navegador não suporta notificações web.');
  }

  return (
    <div className={page.page}>
      <PageHeader title="Perfil" description="Dados da sua conta e preferências do app." />

      <Card style={{ marginBottom: '1rem' }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#012D60',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h2 className={page.listItemTitle}>{user.name}</h2>
        <p className={page.listItemMeta}>{user.email}</p>
      </Card>

      <Card style={{ marginBottom: '1rem' }}>
        <h3 className={page.sectionTitle} style={{ textTransform: 'none', letterSpacing: 0 }}>
          App / PWA
        </h3>
        <div className={page.listItemMeta} style={{ display: 'grid', gap: '0.5rem' }}>
          <p style={{ margin: 0, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <MonitorSmartphone size={16} />
            Modo: {standalone ? 'Instalado (tela cheia)' : 'Navegador'}
          </p>
          <p style={{ margin: 0 }}>Fila offline pendente: {pendingOffline}</p>
          <p style={{ margin: 0 }}>Notificações: {permission}</p>
        </div>
        {permission !== 'granted' ? (
          <div style={{ marginTop: '0.85rem' }}>
            <Button
              size="sm"
              leftIcon={<Bell size={16} />}
              onClick={() => void handleEnableNotifications()}
            >
              Ativar notificações
            </Button>
          </div>
        ) : null}
        {!standalone ? (
          <div style={{ marginTop: '0.85rem' }}>
            <Link to="/instalar" style={{ textDecoration: 'none' }}>
              <Button size="sm" variant="secondary" leftIcon={<Download size={16} />}>
                Como instalar o app
              </Button>
            </Link>
          </div>
        ) : null}
        {feedback ? <p className={page.listItemMeta} style={{ marginTop: '0.75rem' }}>{feedback}</p> : null}
      </Card>

      <Card>
        <h3 className={page.sectionTitle} style={{ textTransform: 'none', letterSpacing: 0 }}>
          Minha conta
        </h3>
        {rows.map((row) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '0.75rem 0',
              borderBottom: '1px solid rgba(1,45,96,0.08)',
            }}
          >
            <span className={page.listItemMeta}>{row.label}</span>
            <strong style={{ color: '#012D60', textAlign: 'right' }}>{row.value}</strong>
          </div>
        ))}
      </Card>

      <div className={page.actions} style={{ marginTop: '1.5rem' }}>
        <Button variant="danger" leftIcon={<LogOut size={16} />} onClick={() => void handleSignOut()}>
          Sair
        </Button>
      </div>
    </div>
  );
}
