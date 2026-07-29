import { PDI_STATUS_COLORS, PDI_STATUS_LABELS } from '@/features/pdi/labels';
import type { PdiEstatisticas } from '@/features/pdi/types';

import { Card } from '../ui/Card';
import styles from './gerencial.module.css';

type PdiSaudeCardProps = {
  stats: PdiEstatisticas;
};

export function PdiSaudeCard({ stats }: PdiSaudeCardProps) {
  const alertaVencidos = stats.percentualVencidos > 10;
  const max = Math.max(...Object.values(stats.totalPorStatus), 1);

  return (
    <Card>
      <h2 className={styles.cardTitle}>Saúde dos PDIs</h2>
      <p className={styles.cardHint}>
        Planos de desenvolvimento ativos e taxa de conclusão na empresa.
      </p>

      <div className={styles.pdiMetrics}>
        <div>
          <strong>{stats.totalAtivos}</strong>
          <span>PDIs ativos</span>
        </div>
        <div>
          <strong>{stats.taxaConclusao}%</strong>
          <span>Taxa de conclusão</span>
        </div>
        <div>
          <strong className={alertaVencidos ? styles.alertText : undefined}>
            {stats.percentualVencidos}%
          </strong>
          <span>Vencidos sem ação</span>
        </div>
      </div>

      {alertaVencidos ? (
        <p className={styles.alertBanner}>
          Atenção: mais de 10% dos PDIs ativos estão vencidos.
        </p>
      ) : null}

      <div className={styles.barList}>
        {(['aberto', 'em_andamento', 'concluido', 'vencido', 'cancelado'] as const).map(
          (status) => {
            const total = stats.totalPorStatus[status];
            const widthPercent = Math.round((total / max) * 100);
            const colors = PDI_STATUS_COLORS[status];

            return (
              <div key={status} className={styles.barRow}>
                <span className={styles.barLabel}>{PDI_STATUS_LABELS[status]}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${widthPercent}%`, background: colors.text }}
                  />
                </div>
                <span className={styles.barValue}>{total}</span>
              </div>
            );
          },
        )}
      </div>

      {stats.topDepartamentosAbertos.length > 0 ? (
        <div className={styles.deptList}>
          <p className={styles.deptTitle}>Top departamentos com PDIs abertos</p>
          {stats.topDepartamentosAbertos.map((item) => (
            <p key={item.departamento} className={styles.deptItem}>
              {item.departamento}: {item.total}
            </p>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
