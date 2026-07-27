import { useMemo, useState } from 'react';

import { PageContent } from '../components/PageContent';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchStatusSolicitacoes } from '@/features/desempenho/historico-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

type Modo = 'mensal' | 'anual';

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function yearKey(iso: string): string {
  return iso.slice(0, 4);
}

export function ImpactoCaixaPage() {
  const [modo, setModo] = useState<Modo>('mensal');
  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchStatusSolicitacoes({ status: 'aprovado' }),
    [],
  );

  const aprovados = useMemo(
    () =>
      (data ?? []).map((row) => ({
        data: row.dataSolicitacao,
        valor: Number(row.valorEstimado ?? 0),
        nome: row.colaboradorNome,
      })),
    [data],
  );

  const buckets = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of aprovados) {
      const key = modo === 'mensal' ? monthKey(item.data) : yearKey(item.data);
      map.set(key, (map.get(key) ?? 0) + item.valor);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [aprovados, modo]);

  const total = aprovados.reduce((sum, item) => sum + item.valor, 0);

  return (
    <div className={page.page}>
      <PageHeader
        title="Impacto no caixa"
        description="Agregação dos valores estimados de reajustes aprovados."
      />

      <div className={page.chips}>
        {(['mensal', 'anual'] as Modo[]).map((option) => (
          <button
            key={option}
            type="button"
            className={`${page.chip} ${modo === option ? page.chipActive : ''}`.trim()}
            onClick={() => setModo(option)}
          >
            {option === 'mensal' ? 'Mensal' : 'Anual'}
          </button>
        ))}
      </div>

      <div className={page.metrics}>
        <div className={page.metric}>
          <div className={page.metricLabel}>Total aprovado</div>
          <div className={page.metricValue}>
            R$ {total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className={page.metric}>
          <div className={page.metricLabel}>Solicitações</div>
          <div className={page.metricValue}>{aprovados.length}</div>
        </div>
      </div>

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {() => (
          <div className={page.list}>
            {buckets.map(([periodo, valor]) => (
              <Card key={periodo} padding="compact">
                <div className={page.listItemHeader}>
                  <span className={page.listItemTitle}>{periodo}</span>
                  <strong>
                    R$ {valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </strong>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
}
