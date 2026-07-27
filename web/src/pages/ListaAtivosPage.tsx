import { Users } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchColaboradoresAtivosLista } from '@/features/desempenho/historico-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function ListaAtivosPage() {
  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchColaboradoresAtivosLista(),
    [],
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Lista de ativos"
        description="Colaboradores ativos com dados cadastrais resumidos."
      />

      <PageContent
        isLoading={isLoading}
        error={error}
        data={data}
        onRetry={reload}
        isEmpty={(items) => items.length === 0}
        emptyTitle="Nenhum colaborador ativo"
      >
        {(rows) => (
          <div className={page.list}>
            {rows.map((row) => (
              <Card key={row.id} padding="compact">
                <div className={page.listItemHeader}>
                  <h3 className={page.listItemTitle}>{row.nome}</h3>
                  <Badge label="ativo" tone="success" size="sm" />
                </div>
                <p className={page.listItemMeta}>
                  {row.departamento ?? '—'} · {row.funcao ?? '—'}
                </p>
                {row.nivelIrata ? (
                  <p className={page.listItemBody}>IRATA: {row.nivelIrata}</p>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
}
