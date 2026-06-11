import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ui/action-button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { formatDataSolicitacao } from '@/features/aprovacoes/api';
import {
  formatTipoAvaliacaoLabel,
  type AvaliacaoPendenteValidacao,
} from '@/features/aprovacoes/avaliacoes-validacao-api';
import { useTheme } from '@/hooks/use-theme';

type AvaliacaoValidacaoCardProps = {
  avaliacao: AvaliacaoPendenteValidacao;
  showRhValidatedBadge?: boolean;
  primaryLabel: string;
  dangerLabel?: string;
  isPrimaryLoading?: boolean;
  isDangerLoading?: boolean;
  onPrimary: () => void;
  onDanger?: () => void;
};

export function AvaliacaoValidacaoCard({
  avaliacao,
  showRhValidatedBadge = false,
  primaryLabel,
  dangerLabel,
  isPrimaryLoading = false,
  isDangerLoading = false,
  onPrimary,
  onDanger,
}: AvaliacaoValidacaoCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <ThemedText style={styles.colaboradorNome}>{avaliacao.avaliadoNome}</ThemedText>
          {avaliacao.avaliadoDepartamento ? (
            <ThemedText themeColor="textSecondary" style={styles.meta}>
              {avaliacao.avaliadoDepartamento}
            </ThemedText>
          ) : null}
        </View>
        <ThemedText themeColor="textSecondary" style={styles.date}>
          {formatDataSolicitacao(avaliacao.createdAt)}
        </ThemedText>
      </View>

      <View style={styles.badges}>
        <View style={[styles.badge, { borderColor: theme.border, backgroundColor: theme.background }]}>
          <ThemedText style={styles.badgeText}>{formatTipoAvaliacaoLabel(avaliacao.tipo)}</ThemedText>
        </View>
        {avaliacao.media !== null ? (
          <View style={[styles.badge, { borderColor: theme.border, backgroundColor: theme.background }]}>
            <ThemedText style={styles.badgeText}>Média {avaliacao.media.toFixed(1)}</ThemedText>
          </View>
        ) : null}
        {showRhValidatedBadge ? (
          <View style={[styles.badge, { borderColor: theme.border, backgroundColor: theme.background }]}>
            <ThemedText style={styles.badgeText}>Validada pelo RH</ThemedText>
          </View>
        ) : null}
      </View>

      {avaliacao.avaliadorNome ? (
        <ThemedText themeColor="textSecondary" style={styles.avaliador}>
          Avaliador: {avaliacao.avaliadorNome}
        </ThemedText>
      ) : null}

      <View style={styles.actions}>
        <ActionButton
          isLoading={isPrimaryLoading}
          label={primaryLabel}
          onPress={onPrimary}
          variant="primary"
        />
        {dangerLabel && onDanger ? (
          <ActionButton
            isLoading={isDangerLoading}
            label={dangerLabel}
            onPress={onDanger}
            variant="danger"
          />
        ) : null}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  colaboradorNome: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
  date: {
    fontSize: 12,
    lineHeight: 16,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  badge: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  badgeText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  avaliador: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
});
