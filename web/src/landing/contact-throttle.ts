const STORAGE_KEY = 'vertek.contact.throttle.v1';
const MAX_SENDS = 3;
const WINDOW_MS = 15 * 60 * 1000;

type ThrottleState = {
  sends: number;
  windowStartedAt: number;
};

function readState(): ThrottleState {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      return { sends: 0, windowStartedAt: Date.now() };
    }
    const parsed = JSON.parse(raw) as ThrottleState;
    if (typeof parsed?.sends !== 'number' || typeof parsed?.windowStartedAt !== 'number') {
      return { sends: 0, windowStartedAt: Date.now() };
    }
    if (Date.now() - parsed.windowStartedAt > WINDOW_MS) {
      return { sends: 0, windowStartedAt: Date.now() };
    }
    return parsed;
  } catch {
    return { sends: 0, windowStartedAt: Date.now() };
  }
}

export function getContactThrottleMessage(): string | null {
  const state = readState();
  if (state.sends >= MAX_SENDS) {
    return 'Muitas mensagens em pouco tempo. Aguarde alguns minutos ou escreva para contato@vertek.app.';
  }
  return null;
}

export function registerContactSend(): void {
  const state = readState();
  try {
    globalThis.localStorage?.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sends: state.sends + 1,
        windowStartedAt: state.windowStartedAt,
      }),
    );
  } catch {
    // ignore quota / private mode
  }
}
