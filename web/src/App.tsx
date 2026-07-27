import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuth } from '@/features/auth/auth-context';
import { getPrimaryTabForRole } from '@/navigation/role-menus';
import type { UserRole } from '@/types/supabase';

import { InstallPrompt } from './components/InstallPrompt';
import { Spinner } from './components/ui/Spinner';
import { useSubscription, SubscriptionProvider } from './contexts/subscription-context';
import { AppShell } from './layouts/AppShell';
import {
  PublicOnly,
  RequireAuth,
  RequireAuthOrPendingRegistration,
  RequireSubscription,
} from './navigation/guards';
import { getTabPath, TAB_ROUTES } from './navigation/routes';
import {
  FormularioAvaliacaoPage,
  FormularioLotePage,
  LoginPage,
  NotFoundPage,
  PdiDetailPage,
  PdiEquipePage,
  PdiListPage,
  PlansPage,
  RegisterPage,
} from './pages';

function RootRedirect() {
  const { user, isLoading, pendingRegistration } = useAuth();
  const { isSubscribed, isLoading: isSubLoading } = useSubscription();

  if (isLoading || isSubLoading) {
    return <Spinner label="Iniciando Vertek Avalia..." />;
  }

  if (!user) {
    if (pendingRegistration) {
      return <Navigate to="/planos" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (!isSubscribed) {
    return <Navigate to="/planos" replace />;
  }

  const role = (user.role ?? 'colaborador') as UserRole;
  return <Navigate to={getTabPath(getPrimaryTabForRole(role))} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
          <InstallPrompt />
          <Routes>
            <Route path="/" element={<RootRedirect />} />

            <Route element={<PublicOnly />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<RequireAuthOrPendingRegistration />}>
              <Route path="/planos" element={<PlansPage />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route element={<RequireSubscription />}>
                <Route path="/app" element={<AppShell />}>
                  {Object.entries(TAB_ROUTES).map(([key, route]) => (
                    <Route key={key} path={route.path} element={<route.component />} />
                  ))}
                  <Route path="pdi" element={<PdiListPage />} />
                  <Route path="pdi/:pdiId" element={<PdiDetailPage />} />
                  <Route path="pdi-equipe" element={<PdiEquipePage />} />
                  <Route path="avaliacao/:avaliadoId" element={<FormularioAvaliacaoPage />} />
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
