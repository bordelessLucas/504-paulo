import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchStatusSolicitacoes } from '@/features/desempenho/historico-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function HistoricoReajustePage() {
  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchStatusSolicitacoes(),
    [],
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Histórico de reajuste"
        description="Linha do tempo de solicitações de melhoria salarial e autoavaliação."
      />

      <PageContent
        isLoading={isLoading}
        error={error}
        data={data}
        onRetry={reload}
        isEmpty={(items) => items.length === 0}
        emptyTitle="Nenhum registro de reajuste"
      >
        {(rows) => (
          <div className={page.list}>
            {rows.map((row) => (
              <Card key={row.id} padding="compact">
                <div className={page.listItemHeader}>
                  <span className={page.listItemTitle}>{row.colaboradorNome}</span>
                  <Badge label={row.status} tone="neutral" size="sm" />
                </div>
                <p className={page.listItemMeta}>
                  {row.dataSolicitacao.slice(0, 10)} · {row.tipoSolicitacao ?? 'Reajuste'}
                </p>
                {row.valorEstimado != null ? (
                  <p className={page.listItemBody}>
                    R${' '}
                    {Number(row.valorEstimado).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
}
