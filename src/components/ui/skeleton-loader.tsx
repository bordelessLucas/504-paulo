import { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SkeletonVariant = 'text' | 'title' | 'avatar' | 'card' | 'list-item' | 'chart' | 'row';

type SkeletonLoaderProps = {
  variant?: SkeletonVariant;
  /** Quantidade de blocos (útil para listas). */
  count?: number;
  width?: number | `${number}%`;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

function useSkeletonPulse() {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return opacity;
}

type SkeletonBlockProps = {
  width?: number | `${number}%`;
  height: number;
  borderRadius: number;
  style?: StyleProp<ViewStyle>;
};

function SkeletonBlock({ width = '100%', height, borderRadius, style }: SkeletonBlockProps) {
  const theme = useTheme();
  const opacity = useSkeletonPulse();

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.backgroundSelected,
          opacity,
        },
        style,
      ]}
    />
  );
}

function SkeletonItem({ variant, width, height }: Pick<SkeletonLoaderProps, 'variant' | 'width' | 'height'>) {
  switch (variant) {
    case 'avatar':
      return <SkeletonBlock height={height ?? 48} width={height ?? 48} borderRadius={layout.radius.pill} />;

    case 'title':
      return (
        <View style={styles.titleGroup}>
          <SkeletonBlock height={height ?? 20} width={width ?? '55%'} borderRadius={layout.radius.sm} />
          <SkeletonBlock height={14} width="35%" borderRadius={layout.radius.sm} />
        </View>
      );

    case 'card':
      return (
        <View style={styles.card}>
          <SkeletonBlock height={height ?? 16} width="40%" borderRadius={layout.radius.sm} />
          <SkeletonBlock height={height ?? 120} borderRadius={layout.radius.md} />
          <SkeletonBlock height={14} width="70%" borderRadius={layout.radius.sm} />
        </View>
      );

    case 'list-item':
      return (
        <View style={styles.listItem}>
          <SkeletonBlock height={44} width={44} borderRadius={layout.radius.md} />
          <View style={styles.listItemBody}>
            <SkeletonBlock height={16} width="65%" borderRadius={layout.radius.sm} />
            <SkeletonBlock height={12} width="40%" borderRadius={layout.radius.sm} />
          </View>
        </View>
      );

    case 'chart':
      return (
        <View style={styles.chart}>
          <SkeletonBlock height={height ?? 200} borderRadius={layout.radius.lg} />
          <View style={styles.chartLegend}>
            <SkeletonBlock height={10} width="22%" borderRadius={layout.radius.sm} />
            <SkeletonBlock height={10} width="18%" borderRadius={layout.radius.sm} />
            <SkeletonBlock height={10} width="24%" borderRadius={layout.radius.sm} />
          </View>
        </View>
      );

    case 'row':
      return (
        <View style={styles.row}>
          <SkeletonBlock height={height ?? 14} width={width ?? '30%'} borderRadius={layout.radius.sm} />
          <SkeletonBlock height={height ?? 14} width="20%" borderRadius={layout.radius.sm} />
        </View>
      );

    case 'text':
    default:
      return <SkeletonBlock height={height ?? 14} width={width ?? '100%'} borderRadius={layout.radius.sm} />;
  }
}

/**
 * Placeholder animado para listas, cards e gráficos — reduz spinners infinitos.
 */
export function SkeletonLoader({
  variant = 'text',
  count = 1,
  width,
  height,
  style,
}: SkeletonLoaderProps) {
  const items = Array.from({ length: Math.max(1, count) }, (_, index) => index);

  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Carregando conteúdo" style={[styles.container, style]}>
      {items.map((index) => (
        <SkeletonItem key={index} variant={variant} width={width} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: layout.space.md,
  },
  titleGroup: {
    gap: layout.space.sm,
  },
  card: {
    gap: layout.space.md,
    padding: layout.space.lg,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.md,
  },
  listItemBody: {
    flex: 1,
    gap: layout.space.sm,
  },
  chart: {
    gap: layout.space.md,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: layout.space.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: layout.space.md,
  },
});
