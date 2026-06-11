import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OptionChips } from '@/components/rh/option-chips';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Fonts, Spacing } from '@/constants/theme';
import {
  getAssignableRolesForCaller,
  isRoleAssignableByCaller,
} from '@/features/rh/access-roles';
import { createColaborador } from '@/features/rh/create-colaborador';
import type { ColaboradorFieldError, CreateColaboradorInput } from '@/features/rh/validation';
import { useUserRole } from '@/hooks/use-user-role';
import { ROLE_LABELS } from '@/navigation/role-menus';
import type { UserRole } from '@/types/supabase';

type FormularioAcessoPlataformaProps = {
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

export function FormularioAcessoPlataforma({ onCreated }: FormularioAcessoPlataformaProps) {
  const { role: callerRole } = useUserRole();
  const assignableRoles = useMemo(
    () => getAssignableRolesForCaller(callerRole),
    [callerRole],
  );

  const [form, setForm] = useState<AcessoFormState>({
    ...INITIAL_FORM,
    role: assignableRoles[0] ?? 'colaborador',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AcessoFormState | 'general', string>>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleLabels = useMemo(() => {
    const labels: Partial<Record<UserRole, string>> = {};
    for (const role of assignableRoles) {
      labels[role] = ROLE_LABELS[role];
    }
    return labels;
  }, [assignableRoles]);

  const updateField = useCallback(
    <K extends keyof AcessoFormState>(field: K, value: AcessoFormState[K]) => {
      setForm((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined, general: undefined }));
      setFeedback(null);
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || assignableRoles.length === 0) {
      return;
    }

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
  }, [assignableRoles, callerRole, form, isSubmitting, onCreated]);

  if (assignableRoles.length === 0) {
    return (
      <ThemedText themeColor="textSecondary" style={styles.hint}>
        Você não tem permissão para gerar acessos à plataforma.
      </ThemedText>
    );
  }

  return (
    <View style={styles.form}>
      <Input
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
        keyboardType="email-address"
        label="E-mail de acesso"
        onChangeText={(value) => updateField('email', value)}
        placeholder="nome@empresa.com"
        value={form.email}
      />

      <Input
        autoComplete="name"
        error={errors.nome}
        label="Nome completo"
        onChangeText={(value) => updateField('nome', value)}
        placeholder="Nome do usuário"
        value={form.nome}
      />

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.fieldLabel}>Papel na plataforma</ThemedText>
        <OptionChips
          labels={roleLabels}
          onChange={(value) => updateField('role', value as UserRole)}
          options={assignableRoles}
          value={form.role}
        />
        {errors.role ? (
          <ThemedText themeColor="danger" style={styles.fieldError}>
            {errors.role}
          </ThemedText>
        ) : null}
      </View>

      <Input
        error={errors.funcao}
        label="Função / cargo (opcional)"
        onChangeText={(value) => updateField('funcao', value)}
        placeholder="Ex.: Analista de RH"
        value={form.funcao}
      />

      <Input
        error={errors.departamento}
        label="Departamento (opcional)"
        onChangeText={(value) => updateField('departamento', value)}
        placeholder="Ex.: Recursos Humanos"
        value={form.departamento}
      />

      <Input
        autoComplete="new-password"
        error={errors.senha_temporaria}
        label="Senha temporária (opcional)"
        onChangeText={(value) => updateField('senha_temporaria', value)}
        placeholder="Gerada automaticamente se vazio"
        secureTextEntry
        value={form.senha_temporaria}
      />

      {errors.general ? (
        <ThemedText themeColor="danger" style={styles.feedback}>
          {errors.general}
        </ThemedText>
      ) : null}

      {feedback ? (
        <ThemedText themeColor="textSecondary" style={styles.feedback}>
          {feedback}
        </ThemedText>
      ) : null}

      <Button
        isLoading={isSubmitting}
        label="Gerar acesso"
        onPress={() => void handleSubmit()}
      />
    </View>
  );
}

function mapFieldError(error: ColaboradorFieldError): Partial<Record<keyof AcessoFormState | 'general', string>> {
  if (error.field === 'general') {
    return { general: error.message };
  }

  if (error.field in INITIAL_FORM || error.field === 'role') {
    return { [error.field]: error.message };
  }

  return { general: error.message };
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  fieldGroup: {
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  fieldError: {
    fontSize: 12,
    lineHeight: 16,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  feedback: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sans,
  },
});
