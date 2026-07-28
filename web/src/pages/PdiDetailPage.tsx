import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  PDI_EIXO_LABELS,
  PDI_STATUS_LABELS,
  PDI_STATUS_OPTIONS,
  formatPdiDate,
  formatPrazoRelativo,
} from '@/features/pdi/labels';
import type { PdiStatus } from '@/features/pdi/types';
import {
  atualizarProgresso,
  buscarHistoricoPDI,
  buscarPDIById,
  cancelarPDI,
} from '@/services/pdiService';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import { isAdminDashboardRole } from '@/types/supabase';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';
import admin from '../styles/admin.module.css';

const PROGRESSO_OPTIONS = [0, 25, 50, 75, 100] as const;

function canManagePdi(role: ReturnType<typeof useAuthRole>['role']): boolean {
  return (
    role === 'supervisor' ||
    role === 'gestor' ||
    role === 'gerente' ||
    isAdminDashboardRole(role)
  );
}

export function PdiDetailPage() {
  const { pdiId } = useParams<{ pdiId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useAuthRole();

  const isGestor = canManagePdi(role);
  const isColaborador = role === 'colaborador';

  const [status, setStatus] = useState<PdiStatus>('aberto');
  const [progresso, setProgresso] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [comentarioColaborador, setComentarioColaborador] = useState('');
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const pdiQuery = useAsyncData(() => buscarPDIById(pdiId!), [pdiId], {
    enabled: Boolean(pdiId),
  });

  const historicoQuery = useAsyncData(() => buscarHistoricoPDI(pdiId!), [pdiId], {
    enabled: Boolean(pdiId),
  });

  useEffect(() => {
    if (!pdiQuery.data) return;
    setStatus(pdiQuery.data.status);
    setProgresso(pdiQuery.data.progressoPct);
    setObservacoes(pdiQuery.data.observacoesResponsavel ?? '');
    setComentarioColaborador(pdiQuery.data.observacoesColaborador ?? '');
  }, [pdiQuery.data]);

  const isOwner = useMemo(
    () => Boolean(user && pdiQuery.data && pdiQuery.data.colaboradorId === user.id),
    [pdiQuery.data, user],
  );

  async function handleSaveGestor(event: FormEvent) {
    event.preventDefault();
    if (!user || !pdiId) return;

    setIsSaving(true);
    setSaveError(null);
    setFeedback(null);

    try {
      await atualizarProgresso(
        pdiId,
        {
          status,
          progressoPct: progresso,
          observacoesResponsavel: observacoes.trim() || undefined,
          comentarioHistorico: 'Atualização pelo responsável no web.',
        },
        user.id,
      );
      setFeedback('PDI atualizado.');
      pdiQuery.reload();
      historicoQuery.reload();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveColaborador(event: FormEvent) {
    event.preventDefault();
    if (!user || !pdiId) return;

    setIsSaving(true);
    setSaveError(null);
    setFeedback(null);

    try {
      await atualizarProgresso(
        pdiId,
        {
          observacoesColaborador: comentarioColaborador.trim() || undefined,
          comentarioHistorico: 'Comentário do colaborador.',
        },
        user.id,
      );
      setFeedback('Comentário salvo.');
      pdiQuery.reload();
      historicoQuery.reload();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancelar() {
    if (!user || !pdiId) return;
    if (motivoCancelamento.trim().length < 5) {
      setSaveError('Informe o motivo do cancelamento (mín. 5 caracteres).');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await cancelarPDI(pdiId, user.id, motivoCancelamento.trim());
      setShowCancel(false);
      setMotivoCancelamento('');
      setFeedback('PDI cancelado.');
      pdiQuery.reload();
      historicoQuery.reload();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Erro ao cancelar.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={page.page}>
      <PageHeader title="Detalhe do PDI" description="Acompanhe metas, prazo e histórico." />

      {feedback ? (
        <p className={`${admin.feedback} ${admin.feedbackSuccess}`} style={{ marginBottom: '1rem' }}>
          {feedback}
        </p>
      ) : null}

      <PageContent
        isLoading={pdiQuery.isLoading}
        error={pdiQuery.error}
        data={pdiQuery.data}
        onRetry={pdiQuery.reload}
      >
        {(pdi) => (
          <>
            <Card style={{ marginBottom: '1rem' }}>
              <div className={page.listItemHeader}>
                <h2 className={page.pageTitle} style={{ fontSize: '1.25rem' }}>
                  {pdi.titulo}
                </h2>
                <Badge label={PDI_STATUS_LABELS[pdi.status]} tone="accent" />
              </div>
              <p className={page.listItemMeta}>
                {PDI_EIXO_LABELS[pdi.eixo]} · Prazo {formatPdiDate(pdi.prazo)} (
                {formatPrazoRelativo(pdi.prazo)})
              </p>
              {pdi.colaboradorNome ? (
                <p className={page.listItemMeta}>Colaborador: {pdi.colaboradorNome}</p>
              ) : null}
              {pdi.descricao ? <p className={page.listItemBody}>{pdi.descricao}</p> : null}
              <p className={page.listItemBody}>
                <strong>Indicador:</strong> {pdi.indicadorSucesso}
              </p>
              <p className={page.listItemMeta}>Progresso atual: {pdi.progressoPct}%</p>
              {pdi.observacoesResponsavel ? (
                <p className={page.listItemBody}>
                  <strong>Obs. responsável:</strong> {pdi.observacoesResponsavel}
                </p>
              ) : null}
              {pdi.observacoesColaborador ? (
                <p className={page.listItemBody}>
                  <strong>Obs. colaborador:</strong> {pdi.observacoesColaborador}
                </p>
              ) : null}
            </Card>

            {isGestor && pdi.status !== 'cancelado' ? (
              <Card style={{ marginBottom: '1rem' }}>
                <h3 className={page.sectionTitle} style={{ textTransform: 'none' }}>
                  Gestão do responsável
                </h3>
                <form className={page.form} onSubmit={(event) => void handleSaveGestor(event)}>
                  <div className={page.field}>
                    <span className={page.label}>Status</span>
                    <div className={admin.chipGroup}>
                      {PDI_STATUS_OPTIONS.filter((option) => option !== 'cancelado').map(
                        (option) => (
                          <button
                            key={option}
                            type="button"
                            className={`${admin.chip} ${
                              status === option ? admin.chipActive : ''
                            }`.trim()}
                            onClick={() => setStatus(option)}
                          >
                            {PDI_STATUS_LABELS[option]}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div className={page.field}>
                    <span className={page.label}>Progresso</span>
                    <div className={admin.chipGroup}>
                      {PROGRESSO_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={`${admin.chip} ${
                            progresso === option ? admin.chipActive : ''
                          }`.trim()}
                          onClick={() => setProgresso(option)}
                        >
                          {option}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={page.field}>
                    <label className={page.label} htmlFor="pdi-obs-gestor">
                      Observações do responsável
                    </label>
                    <textarea
                      id="pdi-obs-gestor"
                      className={page.textarea}
                      rows={3}
                      value={observacoes}
                      onChange={(event) => setObservacoes(event.target.value)}
                    />
                  </div>

                  {saveError ? <div className={page.error}>{saveError}</div> : null}

                  <div className={page.actions}>
                    <Button type="submit" isLoading={isSaving}>
                      Salvar alterações
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => setShowCancel((value) => !value)}
                    >
                      Cancelar PDI
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => navigate('/app/pdi')}>
                      Voltar
                    </Button>
                  </div>
                </form>

                {showCancel ? (
                  <div className={page.form} style={{ marginTop: '1rem' }}>
                    <div className={page.field}>
                      <label className={page.label} htmlFor="pdi-cancel-motivo">
                        Motivo do cancelamento
                      </label>
                      <textarea
                        id="pdi-cancel-motivo"
                        className={page.textarea}
                        rows={2}
                        value={motivoCancelamento}
                        onChange={(event) => setMotivoCancelamento(event.target.value)}
                      />
                    </div>
                    <Button
                      variant="danger"
                      isLoading={isSaving}
                      onClick={() => void handleCancelar()}
                    >
                      Confirmar cancelamento
                    </Button>
                  </div>
                ) : null}
              </Card>
            ) : null}

            {(isColaborador || isOwner) && !isGestor ? (
              <Card style={{ marginBottom: '1rem' }}>
                <h3 className={page.sectionTitle} style={{ textTransform: 'none' }}>
                  Seu comentário
                </h3>
                <form
                  className={page.form}
                  onSubmit={(event) => void handleSaveColaborador(event)}
                >
                  <div className={page.field}>
                    <label className={page.label} htmlFor="pdi-obs-colab">
                      Observações do colaborador
                    </label>
                    <textarea
                      id="pdi-obs-colab"
                      className={page.textarea}
                      rows={3}
                      value={comentarioColaborador}
                      onChange={(event) => setComentarioColaborador(event.target.value)}
                    />
                  </div>
                  {saveError ? <div className={page.error}>{saveError}</div> : null}
                  <div className={page.actions}>
                    <Button type="submit" isLoading={isSaving}>
                      Salvar comentário
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => navigate('/app/pdi')}>
                      Voltar
                    </Button>
                  </div>
                </form>
              </Card>
            ) : null}

            {!isGestor && !(isColaborador || isOwner) ? (
              <div className={page.actions} style={{ marginBottom: '1rem' }}>
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  Voltar
                </Button>
              </div>
            ) : null}

            <section className={page.section}>
              <h2 className={page.sectionTitle}>Histórico</h2>
              <PageContent
                isLoading={historicoQuery.isLoading}
                error={historicoQuery.error}
                data={historicoQuery.data}
                onRetry={historicoQuery.reload}
                isEmpty={(items) => items.length === 0}
                emptyTitle="Sem atualizações registradas"
              >
                {(items) => (
                  <div className={page.list}>
                    {items.map((item) => (
                      <Card key={item.id} padding="compact">
                        <p className={page.listItemMeta}>
                          {new Date(item.createdAt).toLocaleString('pt-BR')}
                          {item.autorNome ? ` · ${item.autorNome}` : ''}
                        </p>
                        {item.comentario ? (
                          <p className={page.listItemBody}>{item.comentario}</p>
                        ) : null}
                        {item.progressoNovo != null ? (
                          <Badge label={`${item.progressoNovo}%`} tone="info" size="sm" />
                        ) : null}
                      </Card>
                    ))}
                  </div>
                )}
              </PageContent>
            </section>
          </>
        )}
      </PageContent>
    </div>
  );
}
