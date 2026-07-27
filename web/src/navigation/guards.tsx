import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth/auth-context';
import { getPrimaryTabForRole } from '@/navigation/role-menus';
import type { UserRole } from '@/types/supabase';

import { useSubscription } from '../contexts/subscription-context';
import { getTabPath } from '../navigation/routes';
import { Spinner } from '../components/ui/Spinner';

export function PublicOnly() {
  const { user, isLoading, pendingRegistration } = useAuth();
  const { isSubscribed, isLoading: isSubLoading } = useSubscription();

  if (isLoading || isSubLoading) {
    return <Spinner label="Carregando..." />;
  }

  if (user && isSubscribed) {
    const role = (user.role ?? 'colaborador') as UserRole;
    return <Navigate to={getTabPath(getPrimaryTabForRole(role))} replace />;
  }

  if (user && !isSubscribed) {
    return <Navigate to="/planos" replace />;
  }

  if (pendingRegistration) {
    return <Navigate to="/planos" replace />;
  }

  return <Outlet />;
}

/** Autenticado OU cadastro pendente (fluxo register → planos). */
export function RequireAuthOrPendingRegistration() {
  const { user, isLoading, pendingRegistration } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Spinner label="Carregando sessão..." />;
  }

  if (!user && !pendingRegistration) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function RequireAuth() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Spinner label="Carregando sessão..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function RequireSubscription() {
  const { user, isLoading: isAuthLoading, pendingRegistration } = useAuth();
  const { isSubscribed, isLoading } = useSubscription();

  if (isAuthLoading || isLoading) {
    return <Spinner label="Verificando plano..." />;
  }

  if (!isSubscribed) {
    if (user || pendingRegistration) {
      return <Navigate to="/planos" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
