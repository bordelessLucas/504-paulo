import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  buildPeriodoAnoCorrente,
  buildPeriodoUltimosMeses,
  fetchColaboradoresAtivosExportacao,
  fetchColaboradorFicha,
  fetchDepartamentosAtivos,
  fetchFichasLote,
  type ColaboradorExportacaoResumo,
  type FichaExportOptions,
} from '@/features/gerencial/ficha-colaborador-api';
import {
  exportColaboradorFichaPdf,
  exportFichasLotePdf,
} from '@/features/gerencial/export-ficha-pdf';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import page from '../../styles/page.module.css';
import styles from './gerencial.module.css';

type PeriodoPreset = 'completo' | 'ano' | '6meses';

const PERIODO_LABELS: Record<PeriodoPreset, string> = {
  completo: 'Histórico completo',
  ano: 'Ano corrente',
  '6meses': 'Últimos 6 meses',
};

function resolvePeriodoOptions(preset: PeriodoPreset): FichaExportOptions | undefined {
  if (preset === 'ano') return buildPeriodoAnoCorrente();
  if (preset === '6meses') return buildPeriodoUltimosMeses(6);
  return undefined;
}

type ExportacaoFichaPanelProps = {
  exportingId: string | null;
  onExportingChange: (id: string | null) => void;
  onExported?: (message: string) => void;
  onError?: (message: string) => void;
};

export function ExportacaoFichaPanel({
  exportingId,
  onExportingChange,
  onExported,
  onError,
}: ExportacaoFichaPanelProps) {
  const [periodo, setPeriodo] = useState<PeriodoPreset>('completo');
  const [departamento, setDepartamento] = useState('');
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [colaboradores, setColaboradores] = useState<ColaboradorExportacaoResumo[]>([]);
  const [busca, setBusca] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingLote, setIsExportingLote] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [listaDepartamentos, listaColaboradores] = await Promise.all([
        fetchDepartamentosAtivos(),
        fetchColaboradoresAtivosExportacao(departamento || undefined),
      ]);
      setDepartamentos(listaDepartamentos);
      setColaboradores(listaColaboradores);
    } catch (loadError) {
      onError?.(
        loadError instanceof Error ? loadError.message : 'Erro ao carregar colaboradores.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [departamento, onError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const colaboradoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return colaboradores;
    return colaboradores.filter((colaborador) => {
      const texto = [colaborador.nome, colaborador.departamento, colaborador.funcao]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return texto.includes(termo);
    });
  }, [busca, colaboradores]);

  const handleExportIndividual = useCallback(
    async (colaborador: ColaboradorExportacaoResumo) => {
      onExportingChange(colaborador.id);
      try {
        const ficha = await fetchColaboradorFicha(colaborador.id, resolvePeriodoOptions(periodo));
        await exportColaboradorFichaPdf(ficha);
        onExported?.(`Ficha de ${colaborador.nome} pronta para impressão/PDF.`);
      } catch (exportError) {
        onError?.(
          exportError instanceof Error
            ? exportError.message
            : 'Não foi possível exportar a ficha.',
        );
      } finally {
        onExportingChange(null);
      }
    },
    [onError, onExported, onExportingChange, periodo],
  );

  const handleExportLote = useCallback(async () => {
    if (colaboradoresFiltrados.length === 0) {
      onError?.('Nenhum colaborador selecionado para exportação em lote.');
      return;
    }

    setIsExportingLote(true);
    try {
      const ids = colaboradoresFiltrados.map((item) => item.id);
      const fichas = await fetchFichasLote(ids, resolvePeriodoOptions(periodo));
      await exportFichasLotePdf({
        fichas,
        titulo: PERIODO_LABELS[periodo],
        departamento: departamento || undefined,
      });
      onExported?.(`${fichas.length} ficha(s) prontas para impressão/PDF.`);
    } catch (exportError) {
      onError?.(
        exportError instanceof Error
          ? exportError.message
          : 'Não foi possível exportar o lote.',
      );
    } finally {
      setIsExportingLote(false);
    }
  }, [colaboradoresFiltrados, departamento, onError, onExported, periodo]);

  return (
    <Card>
      <h2 className={styles.cardTitle}>Exportar fichas</h2>
      <p className={styles.cardHint}>
        Gere PDF via impressão do navegador — individual ou em lote, com filtro de período e
        departamento.
      </p>

      <div className={page.chips}>
        {(Object.keys(PERIODO_LABELS) as PeriodoPreset[]).map((option) => (
          <button
            key={option}
            type="button"
            className={`${page.chip} ${periodo === option ? page.chipActive : ''}`.trim()}
            onClick={() => setPeriodo(option)}
          >
            {PERIODO_LABELS[option]}
          </button>
        ))}
      </div>

      <div className={page.form}>
        <label className={page.field}>
          <span className={page.label}>Departamento</span>
          <select
            className={page.select}
            value={departamento}
            onChange={(event) => setDepartamento(event.target.value)}
          >
            <option value="">Todos os departamentos</option>
            {departamentos.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className={page.field}>
          <span className={page.label}>Buscar colaborador</span>
          <input
            className={page.input}
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Nome, função ou departamento"
          />
        </label>
      </div>

      <div className={page.actions} style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
        <Button
          size="sm"
          variant="secondary"
          isLoading={isExportingLote}
          disabled={isLoading || colaboradoresFiltrados.length === 0}
          onClick={() => void handleExportLote()}
        >
          Exportar lote ({colaboradoresFiltrados.length})
        </Button>
      </div>

      {isLoading ? (
        <p className={page.listItemMeta}>Carregando colaboradores…</p>
      ) : colaboradoresFiltrados.length === 0 ? (
        <p className={page.listItemMeta}>Nenhum colaborador encontrado.</p>
      ) : (
        <div className={styles.exportList}>
          {colaboradoresFiltrados.slice(0, 40).map((colaborador) => (
            <div key={colaborador.id} className={styles.exportRow}>
              <div>
                <strong>{colaborador.nome}</strong>
                <p>
                  {[colaborador.departamento, colaborador.funcao].filter(Boolean).join(' · ') ||
                    '—'}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                isLoading={exportingId === colaborador.id}
                disabled={Boolean(exportingId) || isExportingLote}
                onClick={() => void handleExportIndividual(colaborador)}
              >
                PDF
              </Button>
            </div>
          ))}
          {colaboradoresFiltrados.length > 40 ? (
            <p className={page.listItemMeta}>
              Exibindo 40 de {colaboradoresFiltrados.length}. Use busca/filtro para refinar.
            </p>
          ) : null}
        </div>
      )}
    </Card>
  );
}
