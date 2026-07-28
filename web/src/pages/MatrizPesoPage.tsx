import { Calculator } from 'lucide-react';

import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  SECAO_OFFSHORE_LABELS,
  SECAO_OFFSHORE_PESOS,
  SECOES_OFFSHORE,
  type SecaoOffshore,
} from '@/features/avaliacao/secoes-offshore';
import page from '../styles/page.module.css';

const PESO_TOTAL = SECOES_OFFSHORE.reduce(
  (sum, codigo) => sum + SECAO_OFFSHORE_PESOS[codigo],
  0,
);

const GRUPOS: Array<{ titulo: string; secoes: SecaoOffshore[]; pesoCritico?: boolean }> = [
  { titulo: 'G1 — Campo', secoes: ['GO', 'SB'], pesoCritico: true },
  { titulo: 'G2 — Suporte', secoes: ['LG', 'PE', 'PR', 'MA'] },
  { titulo: 'G3 — Cultura', secoes: ['TR', 'SM', 'RH', 'FA', 'PG', 'IN'] },
];

export function MatrizPesoPage() {
  return (
    <div className={page.page}>
      <PageHeader
        title="Matriz de peso"
        description="Pesos oficiais do IMA (índice de média anual) — fórmula ponderada com teto 0–3."
        accessory={<Badge label={`Σ pesos = ${PESO_TOTAL}`} tone="info" size="sm" />}
      />

      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Calculator size={18} color="#00A675" />
          <strong>Fórmula revisada</strong>
        </div>
        <p className={page.listItemBody} style={{ marginTop: '0.5rem' }}>
          IMA = (GO×3 + SB×3 + LG + PE + PR + MA + TR + SM + RH + FA + PG + IN) ÷ {PESO_TOTAL}
        </p>
        <p className={page.listItemMeta}>
          Seções sem nota são ignoradas no cálculo parcial; o denominador usa apenas seções
          preenchidas.
        </p>
      </Card>

      {GRUPOS.map((grupo) => (
        <section key={grupo.titulo} className={page.section}>
          <h2 className={page.sectionTitle}>
            {grupo.titulo}
            {grupo.pesoCritico ? ' · peso crítico ×3' : ' · peso ×1'}
          </h2>
          <div className={page.list}>
            {grupo.secoes.map((codigo) => {
              const peso = SECAO_OFFSHORE_PESOS[codigo];
              const percentual = peso / PESO_TOTAL;
              return (
                <Card key={codigo} padding="compact">
                  <div className={page.listItemHeader}>
                    <span className={page.listItemTitle}>
                      {codigo} — {SECAO_OFFSHORE_LABELS[codigo]}
                    </span>
                    <Badge
                      label={`×${peso}`}
                      tone={peso >= 3 ? 'danger' : 'neutral'}
                      size="sm"
                    />
                  </div>
                  <p className={page.listItemMeta}>
                    {(percentual * 100).toFixed(2)}% do IMA completo
                  </p>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
