import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FormSection } from '@/components/rh/form-section';
import { OptionChips } from '@/components/rh/option-chips';
import { NotionCheckbox } from '@/components/avaliacao/notion-checkbox';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { createColaborador } from '@/features/rh/create-colaborador';
import {
  NIVEL_IRATA_VALUES,
  PROFILE_STATUS_LABELS,
  PROFILE_STATUS_VALUES,
  type NivelIrataValue,
  type ProfileStatusValue,
} from '@/features/rh/profile-fields';
import type { CreateColaboradorInput } from '@/features/rh/validation';
import { useUserRole } from '@/hooks/use-user-role';
import { useTheme } from '@/hooks/use-theme';
import { isAdminDashboardRole } from '@/types/supabase';

type FormularioColaboradorProps = {
  embedded?: boolean;
  onCreated?: () => void;
};

const INITIAL_FORM: CreateColaboradorInput = {
  email: '',
  nome: '',
  funcao: '',
  departamento: '',
  classificacao: '',
  nivel_irata: undefined,
  data_nascimento: '',
  data_admissao: '',
  ddd: '',
  telefone: '',
  expertise: '',
  formacao_tecnica: '',
  certificacao_edn: false,
  senha_temporaria: '',
  status: 'ativo',
};

export function FormularioColaborador({ embedded = false, onCreated }: FormularioColaboradorProps) {
  const theme = useTheme();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const [form, setForm] = useState<CreateColaboradorInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateColaboradorInput | 'general', string>>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate = isAdminDashboardRole(role);

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
      <View style={embedded ? styles.embedded : [styles.container, { backgroundColor: theme.background, borderColor: '#F0F0F0' }]}>
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          Apenas RH, CEO e administradores podem cadastrar colaboradores.
        </ThemedText>
      </View>
    );
  }

  return (
    <View
      style={
        embedded
          ? styles.embedded
          : [styles.container, { backgroundColor: theme.background, borderColor: '#F0F0F0' }]
      }>
      {!embedded ? (
        <View style={styles.header}>
          <ThemedText type="subtitle">Cadastrar colaborador</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.hint}>
            Ficha completa offshore — dados pessoais, contratuais e certificações.
          </ThemedText>
        </View>
      ) : null}

      <FormSection title="Dados pessoais">
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
          error={errors.data_nascimento}
          label="Data de nascimento"
          onChangeText={(value) => updateField('data_nascimento', value)}
          placeholder="DD/MM/AAAA"
          value={form.data_nascimento ?? ''}
        />
        <View style={styles.row}>
          <View style={styles.half}>
            <Input
              error={errors.ddd}
              keyboardType="number-pad"
              label="DDD"
              maxLength={2}
              onChangeText={(value) => updateField('ddd', value)}
              placeholder="21"
              value={form.ddd ?? ''}
            />
          </View>
          <View style={styles.half}>
            <Input
              error={errors.telefone}
              keyboardType="phone-pad"
              label="Telefone"
              onChangeText={(value) => updateField('telefone', value)}
              placeholder="999999999"
              value={form.telefone ?? ''}
            />
          </View>
        </View>
        <Input
          autoComplete="new-password"
          error={errors.senha_temporaria}
          label="Senha temporária (opcional)"
          onChangeText={(value) => updateField('senha_temporaria', value)}
          placeholder="Gerada automaticamente se vazio"
          secureTextEntry
          value={form.senha_temporaria ?? ''}
        />
      </FormSection>

      <FormSection title="Dados contratuais">
        <Input
          error={errors.funcao}
          label="Função / cargo"
          onChangeText={(value) => updateField('funcao', value)}
          placeholder="Ex.: Operador de Rope Access"
          value={form.funcao ?? ''}
        />
        <Input
          error={errors.departamento}
          label="Departamento"
          onChangeText={(value) => updateField('departamento', value)}
          placeholder="Ex.: Operações Bordo"
          value={form.departamento ?? ''}
        />
        <Input
          error={errors.classificacao}
          label="Classificação"
          onChangeText={(value) => updateField('classificacao', value)}
          placeholder="Ex.: Offshore Pleno"
          value={form.classificacao ?? ''}
        />
        <Input
          error={errors.data_admissao}
          label="Data de admissão"
          onChangeText={(value) => updateField('data_admissao', value)}
          placeholder="DD/MM/AAAA"
          value={form.data_admissao ?? ''}
        />
        <View style={styles.fieldGroup}>
          <ThemedText style={styles.fieldLabel}>Status</ThemedText>
          <OptionChips
            options={PROFILE_STATUS_VALUES}
            labels={PROFILE_STATUS_LABELS}
            value={form.status ?? 'ativo'}
            onChange={(value) => updateField('status', value as ProfileStatusValue)}
          />
          {errors.status ? (
            <ThemedText themeColor="danger" style={styles.fieldError}>
              {errors.status}
            </ThemedText>
          ) : null}
        </View>
      </FormSection>

      <FormSection title="Certificações e competências">
        <View style={styles.fieldGroup}>
          <ThemedText style={styles.fieldLabel}>Nível IRATA</ThemedText>
          <OptionChips
            options={NIVEL_IRATA_VALUES}
            value={form.nivel_irata}
            onChange={(value) => updateField('nivel_irata', value as NivelIrataValue)}
          />
          {errors.nivel_irata ? (
            <ThemedText themeColor="danger" style={styles.fieldError}>
              {errors.nivel_irata}
            </ThemedText>
          ) : null}
        </View>
        <Input
          error={errors.expertise}
          label="Expertise / especialidade"
          onChangeText={(value) => updateField('expertise', value)}
          placeholder="Ex.: Trabalho em altura, resgate"
          value={form.expertise ?? ''}
        />
        <Input
          error={errors.formacao_tecnica}
          label="Formação técnica"
          onChangeText={(value) => updateField('formacao_tecnica', value)}
          placeholder="Ex.: Técnico em Segurança do Trabalho"
          value={form.formacao_tecnica ?? ''}
        />
        <NotionCheckbox
          checked={Boolean(form.certificacao_edn)}
          label="Possui certificação EDN"
          onToggle={() => updateField('certificacao_edn', !form.certificacao_edn)}
        />
      </FormSection>

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
  embedded: {
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  half: {
    flex: 1,
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
  feedback: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sans,
  },
});
