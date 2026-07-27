import type { PlanId, UserSubscription } from '@/features/subscription/types';

const STORAGE_PREFIX = '@avalia/subscription/';

const VALID_PLAN_IDS: readonly PlanId[] = ['essencial', 'profissional', 'corporativo'];

function buildKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

function parseSubscription(raw: string | null): UserSubscription | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserSubscription>;

    if (!parsed.planId || !VALID_PLAN_IDS.includes(parsed.planId)) {
      return null;
    }

    return {
      planId: parsed.planId,
      activatedAt: parsed.activatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function loadSubscription(userId: string): Promise<UserSubscription | null> {
  const raw = globalThis.localStorage?.getItem(buildKey(userId)) ?? null;
  return parseSubscription(raw);
}

export async function saveSubscription(
  userId: string,
  subscription: UserSubscription,
): Promise<void> {
  globalThis.localStorage?.setItem(buildKey(userId), JSON.stringify(subscription));
}

export async function clearSubscription(userId: string): Promise<void> {
  globalThis.localStorage?.removeItem(buildKey(userId));
}
