import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { supabaseStorage } from '@/lib/supabase-storage';

const REFRESH_MARGIN_SECONDS = 60;
const SESSION_BOOTSTRAP_MS = 5000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Auth session timeout')), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

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

function isNetworkAuthError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network request failed') ||
    message.includes('auth session timeout') ||
    message.includes('load failed')
  );
}

function isRecoverableAuthError(error: unknown): boolean {
  return isInvalidRefreshTokenError(error) || isNetworkAuthError(error);
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
    const { data, error } = await withTimeout(supabase.auth.refreshSession(), SESSION_BOOTSTRAP_MS);

    if (error) {
      if (isRecoverableAuthError(error)) {
        await clearStaleAuthSession();
      }

      return null;
    }

    return data.session;
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      await clearStaleAuthSession();
    }

    return null;
  }
}

export async function getSafeSession(): Promise<Session | null> {
  try {
    const {
      data: { session },
      error,
    } = await withTimeout(supabase.auth.getSession(), SESSION_BOOTSTRAP_MS);

    if (error) {
      if (isRecoverableAuthError(error)) {
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
    if (isRecoverableAuthError(error)) {
      await clearStaleAuthSession();
    }

    return null;
  }
}

export async function handleRecoverableAuthError(error: unknown): Promise<boolean> {
  if (!isInvalidRefreshTokenError(error)) {
    return false;
  }

  await clearStaleAuthSession();
  return true;
}
