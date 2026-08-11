import { AlertCircle, ClipboardCheck, Eye, EyeOff, Lock, Mail, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/auth-context';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isSubmitting } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className={styles.shell}>
      <aside className={styles.panel} aria-hidden={false}>
        <div className={styles.panelGlow} />
        <div className={styles.panelInner}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            DNA Performance
          </p>

          <div className={styles.panelBrand}>
            <span className={styles.panelVertek}>Vertek</span>
            <span className={styles.panelAvalia}>Avalia</span>
          </div>

          <h1 className={styles.panelHeadline}>Avaliação com clareza e governança</h1>
          <p className={styles.panelCopy}>
            Desempenho, aprovações e decisões — do bordo à diretoria.
          </p>

          <ul className={styles.points}>
            <li className={styles.point}>
              <span className={styles.pointIcon}>
                <ClipboardCheck size={16} strokeWidth={2} />
              </span>
              <div>
                <p className={styles.pointTitle}>Ciclos por papel</p>
                <p className={styles.pointText}>
                  Quinzenal, semestral e anual com trilha de validação RH → CEO.
                </p>
              </div>
            </li>
            <li className={styles.point}>
              <span className={styles.pointIcon}>
                <Users size={16} strokeWidth={2} />
              </span>
              <div>
                <p className={styles.pointTitle}>Visão por equipe</p>
                <p className={styles.pointText}>
                  Históricos, relatórios e painéis gerenciais em um só lugar.
                </p>
              </div>
            </li>
            <li className={styles.point}>
              <span className={styles.pointIcon}>
                <ShieldCheck size={16} strokeWidth={2} />
              </span>
              <div>
                <p className={styles.pointTitle}>Acesso seguro</p>
                <p className={styles.pointText}>
                  Login corporativo com permissões por perfil da organização.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <p className={styles.panelFooter}>Vertek Avalia · uso interno autorizado</p>
      </aside>

      <main className={styles.formSide}>
        <div className={styles.formCardFrame}>
          <div className={styles.formCardBorder} aria-hidden />
          <div className={styles.formCard}>
            <div className={styles.formBrand}>
              <span className={styles.formVertek}>Vertek</span>
              <span className={styles.formAvalia}>Avalia</span>
            </div>

            <h2 className={styles.formTitle}>Entrar</h2>
            <p className={styles.formSubtitle}>
              Acesse com seu e-mail corporativo.
            </p>

            <form className={styles.form} onSubmit={(event) => void handleSubmit(event)} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="login-email">
                  E-mail corporativo
                </label>
                <div className={styles.inputWrap}>
                  <Mail className={styles.inputIcon} size={17} strokeWidth={1.75} aria-hidden />
                  <input
                    id="login-email"
                    className={`${styles.input} ${errors.email ? styles.inputInvalid : ''}`.trim()}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="nome@empresa.com"
                    value={email}
                    aria-invalid={Boolean(errors.email)}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                {errors.email ? <span className={styles.fieldError}>{errors.email}</span> : null}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="login-password">
                  Senha
                </label>
                <div className={styles.inputWrap}>
                  <Lock className={styles.inputIcon} size={17} strokeWidth={1.75} aria-hidden />
                  <input
                    id="login-password"
                    className={`${styles.input} ${styles.inputWithToggle} ${errors.password ? styles.inputInvalid : ''}`.trim()}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Sua senha"
                    value={password}
                    aria-invalid={Boolean(errors.password)}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? (
                      <EyeOff size={17} strokeWidth={1.75} />
                    ) : (
                      <Eye size={17} strokeWidth={1.75} />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <span className={styles.fieldError}>{errors.password}</span>
                ) : null}
              </div>

              {errors.general ? (
                <div className={styles.errorBox} role="alert">
                  <AlertCircle className={styles.errorIcon} size={17} strokeWidth={2} aria-hidden />
                  <span>{errors.general}</span>
                </div>
              ) : null}

              <button className={styles.submit} type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Entrando…' : 'Entrar'}
              </button>
            </form>

            <div className={styles.footer}>
              <p className={styles.footerRow}>
                Ainda não tem conta?{' '}
                <Link className={`${styles.link} ${styles.linkAccent}`} to="/register">
                  Criar conta
                </Link>
              </p>
              <p className={styles.footerRow}>
                Quer usar como aplicativo?{' '}
                <Link className={styles.link} to="/instalar">
                  Como instalar no celular
                </Link>
              </p>
              <p className={styles.footerRow}>
                Família Vertek:{' '}
                <a
                  className={styles.link}
                  href={(
                    import.meta.env.VITE_OPS_SITE_URL || 'https://vertek-505-paulo.netlify.app'
                  ).replace(/\/$/, '')}
                  target="_blank"
                  rel="noreferrer"
                >
                  Site institucional
                </a>
                {' · '}
                <a
                  className={styles.link}
                  href={
                    import.meta.env.VITE_OPS_URL ||
                    `${(
                      import.meta.env.VITE_OPS_SITE_URL || 'https://vertek-505-paulo.netlify.app'
                    ).replace(/\/$/, '')}/app/login`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Entrar no Ops
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
