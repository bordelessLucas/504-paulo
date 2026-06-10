import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import type { GestorPreenchimentoStatus } from '@/features/gerencial/dashboard-api';
import { useTheme } from '@/hooks/use-theme';

type StatusPreenchimentoListProps = {
  items: GestorPreenchimentoStatus[];
};

function formatGestorLinha(item: GestorPreenchimentoStatus): string {
  const departamento = item.departamento?.trim() || 'Sem departamento';
  const pendentesLabel =
    item.pendentes === 1 ? '1 Avaliação Pendente' : `${item.pendentes} Avaliações Pendentes`;

  return `${item.nome} (${departamento}): ${pendentesLabel} na ${item.cicloLabel}`;
}

export function StatusPreenchimentoList({ items }: StatusPreenchimentoListProps) {
  const theme = useTheme();

  if (items.length === 0) {
    return (
      <ThemedText themeColor="textSecondary" style={styles.empty}>
        Nenhum supervisor ou gestor ativo com equipe vinculada.
      </ThemedText>
    );
  }

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const hasPendencias = item.pendentes > 0;

        return (
          <View
            key={item.id}
            style={[
              styles.row,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
              },
            ]}>
            <View style={styles.rowHeader}>
              <ThemedText style={styles.nome}>{item.nome}</ThemedText>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: hasPendencias ? '#FFF3E0' : '#E8F5E9',
                  },
                ]}>
                <ThemedText
                  style={[
                    styles.badgeText,
                    { color: hasPendencias ? '#E65100' : '#1B5E20' },
                  ]}>
                  {item.pendentes}/{item.total}
                </ThemedText>
              </View>
            </View>

            <ThemedText themeColor="textSecondary" style={styles.meta}>
              {item.departamento?.trim() || 'Sem departamento'} ·{' '}
              {item.role === 'supervisor' ? 'Supervisor' : 'Gestor'} · ciclo {item.cicloLabel}
            </ThemedText>

            <ThemedText style={styles.linha}>{formatGestorLinha(item)}</ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  nome: {
    flex: 1,
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    lineHeight: 20,
  },
  badge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  badgeText: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
  },
  linha: {
    fontSize: 14,
    lineHeight: 20,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});
