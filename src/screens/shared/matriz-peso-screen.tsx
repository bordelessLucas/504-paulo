import { StyleSheet, View } from 'react-native';

import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { StatusBadge } from '@/components/premium/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  SECAO_OFFSHORE_LABELS,
  SECAO_OFFSHORE_PESOS,
  SECOES_OFFSHORE,
  type SecaoOffshore,
} from '@/features/avaliacao/secoes-offshore';
import { useTheme } from '@/hooks/use-theme';

const PESO_TOTAL = SECOES_OFFSHORE.reduce(
  (sum, codigo) => sum + SECAO_OFFSHORE_PESOS[codigo],
  0,
);

const GRUPOS: Array<{ titulo: string; secoes: SecaoOffshore[]; pesoCritico?: boolean }> = [
  { titulo: 'G1 — Campo', secoes: ['GO', 'SB'], pesoCritico: true },
  { titulo: 'G2 — Suporte', secoes: ['LG', 'PE', 'PR', 'MA'] },
  { titulo: 'G3 — Cultura', secoes: ['TR', 'SM', 'RH', 'FA', 'PG', 'IN'] },
];

export function MatrizPesoScreen() {
  const theme = useTheme();

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader title="Matriz de peso" />
      <ThemedText themeColor="textSecondary" type="description">
        Pesos oficiais do IMA (índice de média anual) — fórmula ponderada com teto 0–3.
      </ThemedText>

      <ThemedView
        style={[
          styles.formulaCard,
          { backgroundColor: theme.surfaceCard, borderColor: theme.border },
        ]}>
        <ThemedText type="smallBold">Fórmula revisada</ThemedText>
        <ThemedText themeColor="textSecondary" type="small">
          IMA = (GO×3 + SB×3 + LG + PE + PR + MA + TR + SM + RH + FA + PG + IN) ÷ {PESO_TOTAL}
        </ThemedText>
      </ThemedView>

      {GRUPOS.map((grupo) => (
        <View key={grupo.titulo} style={styles.group}>
          <ThemedText type="smallBold">
            {grupo.titulo}
            {grupo.pesoCritico ? ' · peso crítico ×3' : ' · peso ×1'}
          </ThemedText>
          {grupo.secoes.map((codigo) => {
            const peso = SECAO_OFFSHORE_PESOS[codigo];
            const percentual = peso / PESO_TOTAL;
            return (
              <ThemedView
                key={codigo}
                style={[
                  styles.row,
                  { backgroundColor: theme.surfaceCard, borderColor: theme.border },
                ]}>
                <View style={styles.rowLeft}>
                  <ThemedText type="smallBold">
                    {codigo} — {SECAO_OFFSHORE_LABELS[codigo]}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" type="small">
                    {(percentual * 100).toFixed(2)}% do IMA completo
                  </ThemedText>
                </View>
                <StatusBadge
                  label={`×${peso}`}
                  tone={peso >= 3 ? 'danger' : 'neutral'}
                  size="sm"
                />
              </ThemedView>
            );
          })}
        </View>
      ))}
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
  formulaCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  group: {
    gap: Spacing.two,
  },
  row: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  rowLeft: {
    flex: 1,
    gap: 2,
  },
});
