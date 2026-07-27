import { useState } from 'react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchStatusSolicitacoes } from '@/features/desempenho/historico-api';
import type { StatusSolicitacaoSalarial } from '@/types/supabase';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

const STATUS_OPTIONS: Array<{ value: StatusSolicitacaoSalarial | 'todos'; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendente_rh', label: 'Pendente RH' },
  { value: 'pendente_ceo', label: 'Pendente CEO' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'recusado', label: 'Recusado' },
  { value: 'devolvida', label: 'Devolvida' },
];

export function StatusSolicitacoesPage() {
  const [status, setStatus] = useState<StatusSolicitacaoSalarial | 'todos'>('todos');

  const { data, isLoading, error, reload } = useAsyncData(
    () =>
      fetchStatusSolicitacoes(
        status === 'todos' ? undefined : { status },
      ),
    [status],
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Status de solicitações"
        description="Acompanhamento de autoavaliações e pedidos de reajuste."
      />

      <div className={page.chips}>
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${page.chip} ${status === option.value ? page.chipActive : ''}`.trim()}
            onClick={() => setStatus(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <PageContent
        isLoading={isLoading}
        error={error}
        data={data}
        onRetry={reload}
        isEmpty={(items) => items.length === 0}
        emptyTitle="Nenhuma solicitação encontrada"
      >
        {(rows) => (
          <div className={page.list}>
            {rows.map((row) => (
              <Card key={row.id} padding="compact">
                <div className={page.listItemHeader}>
                  <h3 className={page.listItemTitle}>{row.colaboradorNome}</h3>
                  <Badge label={row.status} tone="neutral" size="sm" />
                </div>
                <p className={page.listItemMeta}>
                  {new Date(row.dataSolicitacao).toLocaleDateString('pt-BR')} ·{' '}
                  {row.tipoSolicitacao ?? 'Reajuste'}
                </p>
                <p className={page.listItemBody}>{row.justificativa}</p>
                {row.valorEstimado != null ? (
                  <p className={page.listItemMeta}>
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
