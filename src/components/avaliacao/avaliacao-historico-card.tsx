import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import {
  formatHistoricoData,
  formatHistoricoMedia,
  type AvaliacaoHistoricoItem,
} from '@/features/avaliacao/historico-api';
import { TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import { useTheme } from '@/hooks/use-theme';

type AvaliacaoHistoricoCardProps = {
  item: AvaliacaoHistoricoItem;
  showAvaliador?: boolean;
};

export function AvaliacaoHistoricoCard({ item, showAvaliador = false }: AvaliacaoHistoricoCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={styles.header}>
        <ThemedText type="subtitle">{TIPO_AVALIACAO_LABELS[item.tipo]}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.meta}>
          {formatHistoricoData(item.dataReferencia)} · Média {formatHistoricoMedia(item.media)}
        </ThemedText>
      </View>

      {showAvaliador && item.avaliadorNome ? (
        <ThemedText style={styles.avaliador}>Avaliador: {item.avaliadorNome}</ThemedText>
      ) : null}

      {!showAvaliador ? (
        <ThemedText themeColor="textSecondary" style={styles.anonimo}>
          Avaliação registrada de forma confidencial (avaliador não exibido).
        </ThemedText>
      ) : null}

      <View style={styles.respostas}>
        {item.respostas.map((resposta, index) => (
          <View key={`${item.id}-${index}`} style={styles.respostaRow}>
            <ThemedText style={styles.respostaCodigo}>
              {resposta.perguntaCodigo ?? `P${index + 1}`}
            </ThemedText>
            <View style={styles.respostaBody}>
              <ThemedText style={styles.respostaDescricao}>{resposta.perguntaDescricao}</ThemedText>
              <ThemedText style={styles.respostaNota}>Nota: {resposta.nota ?? '—'}</ThemedText>
              {resposta.justificativa?.trim() ? (
                <ThemedText themeColor="textSecondary" style={styles.justificativa}>
                  {resposta.justificativa.trim()}
                </ThemedText>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    gap: Spacing.one,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
  avaliador: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  anonimo: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  respostas: {
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  respostaRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  respostaCodigo: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13,
    lineHeight: 18,
    minWidth: 28,
  },
  respostaBody: {
    flex: 1,
    gap: Spacing.one,
  },
  respostaDescricao: {
    fontSize: 14,
    lineHeight: 20,
  },
  respostaNota: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  justificativa: {
    fontSize: 13,
    lineHeight: 18,
  },
});
