import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import { STATUS_VALIDACAO_LABELS } from '@/features/avaliacao/historico-labels';
import { useAuth } from '@/features/auth/auth-context';
import {
  fetchColaboradorDashboard,
  formatFeedbackDate,
  formatMediaGeral,
} from '@/features/colaborador/dashboard-api';
import { STATUS_SOLICITACAO_LABELS } from '@/features/colaborador/solicitacoes-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function DashboardColaboradorPage() {
  const { user } = useAuth();
  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchColaboradorDashboard(user!.id),
    [user?.id],
    { enabled: Boolean(user?.id) },
  );

  return (
    <div className={page.page}>
      <PageHeader
        title={`Olá, ${user?.name?.split(' ')[0] ?? 'Colaborador'}`}
        description="Resumo do seu desempenho, feedbacks e solicitações."
      />

      <PageContent
        isLoading={isLoading}
        error={error}
        data={data}
        onRetry={reload}
        emptyTitle="Sem dados de dashboard"
        emptyDescription="Ainda não há avaliações registradas para exibir."
      >
        {(dashboard) => (
          <>
            <div className={page.metrics}>
              <div className={page.metric}>
                <div className={page.metricLabel}>Média geral</div>
                <div className={page.metricValue}>{formatMediaGeral(dashboard.mediaGeral)}</div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>Respostas</div>
                <div className={page.metricValue}>{dashboard.totalRespostas}</div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>Tempo de casa</div>
                <div className={page.metricValue} style={{ fontSize: '1rem' }}>
                  {dashboard.tempoEmpresaLabel ?? '—'}
                </div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>Semáforo</div>
                <Badge label={dashboard.semaforoStatus} tone="accent" />
              </div>
            </div>

            {dashboard.temIncidentesRecentes ? (
              <Card style={{ marginBottom: '1rem', borderColor: '#fecaca' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <AlertTriangle color="#b91c1c" size={20} />
                  <p className={page.listItemBody}>
                    Há incidentes recentes registrados. Autoavaliação e reajuste podem estar
                    bloqueados.
                  </p>
                </div>
              </Card>
            ) : null}

            <section className={page.section}>
              <h2 className={page.sectionTitle}>Avaliações em análise</h2>
              {dashboard.avaliacoesEmAnalise.length === 0 ? (
                <p className={page.listItemMeta}>Nenhuma avaliação pendente de validação.</p>
              ) : (
                <div className={page.list}>
                  {dashboard.avaliacoesEmAnalise.map((item) => (
                    <Card key={item.id} padding="compact">
                      <div className={page.listItemHeader}>
                        <span className={page.listItemTitle}>
                          {TIPO_AVALIACAO_LABELS[item.tipo]}
                        </span>
                        <Badge label={STATUS_VALIDACAO_LABELS[item.status]} tone="warning" size="sm" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section className={page.section}>
              <h2 className={page.sectionTitle}>Feedbacks recentes</h2>
              {dashboard.feedbacks.length === 0 ? (
                <p className={page.listItemMeta}>Nenhum feedback disponível.</p>
              ) : (
                <div className={page.list}>
                  {dashboard.feedbacks.slice(0, 8).map((feedback) => (
                    <Card key={feedback.id} padding="compact">
                      <p className={page.listItemBody}>{feedback.texto}</p>
                      <p className={page.listItemMeta}>{formatFeedbackDate(feedback.dataReferencia)}</p>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section className={page.section}>
              <h2 className={page.sectionTitle}>Solicitações</h2>
              {dashboard.solicitacoes.length === 0 ? (
                <p className={page.listItemMeta}>Nenhuma solicitação registrada.</p>
              ) : (
                <div className={page.list}>
                  {dashboard.solicitacoes.map((solicitacao) => (
                    <Card key={solicitacao.id} padding="compact">
                      <div className={page.listItemHeader}>
                        <span className={page.listItemTitle}>
                          {solicitacao.tipo === 'autoavaliacao'
                            ? 'Autoavaliação'
                            : 'Solicitação de reajuste'}
                        </span>
                        <Badge
                          label={STATUS_SOLICITACAO_LABELS[solicitacao.status]}
                          tone="neutral"
                          size="sm"
                        />
                      </div>
                      <p className={page.listItemMeta}>
                        {new Date(solicitacao.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <div className={page.actions}>
              <Link to="/minhas-avaliacoes">
                <Badge label="Ver histórico" tone="accent" />
              </Link>
              <Link to="/pdi">
                <Badge label="Meus PDIs" tone="info" />
              </Link>
            </div>
          </>
        )}
      </PageContent>
    </div>
  );
}
