import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
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
    <Card>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <ThemedText type="cardTitle">{avaliacao.avaliadoNome}</ThemedText>
          {avaliacao.avaliadoDepartamento ? (
            <ThemedText type="small" themeColor="textSecondary">
              {avaliacao.avaliadoDepartamento}
            </ThemedText>
          ) : null}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {formatDataSolicitacao(avaliacao.createdAt)}
        </ThemedText>
      </View>

      <View style={styles.badges}>
        <View style={[styles.badge, { borderColor: theme.border, backgroundColor: theme.background }]}>
          <ThemedText type="badge">{formatTipoAvaliacaoLabel(avaliacao.tipo)}</ThemedText>
        </View>
        {avaliacao.media !== null ? (
          <View style={[styles.badge, { borderColor: theme.border, backgroundColor: theme.background }]}>
            <ThemedText type="badge">Média {avaliacao.media.toFixed(1)}</ThemedText>
          </View>
        ) : null}
        {showRhValidatedBadge ? (
          <View style={[styles.badge, { borderColor: theme.border, backgroundColor: theme.background }]}>
            <ThemedText type="badge">Validada pelo RH</ThemedText>
          </View>
        ) : null}
      </View>

      {avaliacao.avaliadorNome ? (
        <ThemedText type="small" themeColor="textSecondary">
          Avaliador: {avaliacao.avaliadorNome}
        </ThemedText>
      ) : null}

      <View style={styles.actions}>
        <Button
          isLoading={isPrimaryLoading}
          label={primaryLabel}
          size="sm"
          onPress={onPrimary}
        />
        {dangerLabel && onDanger ? (
          <Button
            isLoading={isDangerLoading}
            label={dangerLabel}
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
  actions: {
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
});
