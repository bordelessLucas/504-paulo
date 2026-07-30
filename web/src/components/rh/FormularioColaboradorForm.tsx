import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { Button } from '../ui/Button';
import { createColaborador } from '@/features/rh/create-colaborador';
import { fetchLideresOptions, type LiderOption } from '@/features/rh/lideres-api';
import {
  NIVEL_IRATA_VALUES,
  PROFILE_STATUS_LABELS,
  PROFILE_STATUS_VALUES,
  type NivelIrataValue,
  type ProfileStatusValue,
} from '@/features/rh/profile-fields';
import type { CreateColaboradorInput } from '@/features/rh/validation';
import { useAuthRole } from '@/hooks/use-auth-role';
import { isAdminDashboardRole } from '@/types/supabase';
import page from '../../styles/page.module.css';
import admin from '../../styles/admin.module.css';

type FormularioColaboradorFormProps = {
  onCreated?: () => void;
};

const INITIAL_FORM: CreateColaboradorInput = {
  email: '',
  nome: '',
  funcao: '',
  departamento: '',
  lider_id: undefined,
  classificacao: '',
  nivel_irata: undefined,
  data_nascimento: '',
  data_admissao: '',
  ddd: '',
  telefone: '',
  expertise: '',
  formacao_tecnica: '',
  codigo_interno: '',
  plataforma: '',
  formacao_academica: '',
  certificacoes: '',
  certificacao_edn: false,
  senha_temporaria: '',
  status: 'ativo',
  telefone_2: '',
  endereco: '',
  cidade_uf: '',
  telefone_emergencia: '',
  tipo_contrato: '',
  especialidade: '',
  aceita_dobra: false,
  perfil_risco: '',
  observacoes: '',
  total_no_show: 0,
  total_bafometro_positivo: 0,
  total_toxicologico_positivo: 0,
  trocas_plataforma_avaliacao_baixa: 0,
};

export function FormularioColaboradorForm({ onCreated }: FormularioColaboradorFormProps) {
  const { role, isLoading: isRoleLoading } = useAuthRole();
  const [form, setForm] = useState<CreateColaboradorInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateColaboradorInput | 'general', string>>
  >({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lideres, setLideres] = useState<LiderOption[]>([]);
  const [isLoadingLideres, setIsLoadingLideres] = useState(false);

  const canCreate = isAdminDashboardRole(role);

  const updateField = useCallback(
    <K extends keyof CreateColaboradorInput>(field: K, value: CreateColaboradorInput[K]) => {
      setForm((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined, general: undefined }));
      setFeedback(null);
    },
    [],
  );

  useEffect(() => {
    if (!canCreate) return;
    setIsLoadingLideres(true);
    void fetchLideresOptions()
      .then(setLideres)
      .catch(() => setLideres([]))
      .finally(() => setIsLoadingLideres(false));
  }, [canCreate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canCreate || isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});
    setFeedback(null);

    const result = await createColaborador(form);

    if ('field' in result) {
      setErrors({ [result.field]: result.message });
      setIsSubmitting(false);
      return;
    }

    const suffix = result.authCreated
      ? ' Conta de acesso criada automaticamente.'
      : ' Perfil vinculado ao usuário existente.';

    setFeedback(`Colaborador cadastrado com sucesso.${suffix}`);
    setForm(INITIAL_FORM);
    onCreated?.();
    setIsSubmitting(false);
  }

  if (isRoleLoading) {
    return null;
  }

  if (!canCreate) {
    return (
      <p className={admin.hint}>
        Apenas RH, CEO e administradores podem cadastrar colaboradores.
      </p>
    );
  }

  return (
    <form className={page.form} onSubmit={(event) => void handleSubmit(event)}>
      <section className={admin.sectionBlock}>
        <h3 className={admin.sectionHeading}>Dados pessoais</h3>
        <div className={admin.row2}>
          <Field
            id="colab-email"
            label="E-mail corporativo"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(value) => updateField('email', value)}
            required
          />
          <Field
            id="colab-nome"
            label="Nome completo"
            value={form.nome}
            error={errors.nome}
            onChange={(value) => updateField('nome', value)}
            required
          />
        </div>
        <div className={admin.row2}>
          <Field
            id="colab-nascimento"
            label="Data de nascimento"
            placeholder="DD/MM/AAAA ou AAAA-MM-DD"
            value={form.data_nascimento ?? ''}
            error={errors.data_nascimento}
            onChange={(value) => updateField('data_nascimento', value)}
          />
          <Field
            id="colab-senha"
            label="Senha temporária (opcional)"
            type="password"
            placeholder="Padrão: senha123"
            value={form.senha_temporaria ?? ''}
            error={errors.senha_temporaria}
            onChange={(value) => updateField('senha_temporaria', value)}
          />
        </div>
        <div className={admin.row2}>
          <Field
            id="colab-ddd"
            label="DDD"
            value={form.ddd ?? ''}
            error={errors.ddd}
            onChange={(value) => updateField('ddd', value)}
          />
          <Field
            id="colab-telefone"
            label="Telefone"
            value={form.telefone ?? ''}
            error={errors.telefone}
            onChange={(value) => updateField('telefone', value)}
          />
        </div>
        <div className={admin.row2}>
          <Field
            id="colab-telefone-2"
            label="Segundo telefone"
            value={form.telefone_2 ?? ''}
            onChange={(value) => updateField('telefone_2', value)}
          />
          <Field
            id="colab-emergencia"
            label="Tel. emergência"
            value={form.telefone_emergencia ?? ''}
            onChange={(value) => updateField('telefone_emergencia', value)}
          />
        </div>
      </section>

      <section className={admin.sectionBlock}>
        <h3 className={admin.sectionHeading}>Dados contratuais</h3>
        <div className={admin.row2}>
          <Field
            id="colab-codigo"
            label="Código interno"
            value={form.codigo_interno ?? ''}
            onChange={(value) => updateField('codigo_interno', value)}
          />
          <Field
            id="colab-plataforma"
            label="Plataforma / unidade"
            value={form.plataforma ?? ''}
            onChange={(value) => updateField('plataforma', value)}
          />
        </div>
        <div className={admin.row2}>
          <Field
            id="colab-funcao"
            label="Função / cargo"
            value={form.funcao ?? ''}
            error={errors.funcao}
            onChange={(value) => updateField('funcao', value)}
          />
          <Field
            id="colab-departamento"
            label="Departamento"
            value={form.departamento ?? ''}
            error={errors.departamento}
            onChange={(value) => updateField('departamento', value)}
          />
        </div>
        <div className={admin.row2}>
          <Field
            id="colab-classificacao"
            label="Classificação"
            value={form.classificacao ?? ''}
            onChange={(value) => updateField('classificacao', value)}
          />
          <Field
            id="colab-admissao"
            label="Data de admissão"
            placeholder="DD/MM/AAAA ou AAAA-MM-DD"
            value={form.data_admissao ?? ''}
            error={errors.data_admissao}
            onChange={(value) => updateField('data_admissao', value)}
          />
        </div>
        <div className={admin.row2}>
          <Field
            id="colab-contrato"
            label="Tipo de contrato"
            value={form.tipo_contrato ?? ''}
            onChange={(value) => updateField('tipo_contrato', value)}
          />
          <Field
            id="colab-especialidade"
            label="Especialidade"
            value={form.especialidade ?? ''}
            onChange={(value) => updateField('especialidade', value)}
          />
        </div>
        <div className={admin.row2}>
          <Field
            id="colab-endereco"
            label="Endereço"
            value={form.endereco ?? ''}
            onChange={(value) => updateField('endereco', value)}
          />
          <Field
            id="colab-cidade"
            label="Cidade/UF"
            value={form.cidade_uf ?? ''}
            onChange={(value) => updateField('cidade_uf', value)}
          />
        </div>
        <div className={admin.row2}>
          <Field
            id="colab-risco"
            label="Perfil de risco"
            value={form.perfil_risco ?? ''}
            onChange={(value) => updateField('perfil_risco', value)}
          />
          <Field
            id="colab-observacoes"
            label="Observações"
            value={form.observacoes ?? ''}
            onChange={(value) => updateField('observacoes', value)}
          />
        </div>

        <div className={page.field}>
          <span className={page.label}>Líder direto (opcional)</span>
          {isLoadingLideres ? (
            <p className={admin.hint}>Carregando líderes...</p>
          ) : (
            <select
              className={page.select}
              value={form.lider_id ?? ''}
              onChange={(event) => updateField('lider_id', event.target.value || undefined)}
            >
              <option value="">Nenhum</option>
              {lideres.map((lider) => (
                <option key={lider.id} value={lider.id}>
                  {lider.nome}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className={page.field}>
          <span className={page.label}>Status</span>
          <div className={admin.chipGroup}>
            {PROFILE_STATUS_VALUES.map((status) => (
              <button
                key={status}
                type="button"
                className={`${admin.chip} ${
                  form.status === status ? admin.chipActive : ''
                }`.trim()}
                onClick={() => updateField('status', status as ProfileStatusValue)}
              >
                {PROFILE_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        <label className={admin.checkRow}>
          <input
            type="checkbox"
            checked={Boolean(form.aceita_dobra)}
            onChange={(event) => updateField('aceita_dobra', event.target.checked)}
          />
          <span>Aceita dobra</span>
        </label>
      </section>

      <section className={admin.sectionBlock}>
        <h3 className={admin.sectionHeading}>Contadores de risco (Excel 1.7)</h3>
        <div className={admin.row2}>
          <NumberField
            id="colab-no-show"
            label="Total de no-show"
            value={form.total_no_show ?? 0}
            error={errors.total_no_show}
            onChange={(value) => updateField('total_no_show', value)}
          />
          <NumberField
            id="colab-bafometro"
            label="Bafômetro positivo"
            value={form.total_bafometro_positivo ?? 0}
            error={errors.total_bafometro_positivo}
            onChange={(value) => updateField('total_bafometro_positivo', value)}
          />
        </div>
        <div className={admin.row2}>
          <NumberField
            id="colab-toxicologico"
            label="Toxicológico positivo"
            value={form.total_toxicologico_positivo ?? 0}
            error={errors.total_toxicologico_positivo}
            onChange={(value) => updateField('total_toxicologico_positivo', value)}
          />
          <NumberField
            id="colab-trocas-plataforma"
            label="Trocas de plataforma (avaliação baixa)"
            value={form.trocas_plataforma_avaliacao_baixa ?? 0}
            error={errors.trocas_plataforma_avaliacao_baixa}
            onChange={(value) => updateField('trocas_plataforma_avaliacao_baixa', value)}
          />
        </div>
      </section>

      <section className={admin.sectionBlock}>
        <h3 className={admin.sectionHeading}>Certificações e competências</h3>
        <div className={page.field}>
          <span className={page.label}>Nível IRATA</span>
          <div className={admin.chipGroup}>
            {NIVEL_IRATA_VALUES.map((nivel) => (
              <button
                key={nivel}
                type="button"
                className={`${admin.chip} ${
                  form.nivel_irata === nivel ? admin.chipActive : ''
                }`.trim()}
                onClick={() => updateField('nivel_irata', nivel as NivelIrataValue)}
              >
                {nivel}
              </button>
            ))}
          </div>
        </div>
        <div className={admin.row2}>
          <Field
            id="colab-expertise"
            label="Expertise"
            value={form.expertise ?? ''}
            onChange={(value) => updateField('expertise', value)}
          />
          <Field
            id="colab-formacao-tecnica"
            label="Formação técnica"
            value={form.formacao_tecnica ?? ''}
            onChange={(value) => updateField('formacao_tecnica', value)}
          />
        </div>
        <div className={admin.row2}>
          <Field
            id="colab-formacao-academica"
            label="Formação acadêmica"
            value={form.formacao_academica ?? ''}
            onChange={(value) => updateField('formacao_academica', value)}
          />
          <Field
            id="colab-certificacoes"
            label="Certificações"
            value={form.certificacoes ?? ''}
            onChange={(value) => updateField('certificacoes', value)}
          />
        </div>
        <label className={admin.checkRow}>
          <input
            type="checkbox"
            checked={Boolean(form.certificacao_edn)}
            onChange={(event) => updateField('certificacao_edn', event.target.checked)}
          />
          <span>Possui certificação EDN</span>
        </label>
      </section>

      {errors.general ? (
        <p className={`${admin.feedback} ${admin.feedbackError}`}>{errors.general}</p>
      ) : null}
      {feedback ? (
        <p className={`${admin.feedback} ${admin.feedbackSuccess}`}>{feedback}</p>
      ) : null}

      <Button type="submit" isLoading={isSubmitting}>
        Cadastrar colaborador
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className={page.field}>
      <label className={page.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={page.input}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className={page.fieldError}>{error}</span> : null}
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
}) {
  return (
    <div className={page.field}>
      <label className={page.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={page.input}
        type="number"
        min={0}
        step={1}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          onChange(Number.isNaN(parsed) ? 0 : parsed);
        }}
      />
      {error ? <span className={page.fieldError}>{error}</span> : null}
    </div>
  );
}
