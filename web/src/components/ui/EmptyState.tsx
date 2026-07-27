import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import styles from './EmptyState.module.css';

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.wrap}>
      {Icon ? <Icon className={styles.icon} size={40} strokeWidth={1.5} /> : null}
      <h3 className={styles.title}>{title}</h3>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
