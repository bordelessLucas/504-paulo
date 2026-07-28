import { useState, type FormEvent } from 'react';

import { Button } from '../ui/Button';
import { createCliente, type CreateClienteInput } from '@/features/clientes/api';
import { useAuthRole } from '@/hooks/use-auth-role';
import { isAdminDashboardRole } from '@/types/supabase';
import page from '../../styles/page.module.css';
import admin from '../../styles/admin.module.css';

type FormularioClienteFormProps = {
  onCreated?: () => void;
};

const INITIAL: CreateClienteInput = {
  codigo: '',
  cnpj: '',
  razaoSocial: '',
  nomeFantasia: '',
  endereco: '',
  cidade: '',
  uf: '',
  unidadeNome: '',
  aeroportoEmbarque: '',
};

export function FormularioClienteForm({ onCreated }: FormularioClienteFormProps) {
  const { role, isLoading } = useAuthRole();
  const [form, setForm] = useState<CreateClienteInput>(INITIAL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const canWrite = isAdminDashboardRole(role);

  function updateField<K extends keyof CreateClienteInput>(field: K, value: CreateClienteInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canWrite || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      await createCliente(form);
      setFeedback('Cliente cadastrado com sucesso.');
      setForm(INITIAL);
      onCreated?.();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erro ao cadastrar cliente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return null;

  if (!canWrite) {
    return (
      <p className={admin.hint}>
        Apenas RH, CEO e administradores podem cadastrar clientes.
      </p>
    );
  }

  return (
    <form className={page.form} onSubmit={(event) => void handleSubmit(event)}>
      <div className={admin.row2}>
        <Field
          id="cliente-razao"
          label="Razão social"
          value={form.razaoSocial}
          onChange={(value) => updateField('razaoSocial', value)}
          required
        />
        <Field
          id="cliente-fantasia"
          label="Nome fantasia"
          value={form.nomeFantasia ?? ''}
          onChange={(value) => updateField('nomeFantasia', value)}
        />
      </div>
      <div className={admin.row2}>
        <Field
          id="cliente-codigo"
          label="Código"
          value={form.codigo ?? ''}
          onChange={(value) => updateField('codigo', value)}
        />
        <Field
          id="cliente-cnpj"
          label="CNPJ"
          value={form.cnpj ?? ''}
          onChange={(value) => updateField('cnpj', value)}
        />
      </div>
      <div className={admin.row2}>
        <Field
          id="cliente-endereco"
          label="Endereço"
          value={form.endereco ?? ''}
          onChange={(value) => updateField('endereco', value)}
        />
        <Field
          id="cliente-cidade"
          label="Cidade"
          value={form.cidade ?? ''}
          onChange={(value) => updateField('cidade', value)}
        />
      </div>
      <div className={admin.row2}>
        <Field
          id="cliente-uf"
          label="UF"
          value={form.uf ?? ''}
          onChange={(value) => updateField('uf', value)}
        />
        <Field
          id="cliente-unidade"
          label="Unidade (opcional)"
          value={form.unidadeNome ?? ''}
          onChange={(value) => updateField('unidadeNome', value)}
          placeholder="Se preenchido, cria unidade vinculada"
        />
      </div>
      <Field
        id="cliente-aeroporto"
        label="Aeroporto de embarque"
        value={form.aeroportoEmbarque ?? ''}
        onChange={(value) => updateField('aeroportoEmbarque', value)}
      />

      {error ? <p className={`${admin.feedback} ${admin.feedbackError}`}>{error}</p> : null}
      {feedback ? (
        <p className={`${admin.feedback} ${admin.feedbackSuccess}`}>{feedback}</p>
      ) : null}

      <Button type="submit" isLoading={isSubmitting}>
        Cadastrar cliente
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className={page.field}>
      <label className={page.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={page.input}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
