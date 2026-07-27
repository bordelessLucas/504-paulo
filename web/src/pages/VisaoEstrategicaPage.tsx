import { Target } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchGerencialDashboard } from '@/features/gerencial/dashboard-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function VisaoEstrategicaPage() {
  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchGerencialDashboard(),
    [],
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Visão estratégica"
        description="Comparativo de seções offshore e ranking consolidado."
      />

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {(dashboard) => (
          <>
            <section className={page.section}>
              <h2 className={page.sectionTitle}>Radar universal</h2>
              <Card padding="compact">
                <div className={page.grid2}>
                  {dashboard.radarUniversal.labels.map((label, index) => (
                    <div key={label} className={page.metric}>
                      <div className={page.metricLabel}>{label}</div>
                      <div className={page.metricValue}>
                        {dashboard.radarUniversal.valores[index]?.toFixed(1) ?? '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            <section className={page.section}>
              <h2 className={page.sectionTitle}>Ranking completo</h2>
              <div className={page.list}>
                {dashboard.rankingCompleto.slice(0, 15).map((item, index) => (
                  <Card key={item.id} padding="compact">
                    <div className={page.listItemHeader}>
                      <span className={page.listItemTitle}>
                        {index + 1}. {item.nome}
                      </span>
                      <Badge label={item.media.toFixed(1)} tone="accent" size="sm" />
                    </div>
                    <p className={page.listItemMeta}>{item.departamento ?? '—'}</p>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </PageContent>
    </div>
  );
}
