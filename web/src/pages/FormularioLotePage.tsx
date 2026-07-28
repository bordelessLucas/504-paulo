import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  emptyNotaLote,
  fetchSessaoLoteContext,
  resumirSessaoLote,
  statusLinhaLote,
  submitAvaliacoesLote,
  type NotaLoteState,
} from '@/features/avaliacao/lote-api';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function FormularioLotePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useAuthRole();
  const [notas, setNotas] = useState<Record<string, NotaLoteState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, isLoading, error, reload } = useAsyncData(
    () =>
      fetchSessaoLoteContext({
        role,
        departamentoAvaliador: user?.departamento,
      }),
    [role, user?.departamento],
    { enabled: Boolean(user && role) },
  );

  const resumo = useMemo(() => {
    if (!data) return null;
    return resumirSessaoLote(
      notas,
      data.colaboradores.map((colaborador) => colaborador.id),
    );
  }, [data, notas]);

  function updateNota(colaboradorId: string, field: keyof NotaLoteState, value: string | number) {
    setNotas((current) => ({
      ...current,
      [colaboradorId]: {
        ...(current[colaboradorId] ?? emptyNotaLote()),
        [field]: field === 'n1' || field === 'n2' || field === 'n3' ? Number(value) : String(value),
      },
    }));
  }

  async function handleSubmit() {
    if (!user || !data) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitAvaliacoesLote({
        avaliadorId: user.id,
        tipo: data.tipo,
        perguntas: data.perguntas,
        notas,
      });
      navigate('/app/painel-avaliacao', {
        state: { message: `${result.salvos} avaliação(ões) salva(s) em lote.` },
      });
    } catch (submitErr) {
      setSubmitError(submitErr instanceof Error ? submitErr.message : 'Erro ao salvar lote.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={page.page}>
      <PageHeader
        title="Formulário em lote"
        description="Avalie múltiplos colaboradores com as 3 perguntas da sua seção."
      />

      {resumo ? (
        <div className={page.metrics}>
          <div className={page.metric}>
            <div className={page.metricLabel}>Completos</div>
            <div className={page.metricValue}>{resumo.completos}</div>
          </div>
          <div className={page.metric}>
            <div className={page.metricLabel}>Parciais</div>
            <div className={page.metricValue}>{resumo.parciais}</div>
          </div>
          <div className={page.metric}>
            <div className={page.metricLabel}>Pendentes</div>
            <div className={page.metricValue}>{resumo.pendentes}</div>
          </div>
        </div>
      ) : null}

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {(sessao) => (
          <>
            <div className={page.list}>
              {sessao.colaboradores.slice(0, 30).map((colaborador) => {
                const nota = notas[colaborador.id] ?? emptyNotaLote();
                const status = statusLinhaLote(nota);
                return (
                  <Card key={colaborador.id} padding="compact">
                    <div className={page.listItemHeader}>
                      <div>
                        <h3 className={page.listItemTitle}>{colaborador.nome}</h3>
                        <p className={page.listItemMeta}>{colaborador.funcao ?? '—'}</p>
                      </div>
                      <Badge
                        label={status}
                        tone={
                          status === 'completo'
                            ? 'success'
                            : status === 'parcial'
                              ? 'warning'
                              : 'neutral'
                        }
                        size="sm"
                      />
                    </div>
                    <div className={page.grid2}>
                      {(['n1', 'n2', 'n3'] as const).map((field, index) => (
                        <div key={field} className={page.field}>
                          <label className={page.label}>
                            Nota {index + 1}
                            {sessao.perguntas[index]?.codigo
                              ? ` (${sessao.perguntas[index]?.codigo})`
                              : ''}
                          </label>
                          <select
                            className={page.select}
                            value={nota[field] ?? ''}
                            onChange={(event) =>
                              updateNota(colaborador.id, field, event.target.value)
                            }
                          >
                            <option value="">—</option>
                            {[0, 1, 2, 3].map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                    <div className={page.field}>
                      <label className={page.label}>Justificativa</label>
                      <input
                        className={page.input}
                        value={nota.justificativa}
                        onChange={(event) =>
                          updateNota(colaborador.id, 'justificativa', event.target.value)
                        }
                      />
                    </div>
                  </Card>
                );
              })}
            </div>

            {submitError ? <div className={page.error}>{submitError}</div> : null}

            <div className={page.actions}>
              <Button isLoading={isSubmitting} onClick={() => void handleSubmit()}>
                Salvar lote
              </Button>
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
            </div>
          </>
        )}
      </PageContent>
    </div>
  );
}
