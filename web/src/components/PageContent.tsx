import type { ReactNode } from 'react';

import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { Spinner } from './ui/Spinner';
import page from '../styles/page.module.css';

type PageContentProps<T> = {
  isLoading: boolean;
  error: string | null;
  data: T | null;
  isEmpty?: (data: T) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children: (data: T) => ReactNode;
};

export function PageContent<T>({
  isLoading,
  error,
  data,
  isEmpty,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription,
  onRetry,
  children,
}: PageContentProps<T>) {
  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className={page.error}>
        <p>{error}</p>
        {onRetry ? (
          <div className={page.actions} style={{ marginTop: '0.75rem' }}>
            <Button variant="secondary" size="sm" onClick={onRetry}>
              Tentar novamente
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  if (!data || (isEmpty?.(data) ?? false)) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return <>{children(data)}</>;
}
