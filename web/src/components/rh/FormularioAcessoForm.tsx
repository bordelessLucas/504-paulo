import { useCallback, useMemo, useState, type FormEvent } from 'react';

import { Button } from '../ui/Button';
import {
  getAssignableRolesForCaller,
  isRoleAssignableByCaller,
} from '@/features/rh/access-roles';
import { createColaborador } from '@/features/rh/create-colaborador';
import type { ColaboradorFieldError, CreateColaboradorInput } from '@/features/rh/validation';
import { useAuthRole } from '@/hooks/use-auth-role';
import { ROLE_LABELS } from '@/navigation/role-menus';
import type { UserRole } from '@/types/supabase';
import page from '../../styles/page.module.css';
import admin from '../../styles/admin.module.css';

type FormularioAcessoFormProps = {
  onCreated?: () => void;
};

type AcessoFormState = {
  email: string;
  nome: string;
  role: UserRole;
  funcao: string;
  departamento: string;
  senha_temporaria: string;
};

const INITIAL_FORM: AcessoFormState = {
  email: '',
  nome: '',
  role: 'colaborador',
  funcao: '',
  departamento: '',
  senha_temporaria: '',
};

export function FormularioAcessoForm({ onCreated }: FormularioAcessoFormProps) {
  const { role: callerRole } = useAuthRole();
  const assignableRoles = useMemo(
    () => getAssignableRolesForCaller(callerRole),
    [callerRole],
  );

  const [form, setForm] = useState<AcessoFormState>({
    ...INITIAL_FORM,
    role: assignableRoles[0] ?? 'colaborador',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AcessoFormState | 'general', string>>>(
    {},
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof AcessoFormState>(field: K, value: AcessoFormState[K]) => {
      setForm((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined, general: undefined }));
      setFeedback(null);
    },
    [],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isSubmitting || assignableRoles.length === 0) return;

    if (!isRoleAssignableByCaller(callerRole, form.role)) {
      setErrors({ role: 'Você não pode atribuir este papel.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setFeedback(null);

    const payload: CreateColaboradorInput = {
      email: form.email,
      nome: form.nome,
      role: form.role,
      funcao: form.funcao || undefined,
      departamento: form.departamento || undefined,
      senha_temporaria: form.senha_temporaria || undefined,
      status: 'ativo',
    };

    const result = await createColaborador(payload);

    if ('field' in result) {
      setErrors(mapFieldError(result));
      setIsSubmitting(false);
      return;
    }

    const roleLabel = ROLE_LABELS[form.role];
    const suffix = result.authCreated
      ? ' Conta criada com senha definida.'
      : ' Perfil vinculado ao usuário existente.';

    setFeedback(`Acesso de ${roleLabel} criado com sucesso.${suffix}`);
    setForm({
      ...INITIAL_FORM,
      role: assignableRoles[0] ?? 'colaborador',
    });
    onCreated?.();
    setIsSubmitting(false);
  }

  if (assignableRoles.length === 0) {
    return (
      <p className={admin.hint}>Você não tem permissão para gerar acessos à plataforma.</p>
    );
  }

  return (
    <form className={page.form} onSubmit={(event) => void handleSubmit(event)}>
      <div className={page.field}>
        <label className={page.label} htmlFor="acesso-email">
          E-mail de acesso
        </label>
        <input
          id="acesso-email"
          className={page.input}
          type="email"
          autoComplete="email"
          placeholder="nome@empresa.com"
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
          required
        />
        {errors.email ? <span className={page.fieldError}>{errors.email}</span> : null}
      </div>

      <div className={page.field}>
        <label className={page.label} htmlFor="acesso-nome">
          Nome completo
        </label>
        <input
          id="acesso-nome"
          className={page.input}
          autoComplete="name"
          placeholder="Nome do usuário"
          value={form.nome}
          onChange={(event) => updateField('nome', event.target.value)}
          required
        />
        {errors.nome ? <span className={page.fieldError}>{errors.nome}</span> : null}
      </div>

      <div className={page.field}>
        <span className={page.label}>Papel na plataforma</span>
        <div className={admin.chipGroup}>
          {assignableRoles.map((role) => (
            <button
              key={role}
              type="button"
              className={`${admin.chip} ${form.role === role ? admin.chipActive : ''}`.trim()}
              onClick={() => updateField('role', role)}
            >
              {ROLE_LABELS[role]}
            </button>
          ))}
        </div>
        {errors.role ? <span className={page.fieldError}>{errors.role}</span> : null}
      </div>

      <div className={admin.row2}>
        <div className={page.field}>
          <label className={page.label} htmlFor="acesso-funcao">
            Função / cargo (opcional)
          </label>
          <input
            id="acesso-funcao"
            className={page.input}
            placeholder="Ex.: Analista de RH"
            value={form.funcao}
            onChange={(event) => updateField('funcao', event.target.value)}
          />
        </div>
        <div className={page.field}>
          <label className={page.label} htmlFor="acesso-departamento">
            Departamento (opcional)
          </label>
          <input
            id="acesso-departamento"
            className={page.input}
            placeholder="Ex.: Recursos Humanos"
            value={form.departamento}
            onChange={(event) => updateField('departamento', event.target.value)}
          />
        </div>
      </div>

      <div className={page.field}>
        <label className={page.label} htmlFor="acesso-senha">
          Senha temporária (opcional)
        </label>
        <input
          id="acesso-senha"
          className={page.input}
          type="password"
          autoComplete="new-password"
          placeholder="Deixe em branco para gerar no servidor"
          value={form.senha_temporaria}
          onChange={(event) => updateField('senha_temporaria', event.target.value)}
        />
        {errors.senha_temporaria ? (
          <span className={page.fieldError}>{errors.senha_temporaria}</span>
        ) : null}
      </div>

      {errors.general ? <p className={`${admin.feedback} ${admin.feedbackError}`}>{errors.general}</p> : null}
      {feedback ? <p className={`${admin.feedback} ${admin.feedbackSuccess}`}>{feedback}</p> : null}

      <Button type="submit" isLoading={isSubmitting}>
        Gerar acesso
      </Button>
    </form>
  );
}

function mapFieldError(
  error: ColaboradorFieldError,
): Partial<Record<keyof AcessoFormState | 'general', string>> {
  if (error.field === 'general') {
    return { general: error.message };
  }

  if (error.field in INITIAL_FORM || error.field === 'role') {
    return { [error.field]: error.message };
  }

  return { general: error.message };
}
