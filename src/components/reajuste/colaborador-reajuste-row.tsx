import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { formatMediaGeral } from '@/features/aprovacoes/api';
import type { ColaboradorReajusteResumo } from '@/features/reajuste/api';
import { useTheme } from '@/hooks/use-theme';

type ColaboradorReajusteRowProps = {
  colaborador: ColaboradorReajusteResumo;
  isSelected?: boolean;
  onPress: () => void;
};

function ElegibilidadeBadge({
  isElegivel,
  temIncidentesRecentes,
}: {
  isElegivel: boolean;
  temIncidentesRecentes: boolean;
}) {
  if (temIncidentesRecentes) {
    return (
      <View style={[styles.badge, styles.badgeDeveres]}>
        <Ionicons color="#C0392B" name="ban-outline" size={12} />
        <ThemedText style={[styles.badgeText, styles.badgeTextDeveres]}>Deveres</ThemedText>
      </View>
    );
  }

  if (isElegivel) {
    return (
      <View style={[styles.badge, styles.badgeElegivel]}>
        <Ionicons color="#1B5E20" name="checkmark-circle-outline" size={12} />
        <ThemedText style={[styles.badgeText, styles.badgeTextElegivel]}>Elegível</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.badgeInelegivel]}>
      <Ionicons color="#E65100" name="alert-circle-outline" size={12} />
      <ThemedText style={[styles.badgeText, styles.badgeTextInelegivel]}>Inelegível</ThemedText>
    </View>
  );
}

export function ColaboradorReajusteRow({
  colaborador,
  isSelected = false,
  onPress,
}: ColaboradorReajusteRowProps) {
  const theme = useTheme();
  const detail =
    [colaborador.departamento, colaborador.funcao].filter(Boolean).join(' · ') ||
    'Sem departamento';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: isSelected ? theme.backgroundSelected : theme.backgroundElement,
          borderColor: isSelected ? theme.text : theme.border,
        },
        pressed && styles.pressed,
      ]}>
      <View style={styles.info}>
        <ThemedText style={styles.name}>{colaborador.nome}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.meta}>
          {detail}
        </ThemedText>
      </View>

      <View style={styles.trailing}>
        <View style={[styles.mediaBadge, { borderColor: theme.border, backgroundColor: theme.background }]}>
          <ThemedText style={styles.mediaValue}>{formatMediaGeral(colaborador.media)}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.mediaLabel}>
            média
          </ThemedText>
        </View>
        <ElegibilidadeBadge
          isElegivel={colaborador.isElegivel}
          temIncidentesRecentes={colaborador.temIncidentesRecentes}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.88,
  },
  info: {
    flex: 1,
    gap: Spacing.one,
    minWidth: 0,
  },
  name: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    lineHeight: 20,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  mediaBadge: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    minWidth: 52,
  },
  mediaValue: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 18,
  },
  mediaLabel: {
    fontSize: 10,
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
  },
  badgeElegivel: {
    backgroundColor: '#E8F5E9',
  },
  badgeInelegivel: {
    backgroundColor: '#FFF3E0',
  },
  badgeDeveres: {
    backgroundColor: '#FDEBEC',
  },
  badgeText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 10,
    lineHeight: 12,
  },
  badgeTextElegivel: {
    color: '#1B5E20',
  },
  badgeTextInelegivel: {
    color: '#E65100',
  },
  badgeTextDeveres: {
    color: '#C0392B',
  },
});
