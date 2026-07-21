import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { NotionCheckbox } from '@/components/avaliacao/notion-checkbox';
import { OptionChips } from '@/components/rh/option-chips';
import { ThemedText } from '@/components/themed-text';
import { BaseModal, BaseModalActions, getModalTextAreaStyle } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Radius, layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AutoavaliacaoTipo =
  | 'financiamento_curso'
  | 'revisao_cargo_salario'
  | 'nova_qualificacao';

export type AutoavaliacaoSubmitPayload = {
  tipoSolicitacao: AutoavaliacaoTipo;
  qualificacoes: string;
  investimento: string;
  cursoNome: string;
  cursoInstituicao: string;
  valorEstimado: string;
  checklist: {
    semNoShow: boolean;
    semAdvertencias: boolean;
    treinamentosEmDia: boolean;
    mediaAcimaElegivel: boolean;
  };
};

type AutoavaliacaoModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: AutoavaliacaoSubmitPayload) => Promise<void>;
};

const TIPO_OPTIONS: AutoavaliacaoTipo[] = [
  'financiamento_curso',
  'revisao_cargo_salario',
  'nova_qualificacao',
];

const TIPO_LABELS: Record<AutoavaliacaoTipo, string> = {
  financiamento_curso: 'Financiamento de curso',
  revisao_cargo_salario: 'Revisão de cargo/salário',
  nova_qualificacao: 'Nova qualificação',
};

export function AutoavaliacaoModal({ visible, onClose, onSubmit }: AutoavaliacaoModalProps) {
  const theme = useTheme();
  const [tipoSolicitacao, setTipoSolicitacao] =
    useState<AutoavaliacaoTipo>('financiamento_curso');
  const [qualificacoes, setQualificacoes] = useState('');
  const [investimento, setInvestimento] = useState('');
  const [cursoNome, setCursoNome] = useState('');
  const [cursoInstituicao, setCursoInstituicao] = useState('');
  const [valorEstimado, setValorEstimado] = useState('');
  const [checklist, setChecklist] = useState({
    semNoShow: false,
    semAdvertencias: false,
    treinamentosEmDia: false,
    mediaAcimaElegivel: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setTipoSolicitacao('financiamento_curso');
    setQualificacoes('');
    setInvestimento('');
    setCursoNome('');
    setCursoInstituicao('');
    setValorEstimado('');
    setChecklist({
      semNoShow: false,
      semAdvertencias: false,
      treinamentosEmDia: false,
      mediaAcimaElegivel: false,
    });
    setError(null);
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible, resetForm]);

  const handleClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }
    onClose();
  }, [isSubmitting, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!checklist.semNoShow || !checklist.semAdvertencias || !checklist.treinamentosEmDia) {
      setError('Confirme o checklist de elegibilidade (sem no-show, sem advertências e NRs em dia).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        tipoSolicitacao,
        qualificacoes,
        investimento,
        cursoNome,
        cursoInstituicao,
        valorEstimado,
        checklist,
      });
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível enviar a solicitação.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    checklist,
    cursoInstituicao,
    cursoNome,
    investimento,
    onClose,
    onSubmit,
    qualificacoes,
    tipoSolicitacao,
    valorEstimado,
  ]);

  const canSubmit =
    !isSubmitting && (qualificacoes.trim().length > 0 || investimento.trim().length > 0);

  return (
    <BaseModal
      dismissOnBackdropPress={!isSubmitting}
      variant="centered"
      visible={visible}
      onClose={handleClose}>
      <View
        style={[
          styles.iconBadge,
          { backgroundColor: theme.accentMuted, borderColor: theme.border },
        ]}>
        <Ionicons color={theme.accent} name="document-text-outline" size={22} />
      </View>

      <View style={styles.headerBlock}>
        <ThemedText type="subtitle">Solicitação extraordinária</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.description}>
          Gatilho 6 meses / 1 ano — financiamento de curso, revisão salarial ou nova qualificação.
        </ThemedText>
      </View>

      <OptionChips
        options={TIPO_OPTIONS}
        labels={TIPO_LABELS}
        value={tipoSolicitacao}
        onChange={setTipoSolicitacao}
      />

      <View style={styles.field}>
        <ThemedText style={styles.fieldLabel}>Justificativa do colaborador</ThemedText>
        <TextInput
          multiline
          placeholder="O que mudou no seu desempenho ou qualificação?"
          placeholderTextColor={theme.placeholder}
          style={getModalTextAreaStyle(theme)}
          value={investimento}
          onChangeText={setInvestimento}
        />
      </View>

      <View style={styles.field}>
        <ThemedText style={styles.fieldLabel}>Qualificações / certificados</ThemedText>
        <TextInput
          multiline
          placeholder="Ex.: Certificação IRATA N2..."
          placeholderTextColor={theme.placeholder}
          style={getModalTextAreaStyle(theme)}
          value={qualificacoes}
          onChangeText={setQualificacoes}
        />
      </View>

      {tipoSolicitacao === 'financiamento_curso' ? (
        <View style={styles.cursoBlock}>
          <Input label="Nome do curso" value={cursoNome} onChangeText={setCursoNome} />
          <Input
            label="Instituição"
            value={cursoInstituicao}
            onChangeText={setCursoInstituicao}
          />
          <Input
            label="Valor estimado (R$)"
            mask="currency"
            placeholder="0,00"
            value={valorEstimado}
            onChangeText={setValorEstimado}
          />
        </View>
      ) : null}

      <ThemedText type="smallBold">Checklist de elegibilidade</ThemedText>
      <ThemedText themeColor="textSecondary" type="small">
        Médias de campo devem atender à escala 0–3 (elegível tipicamente com IMA ≥ 2,0).
      </ThemedText>
      <NotionCheckbox
        checked={checklist.semNoShow}
        label="Sem no-show nos últimos 6 meses"
        onToggle={() => setChecklist((c) => ({ ...c, semNoShow: !c.semNoShow }))}
      />
      <NotionCheckbox
        checked={checklist.semAdvertencias}
        label="Sem advertências ou suspensões vigentes"
        onToggle={() => setChecklist((c) => ({ ...c, semAdvertencias: !c.semAdvertencias }))}
      />
      <NotionCheckbox
        checked={checklist.treinamentosEmDia}
        label="NRs e ASO em dia"
        onToggle={() =>
          setChecklist((c) => ({ ...c, treinamentosEmDia: !c.treinamentosEmDia }))
        }
      />
      <NotionCheckbox
        checked={checklist.mediaAcimaElegivel}
        label="Médias de campo elegíveis (IMA ≥ 2,0)"
        onToggle={() =>
          setChecklist((c) => ({ ...c, mediaAcimaElegivel: !c.mediaAcimaElegivel }))
        }
      />

      {error ? (
        <ThemedText themeColor="danger" type="small">
          {error}
        </ThemedText>
      ) : null}

      <BaseModalActions>
        <Button label="Cancelar" variant="ghost" onPress={handleClose} disabled={isSubmitting} />
        <Button
          label={isSubmitting ? 'Enviando…' : 'Enviar'}
          onPress={() => void handleSubmit()}
          disabled={!canSubmit}
          isLoading={isSubmitting}
        />
      </BaseModalActions>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: layout.space.sm,
  },
  headerBlock: { gap: 4, marginBottom: layout.space.md },
  description: { marginTop: 4 },
  field: { gap: 6, marginBottom: layout.space.md },
  fieldLabel: { fontWeight: '600' },
  cursoBlock: { gap: layout.space.sm, marginBottom: layout.space.md },
});
