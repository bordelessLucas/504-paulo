import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import {
  createSolicitacaoMelhoria,
  formatMediaGeral,
} from '@/features/aprovacoes/api';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import {
  formatMoedaBrl,
  formatPercentualReajuste,
} from '@/features/reajuste/analise';
import {
  fetchColaboradoresReajusteResumo,
  type ColaboradorReajusteResumo,
} from '@/features/reajuste/api';
import {
  MEDIA_MINIMA_REAJUSTE,
  MENSAGEM_INELEGIVEL_REAJUSTE,
} from '@/features/reajuste/eligibility';
import {
  TIPOS_SOLICITACAO_REAJUSTE,
  TIPO_SOLICITACAO_REAJUSTE_LABELS,
  type TipoSolicitacaoReajuste,
} from '@/features/reajuste/types';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';
import admin from '../styles/admin.module.css';
import styles from './PainelReajustePage.module.css';

export function PainelReajustePage() {
  const { user } = useAuth();
  const { role } = useAuthRole();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tipoSolicitacao, setTipoSolicitacao] =
    useState<TipoSolicitacaoReajuste>('reajuste');
  const [justificativa, setJustificativa] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchColaboradoresReajusteResumo(user!.id, role),
    [user?.id, role],
    { enabled: Boolean(user?.id && role) },
  );

  const selected = useMemo(
    () => data?.find((row) => row.id === selectedId) ?? null,
    [data, selectedId],
  );

  const canSubmit =
    Boolean(selected?.isElegivel) && justificativa.trim().length >= 10 && !isSubmitting;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || !selected || !canSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setFeedback(null);

    try {
      await createSolicitacaoMelhoria({
        colaboradorId: selected.id,
        solicitanteId: user.id,
        tipoSolicitacao,
        justificativa,
        mediaGeral: selected.media,
        totalRespostas: selected.totalRespostas,
      });
      setFeedback(
        `Solicitação de ${TIPO_SOLICITACAO_REAJUSTE_LABELS[tipoSolicitacao]} enviada para o RH.`,
      );
      setJustificativa('');
      setTipoSolicitacao('reajuste');
      setSelectedId(null);
      reload();
    } catch (submitErr) {
      setSubmitError(
        submitErr instanceof Error ? submitErr.message : 'Não foi possível enviar a solicitação.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function selectRow(row: ColaboradorReajusteResumo) {
    setSelectedId(row.id);
    setSubmitError(null);
    setFeedback(null);
    setJustificativa('');
    setTipoSolicitacao('reajuste');
  }

  return (
    <div className={page.page} style={{ maxWidth: 1280 }}>
      <PageHeader
        title="Análise de reajuste salarial"
        description="Selecione um colaborador elegível para solicitar melhoria salarial ao RH."
        accessory={<Badge label="Anual" tone="accent" size="sm" />}
      />

      {feedback ? (
        <p className={`${admin.feedback} ${admin.feedbackSuccess}`} style={{ marginBottom: '1rem' }}>
          {feedback}
        </p>
      ) : null}

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {(rows) =>
          rows.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Nenhum colaborador no escopo"
              description="Não há colaboradores elegíveis para análise de reajuste."
            />
          ) : (
            <>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Colaborador</th>
                      <th>Função</th>
                      <th>Especialidade</th>
                      <th>IRATA</th>
                      <th>Tempo de casa</th>
                      <th>IMA</th>
                      <th>Classificação</th>
                      <th>Salário</th>
                      <th>% sugerido</th>
                      <th>Novo salário</th>
                      <th>Recomendação</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const isSelected = selectedId === row.id;
                      return (
                        <tr
                          key={row.id}
                          className={isSelected ? styles.rowSelected : undefined}
                        >
                          <td>
                            <div className={styles.nameCell}>
                              <strong>{row.nome}</strong>
                              <span>{row.departamento ?? '—'}</span>
                            </div>
                          </td>
                          <td>{row.funcao ?? '—'}</td>
                          <td>{row.especialidade ?? '—'}</td>
                          <td>{row.nivelIrata ?? '—'}</td>
                          <td>{row.tempoEmpresaLabel ?? '—'}</td>
                          <td>{row.media?.toFixed(1) ?? '—'}</td>
                          <td>
                            <Badge
                              label={row.analise.classificacaoLabel ?? 'Sem IMA'}
                              tone={
                                row.analise.classificacao === 'critico' ||
                                row.analise.classificacao === 'desenvolvimento'
                                  ? 'danger'
                                  : row.analise.classificacao === 'excepcional' ||
                                      row.analise.classificacao === 'alta_performance'
                                    ? 'success'
                                    : 'neutral'
                              }
                              size="sm"
                            />
                          </td>
                          <td>{formatMoedaBrl(row.salarioBase)}</td>
                          <td>{formatPercentualReajuste(row.analise.percentualSugerido)}</td>
                          <td>{formatMoedaBrl(row.analise.novoSalario)}</td>
                          <td>
                            <div className={styles.recomendacao}>
                              {row.analise.recomendacao}
                              {row.temIncidentesRecentes ? (
                                <span className={styles.alerta}>Incidentes recentes</span>
                              ) : null}
                              {!row.isElegivel ? (
                                <span className={styles.alerta}>Bloqueado para solicitação</span>
                              ) : null}
                            </div>
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant={isSelected ? 'primary' : 'secondary'}
                              onClick={() => selectRow(row)}
                            >
                              {isSelected ? 'Selecionado' : 'Solicitar'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selected ? (
                <section className={admin.panel} style={{ marginTop: '1.25rem' }}>
                  <div className={admin.panelHeader}>
                    <div>
                      <h2 className={admin.panelTitle}>Nova solicitação — {selected.nome}</h2>
                      <p className={admin.panelSubtitle}>
                        {[selected.departamento, selected.funcao].filter(Boolean).join(' · ') ||
                          'Sem departamento'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedId(null);
                        setSubmitError(null);
                      }}
                    >
                      Fechar
                    </Button>
                  </div>

                  <div className={page.metrics}>
                    <div className={page.metric}>
                      <div className={page.metricLabel}>Média geral</div>
                      <div className={page.metricValue}>
                        {formatMediaGeral(selected.media)}
                      </div>
                    </div>
                    <div className={page.metric}>
                      <div className={page.metricLabel}>Respostas</div>
                      <div className={page.metricValue}>{selected.totalRespostas}</div>
                    </div>
                    <div className={page.metric}>
                      <div className={page.metricLabel}>Mínimo</div>
                      <div className={page.metricValue}>{MEDIA_MINIMA_REAJUSTE.toFixed(1)}</div>
                    </div>
                  </div>

                  {selected.temIncidentesRecentes ? (
                    <div className={page.error} style={{ marginBottom: '1rem' }}>
                      Colaborador com incidentes recentes — solicitação bloqueada.
                    </div>
                  ) : null}

                  {!selected.isElegivel && !selected.temIncidentesRecentes ? (
                    <div className={page.error} style={{ marginBottom: '1rem' }}>
                      {MENSAGEM_INELEGIVEL_REAJUSTE}
                    </div>
                  ) : null}

                  {selected.isElegivel ? (
                    <form className={page.form} onSubmit={(event) => void handleSubmit(event)}>
                      <div className={page.field}>
                        <span className={page.label}>Tipo de solicitação</span>
                        <div className={admin.chipGroup}>
                          {TIPOS_SOLICITACAO_REAJUSTE.map((tipo) => (
                            <button
                              key={tipo}
                              type="button"
                              className={`${admin.chip} ${
                                tipoSolicitacao === tipo ? admin.chipActive : ''
                              }`.trim()}
                              onClick={() => setTipoSolicitacao(tipo)}
                            >
                              {TIPO_SOLICITACAO_REAJUSTE_LABELS[tipo]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={page.field}>
                        <label className={page.label} htmlFor="reajuste-justificativa">
                          Justificativa
                        </label>
                        <textarea
                          id="reajuste-justificativa"
                          className={page.textarea}
                          rows={4}
                          value={justificativa}
                          onChange={(event) => setJustificativa(event.target.value)}
                          placeholder="Descreva os motivos, resultados e benefícios esperados..."
                          required
                        />
                        <span className={admin.hint}>
                          Mínimo 10 caracteres · {justificativa.trim().length} digitados
                        </span>
                      </div>

                      {submitError ? <div className={page.error}>{submitError}</div> : null}

                      <div className={page.actions}>
                        <Button type="submit" isLoading={isSubmitting} disabled={!canSubmit}>
                          Enviar {TIPO_SOLICITACAO_REAJUSTE_LABELS[tipoSolicitacao]} para o RH
                        </Button>
                      </div>
                    </form>
                  ) : null}
                </section>
              ) : (
                <p className={admin.hint} style={{ marginTop: '1rem' }}>
                  Selecione um colaborador na tabela para abrir o formulário de solicitação. Acompanhe
                  o status em{' '}
                  <Link to="/app/status-solicitacoes" className={page.authLink}>
                    Status de solicitações
                  </Link>
                  .
                </p>
              )}
            </>
          )
        }
      </PageContent>
    </div>
  );
}
