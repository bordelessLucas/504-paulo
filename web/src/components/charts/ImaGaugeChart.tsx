import { getSemaforoItem, getSemaforoPorMedia } from '@/features/gerencial/semaforo';

import styles from './charts.module.css';

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
  const width = size;
  const height = size * 0.62;
  const centerX = width / 2;
  const centerY = height * 0.88;
  const radius = size * 0.34;
  const valor = ima !== null ? Math.min(Math.max(ima, 0), MAX_SCORE) : null;
  const status = getSemaforoPorMedia(ima);
  const semaforo = getSemaforoItem(status);

  const pointer =
    valor === null
      ? null
      : (() => {
          const angle = 180 - (valor / MAX_SCORE) * 180;
          const tip = polarToCartesian(centerX, centerY, radius * 0.82, angle);
          const baseLeft = polarToCartesian(centerX, centerY, 10, angle + 90);
          const baseRight = polarToCartesian(centerX, centerY, 10, angle - 90);
          return `${tip.x},${tip.y} ${baseLeft.x},${baseLeft.y} ${baseRight.x},${baseRight.y}`;
        })();

  return (
    <div className={styles.chartWrap}>
      <svg
        height={height}
        width={width}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`IMA ${valor !== null ? valor.toFixed(1) : 'sem dados'}`}
      >
        {ARCO_SEGMENTOS.map((segmento) => (
          <path
            key={`${segmento.min}-${segmento.max}`}
            d={describeArc(centerX, centerY, radius, segmento.min, segmento.max)}
            fill="none"
            stroke={segmento.color}
            strokeLinecap="butt"
            strokeWidth={18}
          />
        ))}

        <path
          d={describeArc(centerX, centerY, radius * 0.72, 0, MAX_SCORE)}
          fill="none"
          stroke="#f7f5f0"
          strokeWidth={28}
        />

        {[0, 1, 2, 3].map((tick) => {
          const point = polarToCartesian(
            centerX,
            centerY,
            radius + 14,
            180 - (tick / MAX_SCORE) * 180,
          );

          return (
            <text
              key={tick}
              fill="#718096"
              fontSize={11}
              textAnchor="middle"
              x={point.x}
              y={point.y + 4}
            >
              {tick}
            </text>
          );
        })}

        {pointer ? (
          <polygon fill="#012d60" points={pointer} />
        ) : (
          <circle cx={centerX} cy={centerY} fill="#a0aec0" r={4} />
        )}

        <line
          stroke="rgba(1, 45, 96, 0.2)"
          strokeWidth={2}
          x1={centerX - radius - 8}
          x2={centerX + radius + 8}
          y1={centerY}
          y2={centerY}
        />
      </svg>

      <div className={styles.gaugeValue}>
        <span className={styles.gaugeLabel}>IMA</span>
        <strong style={{ color: semaforo.color }}>
          {valor !== null ? valor.toFixed(1) : '—'}
        </strong>
        <p className={styles.chartHint}>Índice Médio de Avaliação · escala 0 a 3</p>
        <span className={styles.gaugeStatus} style={{ color: semaforo.color }}>
          {semaforo.label}
        </span>
        <p className={styles.chartHint}>{semaforo.description}</p>
      </div>
    </div>
  );
}
