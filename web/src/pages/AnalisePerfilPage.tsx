import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchColaboradoresAtivosLista } from '@/features/desempenho/historico-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

function toneForRisco(risco: string | null) {
  const value = (risco ?? '').toLowerCase();
  if (value.includes('crítico') || value.includes('critico')) return 'danger' as const;
  if (value.includes('médio') || value.includes('medio')) return 'warning' as const;
  if (value.includes('baixo')) return 'success' as const;
  return 'neutral' as const;
}

export function AnalisePerfilPage() {
  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchColaboradoresAtivosLista(),
    [],
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Análise de perfil comportamental"
        description="Perfil de risco comportamental dos colaboradores ativos."
      />

      <PageContent
        isLoading={isLoading}
        error={error}
        data={data}
        onRetry={reload}
        isEmpty={(items) => items.length === 0}
        emptyTitle="Nenhum perfil encontrado"
      >
        {(rows) => (
          <div className={page.list}>
            {rows.map((row) => (
              <Card key={row.id} padding="compact">
                <div className={page.listItemHeader}>
                  <span className={page.listItemTitle}>{row.nome}</span>
                  <Badge
                    label={row.perfilRisco ?? 'Sem classificação'}
                    tone={toneForRisco(row.perfilRisco)}
                    size="sm"
                  />
                </div>
                <p className={page.listItemMeta}>
                  {row.departamento ?? '—'} · {row.funcao ?? '—'}
                </p>
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
}
