import { useCallback, useEffect, useState } from 'react';

type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
};

export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[] = [],
  options?: { enabled?: boolean },
): AsyncState<T> {
  const enabled = options?.enabled ?? true;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setError(null);

    void loader()
      .then((result) => {
        if (isActive) {
          setData(result);
        }
      })
      .catch((loadError: unknown) => {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar dados.');
          setData(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, reloadToken]);

  return { data, isLoading, error, reload };
}
