import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  TIPOS_SOLICITACAO_REAJUSTE,
  TIPO_SOLICITACAO_REAJUSTE_LABELS,
  type TipoSolicitacaoReajuste,
} from '@/features/reajuste/types';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TipoSolicitacaoSelectProps = {
  value: TipoSolicitacaoReajuste;
  onChange: (value: TipoSolicitacaoReajuste) => void;
  disabled?: boolean;
};

export function TipoSolicitacaoSelect({
  value,
  onChange,
  disabled = false,
}: TipoSolicitacaoSelectProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme.border,
          backgroundColor: theme.background,
          opacity: disabled ? 0.6 : 1,
        },
      ]}>
      {TIPOS_SOLICITACAO_REAJUSTE.map((tipo, index) => {
        const isSelected = value === tipo;
        const isLast = index === TIPOS_SOLICITACAO_REAJUSTE.length - 1;

        return (
          <Pressable
            key={tipo}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled }}
            onPress={() => onChange(tipo)}
            style={[
              styles.option,
              !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border },
              isSelected && { backgroundColor: theme.backgroundSelected },
            ]}>
            <ThemedText
              style={[
                styles.optionLabel,
                isSelected && { fontFamily: Fonts.sansSemiBold },
              ]}>
              {TIPO_SOLICITACAO_REAJUSTE_LABELS[tipo]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  optionLabel: {
    fontSize: 15,
    lineHeight: 20,
  },
});
