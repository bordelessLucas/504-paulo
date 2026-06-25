import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { supabaseStorage } from '@/lib/supabase-storage';

const REFRESH_MARGIN_SECONDS = 60;

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

export function getAuthStorageKey(): string {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const projectRef = url.replace(/^https?:\/\//, '').split('.')[0] || 'localhost';
  return `sb-${projectRef}-auth-token`;
}

export async function clearStaleAuthSession(): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // Sessão local já pode estar ausente ou corrompida.
  }

  await supabaseStorage.removeItem(getAuthStorageKey());
}

function isSessionExpiringSoon(session: Session): boolean {
  const expiresAt = session.expires_at ?? 0;
  const now = Math.floor(Date.now() / 1000);
  return expiresAt <= now + REFRESH_MARGIN_SECONDS;
}

async function refreshSessionSafely(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      if (isInvalidRefreshTokenError(error)) {
        await clearStaleAuthSession();
      }

      return null;
    }

    return data.session;
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      await clearStaleAuthSession();
      return null;
    }

    throw error;
  }
}

export async function getSafeSession(): Promise<Session | null> {
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

    if (!session) {
      return null;
    }

    if (!isSessionExpiringSoon(session)) {
      return session;
    }

    return refreshSessionSafely();
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      await clearStaleAuthSession();
      return null;
    }

    throw error;
  }
}

export async function handleRecoverableAuthError(error: unknown): Promise<boolean> {
  if (!isInvalidRefreshTokenError(error)) {
    return false;
  }

  await clearStaleAuthSession();
  return true;
}
