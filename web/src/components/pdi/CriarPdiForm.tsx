import { useState, type FormEvent } from 'react';

import { Button } from '../ui/Button';
import { PDI_EIXO_LABELS, PDI_EIXO_OPTIONS } from '@/features/pdi/labels';
import type { PdiEixo } from '@/features/pdi/types';
import { criarPDI } from '@/services/pdiService';
import page from '../../styles/page.module.css';
import admin from '../../styles/admin.module.css';
import styles from '../AutoavaliacaoForm.module.css';

type CriarPdiFormProps = {
  open: boolean;
  colaboradorId: string;
  colaboradorNome: string;
  criadoPorId: string;
  onClose: () => void;
  onCreated: () => void;
};

function tomorrowIso(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function CriarPdiForm({
  open,
  colaboradorId,
  colaboradorNome,
  criadoPorId,
  onClose,
  onCreated,
}: CriarPdiFormProps) {
  const [eixo, setEixo] = useState<PdiEixo>('geral');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [indicador, setIndicador] = useState('');
  const [prazo, setPrazo] = useState(tomorrowIso());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (titulo.trim().length < 10) {
      setError('O título deve ter pelo menos 10 caracteres.');
      return;
    }
    if (!indicador.trim()) {
      setError('Informe o indicador de sucesso.');
      return;
    }
    if (!prazo || new Date(`${prazo}T00:00:00`) <= new Date()) {
      setError('O prazo deve ser uma data futura.');
      return;
    }

    setIsSaving(true);
    try {
      await criarPDI({
        colaboradorId,
        criadoPorId,
        eixo,
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        indicadorSucesso: indicador.trim(),
        prazo,
      });
      onCreated();
      onClose();
      setTitulo('');
      setDescricao('');
      setIndicador('');
      setEixo('geral');
      setPrazo(tomorrowIso());
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erro ao criar PDI.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.dialog}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Criar PDI</h2>
            <p className={styles.subtitle}>Para {colaboradorNome}</p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>

        <form className={page.form} onSubmit={(event) => void handleSubmit(event)}>
          <div className={page.field}>
            <span className={page.label}>Eixo</span>
            <div className={admin.chipGroup}>
              {PDI_EIXO_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${admin.chip} ${eixo === option ? admin.chipActive : ''}`.trim()}
                  onClick={() => setEixo(option)}
                >
                  {PDI_EIXO_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <div className={page.field}>
            <label className={page.label} htmlFor="pdi-titulo">
              Título
            </label>
            <input
              id="pdi-titulo"
              className={page.input}
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Mínimo 10 caracteres"
              required
            />
          </div>

          <div className={page.field}>
            <label className={page.label} htmlFor="pdi-descricao">
              Descrição (opcional)
            </label>
            <textarea
              id="pdi-descricao"
              className={page.textarea}
              rows={3}
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
            />
          </div>

          <div className={page.field}>
            <label className={page.label} htmlFor="pdi-indicador">
              Indicador de sucesso
            </label>
            <input
              id="pdi-indicador"
              className={page.input}
              value={indicador}
              onChange={(event) => setIndicador(event.target.value)}
              required
            />
          </div>

          <div className={page.field}>
            <label className={page.label} htmlFor="pdi-prazo">
              Prazo
            </label>
            <input
              id="pdi-prazo"
              className={page.input}
              type="date"
              value={prazo}
              min={tomorrowIso()}
              onChange={(event) => setPrazo(event.target.value)}
              required
            />
          </div>

          {error ? <div className={page.error}>{error}</div> : null}

          <div className={page.actions}>
            <Button type="submit" isLoading={isSaving}>
              Criar PDI
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
