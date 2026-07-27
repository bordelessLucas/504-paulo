import { BookOpen, Calculator } from 'lucide-react';

import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  CLASSIFICACAO_DESEMPENHO_LABELS,
  type ClassificacaoDesempenho,
} from '@/features/avaliacao/ima';
import {
  DEVERES_COLABORADOR,
  DIREITOS_COLABORADOR,
  MARCOS_TEMPORAIS,
} from '@/features/avaliacao/governanca';
import {
  SECAO_OFFSHORE_LABELS,
  SECAO_OFFSHORE_PESOS,
  SECOES_OFFSHORE,
  type SecaoOffshore,
} from '@/features/avaliacao/secoes-offshore';
import page from '../styles/page.module.css';

const GOVERNANCE_RULES = [
  'Nota 0 ou 1: justificativa obrigatória do gestor.',
  'Nota 3: evidência ou elogio formal obrigatório.',
  'Média < 1,8: abertura automática de PDI (30 dias).',
  'Média < 1,0: alerta crítico à diretoria.',
];

const CLASSIFICACAO_ORDEM: ClassificacaoDesempenho[] = [
  'critico',
  'desenvolvimento',
  'atende',
  'alta_performance',
  'excepcional',
];

export function MetodologiaPage() {
  return (
    <div className={page.page}>
      <PageHeader
        title="Metodologia Offshore"
        description="Referência do ciclo de avaliação, cálculo do IMA e regras de governança."
        accessory={<Badge label="IMA Offshore" tone="accent" size="sm" />}
      />

      <div className={page.metrics}>
        <div className={page.metric}>
          <div className={page.metricLabel}>Seções IMA</div>
          <div className={page.metricValue}>12</div>
        </div>
        <div className={page.metric}>
          <div className={page.metricLabel}>Escala</div>
          <div className={page.metricValue}>0–3</div>
        </div>
        <div className={page.metric}>
          <div className={page.metricLabel}>Peso crítico</div>
          <div className={page.metricValue}>×3</div>
        </div>
      </div>

      <section className={page.section}>
        <h2 className={page.sectionTitle}>Marcos temporais</h2>
        <div className={page.grid2}>
          {(Object.keys(MARCOS_TEMPORAIS) as Array<keyof typeof MARCOS_TEMPORAIS>).map((key) => {
            const marco = MARCOS_TEMPORAIS[key];
            return (
              <Card key={key} padding="compact">
                <h3 className={page.listItemTitle}>{marco.label}</h3>
                <p className={page.listItemBody}>{marco.descricao}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className={page.section}>
        <h2 className={page.sectionTitle}>Matriz de pesos (IMA)</h2>
        <div className={page.list}>
          {SECOES_OFFSHORE.map((codigo: SecaoOffshore) => (
            <Card key={codigo} padding="compact">
              <div className={page.listItemHeader}>
                <span className={page.listItemTitle}>
                  {codigo} — {SECAO_OFFSHORE_LABELS[codigo]}
                </span>
                <Badge label={`×${SECAO_OFFSHORE_PESOS[codigo]}`} tone="info" size="sm" />
              </div>
            </Card>
          ))}
        </div>
        <Card style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Calculator size={18} color="#00A675" />
            <strong>Fórmula do IMA:</strong>
          </div>
          <p className={page.listItemBody}>IMA = (GO×3 + SB×3 + demais×1) ÷ 16</p>
        </Card>
      </section>

      <section className={page.section}>
        <h2 className={page.sectionTitle}>Classificação por faixa</h2>
        <div className={page.list}>
          {CLASSIFICACAO_ORDEM.map((key) => (
            <Card key={key} padding="compact">
              <span className={page.listItemTitle}>{CLASSIFICACAO_DESEMPENHO_LABELS[key]}</span>
            </Card>
          ))}
        </div>
      </section>

      <section className={page.section}>
        <h2 className={page.sectionTitle}>Direitos do colaborador</h2>
        <Card>
          <ul className={page.staticList}>
            {DIREITOS_COLABORADOR.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </Card>
      </section>

      <section className={page.section}>
        <h2 className={page.sectionTitle}>Deveres do colaborador</h2>
        <Card>
          <ul className={page.staticList}>
            {DEVERES_COLABORADOR.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </Card>
      </section>

      <section className={page.section}>
        <h2 className={page.sectionTitle}>Regras automáticas</h2>
        <Card>
          <ul className={page.staticList}>
            {GOVERNANCE_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
