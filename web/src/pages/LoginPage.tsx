import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { useAuth } from '@/features/auth/auth-context';
import page from '../styles/page.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isSubmitting } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});

    const result = await login({ email, password });
    if (result) {
      if (result.field && result.field !== 'general') {
        setErrors({ [result.field]: result.message });
        return;
      }
      setErrors({ general: result.message });
      return;
    }

    navigate('/', { replace: true });
  }

  return (
    <div className={page.authShell}>
      <div className={page.authCard}>
        <div className={page.brand}>
          <span className={page.brandVertek}>Vertek</span>
          <span className={page.brandAvalia}>Avalia</span>
        </div>
        <h1 className={page.authTitle}>Entrar</h1>
        <p className={page.authSubtitle}>
          Acesse o ambiente de avaliações internas da sua equipe.
        </p>

        <form className={page.form} onSubmit={(event) => void handleSubmit(event)}>
          <div className={page.field}>
            <label className={page.label} htmlFor="email">
              E-mail corporativo
            </label>
            <input
              id="email"
              className={page.input}
              type="email"
              autoComplete="email"
              placeholder="nome@empresa.com"
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
              autoComplete="current-password"
              placeholder="Sua senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {errors.password ? <span className={page.fieldError}>{errors.password}</span> : null}
          </div>

          {errors.general ? <div className={page.error}>{errors.general}</div> : null}

          <Button type="submit" isLoading={isSubmitting} style={{ width: '100%' }}>
            Entrar
          </Button>
        </form>

        <p className={page.authFooter}>
          Ainda não tem conta?{' '}
          <Link className={page.authLink} to="/register">
            Criar conta
          </Link>
        </p>
        <p className={page.authFooter}>
          Quer usar como aplicativo?{' '}
          <Link className={page.authLink} to="/instalar">
            Como instalar no celular
          </Link>
        </p>
      </div>
    </div>
  );
}
