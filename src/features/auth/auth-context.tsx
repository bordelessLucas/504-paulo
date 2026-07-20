import type { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { mapAuthError } from '@/features/auth/map-auth-error';
import { resolveUserRole } from '@/features/auth/resolve-user-role';
import {
  clearStaleAuthSession,
  getSafeSession,
  isInvalidRefreshTokenError,
} from '@/features/auth/session-utils';
import { validateLogin, validateRegister } from '@/features/auth/validation';
import { supabase } from '@/lib/supabase';
import type {
  AuthError,
  AuthUser,
  LoginCredentials,
  PendingRegistration,
  RegisterCredentials,
  RegisterResult,
} from '@/types/auth';
import type { UserRole } from '@/types/supabase';

/**
 * Papel atribuído a quem se cadastra sozinho e paga: dono da conta (CEO),
 * responsável por gerar os demais acessos (RH, gestores, colaboradores, etc.).
 */
const OWNER_ROLE: UserRole = 'ceo';

const UNIQUE_VIOLATION_CODE = '23505';

async function ensureOwnerProfile(userId: string, nome: string): Promise<void> {
  const payload = {
    id: userId,
    nome,
    role: OWNER_ROLE,
  } as const;

  const { error: upsertError } = await supabase.from('profiles').upsert(payload, {
    onConflict: 'id',
  });

  if (upsertError) {
    // Fallback: tenta insert e, se já existir, atualiza o papel para CEO.
    const { error: insertError } = await supabase.from('profiles').insert(payload);

    if (insertError && insertError.code !== UNIQUE_VIOLATION_CODE) {
      throw new Error(
        insertError.message || 'Não foi possível criar o perfil do dono da conta.',
      );
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ nome, role: OWNER_ROLE })
      .eq('id', userId);

    if (updateError) {
      throw new Error(
        updateError.message || 'Não foi possível definir o papel de CEO da conta.',
      );
    }
  }

  const { data: profile, error: verifyError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (verifyError) {
    throw new Error(verifyError.message);
  }

  if (profile?.role !== OWNER_ROLE) {
    throw new Error(
      'Conta criada, mas o papel de CEO não foi aplicado. Contate o suporte.',
    );
  }
}

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isProfileReady: boolean;
  isSubmitting: boolean;
  pendingRegistration: PendingRegistration | null;
  login: (credentials: LoginCredentials) => Promise<AuthError | null>;
  register: (credentials: RegisterCredentials) => Promise<RegisterResult>;
  beginRegistration: (credentials: RegisterCredentials) => AuthError | null;
  completeRegistration: () => Promise<RegisterResult>;
  clearPendingRegistration: () => void;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type ProfileRow = {
  nome: string;
  role: string;
  created_at: string;
  departamento: string | null;
  funcao: string | null;
  avatar_url?: string | null;
};

async function fetchProfileByUserId(userId: string): Promise<ProfileRow | null> {
  const baseSelect = 'nome, role, created_at, departamento, funcao';

  const fetchProfile = async (): Promise<ProfileRow | null> => {
    const { data: baseData, error: baseError } = await supabase
      .from('profiles')
      .select(baseSelect)
      .eq('id', userId)
      .maybeSingle();

    if (baseError) {
      console.warn('[Auth] Falha ao carregar profile:', baseError.message);
      return null;
    }

    if (!baseData) {
      return null;
    }

    const profile: ProfileRow = { ...(baseData as ProfileRow), avatar_url: null };

    const { data: avatarData, error: avatarError } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (!avatarError && avatarData && 'avatar_url' in avatarData) {
      profile.avatar_url = (avatarData as { avatar_url: string | null }).avatar_url;
    }

    return profile;
  };

  const timeoutMs = 12_000;

  return Promise.race([
    fetchProfile(),
    new Promise<null>((resolve) => {
      setTimeout(() => {
        console.warn('[Auth] Timeout ao carregar profile — seguindo sem dados remotos.');
        resolve(null);
      }, timeoutMs);
    }),
  ]);
}

async function buildAuthUser(session: Session): Promise<AuthUser> {
  const profile = await fetchProfileByUserId(session.user.id);

  const metadataName =
    typeof session.user.user_metadata?.nome === 'string'
      ? session.user.user_metadata.nome
      : undefined;

  const role = resolveUserRole(session, profile?.role);

  return {
    id: session.user.id,
    name: profile?.nome ?? metadataName ?? session.user.email?.split('@')[0] ?? 'Usuário',
    email: session.user.email ?? '',
    createdAt: profile?.created_at ?? session.user.created_at,
    role,
    departamento: profile?.departamento ?? null,
    funcao: profile?.funcao ?? null,
    avatarUrl: profile?.avatar_url ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(null);

  const syncSession = useCallback(async (session: Session | null) => {
    if (!session) {
      setUser(null);
      setIsProfileReady(true);
      return;
    }

    const authUser = await buildAuthUser(session);
    setUser(authUser);
    setIsProfileReady(true);
  }, []);

  const refetchProfile = useCallback(async () => {
    const session = await getSafeSession();
    await syncSession(session);
  }, [syncSession]);

  useEffect(() => {
    let isMounted = true;
    let refreshTimer: ReturnType<typeof setInterval> | null = null;

    const stopRefreshTimer = () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
    };

    const startRefreshTimer = () => {
      stopRefreshTimer();
      refreshTimer = setInterval(() => {
        void getSafeSession().then((session) => {
          if (!session && isMounted) {
            setUser(null);
            setIsProfileReady(true);
          }
        });
      }, 5 * 60 * 1000);
    };

    async function bootstrapSession() {
      try {
        const session = await Promise.race([
          getSafeSession(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 15_000)),
        ]);

        if (isMounted) {
          await syncSession(session);
          if (session) {
            startRefreshTimer();
          }
        }
      } catch (error) {
        if (isInvalidRefreshTokenError(error)) {
          await clearStaleAuthSession();
        }

        if (isMounted) {
          setUser(null);
          setIsProfileReady(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      void (async () => {
        try {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await syncSession(session);
            if (session) {
              startRefreshTimer();
            }
            return;
          }

          if (event === 'SIGNED_OUT') {
            stopRefreshTimer();
            setUser(null);
            setIsProfileReady(true);
          }
        } catch (error) {
          if (isInvalidRefreshTokenError(error)) {
            await clearStaleAuthSession();
            stopRefreshTimer();
            setUser(null);
            setIsProfileReady(true);
          }
        }
      })();
    });

    const appStateSubscription =
      Platform.OS === 'web'
        ? null
        : AppState.addEventListener('change', (nextState) => {
            if (nextState !== 'active') {
              return;
            }

            void getSafeSession().then((session) => {
              if (!session && isMounted) {
                setUser(null);
                setIsProfileReady(true);
              }
            });
          });

    return () => {
      isMounted = false;
      stopRefreshTimer();
      subscription.unsubscribe();
      appStateSubscription?.remove();
    };
  }, [syncSession]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthError | null> => {
    const validationError = validateLogin(credentials);
    if (validationError) {
      return validationError;
    }

    setIsSubmitting(true);

    try {
      const email = credentials.email.trim().toLowerCase();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: credentials.password,
      });

      if (error) {
        return mapAuthError(error);
      }

      if (data.session) {
        await syncSession(data.session);
      }

      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [syncSession]);

  const performSignUp = useCallback(
    async (credentials: RegisterCredentials): Promise<RegisterResult> => {
      setIsSubmitting(true);

      try {
        const email = credentials.email.trim().toLowerCase();
        const nome = credentials.name.trim();

        const { data, error } = await supabase.auth.signUp({
          email,
          password: credentials.password,
          options: {
            data: { nome, role: OWNER_ROLE },
          },
        });

        if (error) {
          return { status: 'error', error: mapAuthError(error) };
        }

        if (data.user && !data.session) {
          return { status: 'email_confirmation' };
        }

        if (data.session) {
          try {
            await ensureOwnerProfile(data.session.user.id, nome);
          } catch (profileError) {
            const message =
              profileError instanceof Error
                ? profileError.message
                : 'Não foi possível configurar o perfil de CEO.';
            return { status: 'error', error: { message } };
          }
          await syncSession(data.session);
          return { status: 'authenticated', userId: data.session.user.id };
        }

        return {
          status: 'error',
          error: { message: 'Falha inesperada ao criar a conta. Tente novamente.' },
        };
      } finally {
        setIsSubmitting(false);
      }
    },
    [syncSession],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<RegisterResult> => {
      const validationError = validateRegister(credentials);
      if (validationError) {
        return { status: 'error', error: validationError };
      }

      return performSignUp(credentials);
    },
    [performSignUp],
  );

  const beginRegistration = useCallback(
    (credentials: RegisterCredentials): AuthError | null => {
      const validationError = validateRegister(credentials);
      if (validationError) {
        return validationError;
      }

      setPendingRegistration(credentials);
      return null;
    },
    [],
  );

  const completeRegistration = useCallback(async (): Promise<RegisterResult> => {
    if (!pendingRegistration) {
      return {
        status: 'error',
        error: { message: 'Nenhum cadastro pendente encontrado.' },
      };
    }

    const result = await performSignUp(pendingRegistration);

    if (result.status === 'authenticated') {
      setPendingRegistration(null);
    }

    return result;
  }, [pendingRegistration, performSignUp]);

  const clearPendingRegistration = useCallback(() => {
    setPendingRegistration(null);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      await clearStaleAuthSession();
    }

    setUser(null);
    setIsProfileReady(true);
    setPendingRegistration(null);
    router.replace('/(auth)/login');
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isProfileReady,
      isSubmitting,
      pendingRegistration,
      login,
      register,
      beginRegistration,
      completeRegistration,
      clearPendingRegistration,
      signOut,
      refetchProfile,
    }),
    [
      user,
      isLoading,
      isProfileReady,
      isSubmitting,
      pendingRegistration,
      login,
      register,
      beginRegistration,
      completeRegistration,
      clearPendingRegistration,
      signOut,
      refetchProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
