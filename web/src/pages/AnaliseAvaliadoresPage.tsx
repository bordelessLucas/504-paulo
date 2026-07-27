import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchGerencialDashboard } from '@/features/gerencial/dashboard-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function AnaliseAvaliadoresPage() {
  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchGerencialDashboard(),
    [],
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Análise dos avaliadores"
        description="Preenchimento e pendências por gestor/supervisor no ciclo atual."
      />

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {(dashboard) => (
          <div className={page.list}>
            {dashboard.statusPreenchimento.map((gestor) => {
              const concluidos = Math.max(gestor.total - gestor.pendentes, 0);
              const pct = gestor.total > 0 ? Math.round((concluidos / gestor.total) * 100) : 0;
              return (
                <Card key={gestor.id} padding="compact">
                  <div className={page.listItemHeader}>
                    <span className={page.listItemTitle}>{gestor.nome}</span>
                    <Badge
                      label={`${pct}%`}
                      tone={pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'danger'}
                      size="sm"
                    />
                  </div>
                  <p className={page.listItemMeta}>
                    {gestor.departamento ?? gestor.role} · {gestor.cicloLabel}
                  </p>
                  <p className={page.listItemBody}>
                    Concluídas: {concluidos} / {gestor.total} · Pendentes: {gestor.pendentes}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </PageContent>
    </div>
  );
}
