import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EscalaLegenda } from '@/components/avaliacao/escala-legenda';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
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
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useTheme } from '@/hooks/use-theme';

export function MetodologiaScreen() {
  const theme = useTheme();
  const { scrollPaddingBottom } = useTabScreenLayout();

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: scrollPaddingBottom }]}>
        <ThemedText type="title">Metodologia Offshore</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.lead}>
          Escala 0–3, 12 áreas avaliadoras e governança de performance (Excel cliente).
        </ThemedText>

        <Block title="Marcos temporais">
          <Bullet text={`${MARCOS_TEMPORAIS.quinzenal.label}: ${MARCOS_TEMPORAIS.quinzenal.descricao}`} />
          <Bullet
            text={`${MARCOS_TEMPORAIS.semestral.label} (${MARCOS_TEMPORAIS.semestral.meses}m): ${MARCOS_TEMPORAIS.semestral.descricao}`}
          />
          <Bullet
            text={`${MARCOS_TEMPORAIS.anual.label} (${MARCOS_TEMPORAIS.anual.meses}m): ${MARCOS_TEMPORAIS.anual.descricao}`}
          />
        </Block>

        <Block title="Escala de notas">
          <EscalaLegenda />
        </Block>

        <Block title="Matriz de pesos (IMA)">
          {Object.entries(SECAO_OFFSHORE_LABELS).map(([codigo, label]) => (
            <ThemedText key={codigo} style={styles.bullet}>
              · {label} ({codigo}) — peso {SECAO_OFFSHORE_PESOS[codigo as keyof typeof SECAO_OFFSHORE_PESOS]}
            </ThemedText>
          ))}
          <ThemedText themeColor="textSecondary" style={styles.formula}>
            IMA = (GO×3 + SB×3 + demais×1) / 16
          </ThemedText>
        </Block>

        <Block title="Classificação por faixa">
          {(Object.keys(CLASSIFICACAO_DESEMPENHO_LABELS) as ClassificacaoDesempenho[]).map(
            (key) => (
              <ThemedText key={key} style={styles.bullet}>
                · {CLASSIFICACAO_DESEMPENHO_LABELS[key]}
              </ThemedText>
            ),
          )}
        </Block>

        <Block title="Direitos do colaborador">
          {DIREITOS_COLABORADOR.map((text) => (
            <Bullet key={text} text={text} />
          ))}
        </Block>

        <Block title="Deveres do colaborador">
          {DEVERES_COLABORADOR.map((text) => (
            <Bullet key={text} text={text} />
          ))}
        </Block>

        <Block title="Regras automáticas">
          <Bullet text="Nota 0 ou 1: justificativa obrigatória do gestor." />
          <Bullet text="Nota 3: evidência ou elogio formal obrigatório." />
          <Bullet text="Média &lt; 1,8: abertura automática de PDI (30 dias)." />
          <Bullet text="Média &lt; 1,0: alerta crítico à diretoria." />
        </Block>
      </ScrollView>
    </SafeAreaView>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.block, { borderColor: theme.border }]}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <View style={styles.blockBody}>{children}</View>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return <ThemedText style={styles.bullet}>· {text}</ThemedText>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four },
  lead: { marginBottom: Spacing.one },
  block: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  blockBody: { gap: Spacing.one },
  bullet: { fontSize: 14, lineHeight: 20, fontFamily: Fonts.sans },
  formula: { marginTop: Spacing.two, fontSize: 13, fontFamily: Fonts.sansMedium },
});
