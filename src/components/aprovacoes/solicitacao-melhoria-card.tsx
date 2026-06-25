import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
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
    <Card>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <ThemedText type="cardTitle">{solicitacao.colaboradorNome}</ThemedText>
          {solicitacao.colaboradorDepartamento ? (
            <ThemedText type="small" themeColor="textSecondary">
              {solicitacao.colaboradorDepartamento}
            </ThemedText>
          ) : null}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {formatDataSolicitacao(solicitacao.createdAt)}
        </ThemedText>
      </View>

      {solicitacao.gerenteNome ? (
        <ThemedText type="small" themeColor="textSecondary">
          Solicitante: {solicitacao.gerenteNome}
        </ThemedText>
      ) : null}

      {showRhValidatedBadge ? (
        <View style={[styles.badge, { borderColor: theme.border, backgroundColor: theme.background }]}>
          <ThemedText type="badge">Validado pelo RH</ThemedText>
        </View>
      ) : null}

      <View style={styles.justificativaBlock}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.justificativaLabel}>
          Justificativa
        </ThemedText>
        <ThemedText type="description">{solicitacao.justificativa}</ThemedText>
      </View>

      <View style={styles.actions}>
        <Button
          label={primaryLabel}
          isLoading={isPrimaryLoading}
          size="sm"
          onPress={onPrimary}
        />
        {secondaryLabel && onSecondary ? (
          <Button
            label={secondaryLabel}
            isLoading={isSecondaryLoading}
            variant="secondary"
            size="sm"
            onPress={onSecondary}
          />
        ) : null}
        {dangerLabel && onDanger ? (
          <Button
            label={dangerLabel}
            isLoading={isDangerLoading}
            variant="danger"
            size="sm"
            onPress={onDanger}
          />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  titleBlock: {
    flex: 1,
    gap: Spacing.half,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  justificativaBlock: {
    gap: Spacing.one,
  },
  justificativaLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  actions: {
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
});
