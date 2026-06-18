import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ui/action-button';
import { getModalTextAreaStyle } from '@/components/ui/BaseModal';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  TIPO_BENEFICIO_ANUAL_LABELS,
  TIPO_BENEFICIO_ANUAL_OPTIONS,
  type TipoBeneficioAnual,
} from '@/types/supabase';

function TipoBeneficioSelect({
  value,
  onChange,
  disabled,
}: {
  value: TipoBeneficioAnual;
  onChange: (value: TipoBeneficioAnual) => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.selectWrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen, disabled }}
        disabled={disabled}
        onPress={() => setIsOpen((current) => !current)}
        style={[
          styles.selectTrigger,
          {
            borderColor: theme.border,
            backgroundColor: theme.inputBackground,
            opacity: disabled ? 0.6 : 1,
          },
        ]}>
        <ThemedText style={styles.selectValue}>{TIPO_BENEFICIO_ANUAL_LABELS[value]}</ThemedText>
        <Ionicons color={theme.textSecondary} name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} />
      </Pressable>

      {isOpen && !disabled ? (
        <View
          style={[
            styles.selectMenu,
            { borderColor: theme.border, backgroundColor: theme.background },
          ]}>
          {TIPO_BENEFICIO_ANUAL_OPTIONS.map((tipo) => {
            const isSelected = value === tipo;

            return (
              <Pressable
                key={tipo}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  onChange(tipo);
                  setIsOpen(false);
                }}
                style={({ pressed }) => [
                  styles.selectOption,
                  isSelected && { backgroundColor: theme.backgroundSelected },
                  pressed && styles.selectOptionPressed,
                ]}>
                <ThemedText
                  style={[
                    styles.selectOptionLabel,
                    isSelected && styles.selectOptionLabelSelected,
                  ]}>
                  {TIPO_BENEFICIO_ANUAL_LABELS[tipo]}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

type VereditoAnualFormProps = {
  tipoBeneficio: TipoBeneficioAnual;
  justificativaFinanceira: string;
  isSubmitting: boolean;
  onTipoBeneficioChange: (value: TipoBeneficioAnual) => void;
  onJustificativaChange: (value: string) => void;
  onSubmit: () => void;
};

export function VereditoAnualForm({
  tipoBeneficio,
  justificativaFinanceira,
  isSubmitting,
  onTipoBeneficioChange,
  onJustificativaChange,
  onSubmit,
}: VereditoAnualFormProps) {
  const theme = useTheme();
  const isValid = justificativaFinanceira.trim().length >= 10;

  return (
    <View
      style={[
        styles.card,
        { borderColor: theme.border, backgroundColor: theme.backgroundElement },
      ]}>
      <ThemedText style={styles.cardTitle}>Veredito Anual</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.cardHint}>
        Registre a decisão financeira com base no histórico consolidado do colaborador.
      </ThemedText>

      <View style={styles.formGroup}>
        <ThemedText style={styles.fieldLabel}>Tipo de benefício</ThemedText>
        <TipoBeneficioSelect value={tipoBeneficio} onChange={onTipoBeneficioChange} />
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.fieldLabel}>Justificativa financeira / impacto no caixa</ThemedText>
        <TextInput
          multiline
          placeholder="Descreva o impacto financeiro, sustentabilidade do caixa e fundamentação da decisão..."
          placeholderTextColor={theme.placeholder}
          style={getModalTextAreaStyle(theme)}
          value={justificativaFinanceira}
          onChangeText={onJustificativaChange}
        />
      </View>

      <ActionButton
        label="Salvar veredito anual"
        isLoading={isSubmitting}
        disabled={!isValid}
        onPress={onSubmit}
        style={styles.submitButton}
      />
    </View>
  );
}

type VereditoAnualRegistradoProps = {
  anoReferencia: number;
  tipoBeneficio: TipoBeneficioAnual;
  justificativaFinanceira: string;
};

export function VereditoAnualRegistrado({
  anoReferencia,
  tipoBeneficio,
  justificativaFinanceira,
}: VereditoAnualRegistradoProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { borderColor: theme.border, backgroundColor: theme.backgroundElement },
      ]}>
      <ThemedText style={styles.cardTitle}>Veredito Anual</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.registradoLabel}>
        Decisão já registrada em {anoReferencia}
      </ThemedText>
      <ThemedText type="subtitle" style={styles.registradoValor}>
        {TIPO_BENEFICIO_ANUAL_LABELS[tipoBeneficio]}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.registradoJustificativa}>
        {justificativaFinanceira}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  cardHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  formGroup: {
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  selectWrapper: {
    gap: Spacing.one,
    zIndex: 10,
  },
  selectTrigger: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectValue: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  selectMenu: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  selectOption: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  selectOptionPressed: {
    opacity: 0.85,
  },
  selectOptionLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectOptionLabelSelected: {
    fontFamily: Fonts.sansSemiBold,
  },
  submitButton: {
    alignSelf: 'flex-start',
    minWidth: 180,
  },
  registradoLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  registradoValor: {
    fontSize: 18,
    lineHeight: 24,
  },
  registradoJustificativa: {
    fontSize: 14,
    lineHeight: 20,
  },
});
