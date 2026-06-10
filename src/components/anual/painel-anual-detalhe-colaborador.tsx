import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ui/action-button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import {
  formatMediaAnual,
  type ColaboradorConsolidado,
  type DecisaoAnualExistente,
  type MediasAnuaisColaborador,
} from '@/features/anual/painel-anual-api';
import { useTheme } from '@/hooks/use-theme';
import {
  TIPO_BENEFICIO_ANUAL_LABELS,
  type TipoBeneficioAnual,
} from '@/types/supabase';

const TIPOS_BENEFICIO: TipoBeneficioAnual[] = ['reajuste', 'plr', 'bonificacao', 'nenhum'];

function MediaCard({
  titulo,
  media,
  detalhe,
}: {
  titulo: string;
  media: number | null;
  detalhe: string;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.mediaCard, { borderColor: theme.border, backgroundColor: theme.background }]}>
      <ThemedText themeColor="textSecondary" style={styles.mediaCardLabel}>
        {titulo}
      </ThemedText>
      <ThemedText style={styles.mediaCardValue}>{formatMediaAnual(media)}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.mediaCardDetalhe}>
        {detalhe}
      </ThemedText>
    </View>
  );
}

function BeneficioPicker({
  value,
  onChange,
  disabled,
}: {
  value: TipoBeneficioAnual;
  onChange: (value: TipoBeneficioAnual) => void;
  disabled?: boolean;
}) {
  const theme = useTheme();

  return (
    <View style={styles.beneficioRow}>
      {TIPOS_BENEFICIO.map((tipo) => {
        const isSelected = value === tipo;

        return (
          <Pressable
            key={tipo}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled }}
            onPress={() => onChange(tipo)}
            style={[
              styles.beneficioChip,
              {
                borderColor: isSelected ? theme.text : theme.border,
                backgroundColor: isSelected ? theme.backgroundSelected : theme.background,
                opacity: disabled ? 0.6 : 1,
              },
            ]}>
            <ThemedText
              style={[
                styles.beneficioChipLabel,
                isSelected && { fontFamily: Fonts.sansSemiBold },
              ]}>
              {TIPO_BENEFICIO_ANUAL_LABELS[tipo]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

type PainelAnualDetalheColaboradorProps = {
  colaborador: ColaboradorConsolidado;
  anoReferencia: number;
  medias: MediasAnuaisColaborador | null;
  decisaoExistente: DecisaoAnualExistente | null;
  tipoBeneficio: TipoBeneficioAnual;
  justificativaFinanceira: string;
  isLoadingDetalhe: boolean;
  isSubmitting: boolean;
  onTipoBeneficioChange: (value: TipoBeneficioAnual) => void;
  onJustificativaChange: (value: string) => void;
  onSubmit: () => void;
  onClose?: () => void;
  showCloseAction?: boolean;
};

export function PainelAnualDetalheColaborador({
  colaborador,
  anoReferencia,
  medias,
  decisaoExistente,
  tipoBeneficio,
  justificativaFinanceira,
  isLoadingDetalhe,
  isSubmitting,
  onTipoBeneficioChange,
  onJustificativaChange,
  onSubmit,
  onClose,
  showCloseAction = false,
}: PainelAnualDetalheColaboradorProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">{colaborador.nome}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
        {colaborador.departamento ?? 'Sem departamento'} · {colaborador.funcao ?? 'Sem função'}
      </ThemedText>

      {isLoadingDetalhe ? (
        <ActivityIndicator style={styles.loaderDetalhe} />
      ) : medias ? (
        <>
          <View style={styles.mediasRow}>
            <MediaCard
              titulo="Média quinzenal"
              media={medias.mediaQuinzenal}
              detalhe={`${medias.totalAvaliacoesQuinzenal} avaliações · ${medias.totalRespostasQuinzenal} notas`}
            />
            <MediaCard
              titulo="Média semestral"
              media={medias.mediaSemestral}
              detalhe={`${medias.totalAvaliacoesSemestral} avaliações · ${medias.totalRespostasSemestral} notas`}
            />
          </View>

          {decisaoExistente ? (
            <View style={[styles.decisaoRegistrada, { borderColor: theme.border }]}>
              <ThemedText style={styles.impactoTitulo}>
                Decisão já registrada em {anoReferencia}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.impactoValor}>
                {TIPO_BENEFICIO_ANUAL_LABELS[decisaoExistente.tipoBeneficio]}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.justificativaExistente}>
                {decisaoExistente.justificativaFinanceira}
              </ThemedText>
            </View>
          ) : (
            <>
              <View style={styles.formGroup}>
                <ThemedText style={styles.fieldLabel}>Tipo de benefício</ThemedText>
                <BeneficioPicker value={tipoBeneficio} onChange={onTipoBeneficioChange} />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.fieldLabel}>
                  Justificativa financeira / impacto no caixa
                </ThemedText>
                <TextInput
                  multiline
                  placeholder="Descreva o impacto financeiro, sustentabilidade do caixa e fundamentação da decisão..."
                  placeholderTextColor={theme.placeholder}
                  style={[
                    styles.textInput,
                    {
                      color: theme.text,
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                  value={justificativaFinanceira}
                  onChangeText={onJustificativaChange}
                />
              </View>

              <ActionButton
                label="Registrar decisão anual"
                isLoading={isSubmitting}
                disabled={justificativaFinanceira.trim().length < 10}
                onPress={onSubmit}
              />
            </>
          )}

          {showCloseAction && onClose ? (
            <Pressable onPress={onClose} style={styles.cancelarPress}>
              <ThemedText themeColor="textSecondary">Fechar painel do colaborador</ThemedText>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

type PainelAnualDetalheModalProps = PainelAnualDetalheColaboradorProps & {
  visible: boolean;
};

export function PainelAnualDetalheModal({
  visible,
  onClose,
  ...detalheProps
}: PainelAnualDetalheModalProps) {
  const theme = useTheme();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalKeyboard}>
          <Pressable
            style={[
              styles.modalSheet,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
            onPress={(event) => event.stopPropagation()}>
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}>
              <PainelAnualDetalheColaborador
                {...detalheProps}
                onClose={onClose}
                showCloseAction
              />
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  loaderDetalhe: {
    marginVertical: Spacing.two,
  },
  mediasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  mediaCard: {
    flexGrow: 1,
    flexBasis: 140,
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  mediaCardLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  mediaCardValue: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 28,
    lineHeight: 34,
  },
  mediaCardDetalhe: {
    fontSize: 12,
    lineHeight: 16,
  },
  formGroup: {
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  beneficioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  beneficioChip: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  beneficioChipLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  textInput: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  decisaoRegistrada: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  impactoTitulo: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  impactoValor: {
    fontSize: 18,
    lineHeight: 24,
  },
  justificativaExistente: {
    fontSize: 14,
    lineHeight: 20,
  },
  cancelarPress: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(47, 52, 55, 0.4)',
  },
  modalKeyboard: {
    width: '100%',
  },
  modalSheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderWidth: 1,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  modalScrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
});
