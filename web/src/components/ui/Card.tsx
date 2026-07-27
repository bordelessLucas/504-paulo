import type { HTMLAttributes, ReactNode } from 'react';

import styles from './Card.module.css';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: 'default' | 'compact';
};

export function Card({ children, padding = 'default', className = '', ...props }: CardProps) {
  return (
    <div
      className={`${styles.card} ${padding === 'compact' ? styles.compact : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
