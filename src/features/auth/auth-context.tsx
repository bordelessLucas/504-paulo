import type { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { mapAuthError } from '@/features/auth/map-auth-error';
import { resolveUserRole } from '@/features/auth/resolve-user-role';
import { validateLogin, validateRegister } from '@/features/auth/validation';
import { supabase } from '@/lib/supabase';
import type {
  AuthError,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  RegisterResult,
} from '@/types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isProfileReady: boolean;
  isSubmitting: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthError | null>;
  register: (credentials: RegisterCredentials) => Promise<RegisterResult>;
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
    setIsProfileReady(false);

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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await syncSession(session);
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsProfileReady(true);
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
    setIsProfileReady(true);
    router.replace('/(auth)/login');
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isProfileReady,
      isSubmitting,
      login,
      register,
      signOut,
      refetchProfile,
    }),
    [user, isLoading, isProfileReady, isSubmitting, login, register, signOut, refetchProfile],
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
