import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAuth } from '@/features/auth/auth-context';
import {
  activateOrganizacaoAssinatura,
  fetchOrganizacaoAssinatura,
  syncLocalAssinaturaToOrganizacao,
} from '@/features/subscription/assinatura-api';
import { getPlanById } from '@/features/subscription/plans';
import {
  clearSubscription,
  loadSubscription,
  saveSubscription,
} from '@/features/subscription/subscription-storage';
import type { PlanId, SubscriptionPlan, UserSubscription } from '@/features/subscription/types';

type SubscriptionContextValue = {
  subscription: UserSubscription | null;
  activePlan: SubscriptionPlan | null;
  isSubscribed: boolean;
  isLoading: boolean;
  /**
   * Ativa um plano para o usuário. Aceita `explicitUserId` para o fluxo em que
   * a conta acabou de ser criada e o estado de sessão ainda não propagou.
   */
  subscribe: (planId: PlanId, explicitUserId?: string) => Promise<void>;
  cancel: () => Promise<void>;
};

type SubscriptionCache = {
  userId: string | null;
  subscription: UserSubscription | null;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

async function resolveSubscriptionForUser(
  userId: string,
  userName?: string | null,
): Promise<UserSubscription | null> {
  const fromDb = await fetchOrganizacaoAssinatura(userId);
  if (fromDb) {
    await saveSubscription(userId, fromDb);
    return fromDb;
  }

  const local = await loadSubscription(userId);
  if (!local) {
    return null;
  }

  // Legado: CEO com plano só no device — promove para a organização.
  return syncLocalAssinaturaToOrganizacao(userId, local, userName);
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cache autoritativo para uma assinatura recém-criada. Evita que um load
  // concorrente (disparado pelo sync da sessão) sobrescreva com `null`.
  const cacheRef = useRef<SubscriptionCache>({ userId: null, subscription: null });

  useEffect(() => {
    let isActive = true;

    async function loadForUser() {
      if (!userId) {
        cacheRef.current = { userId: null, subscription: null };
        setSubscription(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const resolved = await resolveSubscriptionForUser(userId, user?.name);

        if (!isActive) {
          return;
        }

        const cached = cacheRef.current;
        const shouldPreferCache =
          cached.userId === userId && cached.subscription !== null && resolved === null;
        const next = shouldPreferCache ? cached.subscription : resolved;

        cacheRef.current = { userId, subscription: next };
        setSubscription(next);
      } catch {
        if (!isActive) {
          return;
        }

        const local = await loadSubscription(userId);
        const cached = cacheRef.current;
        const shouldPreferCache =
          cached.userId === userId && cached.subscription !== null && local === null;
        const next = shouldPreferCache ? cached.subscription : local;
        cacheRef.current = { userId, subscription: next };
        setSubscription(next);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadForUser();

    return () => {
      isActive = false;
    };
  }, [userId, user?.name]);

  const subscribe = useCallback(
    async (planId: PlanId, explicitUserId?: string) => {
      const targetUserId = explicitUserId ?? userId;

      if (!targetUserId) {
        throw new Error('Usuário não autenticado.');
      }

      const record: UserSubscription = {
        planId,
        activatedAt: new Date().toISOString(),
      };

      // Atualiza o cache antes do await para que qualquer load concorrente
      // já enxergue o registro recém-assinado.
      cacheRef.current = { userId: targetUserId, subscription: record };

      await activateOrganizacaoAssinatura(targetUserId, planId, user?.name);
      await saveSubscription(targetUserId, record);
      setSubscription(record);
    },
    [userId, user?.name],
  );

  const cancel = useCallback(async () => {
    if (!userId) {
      return;
    }

    await clearSubscription(userId);
    cacheRef.current = { userId, subscription: null };
    setSubscription(null);
  }, [userId]);

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      subscription,
      activePlan: subscription ? getPlanById(subscription.planId) : null,
      isSubscribed: subscription !== null,
      isLoading,
      subscribe,
      cancel,
    }),
    [subscription, isLoading, subscribe, cancel],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error('useSubscription deve ser usado dentro de SubscriptionProvider.');
  }

  return context;
}
