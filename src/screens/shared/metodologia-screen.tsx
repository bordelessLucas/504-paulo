import { ScoreScaleList } from '@/components/avaliacao/score-scale-list';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { StatusBadge } from '@/components/premium/StatusBadge';
import { ContentSection } from '@/components/ui/content-section';
import { StructuredRow } from '@/components/ui/structured-row';
import { ThemedText } from '@/components/themed-text';
import {
  CLASSIFICACAO_SHORT_LABELS,
  CLASSIFICACAO_THRESHOLDS,
  CLASSIFICACAO_TONES,
  getPesoTone,
} from '@/constants/evaluation-colors';
import { Fonts, layout } from '@/constants/theme';
import {
  CLASSIFICACAO_DESEMPENHO_LABELS,
  type ClassificacaoDesempenho,
} from '@/features/avaliacao/ima';
import {
  DEVERES_COLABORADOR,
  DIREITOS_COLABORADOR,
  MARCOS_TEMPORAIS,
} from '@/features/avaliacao/governanca';
import { SECAO_OFFSHORE_LABELS, SECAO_OFFSHORE_PESOS } from '@/features/avaliacao/secoes-offshore';
import { useTheme } from '@/hooks/use-theme';
import { StyleSheet, Text, View } from 'react-native';
import type { SemanticTone } from '@/constants/theme';

export function MetodologiaScreen() {
  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader title="Metodologia Offshore" />

      <ContentSection eyebrow="Ciclo" title="Marcos temporais">
        <StructuredRow
          title={MARCOS_TEMPORAIS.quinzenal.label}
          description={MARCOS_TEMPORAIS.quinzenal.descricao}
        />
        <StructuredRow
          title={`${MARCOS_TEMPORAIS.semestral.label} (${MARCOS_TEMPORAIS.semestral.meses}m)`}
          description={MARCOS_TEMPORAIS.semestral.descricao}
        />
        <StructuredRow
          title={`${MARCOS_TEMPORAIS.anual.label} (${MARCOS_TEMPORAIS.anual.meses}m)`}
          description={MARCOS_TEMPORAIS.anual.descricao}
        />
      </ContentSection>

      <ContentSection eyebrow="Avaliação" title="Escala de notas">
        <ScoreScaleList />
      </ContentSection>

      <ContentSection eyebrow="Cálculo" title="Matriz de pesos (IMA)">
        {Object.entries(SECAO_OFFSHORE_LABELS).map(([codigo, label]) => {
          const peso = SECAO_OFFSHORE_PESOS[codigo as keyof typeof SECAO_OFFSHORE_PESOS];
          const tone = getPesoTone(peso);

          return (
            <StructuredRow
              key={codigo}
              title={label}
              description={codigo}
              trailing={<StatusBadge label={`Peso ${peso}`} tone={tone} size="sm" />}
            />
          );
        })}
        <ThemedText themeColor="textSecondary" style={styles.formula}>
          IMA = (GO×3 + SB×3 + demais×1) / 16
        </ThemedText>
      </ContentSection>

      <ContentSection eyebrow="Resultado" title="Classificação por faixa">
        {(Object.keys(CLASSIFICACAO_DESEMPENHO_LABELS) as ClassificacaoDesempenho[]).map((key) => (
          <StructuredRow
            key={key}
            title={CLASSIFICACAO_DESEMPENHO_LABELS[key]}
            description={CLASSIFICACAO_THRESHOLDS[key]}
            trailing={
              <StatusBadge
                label={CLASSIFICACAO_SHORT_LABELS[key]}
                tone={CLASSIFICACAO_TONES[key]}
                size="sm"
              />
            }
          />
        ))}
      </ContentSection>

      <ContentSection eyebrow="Política" title="Direitos do colaborador">
        {DIREITOS_COLABORADOR.map((text) => (
          <StructuredRow key={text} title={text} />
        ))}
      </ContentSection>

      <ContentSection eyebrow="Política" title="Deveres do colaborador">
        {DEVERES_COLABORADOR.map((text) => (
          <StructuredRow key={text} title={text} />
        ))}
      </ContentSection>

      <ContentSection eyebrow="Governança" title="Regras automáticas">
        <GovernanceRuleRow
          icon="⚠️"
          tone="warning"
          text="Nota 0 ou 1: justificativa obrigatória do gestor."
        />
        <GovernanceRuleRow
          icon="✅"
          tone="success"
          text="Nota 3: evidência ou elogio formal obrigatório."
        />
        <GovernanceRuleRow
          icon="⚠️"
          tone="warning"
          text="Média < 1,8: abertura automática de PDI (30 dias)."
        />
        <GovernanceRuleRow
          icon="🔴"
          tone="danger"
          text="Média < 1,0: alerta crítico à diretoria."
        />
      </ContentSection>
    </TabScreenContainer>
  );
}

function GovernanceRuleRow({
  icon,
  tone,
  text,
}: {
  icon: string;
  tone: SemanticTone;
  text: string;
}) {
  const theme = useTheme();
  const palette = theme.semantic[tone];

  return (
    <View
      style={[
        styles.ruleRow,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
      ]}>
      <Text style={styles.ruleIcon}>{icon}</Text>
      <ThemedText type="small" style={styles.ruleText}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.space.xxl,
    paddingBottom: layout.space.xxxl,
  },
  formula: {
    marginTop: layout.space.sm,
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 20,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: layout.space.md,
    paddingHorizontal: layout.space.lg,
    paddingVertical: layout.space.md,
    borderRadius: layout.radius.sm,
    borderWidth: 1,
  },
  ruleIcon: {
    fontSize: 18,
    lineHeight: 22,
  },
  ruleText: {
    flex: 1,
  },
});
