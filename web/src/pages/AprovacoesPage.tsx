import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  isCeoApprovalRole,
  isRhValidationRole,
} from '@/features/aprovacoes/approval-roles';
import {
  atualizarStatusSolicitacao,
  fetchSolicitacoesPorStatus,
  type SolicitacaoMelhoria,
} from '@/features/aprovacoes/api';
import {
  atualizarStatusAvaliacao,
  fetchAvaliacoesPorStatusValidacao,
  type AvaliacaoPendenteValidacao,
} from '@/features/aprovacoes/avaliacoes-validacao-api';
import { TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import { useAuthRole } from '@/hooks/use-auth-role';
import type { StatusSolicitacaoSalarialEnum, StatusValidacaoEnum } from '@/types/supabase';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

type AprovacoesSection = 'solicitacoes' | 'avaliacoes';

export function AprovacoesPage() {
  const { role, isLoading: isRoleLoading } = useAuthRole();
  const [section, setSection] = useState<AprovacoesSection>('solicitacoes');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isRhView = isRhValidationRole(role);
  const isCeoView = isCeoApprovalRole(role);
  const canAccess = isRhView || isCeoView;

  const statusSolicitacao: StatusSolicitacaoSalarialEnum = isRhView
    ? 'pendente_rh'
    : 'pendente_ceo';
  const statusAvaliacao: StatusValidacaoEnum = isRhView ? 'pendente_rh' : 'pendente_ceo';

  const solicitacoesQuery = useAsyncData(
    () => fetchSolicitacoesPorStatus(statusSolicitacao),
    [statusSolicitacao, role],
    { enabled: canAccess },
  );
  const avaliacoesQuery = useAsyncData(
    () => fetchAvaliacoesPorStatusValidacao(statusAvaliacao),
    [statusAvaliacao, role],
    { enabled: canAccess },
  );

  async function handleSolicitacao(
    item: SolicitacaoMelhoria,
    nextStatus: StatusSolicitacaoSalarialEnum,
  ) {
    setProcessingId(item.id);
    try {
      await atualizarStatusSolicitacao(item.id, nextStatus);
      solicitacoesQuery.reload();
    } finally {
      setProcessingId(null);
    }
  }

  async function handleAvaliacao(
    item: AvaliacaoPendenteValidacao,
    nextStatus: StatusValidacaoEnum,
  ) {
    setProcessingId(item.id);
    try {
      await atualizarStatusAvaliacao(item.id, nextStatus);
      avaliacoesQuery.reload();
    } finally {
      setProcessingId(null);
    }
  }

  if (isRoleLoading) {
    return (
      <div className={page.page}>
        <PageHeader title="Aprovações" description="Carregando permissões…" />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className={page.page}>
        <PageHeader
          title="Aprovações"
          description="Você não tem permissão para acessar validações e aprovações."
        />
      </div>
    );
  }

  const title = isRhView ? 'Validações' : 'Aprovações finais';
  const description = isRhView
    ? 'Fila do RH: validar requisitos e encaminhar ao CEO.'
    : 'Fila do CEO: decisão final de solicitações e avaliações.';

  const solicitacoes = solicitacoesQuery.data ?? [];
  const avaliacoes = avaliacoesQuery.data ?? [];

  return (
    <div className={page.page}>
      <PageHeader title={title} description={description} />

      <div className={page.chips}>
        <button
          type="button"
          className={`${page.chip} ${section === 'solicitacoes' ? page.chipActive : ''}`.trim()}
          onClick={() => setSection('solicitacoes')}
        >
          Solicitações ({solicitacoes.length})
        </button>
        <button
          type="button"
          className={`${page.chip} ${section === 'avaliacoes' ? page.chipActive : ''}`.trim()}
          onClick={() => setSection('avaliacoes')}
        >
          Avaliações ({avaliacoes.length})
        </button>
      </div>

      {section === 'solicitacoes' ? (
        <PageContent
          isLoading={solicitacoesQuery.isLoading}
          error={solicitacoesQuery.error}
          data={solicitacoes}
          onRetry={solicitacoesQuery.reload}
          isEmpty={(items) => items.length === 0}
          emptyTitle={
            isRhView
              ? 'Nenhuma solicitação aguardando validação do RH'
              : 'Nenhuma solicitação aguardando aprovação do CEO'
          }
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
                        {isCeoView && item.gerenteNome
                          ? ` · Solicitante: ${item.gerenteNome}`
                          : ''}
                      </p>
                    </div>
                    <Badge
                      label={isCeoView ? 'Validado pelo RH' : item.status}
                      tone="warning"
                      size="sm"
                    />
                  </div>
                  <p className={page.listItemBody}>{item.justificativa}</p>
                  <div className={page.actions}>
                    <Button
                      size="sm"
                      leftIcon={<CheckCircle2 size={16} />}
                      isLoading={processingId === item.id}
                      onClick={() =>
                        void handleSolicitacao(
                          item,
                          isRhView ? 'pendente_ceo' : 'aprovado',
                        )
                      }
                    >
                      {isRhView ? 'Validar e encaminhar ao CEO' : 'Aprovar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={processingId === item.id}
                      onClick={() =>
                        void handleSolicitacao(item, isRhView ? 'devolvida' : 'recusado')
                      }
                    >
                      {isRhView ? 'Devolver ao solicitante' : 'Recusar'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </PageContent>
      ) : (
        <PageContent
          isLoading={avaliacoesQuery.isLoading}
          error={avaliacoesQuery.error}
          data={avaliacoes}
          onRetry={avaliacoesQuery.reload}
          isEmpty={(items) => items.length === 0}
          emptyTitle={
            isRhView
              ? 'Nenhuma avaliação aguardando validação do RH'
              : 'Nenhuma avaliação aguardando aprovação do CEO'
          }
        >
          {(items) => (
            <div className={page.list}>
              {items.map((item) => (
                <Card key={item.id} padding="compact">
                  <div className={page.listItemHeader}>
                    <div>
                      <h3 className={page.listItemTitle}>{item.avaliadoNome}</h3>
                      <p className={page.listItemMeta}>
                        {TIPO_AVALIACAO_LABELS[item.tipo]} ·{' '}
                        {item.avaliadoDepartamento ?? '—'}
                        {item.media != null ? ` · Média ${item.media.toFixed(1)}` : ''}
                      </p>
                    </div>
                    <Badge
                      label={isCeoView ? 'Validado pelo RH' : item.status}
                      tone="warning"
                      size="sm"
                    />
                  </div>
                  <div className={page.actions}>
                    <Button
                      size="sm"
                      leftIcon={<CheckCircle2 size={16} />}
                      isLoading={processingId === item.id}
                      onClick={() =>
                        void handleAvaliacao(item, isRhView ? 'pendente_ceo' : 'aprovada')
                      }
                    >
                      {isRhView ? 'Validar e encaminhar ao CEO' : 'Aprovar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={processingId === item.id}
                      onClick={() =>
                        void handleAvaliacao(item, isRhView ? 'devolvida' : 'recusada')
                      }
                    >
                      {isRhView ? 'Devolver ao avaliador' : 'Recusar'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </PageContent>
      )}
    </div>
  );
}
