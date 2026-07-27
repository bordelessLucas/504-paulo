import { TrendingUp } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchColaboradoresReajusteResumo } from '@/features/reajuste/api';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function PainelReajustePage() {
  const { user } = useAuth();
  const { role } = useAuthRole();

  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchColaboradoresReajusteResumo(user!.id, role),
    [user?.id, role],
    { enabled: Boolean(user?.id && role) },
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Painel de reajuste"
        description="Elegibilidade e histórico de solicitações salariais da equipe."
      />

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {(rows) =>
          rows.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Nenhum colaborador elegível"
              description="Não há colaboradores no escopo de reajuste."
            />
          ) : (
            <div className={page.list}>
              {rows.map((row) => (
                <Card key={row.id} padding="compact">
                  <div className={page.listItemHeader}>
                    <h3 className={page.listItemTitle}>{row.nome}</h3>
                    <Badge
                      label={row.isElegivel ? 'Elegível' : 'Bloqueado'}
                      tone={row.isElegivel ? 'success' : 'danger'}
                      size="sm"
                    />
                  </div>
                  <p className={page.listItemMeta}>
                    {row.departamento ?? '—'} · Média {row.media?.toFixed(1) ?? '—'}
                  </p>
                  {row.temIncidentesRecentes ? (
                    <p className={page.listItemBody}>Incidentes recentes registrados.</p>
                  ) : null}
                </Card>
              ))}
            </div>
          )
        }
      </PageContent>
    </div>
  );
}
