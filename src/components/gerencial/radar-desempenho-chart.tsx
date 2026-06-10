import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MAX_SCORE = 3;
const GRID_LEVELS = 3;

type RadarDesempenhoChartProps = {
  labels: string[];
  valores: number[];
  size?: number;
};

function polarPoint(angle: number, radius: number, center: number) {
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

export function RadarDesempenhoChart({
  labels,
  valores,
  size = 280,
}: RadarDesempenhoChartProps) {
  const theme = useTheme();
  const center = size / 2;
  const chartRadius = size * 0.34;
  const labelRadius = size * 0.46;
  const count = Math.max(labels.length, valores.length, 1);

  const angles = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        return -Math.PI / 2 + (index * 2 * Math.PI) / count;
      }),
    [count],
  );

  const dataPoints = useMemo(() => {
    return angles.map((angle, index) => {
      const valor = Math.min(Math.max(valores[index] ?? 0, 0), MAX_SCORE);
      const ratio = valor / MAX_SCORE;
      return polarPoint(angle, chartRadius * ratio, center);
    });
  }, [angles, center, chartRadius, valores]);

  const polygonPoints = dataPoints.map((point) => `${point.x},${point.y}`).join(' ');

  const gridPolygons = useMemo(() => {
    return Array.from({ length: GRID_LEVELS }, (_, levelIndex) => {
      const level = (levelIndex + 1) / GRID_LEVELS;
      const points = angles
        .map((angle) => {
          const point = polarPoint(angle, chartRadius * level, center);
          return `${point.x},${point.y}`;
        })
        .join(' ');

      return points;
    });
  }, [angles, center, chartRadius]);

  const axisLines = angles.map((angle) => {
    const end = polarPoint(angle, chartRadius, center);
    return { x1: center, y1: center, x2: end.x, y2: end.y };
  });

  const labelPositions = angles.map((angle, index) => {
    const point = polarPoint(angle, labelRadius, center);
    return { ...point, label: labels[index] ?? '' };
  });

  return (
    <View style={styles.container}>
      <Svg height={size} width={size}>
        {gridPolygons.map((points, index) => (
          <Polygon
            key={`grid-${index}`}
            fill="none"
            points={points}
            stroke={theme.border}
            strokeWidth={1}
          />
        ))}

        {axisLines.map((line, index) => (
          <Line
            key={`axis-${index}`}
            stroke={theme.border}
            strokeWidth={1}
            x1={line.x1}
            x2={line.x2}
            y1={line.y1}
            y2={line.y2}
          />
        ))}

        <Polygon
          fill={theme.accentMuted}
          points={polygonPoints}
          stroke={theme.accent}
          strokeWidth={2}
        />

        {dataPoints.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            fill={theme.accent}
            r={3}
          />
        ))}

        {labelPositions.map((item, index) => (
          <SvgText
            key={`label-${index}`}
            fill={theme.textSecondary}
            fontSize={9}
            textAnchor="middle"
            x={item.x}
            y={item.y + 3}>
            {item.label}
          </SvgText>
        ))}
      </Svg>

      <ThemedText themeColor="textSecondary" style={styles.scaleHint}>
        Escala 0–3 · média das 3 perguntas universais
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  scaleHint: {
    fontSize: 12,
    lineHeight: 16,
  },
});
