import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';

import { Button } from './ui/Button';
import { createAutoavaliacaoSolicitacao } from '@/features/colaborador/autoavaliacao-api';
import {
  AUTOAVALIACAO_TIPO_LABELS,
  AUTOAVALIACAO_TIPO_OPTIONS,
  type AutoavaliacaoChecklist,
  type AutoavaliacaoSubmitPayload,
  type AutoavaliacaoTipo,
} from '@/features/colaborador/autoavaliacao-types';
import page from '../styles/page.module.css';
import styles from './AutoavaliacaoForm.module.css';

type AutoavaliacaoFormProps = {
  open: boolean;
  colaboradorId: string;
  onClose: () => void;
  onSuccess: () => void;
};

const EMPTY_CHECKLIST: AutoavaliacaoChecklist = {
  semNoShow: false,
  semAdvertencias: false,
  treinamentosEmDia: false,
  mediaAcimaElegivel: false,
};

export function AutoavaliacaoForm({
  open,
  colaboradorId,
  onClose,
  onSuccess,
}: AutoavaliacaoFormProps) {
  const [tipoSolicitacao, setTipoSolicitacao] =
    useState<AutoavaliacaoTipo>('financiamento_curso');
  const [qualificacoes, setQualificacoes] = useState('');
  const [investimento, setInvestimento] = useState('');
  const [cursoNome, setCursoNome] = useState('');
  const [cursoInstituicao, setCursoInstituicao] = useState('');
  const [valorEstimado, setValorEstimado] = useState('');
  const [checklist, setChecklist] = useState<AutoavaliacaoChecklist>(EMPTY_CHECKLIST);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setTipoSolicitacao('financiamento_curso');
    setQualificacoes('');
    setInvestimento('');
    setCursoNome('');
    setCursoInstituicao('');
    setValorEstimado('');
    setChecklist(EMPTY_CHECKLIST);
    setError(null);
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!checklist.semNoShow || !checklist.semAdvertencias || !checklist.treinamentosEmDia) {
      setError(
        'Confirme o checklist de elegibilidade (sem no-show, sem advertências e NRs em dia).',
      );
      return;
    }

    const payload: AutoavaliacaoSubmitPayload = {
      tipoSolicitacao,
      qualificacoes,
      investimento,
      cursoNome,
      cursoInstituicao,
      valorEstimado,
      checklist,
    };

    setIsSubmitting(true);
    setError(null);

    try {
      await createAutoavaliacaoSolicitacao({
        colaboradorId,
        qualificacoes,
        investimento,
        extra: payload,
      });
      onSuccess();
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível enviar a solicitação.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit =
    !isSubmitting && (qualificacoes.trim().length > 0 || investimento.trim().length > 0);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.dialog}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Solicitação extraordinária</h2>
            <p className={styles.subtitle}>
              Gatilho 6 meses / 1 ano — financiamento de curso, revisão salarial ou nova
              qualificação.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Fechar"
            disabled={isSubmitting}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form className={page.form} onSubmit={(event) => void handleSubmit(event)}>
          <div className={page.chips}>
            {AUTOAVALIACAO_TIPO_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`${page.chip} ${tipoSolicitacao === option ? page.chipActive : ''}`.trim()}
                onClick={() => setTipoSolicitacao(option)}
              >
                {AUTOAVALIACAO_TIPO_LABELS[option]}
              </button>
            ))}
          </div>

          <div className={page.field}>
            <label className={page.label} htmlFor="investimento">
              Justificativa do colaborador
            </label>
            <textarea
              id="investimento"
              className={page.textarea}
              rows={3}
              placeholder="O que mudou no seu desempenho ou qualificação?"
              value={investimento}
              onChange={(event) => setInvestimento(event.target.value)}
            />
          </div>

          <div className={page.field}>
            <label className={page.label} htmlFor="qualificacoes">
              Qualificações / certificados
            </label>
            <textarea
              id="qualificacoes"
              className={page.textarea}
              rows={3}
              placeholder="Ex.: Certificação IRATA N2..."
              value={qualificacoes}
              onChange={(event) => setQualificacoes(event.target.value)}
            />
          </div>

          {tipoSolicitacao === 'financiamento_curso' ? (
            <>
              <div className={page.field}>
                <label className={page.label} htmlFor="cursoNome">
                  Nome do curso
                </label>
                <input
                  id="cursoNome"
                  className={page.input}
                  value={cursoNome}
                  onChange={(event) => setCursoNome(event.target.value)}
                />
              </div>
              <div className={page.field}>
                <label className={page.label} htmlFor="cursoInstituicao">
                  Instituição
                </label>
                <input
                  id="cursoInstituicao"
                  className={page.input}
                  value={cursoInstituicao}
                  onChange={(event) => setCursoInstituicao(event.target.value)}
                />
              </div>
              <div className={page.field}>
                <label className={page.label} htmlFor="valorEstimado">
                  Valor estimado (R$)
                </label>
                <input
                  id="valorEstimado"
                  className={page.input}
                  inputMode="decimal"
                  placeholder="0,00"
                  value={valorEstimado}
                  onChange={(event) => setValorEstimado(event.target.value)}
                />
              </div>
            </>
          ) : null}

          <div>
            <p className={page.label}>Checklist de elegibilidade</p>
            <p className={page.listItemMeta}>
              Médias de campo devem atender à escala 0–3 (elegível tipicamente com IMA ≥ 2,0).
            </p>
            {(
              [
                ['semNoShow', 'Sem no-show nos últimos 6 meses'],
                ['semAdvertencias', 'Sem advertências ou suspensões vigentes'],
                ['treinamentosEmDia', 'NRs e ASO em dia'],
                ['mediaAcimaElegivel', 'Médias de campo elegíveis (IMA ≥ 2,0)'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={checklist[key]}
                  onChange={() =>
                    setChecklist((current) => ({ ...current, [key]: !current[key] }))
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          {error ? <p className={page.fieldError}>{error}</p> : null}

          <div className={page.actions}>
            <Button type="button" variant="ghost" disabled={isSubmitting} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit} isLoading={isSubmitting}>
              Enviar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
