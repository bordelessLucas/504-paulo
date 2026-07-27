import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  atualizarStatusSolicitacao,
  fetchSolicitacoesPorStatus,
  type SolicitacaoMelhoria,
} from '@/features/aprovacoes/api';
import { useAuth } from '@/features/auth/auth-context';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function AprovacoesPage() {
  const { user } = useAuth();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchSolicitacoesPorStatus('pendente_ceo'),
    [],
  );

  async function handleApprove(item: SolicitacaoMelhoria) {
    if (!user) return;
    setProcessingId(item.id);
    try {
      await atualizarStatusSolicitacao(item.id, 'aprovado');
      reload();
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(item: SolicitacaoMelhoria) {
    if (!user) return;
    setProcessingId(item.id);
    try {
      await atualizarStatusSolicitacao(item.id, 'recusado');
      reload();
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className={page.page}>
      <PageHeader
        title="Aprovações"
        description="Solicitações de melhoria salarial pendentes de decisão."
      />

      <PageContent
        isLoading={isLoading}
        error={error}
        data={data}
        onRetry={reload}
        isEmpty={(items) => items.length === 0}
        emptyTitle="Nenhuma solicitação pendente"
        emptyDescription="Todas as solicitações foram processadas."
      >
        {(items) => (
          <div className={page.list}>
            {items.map((item) => (
              <Card key={item.id} padding="compact">
                <div className={page.listItemHeader}>
                  <div>
                    <h3 className={page.listItemTitle}>{item.colaboradorNome}</h3>
                    <p className={page.listItemMeta}>
                      {item.colaboradorDepartamento ?? '—'} ·{' '}
                      {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge label={item.status} tone="warning" size="sm" />
                </div>
                <p className={page.listItemBody}>{item.justificativa}</p>
                <div className={page.actions}>
                  <Button
                    size="sm"
                    leftIcon={<CheckCircle2 size={16} />}
                    isLoading={processingId === item.id}
                    onClick={() => void handleApprove(item)}
                  >
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={processingId === item.id}
                    onClick={() => void handleReject(item)}
                  >
                    Recusar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
}
