import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  DEVERES_COLABORADOR,
  DIREITOS_COLABORADOR,
  MARCOS_TEMPORAIS,
} from '@/features/avaliacao/governanca';
import page from '../styles/page.module.css';

const REGRAS_VALIDACAO = [
  {
    evento: 'Nota 0 ou 1 em qualquer pergunta',
    acao: 'Justificativa detalhada obrigatória por parte do gestor avaliador.',
    tone: 'warning' as const,
  },
  {
    evento: 'Nota 3 (Excepcional)',
    acao: 'Evidência documental ou elogio formal obrigatório anexado ao sistema.',
    tone: 'success' as const,
  },
  {
    evento: 'Média Ponderada < 1,8',
    acao: 'Abertura urgente de PDI com plano de ação em 30 dias + reavaliação.',
    tone: 'warning' as const,
  },
  {
    evento: 'Média Ponderada < 1,0',
    acao: 'Notificação crítica para a diretoria + comitê de análise de desligamento.',
    tone: 'danger' as const,
  },
  {
    evento: 'Ausência de Autoavaliação',
    acao: "Bloqueio do formulário de melhoria salarial e registro de 'Não Realizada' no histórico.",
    tone: 'danger' as const,
  },
];

export function RegrasPage() {
  return (
    <div className={page.page}>
      <PageHeader
        title="Regras / Direitos / Deveres"
        description="Marcos temporais, direitos, deveres e validações obrigatórias do DNA PERFORMANCE."
        accessory={<Badge label="DNA-TEK" tone="accent" size="sm" />}
      />

      <section className={page.section}>
        <h2 className={page.sectionTitle}>Marcos temporais</h2>
        <div className={page.list}>
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
        <h2 className={page.sectionTitle}>Direitos do colaborador</h2>
        <Card>
          <ul className={page.staticList}>
            {DIREITOS_COLABORADOR.map((item, index) => (
              <li key={item}>
                <strong>{index + 1}.</strong> {item}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className={page.section}>
        <h2 className={page.sectionTitle}>Deveres do colaborador</h2>
        <Card>
          <ul className={page.staticList}>
            {DEVERES_COLABORADOR.map((item, index) => (
              <li key={item}>
                <strong>{index + 1}.</strong> {item}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className={page.section}>
        <h2 className={page.sectionTitle}>Regras de validação (escala 0–3)</h2>
        <div className={page.list}>
          {REGRAS_VALIDACAO.map((regra) => (
            <Card key={regra.evento} padding="compact">
              <Badge label={regra.evento} tone={regra.tone} size="sm" />
              <p className={page.listItemBody} style={{ marginTop: '0.75rem' }}>
                {regra.acao}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
