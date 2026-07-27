import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { PDI_EIXO_SHORT, PDI_STATUS_LABELS, formatPrazoRelativo } from '@/features/pdi/labels';
import { useAuth } from '@/features/auth/auth-context';
import { buscarPDIsDoColaborador } from '@/services/pdiService';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function PdiListPage() {
  const { user } = useAuth();
  const { data, isLoading, error, reload } = useAsyncData(
    () => buscarPDIsDoColaborador(user!.id),
    [user?.id],
    { enabled: Boolean(user?.id) },
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Meus PDIs"
        description="Planos de desenvolvimento individual vinculados ao seu perfil."
      />

      <PageContent
        isLoading={isLoading}
        error={error}
        data={data}
        onRetry={reload}
        isEmpty={(items) => items.length === 0}
        emptyTitle="Nenhum PDI encontrado"
        emptyDescription="PDIs são abertos automaticamente quando a média exige acompanhamento."
      >
        {(pdis) => (
          <div className={page.list}>
            {pdis.map((pdi) => (
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
                <Link to={`/pdi/${pdi.id}`}>Ver detalhes</Link>
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
}
