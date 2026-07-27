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
  subscribe: (planId: PlanId, explicitUserId?: string) => Promise<void>;
  cancel: () => Promise<void>;
};

type SubscriptionCache = {
  userId: string | null;
  subscription: UserSubscription | null;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      const stored = await loadSubscription(userId);
      if (!isActive) return;

      const cached = cacheRef.current;
      const shouldPreferCache =
        cached.userId === userId && cached.subscription !== null && stored === null;
      const resolved = shouldPreferCache ? cached.subscription : stored;
      cacheRef.current = { userId, subscription: resolved };
      setSubscription(resolved);
      setIsLoading(false);
    }

    void loadForUser();
    return () => {
      isActive = false;
    };
  }, [userId]);

  const subscribe = useCallback(
    async (planId: PlanId, explicitUserId?: string) => {
      const targetUserId = explicitUserId ?? userId;
      if (!targetUserId) {
        throw new Error('Usuário não autenticado.');
      }

      const next: UserSubscription = {
        planId,
        activatedAt: new Date().toISOString(),
      };
      await saveSubscription(targetUserId, next);
      cacheRef.current = { userId: targetUserId, subscription: next };
      setSubscription(next);
    },
    [userId],
  );

  const cancel = useCallback(async () => {
    if (!userId) return;
    await clearSubscription(userId);
    cacheRef.current = { userId, subscription: null };
    setSubscription(null);
  }, [userId]);

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      subscription,
      activePlan: subscription ? getPlanById(subscription.planId) : null,
      isSubscribed: Boolean(subscription),
      isLoading,
      subscribe,
      cancel,
    }),
    [subscription, isLoading, subscribe, cancel],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error('useSubscription deve ser usado dentro de SubscriptionProvider');
  }
  return ctx;
}
