import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { getSemaforoItem, getSemaforoPorMedia } from '@/features/gerencial/semaforo';
import { useTheme } from '@/hooks/use-theme';

const MAX_SCORE = 3;

const ARCO_SEGMENTOS = [
  { min: 0, max: 1, color: '#E74C3C' },
  { min: 1, max: 2, color: '#E67E22' },
  { min: 2, max: 2.5, color: '#F1C40F' },
  { min: 2.5, max: 3, color: '#2ECC71' },
] as const;

type ImaGaugeChartProps = {
  ima: number | null;
  size?: number;
};

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startValue: number,
  endValue: number,
): string {
  const startAngle = 180 - (startValue / MAX_SCORE) * 180;
  const endAngle = 180 - (endValue / MAX_SCORE) * 180;
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export function ImaGaugeChart({ ima, size = 280 }: ImaGaugeChartProps) {
  const theme = useTheme();
  const width = size;
  const height = size * 0.62;
  const centerX = width / 2;
  const centerY = height * 0.88;
  const radius = size * 0.34;
  const valor = ima !== null ? Math.min(Math.max(ima, 0), MAX_SCORE) : null;
  const status = getSemaforoPorMedia(ima);
  const semaforo = getSemaforoItem(status);

  const pointer = useMemo(() => {
    if (valor === null) {
      return null;
    }

    const angle = 180 - (valor / MAX_SCORE) * 180;
    const tip = polarToCartesian(centerX, centerY, radius * 0.82, angle);
    const baseLeft = polarToCartesian(centerX, centerY, 10, angle + 90);
    const baseRight = polarToCartesian(centerX, centerY, 10, angle - 90);

    return `${tip.x},${tip.y} ${baseLeft.x},${baseLeft.y} ${baseRight.x},${baseRight.y}`;
  }, [centerX, centerY, radius, valor]);

  return (
    <View style={styles.container}>
      <Svg height={height} width={width}>
        {ARCO_SEGMENTOS.map((segmento) => (
          <Path
            key={`${segmento.min}-${segmento.max}`}
            d={describeArc(centerX, centerY, radius, segmento.min, segmento.max)}
            fill="none"
            stroke={segmento.color}
            strokeLinecap="butt"
            strokeWidth={18}
          />
        ))}

        <Path
          d={describeArc(centerX, centerY, radius * 0.72, 0, MAX_SCORE)}
          fill="none"
          stroke={theme.background}
          strokeWidth={28}
        />

        {[0, 1, 2, 3].map((tick) => {
          const point = polarToCartesian(centerX, centerY, radius + 14, 180 - (tick / MAX_SCORE) * 180);

          return (
            <SvgText
              key={tick}
              fill={theme.textSecondary}
              fontSize={11}
              textAnchor="middle"
              x={point.x}
              y={point.y + 4}>
              {tick}
            </SvgText>
          );
        })}

        {pointer ? (
          <Polygon fill={theme.text} points={pointer} />
        ) : (
          <Circle cx={centerX} cy={centerY} fill={theme.textSecondary} r={4} />
        )}

        <Line
          stroke={theme.border}
          strokeWidth={2}
          x1={centerX - radius - 8}
          x2={centerX + radius + 8}
          y1={centerY}
          y2={centerY}
        />
      </Svg>

      <View style={styles.valueBlock}>
        <ThemedText style={styles.imaLabel}>IMA</ThemedText>
        <ThemedText style={[styles.imaValue, { color: semaforo.color }]}>
          {valor !== null ? valor.toFixed(1) : '—'}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.imaHint}>
          Índice Médio de Avaliação · escala 0 a 3
        </ThemedText>
        <ThemedText style={[styles.statusLabel, { color: semaforo.color }]}>
          {semaforo.label}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.statusDescription}>
          {semaforo.description}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  valueBlock: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  imaLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  imaValue: {
    fontFamily: Fonts.sansBold,
    fontSize: 36,
    lineHeight: 40,
  },
  imaHint: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  statusLabel: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
    marginTop: Spacing.one,
  },
  statusDescription: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
