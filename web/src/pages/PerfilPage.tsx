import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '@/features/auth/auth-context';
import { ROLE_LABELS } from '@/navigation/role-menus';
import page from '../styles/page.module.css';

export function PerfilPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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

  return (
    <div className={page.page}>
      <PageHeader title="Perfil" description="Dados da sua conta na plataforma." />

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
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
