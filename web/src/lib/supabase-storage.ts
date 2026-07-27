const STORAGE_KEY = 'sb-auth-token';

export const supabaseStorage = {
  getItem: (key: string): Promise<string | null> => {
    return Promise.resolve(globalThis.localStorage?.getItem(key) ?? null);
  },
  setItem: (key: string, value: string): Promise<void> => {
    globalThis.localStorage?.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    globalThis.localStorage?.removeItem(key);
    return Promise.resolve();
  },
};

export { STORAGE_KEY };
