import { supabase } from '@/lib/supabase';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' ? message : '';
  }

  return '';
}

export function isInvalidRefreshTokenError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes('invalid refresh token') ||
    message.includes('refresh token not found') ||
    message.includes('invalid jwt')
  );
}

export async function clearStaleAuthSession(): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // Sessão local já pode estar ausente ou corrompida.
  }
}

export async function getSafeSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      if (isInvalidRefreshTokenError(error)) {
        await clearStaleAuthSession();
        return null;
      }

      console.warn('[Auth] Erro ao restaurar sessão:', error.message);
      return null;
    }

    return session;
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      await clearStaleAuthSession();
      return null;
    }

    throw error;
  }
}
