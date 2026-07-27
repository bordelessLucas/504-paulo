import { Shield } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  fetchDashboardCompliance,
  fetchDenuncias,
  fetchPlanosAcaoCompliance,
  fetchRiscosNr1,
  TIPO_DENUNCIA_LABELS,
} from '@/features/compliance/api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function CompliancePage() {
  const dashboardQuery = useAsyncData(() => fetchDashboardCompliance(), []);
  const denunciasQuery = useAsyncData(() => fetchDenuncias(), []);
  const riscosQuery = useAsyncData(() => fetchRiscosNr1(), []);
  const planosQuery = useAsyncData(() => fetchPlanosAcaoCompliance(), []);

  const isLoading =
    dashboardQuery.isLoading ||
    denunciasQuery.isLoading ||
    riscosQuery.isLoading ||
    planosQuery.isLoading;
  const error =
    dashboardQuery.error ?? denunciasQuery.error ?? riscosQuery.error ?? planosQuery.error;

  return (
    <div className={page.page}>
      <PageHeader
        title="Compliance"
        description="Denúncias, riscos NR-1 e planos de ação."
        accessory={<Badge label="NR-1" tone="accent" size="sm" />}
      />

      {isLoading ? (
        <PageContent isLoading error={null} data={null}>
          {() => null}
        </PageContent>
      ) : error ? (
        <div className={page.error}>{error}</div>
      ) : (
        <>
          {dashboardQuery.data ? (
            <div className={page.metrics}>
              <div className={page.metric}>
                <div className={page.metricLabel}>Denúncias abertas</div>
                <div className={page.metricValue}>{dashboardQuery.data.abertas}</div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>Em análise</div>
                <div className={page.metricValue}>{dashboardQuery.data.emAnalise}</div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>Planos pendentes</div>
                <div className={page.metricValue}>{dashboardQuery.data.planosPendentes}</div>
              </div>
            </div>
          ) : null}

          <section className={page.section}>
            <h2 className={page.sectionTitle}>Denúncias recentes</h2>
            <div className={page.list}>
              {(denunciasQuery.data ?? []).slice(0, 10).map((item) => (
                <Card key={item.id} padding="compact">
                  <div className={page.listItemHeader}>
                    <span className={page.listItemTitle}>{item.id_relato}</span>
                    <Badge label={item.status} tone="warning" size="sm" />
                  </div>
                  <p className={page.listItemMeta}>
                    {item.tipo_denuncia
                      ? TIPO_DENUNCIA_LABELS[item.tipo_denuncia]
                      : 'Tipo não informado'}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          <section className={page.section}>
            <h2 className={page.sectionTitle}>Riscos NR-1</h2>
            <div className={page.list}>
              {(riscosQuery.data ?? []).slice(0, 8).map((risco) => (
                <Card key={risco.id} padding="compact">
                  <div className={page.listItemHeader}>
                    <span className={page.listItemTitle}>{risco.id_risco}</span>
                    <Badge label={risco.nivel_risco ?? '—'} tone="danger" size="sm" />
                  </div>
                  <p className={page.listItemBody}>{risco.descricao}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className={page.section}>
            <h2 className={page.sectionTitle}>Planos de ação</h2>
            <div className={page.list}>
              {(planosQuery.data ?? []).slice(0, 8).map((plano) => (
                <Card key={plano.id} padding="compact">
                  <div className={page.listItemHeader}>
                    <span className={page.listItemTitle}>{plano.id_acao}</span>
                    <Badge label={`${plano.conclusao_pct}%`} tone="info" size="sm" />
                  </div>
                  <p className={page.listItemBody}>{plano.descricao_acao}</p>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
