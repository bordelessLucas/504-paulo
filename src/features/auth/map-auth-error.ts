import type { AuthError as SupabaseAuthError } from '@supabase/supabase-js';

import type { AuthError } from '@/types/auth';

export function mapAuthError(error: SupabaseAuthError): AuthError {
  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return { field: 'general', message: 'E-mail ou senha incorretos.' };
  }

  if (message.includes('user already registered')) {
    return {
      field: 'general',
      message: 'Se o e-mail for válido, enviaremos os próximos passos.',
    };
  }

  if (message.includes('email not confirmed')) {
    return { field: 'general', message: 'E-mail ou senha incorretos.' };
  }

  if (message.includes('password') && message.includes('least')) {
    return { field: 'password', message: 'A senha deve ter pelo menos 8 caracteres.' };
  }

  if (message.includes('rate limit') || message.includes('too many requests')) {
    return { field: 'general', message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' };
  }

  if (message.includes('network') || message.includes('fetch')) {
    return { field: 'general', message: 'Sem conexão com o servidor. Verifique sua internet.' };
  }

  return { field: 'general', message: 'Não foi possível entrar. Tente novamente.' };
}
