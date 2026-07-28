import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

import { Button } from '../ui/Button';
import { fetchColaboradoresAtivos, type ColaboradorAtivo } from '@/features/aprovacoes/api';
import { useAuth } from '@/features/auth/auth-context';
import { createIncidente } from '@/features/incidentes/api';
import type { CreateIncidenteInput } from '@/features/incidentes/validation';
import { useAuthRole } from '@/hooks/use-auth-role';
import {
  isAdminDashboardRole,
  TIPO_INCIDENTE_LABELS,
  type TipoIncidente,
} from '@/types/supabase';
import page from '../../styles/page.module.css';
import admin from '../../styles/admin.module.css';

const TIPOS_INCIDENTE: readonly TipoIncidente[] = [
  'acidente_sms',
  'no_show',
  'advertencia',
  'desvio_comportamental',
] as const;

const INITIAL_FORM = {
  tipoIncidente: 'acidente_sms' as TipoIncidente,
  dataOcorrencia: '',
  descricao: '',
  horarioAproximado: '',
  reincidencia: false,
  onOffshore: '' as '' | 'OnShore' | 'Offshore',
  diasEmbarcados: '',
  prevMob: '',
  prevDemob: '',
  plataformaTexto: '',
  relatanteNome: '',
  acaoTomada: '',
  comentarioCliente: '',
};

export function RegistroIncidenteForm() {
  const { user } = useAuth();
  const { role, isLoading: isRoleLoading } = useAuthRole();
  const [colaboradores, setColaboradores] = useState<ColaboradorAtivo[]>([]);
  const [selectedColaborador, setSelectedColaborador] = useState<ColaboradorAtivo | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(INITIAL_FORM);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const canRegister = isAdminDashboardRole(role);

  const loadColaboradores = useCallback(async () => {
    setIsLoadingList(true);
    setError(null);
    try {
      setColaboradores(await fetchColaboradoresAtivos());
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Erro ao carregar colaboradores.',
      );
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (canRegister) {
      void loadColaboradores();
    }
  }, [canRegister, loadColaboradores]);

  const filteredColaboradores = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return colaboradores;
    return colaboradores.filter((colaborador) =>
      [colaborador.nome, colaborador.departamento, colaborador.funcao]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [colaboradores, search]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || !selectedColaborador) {
      setError('Selecione o colaborador antes de registrar.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    const payload: CreateIncidenteInput = {
      colaboradorId: selectedColaborador.id,
      tipoIncidente: form.tipoIncidente,
      dataOcorrencia: form.dataOcorrencia,
      descricao: form.descricao,
      horarioAproximado: form.horarioAproximado,
      reincidencia: form.reincidencia,
      onOffshore: form.onOffshore,
      diasEmbarcados: form.diasEmbarcados,
      prevMob: form.prevMob,
      prevDemob: form.prevDemob,
      plataformaTexto: form.plataformaTexto,
      relatanteNome: form.relatanteNome,
      acaoTomada: form.acaoTomada,
      comentarioCliente: form.comentarioCliente,
    };

    try {
      await createIncidente(user.id, payload);
      setFeedback(`Incidente registrado para ${selectedColaborador.nome}.`);
      setSelectedColaborador(null);
      setForm(INITIAL_FORM);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível registrar o incidente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isRoleLoading) {
    return null;
  }

  if (!canRegister) {
    return (
      <p className={admin.hint}>
        Apenas RH, CEO e administradores podem registrar quebras de deveres.
      </p>
    );
  }

  return (
    <form className={page.form} onSubmit={(event) => void handleSubmit(event)}>
      <div className={page.field}>
        <label className={page.label} htmlFor="incidente-busca">
          Colaborador
        </label>
        <input
          id="incidente-busca"
          className={page.input}
          placeholder="Buscar por nome, departamento ou função"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {isLoadingList ? (
          <p className={admin.hint}>Carregando colaboradores...</p>
        ) : filteredColaboradores.length === 0 ? (
          <p className={admin.hint}>Nenhum colaborador encontrado.</p>
        ) : (
          <div className={admin.colaboradorList}>
            {filteredColaboradores.slice(0, 40).map((colaborador) => (
              <button
                key={colaborador.id}
                type="button"
                className={`${admin.colaboradorItem} ${
                  selectedColaborador?.id === colaborador.id ? admin.colaboradorItemActive : ''
                }`.trim()}
                onClick={() => setSelectedColaborador(colaborador)}
              >
                <span className={admin.colaboradorNome}>{colaborador.nome}</span>
                <span className={admin.colaboradorMeta}>
                  {[colaborador.departamento, colaborador.funcao].filter(Boolean).join(' · ') ||
                    'Sem departamento'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={page.field}>
        <span className={page.label}>Tipo de incidente</span>
        <div className={admin.chipGroup}>
          {TIPOS_INCIDENTE.map((tipo) => (
            <button
              key={tipo}
              type="button"
              className={`${admin.chip} ${
                form.tipoIncidente === tipo ? admin.chipActive : ''
              }`.trim()}
              onClick={() => setForm((current) => ({ ...current, tipoIncidente: tipo }))}
            >
              {TIPO_INCIDENTE_LABELS[tipo]}
            </button>
          ))}
        </div>
      </div>

      <div className={admin.row2}>
        <div className={page.field}>
          <label className={page.label} htmlFor="incidente-data">
            Data da ocorrência
          </label>
          <input
            id="incidente-data"
            className={page.input}
            type="date"
            value={form.dataOcorrencia}
            onChange={(event) =>
              setForm((current) => ({ ...current, dataOcorrencia: event.target.value }))
            }
            required
          />
        </div>
        <div className={page.field}>
          <label className={page.label} htmlFor="incidente-horario">
            Horário aproximado
          </label>
          <input
            id="incidente-horario"
            className={page.input}
            placeholder="Ex.: 14:30"
            value={form.horarioAproximado}
            onChange={(event) =>
              setForm((current) => ({ ...current, horarioAproximado: event.target.value }))
            }
          />
        </div>
      </div>

      <div className={page.field}>
        <label className={page.label} htmlFor="incidente-descricao">
          Descrição
        </label>
        <textarea
          id="incidente-descricao"
          className={page.textarea}
          rows={3}
          value={form.descricao}
          onChange={(event) =>
            setForm((current) => ({ ...current, descricao: event.target.value }))
          }
          required
        />
      </div>

      <div className={admin.row2}>
        <div className={page.field}>
          <span className={page.label}>Ambiente</span>
          <div className={admin.chipGroup}>
            {(['', 'OnShore', 'Offshore'] as const).map((option) => (
              <button
                key={option || 'qualquer'}
                type="button"
                className={`${admin.chip} ${form.onOffshore === option ? admin.chipActive : ''}`.trim()}
                onClick={() => setForm((current) => ({ ...current, onOffshore: option }))}
              >
                {option || 'Não informado'}
              </button>
            ))}
          </div>
        </div>
        <div className={page.field}>
          <label className={page.label} htmlFor="incidente-plataforma">
            Plataforma
          </label>
          <input
            id="incidente-plataforma"
            className={page.input}
            value={form.plataformaTexto}
            onChange={(event) =>
              setForm((current) => ({ ...current, plataformaTexto: event.target.value }))
            }
          />
        </div>
      </div>

      <div className={admin.row2}>
        <div className={page.field}>
          <label className={page.label} htmlFor="incidente-mob">
            Prev. MOB
          </label>
          <input
            id="incidente-mob"
            className={page.input}
            type="date"
            value={form.prevMob}
            onChange={(event) =>
              setForm((current) => ({ ...current, prevMob: event.target.value }))
            }
          />
        </div>
        <div className={page.field}>
          <label className={page.label} htmlFor="incidente-demob">
            Prev. DEMOB
          </label>
          <input
            id="incidente-demob"
            className={page.input}
            type="date"
            value={form.prevDemob}
            onChange={(event) =>
              setForm((current) => ({ ...current, prevDemob: event.target.value }))
            }
          />
        </div>
      </div>

      <div className={admin.row2}>
        <div className={page.field}>
          <label className={page.label} htmlFor="incidente-dias">
            Dias embarcados
          </label>
          <input
            id="incidente-dias"
            className={page.input}
            value={form.diasEmbarcados}
            onChange={(event) =>
              setForm((current) => ({ ...current, diasEmbarcados: event.target.value }))
            }
          />
        </div>
        <div className={page.field}>
          <label className={page.label} htmlFor="incidente-relatante">
            Relatante
          </label>
          <input
            id="incidente-relatante"
            className={page.input}
            value={form.relatanteNome}
            onChange={(event) =>
              setForm((current) => ({ ...current, relatanteNome: event.target.value }))
            }
          />
        </div>
      </div>

      <div className={page.field}>
        <label className={page.label} htmlFor="incidente-acao">
          Ação tomada
        </label>
        <textarea
          id="incidente-acao"
          className={page.textarea}
          rows={2}
          value={form.acaoTomada}
          onChange={(event) =>
            setForm((current) => ({ ...current, acaoTomada: event.target.value }))
          }
        />
      </div>

      <div className={page.field}>
        <label className={page.label} htmlFor="incidente-cliente">
          Comentário do cliente
        </label>
        <textarea
          id="incidente-cliente"
          className={page.textarea}
          rows={2}
          value={form.comentarioCliente}
          onChange={(event) =>
            setForm((current) => ({ ...current, comentarioCliente: event.target.value }))
          }
        />
      </div>

      <label className={admin.checkRow}>
        <input
          type="checkbox"
          checked={form.reincidencia}
          onChange={(event) =>
            setForm((current) => ({ ...current, reincidencia: event.target.checked }))
          }
        />
        <span>Reincidência</span>
      </label>

      {error ? <p className={`${admin.feedback} ${admin.feedbackError}`}>{error}</p> : null}
      {feedback ? <p className={`${admin.feedback} ${admin.feedbackSuccess}`}>{feedback}</p> : null}

      <Button type="submit" isLoading={isSubmitting} disabled={!selectedColaborador}>
        Registrar incidente
      </Button>
    </form>
  );
}
