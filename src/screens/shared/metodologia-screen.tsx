import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ScoreScaleList } from '@/components/avaliacao/score-scale-list';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { CollapsibleSection } from '@/components/premium/CollapsibleSection';
import { GlassCard } from '@/components/premium/GlassCard';
import { MetricStrip } from '@/components/premium/MetricStrip';
import { StatusBadge } from '@/components/premium/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { brandRgb } from '@/constants/brand';
import {
  CLASSIFICACAO_SHORT_LABELS,
  CLASSIFICACAO_THRESHOLDS,
  CLASSIFICACAO_TONES,
  getPesoTone,
} from '@/constants/evaluation-colors';
import { Fonts, layout, SemaforoColors, type SemanticTone } from '@/constants/theme';
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
import { useTheme } from '@/hooks/use-theme';

const PESO_MAXIMO = 3;
const SECOES_CRITICAS: SecaoOffshore[] = ['GO', 'SB'];
const SECOES_PADRAO = SECOES_OFFSHORE.filter((s) => !SECOES_CRITICAS.includes(s));

const CICLO_MARCOS = [
  {
    key: 'quinzenal' as const,
    periodo: '15 dias',
    icon: 'boat-outline' as const,
    tone: 'info' as const,
  },
  {
    key: 'semestral' as const,
    periodo: '6 meses',
    icon: 'calendar-outline' as const,
    tone: 'accent' as const,
  },
  {
    key: 'anual' as const,
    periodo: '12 meses',
    icon: 'trophy-outline' as const,
    tone: 'success' as const,
  },
];

const CLASSIFICACAO_ORDEM: ClassificacaoDesempenho[] = [
  'critico',
  'desenvolvimento',
  'atende',
  'alta_performance',
  'excepcional',
];

const CLASSIFICACAO_SPECTRUM_COLORS: Record<ClassificacaoDesempenho, string> = {
  critico: SemaforoColors.vermelho,
  desenvolvimento: SemaforoColors.laranja,
  atende: SemaforoColors.amarelo,
  alta_performance: SemaforoColors.verde,
  excepcional: '#00A675',
};

const GOVERNANCE_RULES: {
  icon: keyof typeof Ionicons.glyphMap;
  tone: SemanticTone;
  text: string;
}[] = [
  {
    icon: 'alert-circle-outline',
    tone: 'warning',
    text: 'Nota 0 ou 1: justificativa obrigatória do gestor.',
  },
  {
    icon: 'checkmark-circle-outline',
    tone: 'success',
    text: 'Nota 3: evidência ou elogio formal obrigatório.',
  },
  {
    icon: 'fitness-outline',
    tone: 'warning',
    text: 'Média < 1,8: abertura automática de PDI (30 dias).',
  },
  {
    icon: 'warning-outline',
    tone: 'danger',
    text: 'Média < 1,0: alerta crítico à diretoria.',
  },
];

export function MetodologiaScreen() {
  const theme = useTheme();

  const overviewMetrics = useMemo(
    () => [
      { label: 'Seções IMA', value: '12', hint: 'Áreas offshore', tone: 'info' as const },
      { label: 'Escala', value: '0–3', hint: 'Notas permitidas', tone: 'neutral' as const },
      { label: 'Peso crítico', value: '×3', hint: 'GO e SB', tone: 'danger' as const },
      { label: 'Faixas', value: '5', hint: 'Classificação', tone: 'accent' as const },
    ],
    [],
  );

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader
        variant="default"
        title="Metodologia Offshore"
        description="Referência do ciclo de avaliação, cálculo do IMA e regras de governança para operações offshore."
        accessory={
          <StatusBadge label="IMA Offshore" tone="accent" size="sm" />
        }
      />

      <MetricStrip metrics={overviewMetrics} />

      <View style={styles.section}>
        <ThemedText themeColor="textMuted" style={styles.eyebrow}>
          CICLO
        </ThemedText>
        <ThemedText type="sectionTitle">Marcos temporais</ThemedText>
        <CicloTimeline />
      </View>

      <CollapsibleSection title="Escala de notas" defaultExpanded count={4}>
        <ThemedText themeColor="textSecondary" type="small" style={styles.sectionHint}>
          Cada nota exige justificativa ou evidência conforme a governança automática.
        </ThemedText>
        <ScoreScaleList />
      </CollapsibleSection>

      <CollapsibleSection title="Matriz de pesos (IMA)" defaultExpanded count={12}>
        <ThemedText themeColor="textSecondary" type="small" style={styles.sectionHint}>
          GO e SB concentram o maior impacto no índice final.
        </ThemedText>

        <GlassCard padding="compact" glow>
          <View style={styles.pesoGroupHeader}>
            <Ionicons color={theme.semantic.danger.text} name="flash" size={16} />
            <ThemedText type="smallBold">Seções críticas</ThemedText>
            <StatusBadge label="Peso ×3" tone="danger" size="sm" />
          </View>
          <View style={styles.pesoGroup}>
            {SECOES_CRITICAS.map((codigo) => (
              <PesoSecaoRow key={codigo} codigo={codigo} />
            ))}
          </View>
        </GlassCard>

        <View style={styles.pesoGroupHeader}>
          <Ionicons color={theme.textMuted} name="grid-outline" size={16} />
          <ThemedText type="smallBold">Demais seções</ThemedText>
          <StatusBadge label="Peso ×1" tone="neutral" size="sm" />
        </View>
        <View style={styles.pesoGrid}>
          {SECOES_PADRAO.map((codigo) => (
            <PesoSecaoChip key={codigo} codigo={codigo} />
          ))}
        </View>

        <ImaFormulaCard />
      </CollapsibleSection>

      <CollapsibleSection title="Classificação por faixa" count={5}>
        <ClassificacaoSpectrum />
        <View style={styles.classificacaoList}>
          {CLASSIFICACAO_ORDEM.slice().reverse().map((key) => (
            <ClassificacaoRow key={key} classificacao={key} />
          ))}
        </View>
      </CollapsibleSection>

      <CollapsibleSection title="Direitos do colaborador" count={DIREITOS_COLABORADOR.length}>
        <View style={styles.policyList}>
          {DIREITOS_COLABORADOR.map((text, index) => (
            <PolicyItem
              key={text}
              index={index + 1}
              text={text}
              icon="shield-checkmark-outline"
              tone="success"
            />
          ))}
        </View>
      </CollapsibleSection>

      <CollapsibleSection title="Deveres do colaborador" count={DEVERES_COLABORADOR.length}>
        <View style={styles.policyList}>
          {DEVERES_COLABORADOR.map((text, index) => (
            <PolicyItem
              key={text}
              index={index + 1}
              text={text}
              icon="checkbox-outline"
              tone="info"
            />
          ))}
        </View>
      </CollapsibleSection>

      <GlassCard glow>
        <View style={styles.governanceHeader}>
          <Ionicons color={theme.accent} name="git-branch-outline" size={20} />
          <View style={styles.governanceHeaderText}>
            <ThemedText type="subtitle">Regras automáticas</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              Acionadas pelo sistema ao registrar notas e consolidar o IMA.
            </ThemedText>
          </View>
        </View>
        <View style={styles.governanceList}>
          {GOVERNANCE_RULES.map((rule) => (
            <GovernanceRuleRow
              key={rule.text}
              icon={rule.icon}
              tone={rule.tone}
              text={rule.text}
            />
          ))}
        </View>
      </GlassCard>
    </TabScreenContainer>
  );
}

function CicloTimeline() {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.timelineStrip}>
      {CICLO_MARCOS.map((marco, index) => {
        const dados = MARCOS_TEMPORAIS[marco.key];
        const palette = theme.semantic[marco.tone];
        const isLast = index === CICLO_MARCOS.length - 1;

        return (
          <View key={marco.key} style={styles.timelineItem}>
            <View
              style={[
                styles.timelineCard,
                theme.shadow.card,
                {
                  backgroundColor: palette.bg,
                  borderColor: palette.border,
                },
              ]}>
              <View style={[styles.timelineIconWrap, { backgroundColor: brandRgb(palette.text, 0.12) }]}>
                <Ionicons color={palette.text} name={marco.icon} size={22} />
              </View>
              <ThemedText style={[styles.timelinePeriodo, { color: palette.text }]}>
                {marco.periodo}
              </ThemedText>
              <ThemedText type="smallBold" style={styles.timelineLabel}>
                {dados.label}
              </ThemedText>
              <ThemedText themeColor="textSecondary" type="small" style={styles.timelineDesc}>
                {dados.descricao}
              </ThemedText>
            </View>
            {!isLast ? (
              <View style={styles.timelineConnector}>
                <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
                <Ionicons color={theme.textMuted} name="chevron-forward" size={14} />
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

function PesoSecaoRow({ codigo }: { codigo: SecaoOffshore }) {
  const theme = useTheme();
  const label = SECAO_OFFSHORE_LABELS[codigo];
  const peso = SECAO_OFFSHORE_PESOS[codigo];
  const tone = getPesoTone(peso);
  const palette = theme.semantic[tone];

  return (
    <View
      style={[
        styles.pesoRow,
        {
          backgroundColor: theme.surfaceCard,
          borderColor: palette.border,
        },
      ]}>
      <View style={styles.pesoRowLeft}>
        <View style={[styles.codigoBadge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
          <ThemedText style={[styles.codigoText, { color: palette.text }]}>{codigo}</ThemedText>
        </View>
        <View style={styles.pesoRowText}>
          <ThemedText type="smallBold">{label}</ThemedText>
          <WeightBar peso={peso} tone={tone} />
        </View>
      </View>
      <StatusBadge label={`×${peso}`} tone={tone} size="sm" />
    </View>
  );
}

function PesoSecaoChip({ codigo }: { codigo: SecaoOffshore }) {
  const theme = useTheme();
  const label = SECAO_OFFSHORE_LABELS[codigo];

  return (
    <View
      style={[
        styles.pesoChip,
        {
          backgroundColor: theme.surfaceCard,
          borderColor: theme.border,
        },
      ]}>
      <ThemedText style={[styles.pesoChipCodigo, { color: theme.accent }]}>{codigo}</ThemedText>
      <ThemedText type="small" numberOfLines={2} style={styles.pesoChipLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

function WeightBar({ peso, tone }: { peso: number; tone: SemanticTone }) {
  const theme = useTheme();
  const palette = theme.semantic[tone];

  return (
    <View style={styles.weightBar}>
      {Array.from({ length: PESO_MAXIMO }, (_, i) => (
        <View
          key={i}
          style={[
            styles.weightSegment,
            {
              backgroundColor: i < peso ? palette.text : brandRgb(palette.text, 0.15),
            },
          ]}
        />
      ))}
    </View>
  );
}

function ImaFormulaCard() {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.formulaCard,
        {
          backgroundColor: theme.accentMuted,
          borderColor: brandRgb(theme.accent, 0.3),
        },
      ]}>
      <View style={styles.formulaHeader}>
        <Ionicons color={theme.accent} name="calculator-outline" size={18} />
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          Fórmula do IMA
        </ThemedText>
      </View>
      <ThemedText style={[styles.formulaText, { fontFamily: Fonts.sansMedium }]}>
        IMA = (GO×3 + SB×3 + demais×1) ÷ 16
      </ThemedText>
      <ThemedText themeColor="textSecondary" type="small">
        Seções sem nota são ignoradas; o denominador considera apenas áreas preenchidas.
      </ThemedText>
    </View>
  );
}

function ClassificacaoSpectrum() {
  return (
    <View style={styles.spectrumWrap}>
      <View style={styles.spectrumBar}>
        {CLASSIFICACAO_ORDEM.map((key) => (
          <View
            key={key}
            style={[styles.spectrumSegment, { backgroundColor: CLASSIFICACAO_SPECTRUM_COLORS[key] }]}
          />
        ))}
      </View>
      <View style={styles.spectrumLabels}>
        <ThemedText themeColor="textMuted" type="small">
          Crítico
        </ThemedText>
        <ThemedText themeColor="textMuted" type="small">
          Excepcional
        </ThemedText>
      </View>
    </View>
  );
}

function ClassificacaoRow({ classificacao }: { classificacao: ClassificacaoDesempenho }) {
  const theme = useTheme();
  const tone = CLASSIFICACAO_TONES[classificacao];
  const palette = theme.semantic[tone];

  return (
    <View
      style={[
        styles.classificacaoRow,
        {
          backgroundColor: theme.surfaceCard,
          borderColor: palette.border,
        },
      ]}>
      <View style={[styles.classificacaoDot, { backgroundColor: CLASSIFICACAO_SPECTRUM_COLORS[classificacao] }]} />
      <View style={styles.classificacaoContent}>
        <ThemedText type="smallBold">{CLASSIFICACAO_DESEMPENHO_LABELS[classificacao]}</ThemedText>
        <ThemedText themeColor="textSecondary" type="small">
          {CLASSIFICACAO_THRESHOLDS[classificacao]}
        </ThemedText>
      </View>
      <StatusBadge
        label={CLASSIFICACAO_SHORT_LABELS[classificacao]}
        tone={tone}
        size="sm"
      />
    </View>
  );
}

function PolicyItem({
  index,
  text,
  icon,
  tone,
}: {
  index: number;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: SemanticTone;
}) {
  const theme = useTheme();
  const palette = theme.semantic[tone];

  return (
    <View
      style={[
        styles.policyItem,
        {
          backgroundColor: theme.surfaceCard,
          borderColor: theme.border,
        },
      ]}>
      <View style={[styles.policyIndex, { backgroundColor: palette.bg, borderColor: palette.border }]}>
        <ThemedText style={[styles.policyIndexText, { color: palette.text }]}>{index}</ThemedText>
      </View>
      <Ionicons color={palette.text} name={icon} size={18} style={styles.policyIcon} />
      <ThemedText type="small" style={styles.policyText}>
        {text}
      </ThemedText>
    </View>
  );
}

function GovernanceRuleRow({
  icon,
  tone,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
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
      <View style={[styles.ruleIconWrap, { backgroundColor: brandRgb(palette.text, 0.12) }]}>
        <Ionicons color={palette.text} name={icon} size={18} />
      </View>
      <ThemedText type="small" style={styles.ruleText}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.space.xl,
    paddingBottom: layout.space.xxxl,
  },
  section: {
    gap: layout.space.sm,
  },
  eyebrow: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
  },
  sectionHint: {
    lineHeight: 20,
  },
  timelineStrip: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: layout.space.xs,
    paddingVertical: layout.space.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineCard: {
    width: 200,
    gap: layout.space.sm,
    padding: layout.space.lg,
    borderRadius: layout.radius.lg,
    borderWidth: 1,
  },
  timelineIconWrap: {
    width: 40,
    height: 40,
    borderRadius: layout.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelinePeriodo: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  timelineLabel: {
    lineHeight: 20,
  },
  timelineDesc: {
    lineHeight: 18,
  },
  timelineConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.space.xs,
    gap: 2,
  },
  timelineLine: {
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  pesoGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.sm,
    marginTop: layout.space.xs,
  },
  pesoGroup: {
    gap: layout.space.sm,
  },
  pesoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: layout.space.md,
    padding: layout.space.md,
    borderRadius: layout.radius.md,
    borderWidth: 1,
  },
  pesoRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.md,
  },
  codigoBadge: {
    width: 40,
    height: 40,
    borderRadius: layout.radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codigoText: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    lineHeight: 16,
  },
  pesoRowText: {
    flex: 1,
    gap: layout.space.xs,
  },
  weightBar: {
    flexDirection: 'row',
    gap: 4,
  },
  weightSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    maxWidth: 32,
  },
  pesoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.space.sm,
  },
  pesoChip: {
    width: '31%',
    minWidth: 96,
    flexGrow: 1,
    gap: 2,
    padding: layout.space.sm,
    paddingVertical: layout.space.md,
    borderRadius: layout.radius.sm,
    borderWidth: 1,
  },
  pesoChipCodigo: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  pesoChipLabel: {
    lineHeight: 16,
  },
  formulaCard: {
    gap: layout.space.sm,
    padding: layout.space.lg,
    borderRadius: layout.radius.md,
    borderWidth: 1,
    marginTop: layout.space.sm,
  },
  formulaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.sm,
  },
  formulaText: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  spectrumWrap: {
    gap: layout.space.xs,
    marginBottom: layout.space.sm,
  },
  spectrumBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: layout.radius.pill,
    overflow: 'hidden',
  },
  spectrumSegment: {
    flex: 1,
  },
  spectrumLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  classificacaoList: {
    gap: layout.space.sm,
  },
  classificacaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.md,
    padding: layout.space.md,
    borderRadius: layout.radius.sm,
    borderWidth: 1,
  },
  classificacaoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  classificacaoContent: {
    flex: 1,
    gap: 2,
  },
  policyList: {
    gap: layout.space.sm,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: layout.space.sm,
    padding: layout.space.md,
    borderRadius: layout.radius.sm,
    borderWidth: 1,
  },
  policyIndex: {
    width: 22,
    height: 22,
    borderRadius: layout.radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyIndexText: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    lineHeight: 14,
  },
  policyIcon: {
    marginTop: 2,
  },
  policyText: {
    flex: 1,
    lineHeight: 20,
  },
  governanceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: layout.space.md,
    marginBottom: layout.space.md,
  },
  governanceHeaderText: {
    flex: 1,
    gap: 2,
  },
  governanceList: {
    gap: layout.space.sm,
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
  ruleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: layout.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleText: {
    flex: 1,
    lineHeight: 20,
  },
});
