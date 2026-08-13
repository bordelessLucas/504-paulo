import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/auth-context';
import { changePassword } from '@/features/perfil/profile-api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import page from '../styles/page.module.css';

export function TrocarSenhaPage() {
  const navigate = useNavigate();
  const { user, refetchProfile, signOut } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return null;
  }

  const email = user.email;
  const firstName = user.name.split(' ')[0];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await changePassword({
      email,
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (result) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }

    await refetchProfile();
    setIsSubmitting(false);
    navigate('/', { replace: true });
  }

  async function handleExit() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className={page.authShell}>
      <Card className={page.authCard}>
        <div className={page.brand}>
          <span className={page.brandVertek}>Vertek</span>
          <span className={page.brandAvalia}>Avalia</span>
        </div>
        <h1 className={page.authTitle}>Defina sua nova senha</h1>
        <p className={page.authSubtitle}>
          Olá, {firstName}! Este é o seu primeiro acesso. Use a senha temporária que você recebeu e
          defina uma senha própria antes de continuar.
        </p>

        <form className={page.form} onSubmit={(event) => void handleSubmit(event)}>
          <div className={page.field}>
            <label className={page.label} htmlFor="currentPassword">
              Senha temporária
            </label>
            <input
              id="currentPassword"
              className={page.input}
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Senha temporária recebida"
            />
          </div>
          <div className={page.field}>
            <label className={page.label} htmlFor="newPassword">
              Nova senha
            </label>
            <input
              id="newPassword"
              className={page.input}
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Mínimo 8 caracteres, letras e números"
            />
          </div>
          <div className={page.field}>
            <label className={page.label} htmlFor="confirmPassword">
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              className={page.input}
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repita a nova senha"
            />
          </div>

          {error ? <p className={page.fieldError}>{error}</p> : null}

          <Button type="submit" size="lg" isLoading={isSubmitting} style={{ width: '100%' }}>
            Salvar e entrar
          </Button>
        </form>

        <button
          type="button"
          onClick={() => void handleExit()}
          disabled={isSubmitting}
          className={page.authLink}
          style={{
            marginTop: '1rem',
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Sair da conta
        </button>
      </Card>
    </div>
  );
}
