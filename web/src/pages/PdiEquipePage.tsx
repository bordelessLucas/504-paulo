import { Link } from 'react-router-dom';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { PDI_STATUS_LABELS } from '@/features/pdi/labels';
import { useAuth } from '@/features/auth/auth-context';
import { buscarPDIsDaEquipe } from '@/services/pdiService';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function PdiEquipePage() {
  const { user } = useAuth();
  const { data, isLoading, error, reload } = useAsyncData(
    () => buscarPDIsDaEquipe(user!.id),
    [user?.id],
    { enabled: Boolean(user?.id) },
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="PDI da equipe"
        description="Resumo de planos de desenvolvimento por colaborador liderado."
      />

      <PageContent
        isLoading={isLoading}
        error={error}
        data={data}
        onRetry={reload}
        isEmpty={(items) => items.length === 0}
        emptyTitle="Nenhum PDI na equipe"
      >
        {(resumos) => (
          <div className={page.list}>
            {resumos.map((resumo) => (
              <Card key={resumo.colaboradorId} padding="compact">
                <div className={page.listItemHeader}>
                  <div>
                    <h3 className={page.listItemTitle}>{resumo.colaboradorNome}</h3>
                    <p className={page.listItemMeta}>{resumo.departamento ?? '—'}</p>
                  </div>
                  <Badge label={`${resumo.total} PDI(s)`} tone="neutral" size="sm" />
                </div>
                <div className={page.metrics} style={{ marginTop: '0.75rem' }}>
                  <div className={page.metric}>
                    <div className={page.metricLabel}>Abertos</div>
                    <div className={page.metricValue}>{resumo.abertos}</div>
                  </div>
                  <div className={page.metric}>
                    <div className={page.metricLabel}>Em andamento</div>
                    <div className={page.metricValue}>{resumo.emAndamento}</div>
                  </div>
                  <div className={page.metric}>
                    <div className={page.metricLabel}>Concluídos</div>
                    <div className={page.metricValue}>{resumo.concluidos}</div>
                  </div>
                </div>
                {resumo.pdis[0] ? (
                  <p className={page.listItemBody} style={{ marginTop: '0.5rem' }}>
                    Último: {resumo.pdis[0].titulo} · {PDI_STATUS_LABELS[resumo.pdis[0].status]}
                  </p>
                ) : null}
                {resumo.pdis[0] ? (
                  <Link to={`/pdi/${resumo.pdis[0].id}`}>Abrir PDI</Link>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
}
