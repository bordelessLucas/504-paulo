import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  clearSession,
  getStoredSession,
  getStoredUsers,
  saveSession,
  saveStoredUsers,
  type StoredUser,
} from '@/features/auth/storage';
import { validateLogin, validateRegister } from '@/features/auth/validation';
import type { AuthError, AuthUser, LoginCredentials, RegisterCredentials } from '@/types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isSubmitting: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthError | null>;
  register: (credentials: RegisterCredentials) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toPublicUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      const session = await getStoredSession();
      if (isMounted) {
        setUser(session);
        setIsLoading(false);
      }
    }

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthError | null> => {
    const validationError = validateLogin(credentials);
    if (validationError) {
      return validationError;
    }

    setIsSubmitting(true);

    try {
      const email = credentials.email.trim().toLowerCase();
      const users = await getStoredUsers();
      const matchedUser = users.find((storedUser) => storedUser.email === email);

      if (!matchedUser || matchedUser.password !== credentials.password) {
        return {
          field: 'general',
          message: 'E-mail ou senha incorretos.',
        };
      }

      const publicUser = toPublicUser(matchedUser);
      await saveSession(publicUser);
      setUser(publicUser);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthError | null> => {
    const validationError = validateRegister(credentials);
    if (validationError) {
      return validationError;
    }

    setIsSubmitting(true);

    try {
      const email = credentials.email.trim().toLowerCase();
      const users = await getStoredUsers();

      if (users.some((storedUser) => storedUser.email === email)) {
        return {
          field: 'email',
          message: 'Este e-mail já está cadastrado.',
        };
      }

      const newUser: StoredUser = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        name: credentials.name.trim(),
        email,
        password: credentials.password,
        createdAt: new Date().toISOString(),
      };

      await saveStoredUsers([...users, newUser]);

      const publicUser = toPublicUser(newUser);
      await saveSession(publicUser);
      setUser(publicUser);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isSubmitting,
      login,
      register,
      signOut,
    }),
    [user, isLoading, isSubmitting, login, register, signOut],
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
