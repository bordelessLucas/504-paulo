import { BarChart3 } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchGerencialDashboard } from '@/features/gerencial/dashboard-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function DashboardsGerenciaisPage() {
  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchGerencialDashboard(),
    [],
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Dashboards gerenciais"
        description="Radar de competências, rankings e preenchimento por gestor."
      />

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {(dashboard) => (
          <>
            <div className={page.metrics}>
              <div className={page.metric}>
                <div className={page.metricLabel}>Média empresa</div>
                <div className={page.metricValue}>
                  {dashboard.ima?.toFixed(1) ?? '—'}
                </div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>Top performer</div>
                <div className={page.metricValue} style={{ fontSize: '1rem' }}>
                  {dashboard.top5[0]?.nome ?? '—'}
                </div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>Gestores</div>
                <div className={page.metricValue}>{dashboard.statusPreenchimento.length}</div>
              </div>
            </div>

            <section className={page.section}>
              <h2 className={page.sectionTitle}>Top 5 performance</h2>
              <div className={page.list}>
                {dashboard.top5.map((item, index) => (
                  <Card key={item.id} padding="compact">
                    <div className={page.listItemHeader}>
                      <span className={page.listItemTitle}>
                        #{index + 1} {item.nome}
                      </span>
                      <Badge label={item.media.toFixed(1)} tone="success" size="sm" />
                    </div>
                    <p className={page.listItemMeta}>{item.departamento ?? '—'}</p>
                  </Card>
                ))}
              </div>
            </section>

            <section className={page.section}>
              <h2 className={page.sectionTitle}>Preenchimento por gestor</h2>
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
                        {gestor.departamento ?? gestor.role} · {concluidos}/{gestor.total}{' '}
                        concluídas
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
