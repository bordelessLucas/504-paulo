import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ColaboradorHistoricoPanel } from '@/components/anual/colaborador-historico-panel';
import {
  VereditoAnualForm,
  VereditoAnualRegistrado,
} from '@/components/anual/veredito-anual-form';
import { ThemedText } from '@/components/themed-text';
import { BaseModal } from '@/components/ui/BaseModal';
import { Spacing } from '@/constants/theme';
import type { AvaliacaoHistoricoItem } from '@/features/avaliacao/historico-api';
import {
  type ColaboradorConsolidado,
  type DecisaoAnualExistente,
  type MediasAnuaisColaborador,
} from '@/features/estrategico/api';
import type { TipoBeneficioAnual } from '@/types/supabase';

type PainelAnualDetalheColaboradorProps = {
  colaborador: ColaboradorConsolidado;
  anoReferencia: number;
  medias: MediasAnuaisColaborador | null;
  historico: AvaliacaoHistoricoItem[];
  decisaoExistente: DecisaoAnualExistente | null;
  tipoBeneficio: TipoBeneficioAnual;
  justificativaFinanceira: string;
  canRegistrarDecisao: boolean;
  isLoadingDetalhe: boolean;
  isSubmitting: boolean;
  onTipoBeneficioChange: (value: TipoBeneficioAnual) => void;
  onJustificativaChange: (value: string) => void;
  onSubmit: () => void;
  onClose?: () => void;
  showCloseAction?: boolean;
};

export function PainelAnualDetalheColaborador({
  colaborador,
  anoReferencia,
  medias,
  historico,
  decisaoExistente,
  tipoBeneficio,
  justificativaFinanceira,
  canRegistrarDecisao,
  isLoadingDetalhe,
  isSubmitting,
  onTipoBeneficioChange,
  onJustificativaChange,
  onSubmit,
  onClose,
  showCloseAction = false,
}: PainelAnualDetalheColaboradorProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">{colaborador.nome}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
        {colaborador.departamento ?? 'Sem departamento'} · {colaborador.funcao ?? 'Sem função'}
      </ThemedText>

      {isLoadingDetalhe ? (
        <ActivityIndicator style={styles.loaderDetalhe} />
      ) : medias ? (
        <>
          <ColaboradorHistoricoPanel anoReferencia={anoReferencia} historico={historico} />

          {decisaoExistente ? (
            <VereditoAnualRegistrado
              anoReferencia={anoReferencia}
              justificativaFinanceira={decisaoExistente.justificativaFinanceira}
              tipoBeneficio={decisaoExistente.tipoBeneficio}
            />
          ) : canRegistrarDecisao ? (
            <VereditoAnualForm
              isSubmitting={isSubmitting}
              justificativaFinanceira={justificativaFinanceira}
              tipoBeneficio={tipoBeneficio}
              onJustificativaChange={onJustificativaChange}
              onSubmit={onSubmit}
              onTipoBeneficioChange={onTipoBeneficioChange}
            />
          ) : (
            <View style={styles.readOnlyHint}>
              <ThemedText themeColor="textSecondary" style={styles.readOnlyText}>
                Apenas RH e CEO podem registrar o veredito financeiro anual.
              </ThemedText>
            </View>
          )}

          {showCloseAction && onClose ? (
            <Pressable onPress={onClose} style={styles.cancelarPress}>
              <ThemedText themeColor="textSecondary">Fechar painel do colaborador</ThemedText>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

type PainelAnualDetalheModalProps = Omit<PainelAnualDetalheColaboradorProps, 'onClose'> & {
  visible: boolean;
  onClose: () => void;
};

export function PainelAnualDetalheModal({
  visible,
  onClose,
  ...detalheProps
}: PainelAnualDetalheModalProps) {
  return (
    <BaseModal variant="sheet" visible={visible} onClose={onClose}>
      <PainelAnualDetalheColaborador {...detalheProps} onClose={onClose} showCloseAction />
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  loaderDetalhe: {
    marginVertical: Spacing.two,
  },
  readOnlyHint: {
    paddingVertical: Spacing.two,
  },
  readOnlyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  cancelarPress: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
});
