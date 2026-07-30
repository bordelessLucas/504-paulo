import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { PDIsAbertoPanel } from '../components/avaliacao/PDIsAbertoPanel';
import { PageContent } from '../components/PageContent';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { resolveTipoAvaliacaoPorRole, TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import {
  addPontoMelhoriaAvaliacao,
  fetchPerguntasPorAvaliador,
  fetchPontosMelhoriaAnteriores,
  submitAvaliacao,
} from '@/features/avaliacao/api';
import {
  getRespostaValidationMessage,
  isRespostaCompleta,
  type RespostaFormState,
} from '@/features/avaliacao/validation';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';
import admin from '../styles/admin.module.css';

type RespostaState = Record<string, RespostaFormState>;
type MelhoriasState = Record<string, boolean>;

function createEmptyResposta(): RespostaFormState {
  return { nota: null, justificativa: '', evidencia: '' };
}

export function FormularioAvaliacaoPage() {
  const navigate = useNavigate();
  const { avaliadoId: avaliadoIdParam } = useParams();
  const [searchParams] = useSearchParams();
  const colaboradorId = avaliadoIdParam ?? searchParams.get('colaboradorId');
  const colaboradorNome = searchParams.get('nome') ?? 'Colaborador';

  const { user } = useAuth();
  const { role } = useAuthRole();
  const [respostas, setRespostas] = useState<RespostaState>({});
  const [melhorias, setMelhorias] = useState<MelhoriasState>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastAvaliacaoId, setLastAvaliacaoId] = useState<string | null>(null);
  const [pontoMelhoriaTexto, setPontoMelhoriaTexto] = useState('');
  const [isSavingPonto, setIsSavingPonto] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const tipo = useMemo(() => resolveTipoAvaliacaoPorRole(role), [role]);

  const perguntasQuery = useAsyncData(
    () =>
      fetchPerguntasPorAvaliador({
        role,
        tipo,
        departamentoAvaliador: user?.departamento,
      }),
    [role, tipo, user?.departamento],
    { enabled: Boolean(role && colaboradorId) },
  );

  const melhoriasQuery = useAsyncData(
    () => fetchPontosMelhoriaAnteriores(colaboradorId!),
    [colaboradorId],
    { enabled: Boolean(colaboradorId) },
  );

  function updateResposta(perguntaId: string, patch: Partial<RespostaFormState>) {
    setTouched((current) => ({ ...current, [perguntaId]: true }));
    setRespostas((current) => ({
      ...current,
      [perguntaId]: {
        ...(current[perguntaId] ?? createEmptyResposta()),
        ...patch,
      },
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || !colaboradorId || !perguntasQuery.data) return;

    const incomplete = perguntasQuery.data.find((pergunta) => {
      const resposta = respostas[pergunta.id] ?? createEmptyResposta();
      return !isRespostaCompleta(resposta);
    });

    if (incomplete) {
      const perguntas = perguntasQuery.data;
      setTouched((current) => {
        const next = { ...current };
        for (const pergunta of perguntas) {
          next[pergunta.id] = true;
        }
        return next;
      });
      setSubmitError('Complete todas as notas e campos obrigatórios de governança.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = perguntasQuery.data.map((pergunta) => {
        const resposta = respostas[pergunta.id] ?? createEmptyResposta();
        return {
          perguntaId: pergunta.id,
          nota: resposta.nota as number,
          justificativa: resposta.justificativa || undefined,
          evidencia: resposta.evidencia || undefined,
        };
      });

      const melhoriasPayload = (melhoriasQuery.data ?? []).map((ponto) => ({
        pontoId: ponto.id,
        melhorou: melhorias[ponto.id] ?? false,
      }));

      const { avaliacaoId } = await submitAvaliacao({
        avaliadorId: user.id,
        avaliadoId: colaboradorId,
        tipo,
        respostas: payload,
        melhorias: melhoriasPayload,
      });

      setLastAvaliacaoId(avaliacaoId);
      setSuccessMessage('Avaliação enviada. Deseja registrar um novo ponto de melhoria?');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao enviar avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSavePontoMelhoria() {
    if (!lastAvaliacaoId || !pontoMelhoriaTexto.trim()) {
      setSubmitError('Informe o texto do ponto de melhoria.');
      return;
    }

    setIsSavingPonto(true);
    setSubmitError(null);
    try {
      await addPontoMelhoriaAvaliacao(lastAvaliacaoId, pontoMelhoriaTexto.trim());
      navigate('/app/painel-avaliacao');
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Não foi possível salvar o ponto de melhoria.',
      );
    } finally {
      setIsSavingPonto(false);
    }
  }

  if (!colaboradorId) {
    return (
      <div className={page.page}>
        <div className={page.error}>Colaborador não informado na rota.</div>
        <Button variant="secondary" onClick={() => navigate('/app/painel-avaliacao')}>
          Voltar ao painel
        </Button>
      </div>
    );
  }

  if (lastAvaliacaoId) {
    return (
      <div className={page.page}>
        <PageHeader
          title="Ponto de melhoria"
          description={successMessage ?? 'Avaliação enviada para validação do RH.'}
        />
        <Card padding="compact">
          <div className={page.field}>
            <label className={page.label} htmlFor="ponto-melhoria">
              Novo ponto de melhoria (opcional)
            </label>
            <textarea
              id="ponto-melhoria"
              className={page.textarea}
              rows={3}
              value={pontoMelhoriaTexto}
              onChange={(event) => setPontoMelhoriaTexto(event.target.value)}
              placeholder={`Ex.: ${colaboradorNome} precisa reforçar...`}
            />
          </div>
          {submitError ? <div className={page.error}>{submitError}</div> : null}
          <div className={page.actions}>
            <Button isLoading={isSavingPonto} onClick={() => void handleSavePontoMelhoria()}>
              Salvar ponto
            </Button>
            <Button variant="secondary" onClick={() => navigate('/app/painel-avaliacao')}>
              Pular e concluir
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={page.page}>
      <PageHeader
        title={colaboradorNome}
        description={`${TIPO_AVALIACAO_LABELS[tipo]} · escala 0 a 3 · notas 0/1 exigem justificativa · nota 3 exige evidência`}
      />

      <PDIsAbertoPanel colaboradorId={colaboradorId} />

      <PageContent
        isLoading={perguntasQuery.isLoading}
        error={perguntasQuery.error}
        data={perguntasQuery.data}
        onRetry={perguntasQuery.reload}
      >
        {(perguntas) => (
          <form className={page.form} onSubmit={(event) => void handleSubmit(event)}>
            {melhoriasQuery.data && melhoriasQuery.data.length > 0 ? (
              <Card padding="compact">
                <h3 className={page.sectionTitle} style={{ textTransform: 'none' }}>
                  Pontos da avaliação anterior
                </h3>
                <p className={admin.hint}>
                  Itens com nota 2 ou 3 na última avaliação. Marque se o colaborador melhorou.
                </p>
                <div className={page.list}>
                  {melhoriasQuery.data.map((ponto) => (
                    <label key={ponto.id} className={admin.checkRow}>
                      <input
                        type="checkbox"
                        checked={melhorias[ponto.id] ?? false}
                        onChange={() =>
                          setMelhorias((current) => ({
                            ...current,
                            [ponto.id]: !current[ponto.id],
                          }))
                        }
                      />
                      <span>{ponto.descricao ?? ponto.id}</span>
                    </label>
                  ))}
                </div>
              </Card>
            ) : null}

            {perguntas.map((pergunta) => {
              const resposta = respostas[pergunta.id] ?? createEmptyResposta();
              const validationMessage = getRespostaValidationMessage(resposta);
              const showValidation = Boolean(touched[pergunta.id]) && validationMessage !== null;

              return (
                <Card key={pergunta.id} padding="compact">
                  <p className={page.listItemTitle}>
                    {pergunta.codigo ? `${pergunta.codigo} · ` : ''}
                    {pergunta.descricao}
                  </p>
                  <div className={page.field}>
                    <label className={page.label}>Nota (0–3)</label>
                    <div className={admin.chipGroup}>
                      {[0, 1, 2, 3].map((nota) => (
                        <button
                          key={nota}
                          type="button"
                          className={`${admin.chip} ${
                            resposta.nota === nota ? admin.chipActive : ''
                          }`.trim()}
                          onClick={() => updateResposta(pergunta.id, { nota })}
                        >
                          {nota}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={page.field}>
                    <label className={page.label}>
                      Justificativa
                      {resposta.nota !== null && resposta.nota <= 1 ? ' (obrigatória)' : ''}
                    </label>
                    <textarea
                      className={page.textarea}
                      rows={2}
                      value={resposta.justificativa}
                      onChange={(event) =>
                        updateResposta(pergunta.id, { justificativa: event.target.value })
                      }
                    />
                  </div>
                  <div className={page.field}>
                    <label className={page.label}>
                      Evidência / elogio
                      {resposta.nota === 3 ? ' (obrigatória)' : ''}
                    </label>
                    <textarea
                      className={page.textarea}
                      rows={2}
                      value={resposta.evidencia}
                      onChange={(event) =>
                        updateResposta(pergunta.id, { evidencia: event.target.value })
                      }
                    />
                  </div>
                  {showValidation ? (
                    <span className={page.fieldError}>{validationMessage}</span>
                  ) : null}
                </Card>
              );
            })}

            {submitError ? <div className={page.error}>{submitError}</div> : null}

            <div className={page.actions}>
              <Button type="submit" isLoading={isSubmitting} disabled={perguntas.length === 0}>
                Enviar avaliação
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </PageContent>
    </div>
  );
}
