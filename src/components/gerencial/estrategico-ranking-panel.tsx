import { StyleSheet, View } from 'react-native';
import { Avatar, List, Text, useTheme as usePaperTheme } from 'react-native-paper';

import { layout } from '@/constants/theme';
import type { ColaboradorRanking } from '@/features/gerencial/dashboard-api';

type EstrategicoRankingPanelProps = {
  title: string;
  items: ColaboradorRanking[];
  tone?: 'top' | 'bottom';
};

function resolveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function EstrategicoRankingPanel({
  title,
  items,
  tone = 'top',
}: EstrategicoRankingPanelProps) {
  const paperTheme = usePaperTheme();
  const accentColor = tone === 'top' ? paperTheme.colors.primary : paperTheme.colors.error;

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
          Sem dados de desempenho no período.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={{ color: paperTheme.colors.onSurface }}>
        {title}
      </Text>
      {items.map((item, index) => {
        const subtitle = [item.departamento, item.funcao].filter(Boolean).join(' · ') || 'Sem departamento';

        return (
          <List.Item
            key={item.id}
            title={item.nome}
            description={subtitle}
            left={() => (
              <Avatar.Text
                size={40}
                label={resolveInitials(item.nome)}
                style={{ backgroundColor: paperTheme.colors.primaryContainer }}
                labelStyle={{ color: paperTheme.colors.onPrimaryContainer, fontSize: 14 }}
              />
            )}
            right={() => (
              <View style={styles.scoreBlock}>
                <Text variant="labelSmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                  #{index + 1}
                </Text>
                <Text variant="titleMedium" style={{ color: accentColor }}>
                  {item.media.toFixed(1)}
                </Text>
              </View>
            )}
            style={styles.listItem}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: layout.space.xs,
  },
  listItem: {
    paddingVertical: layout.space.xs,
  },
  scoreBlock: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 44,
  },
  empty: {
    paddingVertical: layout.space.lg,
  },
});
