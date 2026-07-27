import type { ReactNode } from 'react';

import styles from './Badge.module.css';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

type BadgeProps = {
  label: ReactNode;
  tone?: BadgeTone;
  size?: 'sm' | 'md';
};

export function Badge({ label, tone = 'neutral', size = 'md' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]} ${styles[size]}`.trim()}>{label}</span>
  );
}
