import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { fetchHistoricoAvaliacoes } from '@/features/desempenho/historico-api';
import page from '../styles/page.module.css';

type HistoricoListProps = {
  data: Awaited<ReturnType<typeof fetchHistoricoAvaliacoes>> | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

export function HistoricoList({ data, isLoading, error, onRetry }: HistoricoListProps) {
  return (
    <PageContent
      isLoading={isLoading}
      error={error}
      data={data}
      onRetry={onRetry}
      isEmpty={(items) => items.length === 0}
      emptyTitle="Nenhum registro no período"
    >
      {(items) => (
        <div className={page.list}>
          {items.map((row) => (
            <Card key={row.id} padding="compact">
              <div className={page.listItemHeader}>
                <h3 className={page.listItemTitle}>{row.colaboradorNome}</h3>
                <Badge label={row.media?.toFixed(1) ?? '—'} tone="neutral" size="sm" />
              </div>
              <p className={page.listItemMeta}>
                {row.colaboradorFuncao ?? '—'} ·{' '}
                {new Date(row.createdAt).toLocaleDateString('pt-BR')}
              </p>
              {row.avaliadorNome ? (
                <p className={page.listItemBody}>Avaliador: {row.avaliadorNome}</p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </PageContent>
  );
}
