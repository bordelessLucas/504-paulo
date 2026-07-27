import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchDashboardExecutivo } from '@/features/executivo/api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function AdminDashboardPage() {
  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchDashboardExecutivo(),
    [],
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Painel administrativo"
        description="Nine-box, riscos de turnover e plano de sucessão."
        accessory={<Badge label="Executivo" tone="accent" size="sm" />}
      />

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
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
