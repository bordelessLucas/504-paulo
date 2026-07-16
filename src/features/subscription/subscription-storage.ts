import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import type { PlanId, UserSubscription } from '@/features/subscription/types';

const STORAGE_PREFIX = '@avalia/subscription/';

const VALID_PLAN_IDS: readonly PlanId[] = ['essencial', 'profissional', 'corporativo'];

function buildKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

async function readRaw(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return AsyncStorage.getItem(key);
}

async function writeRaw(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  await AsyncStorage.setItem(key, value);
}

async function deleteRaw(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }

  await AsyncStorage.removeItem(key);
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
  const raw = await readRaw(buildKey(userId));
  return parseSubscription(raw);
}

export async function saveSubscription(
  userId: string,
  subscription: UserSubscription,
): Promise<void> {
  await writeRaw(buildKey(userId), JSON.stringify(subscription));
}

export async function clearSubscription(userId: string): Promise<void> {
  await deleteRaw(buildKey(userId));
}
