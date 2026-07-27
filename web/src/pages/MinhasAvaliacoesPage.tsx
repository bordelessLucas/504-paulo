import { ClipboardList } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import { fetchHistoricoAvaliacoesMasked } from '@/features/avaliacao/historico-api';
import { useAuth } from '@/features/auth/auth-context';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function MinhasAvaliacoesPage() {
  const { user } = useAuth();
  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchHistoricoAvaliacoesMasked(user!.id),
    [user?.id],
    { enabled: Boolean(user?.id) },
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Minhas avaliações"
        description="Histórico de ciclos concluídos com médias consolidadas."
      />

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {(items) =>
          items.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Nenhuma avaliação encontrada"
              description="Quando houver ciclos concluídos, eles aparecerão aqui."
            />
          ) : (
            <div className={page.list}>
              {items.map((item) => (
                <Card key={item.id} padding="compact">
                  <div className={page.listItemHeader}>
                    <h3 className={page.listItemTitle}>{TIPO_AVALIACAO_LABELS[item.tipo]}</h3>
                    <Badge label={item.status ?? '—'} tone="neutral" size="sm" />
                  </div>
                  <p className={page.listItemMeta}>
                    {new Date(item.dataReferencia).toLocaleDateString('pt-BR')}
                    {item.media != null ? ` · Média ${item.media.toFixed(1)}` : ''}
                    {item.avaliadorNome ? ` · ${item.avaliadorNome}` : ''}
                  </p>
                  {item.respostas.length > 0 ? (
                    <p className={page.listItemBody}>
                      {item.respostas.length} critério(s) avaliado(s)
                    </p>
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
