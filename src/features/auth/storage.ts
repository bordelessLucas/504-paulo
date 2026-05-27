import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthUser } from '@/types/auth';

const SESSION_KEY = 'avalia.session';
const USERS_KEY = 'avalia.users';

type StoredUser = AuthUser & {
  password: string;
};

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function getStoredSession(): Promise<AuthUser | null> {
  const rawSession = await getItem(SESSION_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthUser;
  } catch {
    return null;
  }
}

export async function saveSession(user: AuthUser): Promise<void> {
  await setItem(SESSION_KEY, JSON.stringify(user));
}

export async function clearSession(): Promise<void> {
  await deleteItem(SESSION_KEY);
}

export async function getStoredUsers(): Promise<StoredUser[]> {
  const rawUsers = await getItem(USERS_KEY);
  if (!rawUsers) {
    return [];
  }

  try {
    return JSON.parse(rawUsers) as StoredUser[];
  } catch {
    return [];
  }
}

export async function saveStoredUsers(users: StoredUser[]): Promise<void> {
  await setItem(USERS_KEY, JSON.stringify(users));
}

export type { StoredUser };
