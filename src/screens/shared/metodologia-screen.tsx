import { StyleSheet, View } from 'react-native';

import { EscalaLegenda } from '@/components/avaliacao/escala-legenda';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
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

export function MetodologiaScreen() {
  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader title="Metodologia Offshore" />

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
          <ThemedText key={codigo} type="small">
            · {label} ({codigo}) — peso {SECAO_OFFSHORE_PESOS[codigo as keyof typeof SECAO_OFFSHORE_PESOS]}
          </ThemedText>
        ))}
        <ThemedText type="small" themeColor="textSecondary" style={styles.formula}>
          IMA = (GO×3 + SB×3 + demais×1) / 16
        </ThemedText>
      </Block>

      <Block title="Classificação por faixa">
        {(Object.keys(CLASSIFICACAO_DESEMPENHO_LABELS) as ClassificacaoDesempenho[]).map(
          (key) => (
            <ThemedText key={key} type="small">
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
    </TabScreenContainer>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card padding="compact">
      <ThemedText type="subtitle">{title}</ThemedText>
      <View style={styles.blockBody}>{children}</View>
    </Card>
  );
}

function Bullet({ text }: { text: string }) {
  return <ThemedText type="small">· {text}</ThemedText>;
}

const styles = StyleSheet.create({
  content: { gap: Spacing.four },
  blockBody: { gap: Spacing.one },
  formula: { marginTop: Spacing.two, fontFamily: Fonts.sansMedium },
});
