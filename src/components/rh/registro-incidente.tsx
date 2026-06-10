import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ColaboradorRow } from '@/components/avaliacao/colaborador-row';
import { OptionChips } from '@/components/rh/option-chips';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { fetchColaboradoresAtivos, type ColaboradorAtivo } from '@/features/aprovacoes/api';
import { createIncidente } from '@/features/incidentes/api';
import type { CreateIncidenteInput } from '@/features/incidentes/validation';
import { useUserRole } from '@/hooks/use-user-role';
import { useTheme } from '@/hooks/use-theme';
import {
  isAdminDashboardRole,
  TIPO_INCIDENTE_LABELS,
  type TipoIncidente,
} from '@/types/supabase';

const TIPOS_INCIDENTE: readonly TipoIncidente[] = [
  'acidente_sms',
  'no_show',
  'advertencia',
] as const;

const INITIAL_FORM = {
  tipoIncidente: 'acidente_sms' as TipoIncidente,
  dataOcorrencia: '',
  descricao: '',
};

export function RegistroIncidente() {
  const theme = useTheme();
  const { user } = useAuth();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const { showToast } = useToast();

  const [colaboradores, setColaboradores] = useState<ColaboradorAtivo[]>([]);
  const [selectedColaborador, setSelectedColaborador] = useState<ColaboradorAtivo | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRegister = isAdminDashboardRole(role);

  const loadColaboradores = useCallback(async () => {
    setIsLoadingList(true);
    setError(null);

    try {
      const lista = await fetchColaboradoresAtivos();
      setColaboradores(lista);
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

  const resetForm = useCallback(() => {
    setSelectedColaborador(null);
    setForm(INITIAL_FORM);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!user || !selectedColaborador) {
      showToast('Selecione o colaborador antes de registrar.', 'error');
      return;
    }

    setIsSubmitting(true);

    const payload: CreateIncidenteInput = {
      colaboradorId: selectedColaborador.id,
      tipoIncidente: form.tipoIncidente,
      dataOcorrencia: form.dataOcorrencia,
      descricao: form.descricao,
    };

    try {
      await createIncidente(user.id, payload);
      showToast(`Incidente registrado para ${selectedColaborador.nome}.`, 'success');
      resetForm();
    } catch (submitError) {
      showToast(
        submitError instanceof Error ? submitError.message : 'Não foi possível registrar o incidente.',
        'error',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [form, resetForm, selectedColaborador, showToast, user]);

  if (isRoleLoading) {
    return null;
  }

  if (!canRegister) {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}>
        <ThemedText type="subtitle">Registro de incidentes</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          Apenas RH, CEO e administradores podem registrar quebras de deveres.
        </ThemedText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <ThemedText type="subtitle">Registro de incidentes</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.hint}>
        Registre acidentes SMS, faltas ou advertências. Incidentes nos últimos 6 meses bloqueiam
        autoavaliação e solicitações de reajuste do colaborador.
      </ThemedText>

      {error ? (
        <ThemedText themeColor="danger" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}

      <View style={styles.field}>
        <ThemedText themeColor="textSecondary" style={styles.fieldLabel}>
          Colaborador
        </ThemedText>

        {isLoadingList ? (
          <ThemedText themeColor="textSecondary" style={styles.hint}>
            Carregando colaboradores...
          </ThemedText>
        ) : colaboradores.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.hint}>
            Nenhum colaborador ativo cadastrado.
          </ThemedText>
        ) : (
          <View style={styles.list}>
            {colaboradores.map((colaborador) => (
              <ColaboradorRow
                key={colaborador.id}
                colaborador={colaborador}
                detail={
                  selectedColaborador?.id === colaborador.id
                    ? 'Selecionado'
                    : [colaborador.departamento, colaborador.funcao].filter(Boolean).join(' · ') ||
                      undefined
                }
                onPress={() => setSelectedColaborador(colaborador)}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.field}>
        <ThemedText themeColor="textSecondary" style={styles.fieldLabel}>
          Tipo de incidente
        </ThemedText>
        <OptionChips
          options={TIPOS_INCIDENTE}
          labels={TIPO_INCIDENTE_LABELS}
          value={form.tipoIncidente}
          onChange={(value) => setForm((current) => ({ ...current, tipoIncidente: value }))}
        />
      </View>

      <Input
        label="Data da ocorrência"
        placeholder="DD/MM/AAAA"
        value={form.dataOcorrencia}
        onChangeText={(value) => setForm((current) => ({ ...current, dataOcorrencia: value }))}
      />

      <View style={styles.field}>
        <ThemedText themeColor="textSecondary" style={styles.fieldLabel}>
          Descrição
        </ThemedText>
        <TextInput
          multiline
          placeholder="Descreva o ocorrido e o impacto operacional..."
          placeholderTextColor={theme.placeholder}
          style={[
            styles.textArea,
            {
              color: theme.text,
              backgroundColor: theme.inputBackground,
              borderColor: theme.border,
            },
          ]}
          textAlignVertical="top"
          value={form.descricao}
          onChangeText={(value) => setForm((current) => ({ ...current, descricao: value }))}
        />
      </View>

      <Button
        label="Registrar incidente"
        disabled={!selectedColaborador || isSubmitting}
        isLoading={isSubmitting}
        onPress={() => void handleSubmit()}
      />

      {selectedColaborador ? (
        <Pressable accessibilityRole="button" onPress={resetForm}>
          <ThemedText themeColor="textSecondary" style={styles.cancel}>
            Limpar formulário
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  list: {
    gap: Spacing.two,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  cancel: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
