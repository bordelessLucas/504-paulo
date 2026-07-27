import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PageContent } from '../components/PageContent';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { resolveTipoAvaliacaoPorRole } from '@/features/avaliacao/ciclos';
import {
  fetchPerguntasPorAvaliador,
  fetchPontosMelhoriaAnteriores,
  submitAvaliacao,
} from '@/features/avaliacao/api';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

type RespostaState = Record<string, { nota: number; justificativa: string; evidencia: string }>;

export function FormularioAvaliacaoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const colaboradorId = searchParams.get('colaboradorId');
  const { user } = useAuth();
  const { role } = useAuthRole();
  const [respostas, setRespostas] = useState<RespostaState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  function updateResposta(perguntaId: string, field: 'nota' | 'justificativa' | 'evidencia', value: string | number) {
    setRespostas((current) => ({
      ...current,
      [perguntaId]: {
        nota: field === 'nota' ? Number(value) : (current[perguntaId]?.nota ?? 0),
        justificativa: field === 'justificativa' ? String(value) : (current[perguntaId]?.justificativa ?? ''),
        evidencia: field === 'evidencia' ? String(value) : (current[perguntaId]?.evidencia ?? ''),
      },
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !colaboradorId || !perguntasQuery.data) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = perguntasQuery.data.map((pergunta) => {
        const resposta = respostas[pergunta.id] ?? { nota: 0, justificativa: '', evidencia: '' };
        return {
          perguntaId: pergunta.id,
          nota: resposta.nota,
          justificativa: resposta.justificativa || undefined,
          evidencia: resposta.evidencia || undefined,
        };
      });

      await submitAvaliacao({
        avaliadorId: user.id,
        avaliadoId: colaboradorId,
        tipo,
        respostas: payload,
        melhorias: [],
      });

      navigate('/avaliacao/painel');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao enviar avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!colaboradorId) {
    return (
      <div className={page.page}>
        <div className={page.error}>Informe colaboradorId na URL (?colaboradorId=...)</div>
      </div>
    );
  }

  return (
    <div className={page.page}>
      <PageHeader
        title="Formulário de avaliação"
        description="Preencha as notas de 0 a 3 conforme a metodologia offshore."
      />

      <PageContent
        isLoading={perguntasQuery.isLoading}
        error={perguntasQuery.error}
        data={perguntasQuery.data}
        onRetry={perguntasQuery.reload}
      >
        {(perguntas) => (
          <form className={page.form} onSubmit={(event) => void handleSubmit(event)}>
            {perguntas.map((pergunta) => (
              <Card key={pergunta.id} padding="compact">
                <p className={page.listItemTitle}>
                  {pergunta.codigo ? `${pergunta.codigo} · ` : ''}
                  {pergunta.descricao}
                </p>
                <div className={page.field}>
                  <label className={page.label}>Nota (0–3)</label>
                  <select
                    className={page.select}
                    value={respostas[pergunta.id]?.nota ?? ''}
                    onChange={(event) =>
                      updateResposta(pergunta.id, 'nota', event.target.value)
                    }
                    required
                  >
                    <option value="">Selecione</option>
                    {[0, 1, 2, 3].map((nota) => (
                      <option key={nota} value={nota}>
                        {nota}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={page.field}>
                  <label className={page.label}>Justificativa</label>
                  <textarea
                    className={page.textarea}
                    rows={2}
                    value={respostas[pergunta.id]?.justificativa ?? ''}
                    onChange={(event) =>
                      updateResposta(pergunta.id, 'justificativa', event.target.value)
                    }
                  />
                </div>
                <div className={page.field}>
                  <label className={page.label}>Evidência / elogio</label>
                  <textarea
                    className={page.textarea}
                    rows={2}
                    value={respostas[pergunta.id]?.evidencia ?? ''}
                    onChange={(event) =>
                      updateResposta(pergunta.id, 'evidencia', event.target.value)
                    }
                  />
                </div>
              </Card>
            ))}

            {melhoriasQuery.data && melhoriasQuery.data.length > 0 ? (
              <Card padding="compact">
                <h3 className={page.sectionTitle} style={{ textTransform: 'none' }}>
                  Pontos de melhoria anteriores
                </h3>
                <ul className={page.staticList}>
                  {melhoriasQuery.data.slice(0, 5).map((ponto) => (
                    <li key={ponto.id}>{ponto.descricao ?? ponto.id}</li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {submitError ? <div className={page.error}>{submitError}</div> : null}

            <div className={page.actions}>
              <Button type="submit" isLoading={isSubmitting}>
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
