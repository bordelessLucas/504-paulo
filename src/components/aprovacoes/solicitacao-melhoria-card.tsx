import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ActionButton } from '@/components/ui/action-button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { SolicitacaoMelhoria } from '@/features/aprovacoes/api';
import { formatDataSolicitacao } from '@/features/aprovacoes/api';
import { useTheme } from '@/hooks/use-theme';

type SolicitacaoMelhoriaCardProps = {
  solicitacao: SolicitacaoMelhoria;
  showRhValidatedBadge?: boolean;
  primaryLabel: string;
  secondaryLabel?: string;
  dangerLabel?: string;
  isPrimaryLoading?: boolean;
  isSecondaryLoading?: boolean;
  isDangerLoading?: boolean;
  onPrimary: () => void;
  onSecondary?: () => void;
  onDanger?: () => void;
};

export function SolicitacaoMelhoriaCard({
  solicitacao,
  showRhValidatedBadge = false,
  primaryLabel,
  secondaryLabel,
  dangerLabel,
  isPrimaryLoading = false,
  isSecondaryLoading = false,
  isDangerLoading = false,
  onPrimary,
  onSecondary,
  onDanger,
}: SolicitacaoMelhoriaCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <ThemedText style={styles.colaboradorNome}>{solicitacao.colaboradorNome}</ThemedText>
          {solicitacao.colaboradorDepartamento ? (
            <ThemedText themeColor="textSecondary" style={styles.meta}>
              {solicitacao.colaboradorDepartamento}
            </ThemedText>
          ) : null}
        </View>
        <ThemedText themeColor="textSecondary" style={styles.date}>
          {formatDataSolicitacao(solicitacao.createdAt)}
        </ThemedText>
      </View>

      {solicitacao.gerenteNome ? (
        <ThemedText themeColor="textSecondary" style={styles.gerente}>
          Solicitante: {solicitacao.gerenteNome}
        </ThemedText>
      ) : null}

      {showRhValidatedBadge ? (
        <View style={[styles.badge, { borderColor: theme.border, backgroundColor: theme.background }]}>
          <ThemedText style={styles.badgeText}>Validado pelo RH</ThemedText>
        </View>
      ) : null}

      <View style={styles.justificativaBlock}>
        <ThemedText themeColor="textSecondary" style={styles.justificativaLabel}>
          Justificativa
        </ThemedText>
        <ThemedText style={styles.justificativa}>{solicitacao.justificativa}</ThemedText>
      </View>

      <View style={styles.actions}>
        <ActionButton
          label={primaryLabel}
          isLoading={isPrimaryLoading}
          variant="primary"
          onPress={onPrimary}
        />
        {secondaryLabel && onSecondary ? (
          <ActionButton
            label={secondaryLabel}
            isLoading={isSecondaryLoading}
            variant="secondary"
            onPress={onSecondary}
          />
        ) : null}
        {dangerLabel && onDanger ? (
          <ActionButton
            label={dangerLabel}
            isLoading={isDangerLoading}
            variant="danger"
            onPress={onDanger}
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
  gerente: {
    fontSize: 14,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
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
  justificativaBlock: {
    gap: Spacing.one,
  },
  justificativaLabel: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  justificativa: {
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
});
