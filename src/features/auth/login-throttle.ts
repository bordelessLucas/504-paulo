/**
 * Rate limit simples no cliente para reduzir força-bruta de senha.
 * Não substitui limites do Supabase Auth no servidor.
 */

const STORAGE_KEY = 'vertek.login.throttle.v1';
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BASE_LOCK_MS = 30 * 1000;

type ThrottleState = {
  failures: number;
  windowStartedAt: number;
  lockedUntil: number;
};

const memoryStore = new Map<string, string>();

function readRaw(): string | null {
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      return globalThis.localStorage.getItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
  return memoryStore.get(STORAGE_KEY) ?? null;
}

function writeRaw(value: string): void {
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.setItem(STORAGE_KEY, value);
      return;
    }
  } catch {
    // fall through to memory
  }
  memoryStore.set(STORAGE_KEY, value);
}

function readState(): ThrottleState {
  try {
    const raw = readRaw();
    if (!raw) {
      return { failures: 0, windowStartedAt: Date.now(), lockedUntil: 0 };
    }
    const parsed = JSON.parse(raw) as ThrottleState;
    if (
      typeof parsed?.failures !== 'number' ||
      typeof parsed?.windowStartedAt !== 'number' ||
      typeof parsed?.lockedUntil !== 'number'
    ) {
      return { failures: 0, windowStartedAt: Date.now(), lockedUntil: 0 };
    }
    return parsed;
  } catch {
    return { failures: 0, windowStartedAt: Date.now(), lockedUntil: 0 };
  }
}

function writeState(state: ThrottleState): void {
  writeRaw(JSON.stringify(state));
}

function normalizeWindow(state: ThrottleState): ThrottleState {
  if (Date.now() - state.windowStartedAt > WINDOW_MS) {
    return { failures: 0, windowStartedAt: Date.now(), lockedUntil: 0 };
  }
  return state;
}

export function getLoginThrottleMessage(): string | null {
  const state = normalizeWindow(readState());
  if (state.lockedUntil > Date.now()) {
    const seconds = Math.ceil((state.lockedUntil - Date.now()) / 1000);
    return `Muitas tentativas. Aguarde ${seconds}s e tente novamente.`;
  }
  return null;
}

export function registerLoginFailure(): string | null {
  let state = normalizeWindow(readState());
  state = {
    ...state,
    failures: state.failures + 1,
  };

  if (state.failures >= MAX_ATTEMPTS) {
    const multiplier = Math.min(8, 2 ** (state.failures - MAX_ATTEMPTS));
    state.lockedUntil = Date.now() + BASE_LOCK_MS * multiplier;
  }

  writeState(state);
  return getLoginThrottleMessage();
}

export function clearLoginThrottle(): void {
  writeState({ failures: 0, windowStartedAt: Date.now(), lockedUntil: 0 });
}
