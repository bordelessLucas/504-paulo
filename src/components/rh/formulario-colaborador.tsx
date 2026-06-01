import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { createColaborador } from '@/features/rh/create-colaborador';
import type { CreateColaboradorInput } from '@/features/rh/validation';
import { useUserRole } from '@/hooks/use-user-role';
import { useTheme } from '@/hooks/use-theme';

type FormularioColaboradorProps = {
  onCreated?: () => void;
};

const INITIAL_FORM: CreateColaboradorInput = {
  email: '',
  nome: '',
  funcao: '',
  departamento: '',
  data_admissao: '',
  senha_temporaria: '',
};

export function FormularioColaborador({ onCreated }: FormularioColaboradorProps) {
  const theme = useTheme();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const [form, setForm] = useState<CreateColaboradorInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateColaboradorInput | 'general', string>>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate = role === 'admin' || role === 'ceo';

  const updateField = useCallback(
    <K extends keyof CreateColaboradorInput>(field: K, value: CreateColaboradorInput[K]) => {
      setForm((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined, general: undefined }));
      setFeedback(null);
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    if (!canCreate || isSubmitting) {
      return;
    }

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
  }, [canCreate, form, isSubmitting, onCreated]);

  if (isRoleLoading) {
    return null;
  }

  if (!canCreate) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}>
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          Apenas administradores e CEO podem cadastrar colaboradores.
        </ThemedText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Cadastrar colaborador</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          Cria o perfil do colaborador para avaliação. Se o e-mail ainda não existir, a conta de
          acesso é criada automaticamente.
        </ThemedText>
      </View>

      <Input
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
        keyboardType="email-address"
        label="E-mail corporativo"
        onChangeText={(value) => updateField('email', value)}
        placeholder="nome@empresa.com"
        value={form.email}
      />

      <Input
        autoComplete="name"
        error={errors.nome}
        label="Nome completo"
        onChangeText={(value) => updateField('nome', value)}
        placeholder="Nome do colaborador"
        value={form.nome}
      />

      <Input
        error={errors.funcao}
        label="Função"
        onChangeText={(value) => updateField('funcao', value)}
        placeholder="Ex.: Analista de RH"
        value={form.funcao ?? ''}
      />

      <Input
        error={errors.departamento}
        label="Departamento"
        onChangeText={(value) => updateField('departamento', value)}
        placeholder="Ex.: Recursos Humanos"
        value={form.departamento ?? ''}
      />

      <Input
        error={errors.data_admissao}
        label="Data de admissão"
        onChangeText={(value) => updateField('data_admissao', value)}
        placeholder="DD/MM/AAAA"
        value={form.data_admissao ?? ''}
      />

      <Input
        autoComplete="new-password"
        error={errors.senha_temporaria}
        label="Senha temporária (opcional)"
        onChangeText={(value) => updateField('senha_temporaria', value)}
        placeholder="Gerada automaticamente se vazio"
        secureTextEntry
        value={form.senha_temporaria ?? ''}
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
        label="Cadastrar colaborador"
        isLoading={isSubmitting}
        onPress={() => void handleSubmit()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
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
