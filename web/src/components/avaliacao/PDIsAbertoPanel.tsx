import { useCallback, useEffect, useState } from 'react';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PDI_EVOLUCAO_LABELS } from '@/features/pdi/labels';
import type { PdiEvolucaoCiclo, PlanoDesenvolvimento } from '@/features/pdi/types';
import { useAuth } from '@/features/auth/auth-context';
import { atualizarProgresso, buscarPDIsAtivosColaborador } from '@/services/pdiService';
import page from '../../styles/page.module.css';
import admin from '../../styles/admin.module.css';

type PDIsAbertoPanelProps = {
  colaboradorId: string;
};

export function PDIsAbertoPanel({ colaboradorId }: PDIsAbertoPanelProps) {
  const { user } = useAuth();
  const [pdis, setPdis] = useState<PlanoDesenvolvimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [evolucao, setEvolucao] = useState<Record<string, PdiEvolucaoCiclo | null>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPdis = useCallback(async () => {
    setIsLoading(true);
    try {
      setPdis(await buscarPDIsAtivosColaborador(colaboradorId));
    } catch {
      setPdis([]);
    } finally {
      setIsLoading(false);
    }
  }, [colaboradorId]);

  useEffect(() => {
    void loadPdis();
  }, [loadPdis]);

  async function handleSalvarEvolucao(pdi: PlanoDesenvolvimento) {
    if (!user) return;
    const resposta = evolucao[pdi.id];
    if (!resposta) {
      setError('Selecione se houve evolução neste ponto.');
      return;
    }

    setSavingId(pdi.id);
    setError(null);
    setFeedback(null);

    try {
      await atualizarProgresso(
        pdi.id,
        {
          evolucaoCiclo: resposta,
          comentarioHistorico: 'Registrado durante avaliação do ciclo.',
        },
        user.id,
      );
      setFeedback('Evolução do PDI registrada.');
      await loadPdis();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erro ao salvar.');
    } finally {
      setSavingId(null);
    }
  }

  if (isLoading || pdis.length === 0) {
    return null;
  }

  return (
    <Card padding="compact">
      <h3 className={page.sectionTitle} style={{ textTransform: 'none' }}>
        PDIs em aberto
      </h3>
      <p className={admin.hint}>
        Planos de desenvolvimento ativos deste colaborador. Registre a evolução observada no ciclo.
      </p>

      <div className={page.list}>
        {pdis.map((pdi) => (
          <div key={pdi.id} className={admin.sectionBlock}>
            <p className={page.listItemTitle}>{pdi.titulo}</p>
            <p className={page.listItemMeta}>
              {pdi.eixo} · progresso {pdi.progressoPct ?? 0}%
            </p>
            <p className={admin.hint}>
              O colaborador demonstrou evolução neste ponto durante o ciclo?
            </p>
            <div className={admin.chipGroup}>
              {(Object.keys(PDI_EVOLUCAO_LABELS) as PdiEvolucaoCiclo[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${admin.chip} ${
                    evolucao[pdi.id] === option ? admin.chipActive : ''
                  }`.trim()}
                  onClick={() =>
                    setEvolucao((current) => ({ ...current, [pdi.id]: option }))
                  }
                >
                  {PDI_EVOLUCAO_LABELS[option]}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              variant="secondary"
              isLoading={savingId === pdi.id}
              onClick={() => void handleSalvarEvolucao(pdi)}
            >
              Registrar evolução
            </Button>
          </div>
        ))}
      </div>

      {error ? <p className={`${admin.feedback} ${admin.feedbackError}`}>{error}</p> : null}
      {feedback ? (
        <p className={`${admin.feedback} ${admin.feedbackSuccess}`}>{feedback}</p>
      ) : null}
    </Card>
  );
}
