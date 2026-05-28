import type { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { mapAuthError } from '@/features/auth/map-auth-error';
import { validateLogin, validateRegister } from '@/features/auth/validation';
import { supabase } from '@/lib/supabase';
import type {
  AuthError,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  RegisterResult,
} from '@/types/auth';
import type { UserRole } from '@/types/supabase';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isSubmitting: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthError | null>;
  register: (credentials: RegisterCredentials) => Promise<RegisterResult>;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function buildAuthUser(session: Session): Promise<AuthUser> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('nome, role, created_at, departamento, funcao')
    .eq('id', session.user.id)
    .single();

  if (profileError) {
    console.warn('[Auth] Falha ao carregar profile:', profileError.message);
  }

  const metadataName =
    typeof session.user.user_metadata?.nome === 'string'
      ? session.user.user_metadata.nome
      : undefined;

  return {
    id: session.user.id,
    name: profile?.nome ?? metadataName ?? session.user.email?.split('@')[0] ?? 'Usuário',
    email: session.user.email ?? '',
    createdAt: profile?.created_at ?? session.user.created_at,
    role: profile?.role as UserRole | undefined,
    departamento: profile?.departamento ?? null,
    funcao: profile?.funcao ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syncSession = useCallback(async (session: Session | null) => {
    if (!session) {
      setUser(null);
      return;
    }

    const authUser = await buildAuthUser(session);
    setUser(authUser);
  }, []);

  const refetchProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    await syncSession(session);
  }, [syncSession]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (isMounted) {
        await syncSession(session);
        setIsLoading(false);
      }
    }

    void bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        void syncSession(session);
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
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

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<RegisterResult> => {
      const validationError = validateRegister(credentials);
      if (validationError) {
        return { status: 'error', error: validationError };
      }

      setIsSubmitting(true);

      try {
        const email = credentials.email.trim().toLowerCase();
        const nome = credentials.name.trim();

        const { data, error } = await supabase.auth.signUp({
          email,
          password: credentials.password,
          options: {
            data: { nome },
          },
        });

        if (error) {
          return { status: 'error', error: mapAuthError(error) };
        }

        if (data.user && !data.session) {
          return { status: 'email_confirmation' };
        }

        if (data.session) {
          await syncSession(data.session);
        }

        return { status: 'authenticated' };
      } finally {
        setIsSubmitting(false);
      }
    },
    [syncSession],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.replace('/(auth)/login');
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isSubmitting,
      login,
      register,
      signOut,
      refetchProfile,
    }),
    [user, isLoading, isSubmitting, login, register, signOut, refetchProfile],
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
