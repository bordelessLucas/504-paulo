import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import {
  formatHistoricoData,
  formatHistoricoMedia,
  type AvaliacaoHistoricoItem,
} from '@/features/avaliacao/historico-api';
import { STATUS_VALIDACAO_LABELS } from '@/features/avaliacao/historico-labels';
import { getSemaforoItem, getSemaforoPorMedia } from '@/features/gerencial/semaforo';
import { useTheme } from '@/hooks/use-theme';
import type { StatusValidacaoEnum } from '@/types/supabase';

type AvaliacaoHistoricoCardProps = {
  item: AvaliacaoHistoricoItem;
  showAvaliador?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  index?: number;
};

function getStatusBadgeStyle(status: StatusValidacaoEnum | undefined, theme: ReturnType<typeof useTheme>) {
  switch (status) {
    case 'aprovada':
      return { backgroundColor: theme.accentMuted, color: theme.accent, borderColor: theme.accent };
    case 'pendente_rh':
    case 'pendente_ceo':
      return { backgroundColor: theme.backgroundSelected, color: theme.textSecondary, borderColor: theme.border };
    case 'recusada':
      return { backgroundColor: theme.dangerMuted, color: theme.danger, borderColor: theme.danger };
    case 'devolvida':
      return { backgroundColor: theme.backgroundSelected, color: '#E67E22', borderColor: '#E67E22' };
    default:
      return { backgroundColor: theme.backgroundSelected, color: theme.textSecondary, borderColor: theme.border };
  }
}

export function AvaliacaoHistoricoCard({
  item,
  showAvaliador = false,
  isExpanded,
  onToggle,
  index,
}: AvaliacaoHistoricoCardProps) {
  const theme = useTheme();
  const semaforo = getSemaforoItem(getSemaforoPorMedia(item.media));
  const statusStyle = getStatusBadgeStyle(item.status, theme);
  const tipoLabel = TIPO_AVALIACAO_LABELS[item.tipo].split(' — ')[0];

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        onPress={onToggle}
        style={({ pressed }) => [styles.headerPressable, pressed && styles.pressed]}>
        <View style={styles.headerMain}>
          <View style={styles.headerTopRow}>
            {typeof index === 'number' ? (
              <View style={[styles.indexBadge, { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText style={styles.indexText}>{index + 1}</ThemedText>
              </View>
            ) : null}

            <View style={styles.headerText}>
              <ThemedText type="subtitle" style={styles.tipoTitle}>
                {tipoLabel}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.meta}>
                {formatHistoricoData(item.dataReferencia)}
                {showAvaliador && item.avaliadorNome ? ` · ${item.avaliadorNome}` : ''}
              </ThemedText>
            </View>

            <View style={styles.headerRight}>
              <View style={[styles.mediaBadge, { backgroundColor: `${semaforo.color}22` }]}>
                <ThemedText style={[styles.mediaValue, { color: semaforo.color }]}>
                  {formatHistoricoMedia(item.media)}
                </ThemedText>
              </View>
              <Ionicons
                color={theme.textSecondary}
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
              />
            </View>
          </View>

          <View style={[styles.badgesRow, typeof index === 'number' && styles.badgesRowWithIndex]}>
            {item.status ? (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusStyle.backgroundColor,
                    borderColor: statusStyle.borderColor,
                  },
                ]}>
                <ThemedText style={[styles.statusText, { color: statusStyle.color }]}>
                  {STATUS_VALIDACAO_LABELS[item.status]}
                </ThemedText>
              </View>
            ) : null}
            <ThemedText themeColor="textSecondary" style={styles.respostaCount}>
              {item.respostas.length} critério{item.respostas.length === 1 ? '' : 's'}
            </ThemedText>
          </View>
        </View>
      </Pressable>

      {isExpanded ? (
        <View style={[styles.details, { borderTopColor: theme.border }]}>
          {!showAvaliador ? (
            <ThemedText themeColor="textSecondary" style={styles.anonimo}>
              Avaliação confidencial — avaliador não exibido.
            </ThemedText>
          ) : null}

          {item.respostas.map((resposta, respostaIndex) => (
            <View
              key={`${item.id}-${respostaIndex}`}
              style={[styles.respostaRow, { borderColor: theme.border }]}>
              <View style={[styles.codigoBadge, { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText style={styles.respostaCodigo}>
                  {resposta.perguntaCodigo ?? `P${respostaIndex + 1}`}
                </ThemedText>
              </View>
              <View style={styles.respostaBody}>
                <ThemedText style={styles.respostaDescricao}>{resposta.perguntaDescricao}</ThemedText>
                <View style={styles.notaRow}>
                  <ThemedText style={styles.respostaNota}>Nota {resposta.nota ?? '—'}</ThemedText>
                </View>
                {resposta.justificativa?.trim() ? (
                  <ThemedText themeColor="textSecondary" style={styles.justificativa}>
                    {resposta.justificativa.trim()}
                  </ThemedText>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerPressable: {
    padding: Spacing.three,
  },
  headerMain: {
    gap: Spacing.two,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  indexText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  tipoTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  mediaBadge: {
    minWidth: 36,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  mediaValue: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badgesRowWithIndex: {
    paddingLeft: 36,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  statusText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    lineHeight: 14,
  },
  respostaCount: {
    fontSize: 11,
    lineHeight: 14,
  },
  details: {
    borderTopWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  anonimo: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
    marginBottom: Spacing.one,
  },
  respostaRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  codigoBadge: {
    minWidth: 32,
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    alignItems: 'center',
    marginTop: 2,
  },
  respostaCodigo: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    lineHeight: 14,
  },
  respostaBody: {
    flex: 1,
    gap: Spacing.one,
  },
  respostaDescricao: {
    fontSize: 14,
    lineHeight: 20,
  },
  notaRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  pressed: {
    opacity: 0.88,
  },
});
