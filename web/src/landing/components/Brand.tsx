type BrandProps = {
  compact?: boolean;
};

export default function Brand({ compact = false }: BrandProps) {
  return (
    <a className={`brand ${compact ? 'brand--compact' : ''}`} href="#top" aria-label="VERTEK — início">
      <span className="brand__mark" aria-hidden="true">
        <i></i>
        <i></i>
        <i></i>
      </span>
      <span className="brand__word">VERTEK</span>
    </a>
  );
}
