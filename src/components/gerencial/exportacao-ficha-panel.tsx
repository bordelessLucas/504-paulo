import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { OptionChips } from '@/components/rh/option-chips';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Fonts, Radius, Spacing } from '@/constants/theme';
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
import { useTheme } from '@/hooks/use-theme';

type PeriodoPreset = 'completo' | 'ano' | '6meses';

const PERIODO_OPTIONS: readonly PeriodoPreset[] = ['completo', 'ano', '6meses'] as const;

const PERIODO_LABELS: Record<PeriodoPreset, string> = {
  completo: 'Histórico completo',
  ano: 'Ano corrente',
  '6meses': 'Últimos 6 meses',
};

function resolvePeriodoOptions(preset: PeriodoPreset): FichaExportOptions | undefined {
  if (preset === 'ano') {
    return buildPeriodoAnoCorrente();
  }

  if (preset === '6meses') {
    return buildPeriodoUltimosMeses(6);
  }

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
  const theme = useTheme();
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

  const departamentoOptions = useMemo(() => ['', ...departamentos], [departamentos]);
  const departamentoLabels = useMemo(
    () => ({ '': 'Todos os departamentos', ...Object.fromEntries(departamentos.map((item) => [item, item])) }),
    [departamentos],
  );

  const colaboradoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return colaboradores;
    }

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
        onExported?.(`Ficha de ${colaborador.nome} exportada.`);
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
      const options = resolvePeriodoOptions(periodo);
      const fichas = await fetchFichasLote(
        colaboradoresFiltrados.map((item) => item.id),
        options,
      );

      await exportFichasLotePdf({
        fichas,
        titulo: PERIODO_LABELS[periodo],
        departamento: departamento || undefined,
      });

      onExported?.(
        `${fichas.length} ficha(s) exportada(s)${departamento ? ` — ${departamento}` : ''}.`,
      );
    } catch (exportError) {
      onError?.(
        exportError instanceof Error
          ? exportError.message
          : 'Não foi possível exportar o relatório em lote.',
      );
    } finally {
      setIsExportingLote(false);
    }
  }, [colaboradoresFiltrados, departamento, onError, onExported, periodo]);

  return (
    <View style={styles.container}>
      <ThemedText themeColor="textSecondary" style={styles.hint}>
        Exporte a ficha offshore de qualquer colaborador ativo ou gere um PDF em lote por
        departamento e período.
      </ThemedText>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.fieldLabel}>Período das avaliações</ThemedText>
        <OptionChips
          options={PERIODO_OPTIONS}
          labels={PERIODO_LABELS}
          value={periodo}
          onChange={setPeriodo}
        />
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.fieldLabel}>Departamento</ThemedText>
        <OptionChips
          options={departamentoOptions}
          labels={departamentoLabels}
          value={departamento}
          onChange={setDepartamento}
        />
      </View>

      <TextInput
        placeholder="Buscar colaborador..."
        placeholderTextColor={theme.textSecondary}
        value={busca}
        onChangeText={setBusca}
        style={[
          styles.searchInput,
          {
            color: theme.text,
            borderColor: theme.border,
            backgroundColor: theme.backgroundElement,
          },
        ]}
      />

      {isLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <ScrollView style={styles.lista} nestedScrollEnabled>
          {colaboradoresFiltrados.length === 0 ? (
            <ThemedText themeColor="textSecondary" style={styles.empty}>
              Nenhum colaborador encontrado.
            </ThemedText>
          ) : (
            colaboradoresFiltrados.map((colaborador) => {
              const isExporting = exportingId === colaborador.id;

              return (
                <View
                  key={colaborador.id}
                  style={[
                    styles.row,
                    { backgroundColor: theme.background, borderColor: theme.border },
                  ]}>
                  <View style={styles.rowInfo}>
                    <ThemedText style={styles.rowName}>{colaborador.nome}</ThemedText>
                    <ThemedText themeColor="textSecondary" style={styles.rowMeta}>
                      {[colaborador.departamento, colaborador.funcao].filter(Boolean).join(' · ') ||
                        'Sem departamento'}
                    </ThemedText>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    disabled={isExporting || isExportingLote}
                    onPress={() => void handleExportIndividual(colaborador)}
                    style={({ pressed }) => [
                      styles.exportButton,
                      {
                        borderColor: theme.border,
                        backgroundColor: theme.backgroundElement,
                      },
                      pressed && !isExporting && styles.pressed,
                    ]}>
                    {isExporting ? (
                      <ActivityIndicator size="small" color={theme.text} />
                    ) : (
                      <ThemedText style={styles.exportLabel}>PDF</ThemedText>
                    )}
                  </Pressable>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <Button
        label={
          isExportingLote
            ? 'Gerando relatório...'
            : `Exportar lote (${colaboradoresFiltrados.length})`
        }
        disabled={isExportingLote || isLoading || colaboradoresFiltrados.length === 0}
        onPress={() => void handleExportLote()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  fieldGroup: {
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  loader: {
    marginVertical: Spacing.three,
  },
  lista: {
    maxHeight: 280,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  rowMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  exportButton: {
    minWidth: 52,
    minHeight: 32,
    borderWidth: 1,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  exportLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.86,
  },
});
