import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { useAuth } from '@/features/auth/auth-context';
import page from '../styles/page.module.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const { beginRegistration, pendingRegistration } = useAuth();
  const [name, setName] = useState(pendingRegistration?.name ?? '');
  const [email, setEmail] = useState(pendingRegistration?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});

    const error = beginRegistration({ name, email, password, confirmPassword });
    if (error) {
      if (error.field && error.field !== 'general') {
        setErrors({ [error.field]: error.message });
        return;
      }
      setErrors({ general: error.message });
      return;
    }

    navigate('/planos');
  }

  return (
    <div className={page.authShell}>
      <div className={page.authCard}>
        <div className={page.brand}>
          <span className={page.brandVertek}>Vertek</span>
          <span className={page.brandAvalia}>Avalia</span>
        </div>
        <h1 className={page.authTitle}>Criar sua conta</h1>
        <p className={page.authSubtitle}>
          Cadastre-se para gerenciar avaliações da sua empresa. Após assinar um plano, você será o
          CEO da conta.
        </p>

        <form className={page.form} onSubmit={handleSubmit}>
          <div className={page.field}>
            <label className={page.label} htmlFor="name">
              Nome completo
            </label>
            <input
              id="name"
              className={page.input}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name ? <span className={page.fieldError}>{errors.name}</span> : null}
          </div>

          <div className={page.field}>
            <label className={page.label} htmlFor="email">
              E-mail corporativo
            </label>
            <input
              id="email"
              className={page.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {errors.email ? <span className={page.fieldError}>{errors.email}</span> : null}
          </div>

          <div className={page.field}>
            <label className={page.label} htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              className={page.input}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {errors.password ? <span className={page.fieldError}>{errors.password}</span> : null}
          </div>

          <div className={page.field}>
            <label className={page.label} htmlFor="confirmPassword">
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              className={page.input}
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {errors.confirmPassword ? (
              <span className={page.fieldError}>{errors.confirmPassword}</span>
            ) : null}
          </div>

          {errors.general ? <div className={page.error}>{errors.general}</div> : null}

          <Button type="submit" style={{ width: '100%' }}>
            Continuar
          </Button>
        </form>

        <p className={page.authFooter}>
          Já possui conta?{' '}
          <Link className={page.authLink} to="/login">
            Entrar
          </Link>
          {' · '}
          <Link className={page.authLink} to="/">
            Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  );
}
