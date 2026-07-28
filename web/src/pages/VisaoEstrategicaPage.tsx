import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchDashboardExecutivo } from '@/features/executivo/api';
import { fetchGerencialDashboard } from '@/features/gerencial/dashboard-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function VisaoEstrategicaPage() {
  const gerencialQuery = useAsyncData(() => fetchGerencialDashboard(), []);
  const executivoQuery = useAsyncData(() => fetchDashboardExecutivo(), []);

  return (
    <div className={page.page}>
      <PageHeader
        title="Visão estratégica"
        description="Comparativo de seções, nine-box, riscos de turnover e plano de sucessão."
      />

      <PageContent
        isLoading={gerencialQuery.isLoading}
        error={gerencialQuery.error}
        data={gerencialQuery.data}
        onRetry={gerencialQuery.reload}
      >
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

      <PageContent
        isLoading={executivoQuery.isLoading}
        error={executivoQuery.error}
        data={executivoQuery.data}
        onRetry={executivoQuery.reload}
      >
        {(dashboard) => (
          <>
            <div className={page.metrics}>
              <div className={page.metric}>
                <div className={page.metricLabel}>Colaboradores</div>
                <div className={page.metricValue}>{dashboard.totalColaboradores}</div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>IMA médio</div>
                <div className={page.metricValue}>{dashboard.imaMedio?.toFixed(1) ?? '—'}</div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>Riscos turnover</div>
                <div className={page.metricValue}>{dashboard.riscos.length}</div>
              </div>
            </div>

            <section className={page.section}>
              <h2 className={page.sectionTitle}>Nine-box (amostra)</h2>
              <div className={page.list}>
                {dashboard.nineBox.slice(0, 12).map((colaborador) => (
                  <Card key={colaborador.id} padding="compact">
                    <div className={page.listItemHeader}>
                      <h3 className={page.listItemTitle}>{colaborador.nome}</h3>
                      <Badge label={colaborador.quadrante} tone="info" size="sm" />
                    </div>
                    <p className={page.listItemMeta}>
                      IMA {colaborador.ima?.toFixed(1) ?? '—'} · {colaborador.acao}
                    </p>
                  </Card>
                ))}
              </div>
            </section>

            <section className={page.section}>
              <h2 className={page.sectionTitle}>Riscos de turnover</h2>
              {dashboard.riscos.length === 0 ? (
                <p className={page.listItemMeta}>Nenhum risco identificado.</p>
              ) : (
                <div className={page.list}>
                  {dashboard.riscos.slice(0, 8).map((risco) => (
                    <Card key={risco.id} padding="compact">
                      <div className={page.listItemHeader}>
                        <span className={page.listItemTitle}>{risco.nome}</span>
                        <Badge label={risco.risco} tone="warning" size="sm" />
                      </div>
                      <p className={page.listItemMeta}>
                        IMA {risco.imaAtual?.toFixed(1) ?? '—'} · Tendência {risco.tendencia}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section className={page.section}>
              <h2 className={page.sectionTitle}>Plano de sucessão</h2>
              <div className={page.list}>
                {dashboard.sucessao.slice(0, 8).map((item) => (
                  <Card key={item.id} padding="compact">
                    <h3 className={page.listItemTitle}>{item.posicaoChave}</h3>
                    <p className={page.listItemMeta}>
                      Titular: {item.titularNome ?? '—'} · Sucessor 1: {item.sucessor1Nome ?? '—'}
                    </p>
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
