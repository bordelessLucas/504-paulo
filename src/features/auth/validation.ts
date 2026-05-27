import type { AuthError, LoginCredentials, RegisterCredentials } from '@/types/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(credentials: LoginCredentials): AuthError | null {
  const email = credentials.email.trim().toLowerCase();

  if (!email) {
    return { field: 'email', message: 'Informe seu e-mail corporativo.' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { field: 'email', message: 'Informe um e-mail válido.' };
  }

  if (!credentials.password) {
    return { field: 'password', message: 'Informe sua senha.' };
  }

  if (credentials.password.length < 6) {
    return { field: 'password', message: 'A senha deve ter pelo menos 6 caracteres.' };
  }

  return null;
}

export function validateRegister(credentials: RegisterCredentials): AuthError | null {
  const name = credentials.name.trim();
  const email = credentials.email.trim().toLowerCase();

  if (!name) {
    return { field: 'name', message: 'Informe seu nome completo.' };
  }

  if (name.length < 3) {
    return { field: 'name', message: 'O nome deve ter pelo menos 3 caracteres.' };
  }

  if (!email) {
    return { field: 'email', message: 'Informe seu e-mail corporativo.' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { field: 'email', message: 'Informe um e-mail válido.' };
  }

  if (!credentials.password) {
    return { field: 'password', message: 'Crie uma senha.' };
  }

  if (credentials.password.length < 6) {
    return { field: 'password', message: 'A senha deve ter pelo menos 6 caracteres.' };
  }

  if (credentials.password !== credentials.confirmPassword) {
    return { field: 'confirmPassword', message: 'As senhas não coincidem.' };
  }

  return null;
}
