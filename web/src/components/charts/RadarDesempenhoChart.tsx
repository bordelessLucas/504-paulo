import styles from './charts.module.css';

const MAX_SCORE = 3;
const GRID_LEVELS = 3;

type RadarDesempenhoChartProps = {
  labels: string[];
  valores: number[];
  size?: number;
  hint?: string;
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
  hint = 'Escala 0–3',
}: RadarDesempenhoChartProps) {
  const center = size / 2;
  const chartRadius = size * 0.34;
  const labelRadius = size * 0.46;
  const count = Math.max(labels.length, valores.length, 1);

  const angles = Array.from({ length: count }, (_, index) => {
    return -Math.PI / 2 + (index * 2 * Math.PI) / count;
  });

  const dataPoints = angles.map((angle, index) => {
    const valor = Math.min(Math.max(valores[index] ?? 0, 0), MAX_SCORE);
    const ratio = valor / MAX_SCORE;
    return polarPoint(angle, chartRadius * ratio, center);
  });

  const polygonPoints = dataPoints.map((point) => `${point.x},${point.y}`).join(' ');

  const gridPolygons = Array.from({ length: GRID_LEVELS }, (_, levelIndex) => {
    const level = (levelIndex + 1) / GRID_LEVELS;
    return angles
      .map((angle) => {
        const point = polarPoint(angle, chartRadius * level, center);
        return `${point.x},${point.y}`;
      })
      .join(' ');
  });

  const axisLines = angles.map((angle) => {
    const end = polarPoint(angle, chartRadius, center);
    return { x1: center, y1: center, x2: end.x, y2: end.y };
  });

  const labelPositions = angles.map((angle, index) => {
    const point = polarPoint(angle, labelRadius, center);
    return { ...point, label: labels[index] ?? '' };
  });

  return (
    <div className={styles.chartWrap}>
      <svg height={size} width={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Radar de desempenho">
        {gridPolygons.map((points, index) => (
          <polygon
            key={`grid-${index}`}
            fill="none"
            points={points}
            stroke="rgba(1, 45, 96, 0.15)"
            strokeWidth={1}
          />
        ))}

        {axisLines.map((line, index) => (
          <line
            key={`axis-${index}`}
            stroke="rgba(1, 45, 96, 0.15)"
            strokeWidth={1}
            x1={line.x1}
            x2={line.x2}
            y1={line.y1}
            y2={line.y2}
          />
        ))}

        <polygon
          fill="rgba(0, 166, 117, 0.2)"
          points={polygonPoints}
          stroke="#00a675"
          strokeWidth={2}
        />

        {dataPoints.map((point, index) => (
          <circle key={`point-${index}`} cx={point.x} cy={point.y} fill="#00a675" r={3} />
        ))}

        {labelPositions.map((item, index) => (
          <text
            key={`label-${index}`}
            fill="#718096"
            fontSize={9}
            textAnchor="middle"
            x={item.x}
            y={item.y + 3}
          >
            {item.label}
          </text>
        ))}
      </svg>
      <p className={styles.chartHint}>{hint}</p>
    </div>
  );
}
