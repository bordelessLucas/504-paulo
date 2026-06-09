import type { UserRole } from '@/types/supabase';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role?: UserRole;
  departamento?: string | null;
  funcao?: string | null;
  avatarUrl?: string | null;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthError = {
  field?: keyof RegisterCredentials | keyof LoginCredentials | 'general';
  message: string;
};

export type RegisterResult =
  | { status: 'authenticated' }
  | { status: 'email_confirmation' }
  | { status: 'error'; error: AuthError };
