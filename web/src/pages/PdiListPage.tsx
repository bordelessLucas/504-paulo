import { Link } from 'react-router-dom';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { PDI_EIXO_SHORT, PDI_STATUS_LABELS, formatPrazoRelativo } from '@/features/pdi/labels';
import { useAuth } from '@/features/auth/auth-context';
import { buscarMetricasColaborador, buscarPDIsDoColaborador } from '@/services/pdiService';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function PdiListPage() {
  const { user } = useAuth();
  const { data, isLoading, error, reload } = useAsyncData(
    () => buscarPDIsDoColaborador(user!.id),
    [user?.id],
    { enabled: Boolean(user?.id) },
  );
  const metricsQuery = useAsyncData(
    () => buscarMetricasColaborador(user!.id),
    [user?.id],
    { enabled: Boolean(user?.id) },
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Meus PDIs"
        description="Planos de desenvolvimento individual vinculados ao seu perfil."
      />

      {metricsQuery.data ? (
        <div className={page.metrics}>
          <div className={page.metric}>
            <div className={page.metricLabel}>Em andamento</div>
            <div className={page.metricValue}>{metricsQuery.data.emAndamento}</div>
          </div>
          <div className={page.metric}>
            <div className={page.metricLabel}>Concluídos no ano</div>
            <div className={page.metricValue}>{metricsQuery.data.concluidosAno}</div>
          </div>
        </div>
      ) : null}

      <PageContent
        isLoading={isLoading}
        error={error}
        data={data}
        onRetry={reload}
        isEmpty={(items) => items.length === 0}
        emptyTitle="Nenhum PDI encontrado"
        emptyDescription="PDIs são abertos automaticamente quando a média exige acompanhamento."
      >
        {(pdis) => {
          const ativos = pdis.filter(
            (pdi) => pdi.status === 'aberto' || pdi.status === 'em_andamento',
          );
          const concluidos = pdis.filter((pdi) => pdi.status === 'concluido');
          const encerrados = pdis.filter(
            (pdi) => pdi.status === 'vencido' || pdi.status === 'cancelado',
          );

          return (
            <>
              <PdiSection title="Ativos" items={ativos} />
              <PdiSection title="Concluídos" items={concluidos} />
              <PdiSection title="Encerrados" items={encerrados} />
            </>
          );
        }}
      </PageContent>
    </div>
  );
}

function PdiSection({
  title,
  items,
}: {
  title: string;
  items: Array<{
    id: string;
    titulo: string;
    eixo: keyof typeof PDI_EIXO_SHORT;
    prazo: string;
    status: keyof typeof PDI_STATUS_LABELS;
    indicadorSucesso: string;
  }>;
}) {
  if (items.length === 0) return null;

  return (
    <section className={page.section}>
      <h2 className={page.sectionTitle}>
        {title} ({items.length})
      </h2>
      <div className={page.list}>
        {items.map((pdi) => (
          <Card key={pdi.id} padding="compact">
            <div className={page.listItemHeader}>
              <div>
                <h3 className={page.listItemTitle}>{pdi.titulo}</h3>
                <p className={page.listItemMeta}>
                  {PDI_EIXO_SHORT[pdi.eixo]} · {formatPrazoRelativo(pdi.prazo)}
                </p>
              </div>
              <Badge label={PDI_STATUS_LABELS[pdi.status]} tone="info" size="sm" />
            </div>
            <p className={page.listItemBody}>{pdi.indicadorSucesso}</p>
            <Link to={`/app/pdi/${pdi.id}`}>Ver detalhes</Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
