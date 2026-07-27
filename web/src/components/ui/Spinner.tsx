import styles from './Spinner.module.css';

type SpinnerProps = {
  label?: string;
};

export function Spinner({ label = 'Carregando…' }: SpinnerProps) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
