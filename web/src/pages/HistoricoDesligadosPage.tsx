import { UserX } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchColaboradoresDesligados } from '@/features/desempenho/historico-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function HistoricoDesligadosPage() {
  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchColaboradoresDesligados(),
    [],
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Histórico de desligados"
        description="Colaboradores desligados com dados de recontratação e perfil de risco."
      />

      <PageContent
        isLoading={isLoading}
        error={error}
        data={data}
        onRetry={reload}
        isEmpty={(items) => items.length === 0}
        emptyTitle="Nenhum desligamento registrado"
      >
        {(rows) => (
          <div className={page.list}>
            {rows.map((row) => (
              <Card key={row.id} padding="compact">
                <div className={page.listItemHeader}>
                  <h3 className={page.listItemTitle}>{row.nome}</h3>
                  <Badge
                    label={row.aptoRecontratacao ? 'Apto' : 'Não apto'}
                    tone={row.aptoRecontratacao ? 'success' : 'danger'}
                    size="sm"
                  />
                </div>
                <p className={page.listItemMeta}>
                  {row.funcao ?? '—'} · Desligamento{' '}
                  {row.dataDemissao
                    ? new Date(row.dataDemissao).toLocaleDateString('pt-BR')
                    : '—'}
                </p>
                {row.motivoDemissao ? (
                  <p className={page.listItemBody}>{row.motivoDemissao}</p>
                ) : null}
                {row.perfilRisco ? (
                  <Badge label={row.perfilRisco} tone="warning" size="sm" />
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
}
