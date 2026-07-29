import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchGerencialDashboard } from '@/features/gerencial/dashboard-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function AnaliseAvaliadoresPage() {
  const { data, isLoading, error, reload } = useAsyncData(() => fetchGerencialDashboard(), []);

  const totalPendentes = (data?.statusPreenchimento ?? []).reduce(
    (sum, item) => sum + item.pendentes,
    0,
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Análise dos avaliadores"
        description="Acompanhamento de preenchimento por gestor/supervisor no ciclo atual."
      />

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {(dashboard) => (
          <>
            <div className={page.metrics}>
              <div className={page.metric}>
                <div className={page.metricLabel}>Avaliadores</div>
                <div className={page.metricValue}>{dashboard.statusPreenchimento.length}</div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>Pendências</div>
                <div className={page.metricValue}>{totalPendentes}</div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>IMA empresa</div>
                <div className={page.metricValue}>
                  {dashboard.ima !== null ? dashboard.ima.toFixed(1) : '—'}
                </div>
              </div>
            </div>

            <section className={page.section}>
              <h2 className={page.sectionTitle}>Status por gestor</h2>
              <div className={page.list}>
                {dashboard.statusPreenchimento.map((gestor) => {
                  const concluidos = Math.max(gestor.total - gestor.pendentes, 0);
                  const pct =
                    gestor.total > 0 ? Math.round((concluidos / gestor.total) * 100) : 0;
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
                        {gestor.departamento ?? gestor.role} · {concluidos}/{gestor.total} ·{' '}
                        {gestor.cicloLabel} · {gestor.pendentes} pendente(s)
                      </p>
                    </Card>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </PageContent>
    </div>
  );
}
