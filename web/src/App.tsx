import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

import { AuthProvider, useAuth } from '@/features/auth/auth-context';
import { canAccessTab, getPrimaryTabForRole } from '@/navigation/role-menus';
import type { MainTabParamList } from '@/navigation/types';
import type { UserRole } from '@/types/supabase';

import { DocumentMeta } from './components/DocumentMeta';
import { InstallPrompt } from './components/InstallPrompt';
import { OfflineBanner, UpdatePrompt } from './components/PwaChrome';
import { Spinner } from './components/ui/Spinner';
import { useSubscription, SubscriptionProvider } from './contexts/subscription-context';
import { AppShell } from './layouts/AppShell';
import {
  PublicOnly,
  RequireAuth,
  RequireAuthOrPendingRegistration,
  RequirePasswordChanged,
  RequireSubscription,
} from './navigation/guards';
import { getTabPath, TAB_ROUTES } from './navigation/routes';
import {
  FormularioAvaliacaoPage,
  FormularioLotePage,
  HistoricoAvaliacaoColaboradorPage,
  InstalarAppPage,
  LandingPage,
  LoginPage,
  NotFoundPage,
  PdiDetailPage,
  PdiEquipePage,
  PdiListPage,
  PlansPage,
  RegisterPage,
  TrocarSenhaPage,
} from './pages';

function RoleGuardedTab({
  tab,
  children,
}: {
  tab: keyof MainTabParamList;
  children: ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner label="Carregando..." />;
  }

  const role = (user?.role ?? 'colaborador') as UserRole;
  if (!canAccessTab(role, tab)) {
    return <Navigate to={getTabPath(getPrimaryTabForRole(role))} replace />;
  }

  return children;
}
function RootRedirect() {
  const { user, isLoading, pendingRegistration } = useAuth();
  const { isSubscribed, isLoading: isSubLoading } = useSubscription();

  if (!user) {
    if (pendingRegistration) {
      return <Navigate to="/planos" replace />;
    }
    return <LandingPage />;
  }

  if (isLoading || isSubLoading) {
    return <Spinner label="Iniciando Vertek Avalia..." />;
  }

  if (user.mustChangePassword) {
    return <Navigate to="/trocar-senha" replace />;
  }

  if (!isSubscribed) {
    return <Navigate to="/planos" replace />;
  }

  const role = (user.role ?? 'colaborador') as UserRole;
  return <Navigate to={getTabPath(getPrimaryTabForRole(role))} replace />;
}

function AppChrome() {
  const location = useLocation();
  const showInstall = location.pathname !== '/';

  return (
    <>
      <DocumentMeta />
      <OfflineBanner />
      {showInstall ? <InstallPrompt /> : null}
      <UpdatePrompt />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
          <AppChrome />
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/instalar" element={<InstalarAppPage />} />

            <Route element={<PublicOnly />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<RequireAuthOrPendingRegistration />}>
              <Route path="/planos" element={<PlansPage />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route element={<RequirePasswordChanged />}>
                <Route path="/trocar-senha" element={<TrocarSenhaPage />} />
              </Route>
              <Route element={<RequireSubscription />}>
                <Route path="/app" element={<AppShell />}>
                  {Object.entries(TAB_ROUTES).map(([key, route]) => {
                    const tab = key as keyof MainTabParamList;
                    const Component = route.component;
                    return (
                      <Route
                        key={key}
                        path={route.path}
                        element={
                          <RoleGuardedTab tab={tab}>
                            <Component />
                          </RoleGuardedTab>
                        }
                      />
                    );
                  })}
                  <Route path="pdi" element={<PdiListPage />} />
                  <Route path="pdi/:pdiId" element={<PdiDetailPage />} />
                  <Route path="pdi-equipe" element={<PdiEquipePage />} />
                  <Route path="avaliacao/:avaliadoId" element={<FormularioAvaliacaoPage />} />
                  <Route
                    path="avaliacao/:avaliadoId/historico"
                    element={<HistoricoAvaliacaoColaboradorPage />}
                  />
                  <Route path="avaliacao-lote" element={<FormularioLotePage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

