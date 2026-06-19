import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BaseModal, BaseModalActions, getModalTextAreaStyle } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { useToast } from '@/components/ui/toast';
import { Fonts, Spacing } from '@/constants/theme';
import {
  calcularDiasRestantes,
  PDI_EIXO_LABELS,
  PDI_EIXO_OPTIONS,
} from '@/features/pdi/labels';
import type { PdiEixo } from '@/features/pdi/types';
import { useTheme } from '@/hooks/use-theme';
import { criarPDI } from '@/services/pdiService';
import { confirmAction } from '@/utils/confirm-action';

type CriarPDIModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  colaboradorId: string;
  colaboradorNome: string;
  criadoPorId: string;
  avaliacaoOrigemId?: string | null;
  eixoInicial?: PdiEixo;
};

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

export function CriarPDIModal({
  visible,
  onClose,
  onCreated,
  colaboradorId,
  colaboradorNome,
  criadoPorId,
  avaliacaoOrigemId,
  eixoInicial = 'geral',
}: CriarPDIModalProps) {
  const theme = useTheme();
  const { showToast } = useToast();
  const minDate = useMemo(() => addDays(new Date(), 1), []);
  const maxDate = useMemo(() => addDays(new Date(), 365), []);

  const [eixo, setEixo] = useState<PdiEixo>(eixoInicial);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [indicador, setIndicador] = useState('');
  const [prazo, setPrazo] = useState(minDate);
  const [showPicker, setShowPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setEixo(eixoInicial);
      setTitulo('');
      setDescricao('');
      setIndicador('');
      setPrazo(minDate);
      setFeedback(null);
    }
  }, [eixoInicial, minDate, visible]);

  const diasCorridos = calcularDiasRestantes(toIsoDate(prazo));

  async function handleSave() {
    setFeedback(null);

    if (titulo.trim().length < 10) {
      setFeedback('O título deve ter pelo menos 10 caracteres.');
      return;
    }

    if (!indicador.trim()) {
      setFeedback('Informe o indicador de sucesso.');
      return;
    }

    if (prazo <= new Date()) {
      setFeedback('O prazo deve ser uma data futura.');
      return;
    }

    const confirmed = await confirmAction(
      'Criar PDI',
      `Criar PDI para ${colaboradorNome}?`,
    );

    if (!confirmed) {
      return;
    }

    setIsSaving(true);

    try {
      await criarPDI({
        colaboradorId,
        criadoPorId,
        avaliacaoOrigemId,
        eixo,
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        indicadorSucesso: indicador.trim(),
        prazo: toIsoDate(prazo),
      });

      showToast('PDI criado com sucesso.', 'success');
      onCreated();
      onClose();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível criar o PDI.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Criar PDI"
      description={`Plano de desenvolvimento para ${colaboradorNome}`}
      footer={
        <BaseModalActions>
          <Button label="Cancelar" variant="secondary" onPress={onClose} />
          <Button
            label={isSaving ? 'Salvando...' : 'Criar PDI'}
            disabled={isSaving}
            onPress={() => void handleSave()}
          />
        </BaseModalActions>
      }>
      <View style={styles.field}>
        <ThemedText style={styles.label}>Eixo</ThemedText>
        <View style={styles.eixoOptions}>
          {PDI_EIXO_OPTIONS.map((option) => {
            const isActive = eixo === option;

            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                onPress={() => setEixo(option)}
                style={[
                  styles.eixoChip,
                  {
                    backgroundColor: isActive ? theme.backgroundSelected : theme.backgroundElement,
                    borderColor: isActive ? theme.text : theme.border,
                  },
                ]}>
                <ThemedText style={styles.eixoChipText}>{PDI_EIXO_LABELS[option]}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <ThemedText style={styles.label}>Título da ação *</ThemedText>
        <TextInput
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ex.: Realizar curso NR-34"
          placeholderTextColor={theme.placeholder}
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
        />
      </View>

      <View style={styles.field}>
        <ThemedText style={styles.label}>Descrição detalhada</ThemedText>
        <TextInput
          value={descricao}
          onChangeText={setDescricao}
          multiline
          placeholder="Detalhe a ação de desenvolvimento"
          placeholderTextColor={theme.placeholder}
          style={getModalTextAreaStyle(theme)}
        />
      </View>

      <View style={styles.field}>
        <ThemedText style={styles.label}>Indicador de sucesso *</ThemedText>
        <TextInput
          value={indicador}
          onChangeText={setIndicador}
          placeholder="Como saberemos que foi concluído?"
          placeholderTextColor={theme.placeholder}
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
        />
      </View>

      <View style={styles.field}>
        <ThemedText style={styles.label}>Prazo *</ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowPicker(true)}
          style={[styles.dateButton, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
          <ThemedText>{toIsoDate(prazo).split('-').reverse().join('/')}</ThemedText>
        </Pressable>
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          {diasCorridos} dia{diasCorridos === 1 ? '' : 's'} corridos a partir de hoje
        </ThemedText>
      </View>

      {showPicker ? (
        <DateTimePicker
          value={prazo}
          mode="date"
          minimumDate={minDate}
          maximumDate={maxDate}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selected) => {
            setShowPicker(Platform.OS === 'ios');
            if (selected) {
              setPrazo(selected);
            }
          }}
        />
      ) : null}

      {feedback ? <ThemedText themeColor="danger">{feedback}</ThemedText> : null}
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    borderRadius: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  eixoOptions: {
    gap: Spacing.two,
  },
  eixoChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  eixoChipText: {
    fontSize: 13,
    lineHeight: 18,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
  },
});
