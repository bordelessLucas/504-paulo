import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { GlassCard } from '@/components/premium/GlassCard';
import { StatusBadge } from '@/components/premium/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { Fonts, layout } from '@/constants/theme';
import {
  DEVERES_COLABORADOR,
  DIREITOS_COLABORADOR,
  MARCOS_TEMPORAIS,
} from '@/features/avaliacao/governanca';
import { useTheme } from '@/hooks/use-theme';

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

export function RegrasScreen() {
  const theme = useTheme();

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Regras / Direitos / Deveres"
        description="Marcos temporais, direitos, deveres e validações obrigatórias do DNA PERFORMANCE."
        accessory={<StatusBadge label="DNA-TEK" tone="accent" size="sm" />}
      />

      <ThemedText themeColor="textMuted" style={styles.eyebrow}>
        MARCOS TEMPORAIS
      </ThemedText>
      <View style={styles.stack}>
        {(Object.keys(MARCOS_TEMPORAIS) as Array<keyof typeof MARCOS_TEMPORAIS>).map((key) => {
          const marco = MARCOS_TEMPORAIS[key];
          return (
            <GlassCard key={key} padding="compact">
              <View style={styles.row}>
                <Ionicons color={theme.accent} name="calendar-outline" size={18} />
                <View style={styles.flex}>
                  <ThemedText type="smallBold">{marco.label}</ThemedText>
                  <ThemedText themeColor="textSecondary" type="small">
                    {marco.descricao}
                  </ThemedText>
                </View>
              </View>
            </GlassCard>
          );
        })}
      </View>

      <ThemedText themeColor="textMuted" style={styles.eyebrow}>
        DIREITOS DO COLABORADOR
      </ThemedText>
      <GlassCard>
        {DIREITOS_COLABORADOR.map((item, index) => (
          <View key={item} style={styles.listItem}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {index + 1}.
            </ThemedText>
            <ThemedText type="small" style={styles.flex}>
              {item}
            </ThemedText>
          </View>
        ))}
      </GlassCard>

      <ThemedText themeColor="textMuted" style={styles.eyebrow}>
        DEVERES DO COLABORADOR
      </ThemedText>
      <GlassCard>
        {DEVERES_COLABORADOR.map((item, index) => (
          <View key={item} style={styles.listItem}>
            <ThemedText type="smallBold" style={{ color: theme.semantic.warning.text }}>
              {index + 1}.
            </ThemedText>
            <ThemedText type="small" style={styles.flex}>
              {item}
            </ThemedText>
          </View>
        ))}
      </GlassCard>

      <ThemedText themeColor="textMuted" style={styles.eyebrow}>
        REGRAS DE VALIDAÇÃO (ESCALA 0–3)
      </ThemedText>
      <View style={styles.stack}>
        {REGRAS_VALIDACAO.map((regra) => (
          <GlassCard key={regra.evento} padding="compact">
            <StatusBadge label={regra.evento} tone={regra.tone} size="sm" />
            <ThemedText type="small" style={styles.acaoText}>
              {regra.acao}
            </ThemedText>
          </GlassCard>
        ))}
      </View>
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.space.md,
    paddingBottom: layout.space.xxl,
  },
  eyebrow: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 1,
    marginTop: layout.space.sm,
  },
  stack: {
    gap: layout.space.sm,
  },
  row: {
    flexDirection: 'row',
    gap: layout.space.sm,
    alignItems: 'flex-start',
  },
  flex: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    gap: layout.space.sm,
    marginBottom: layout.space.sm,
  },
  acaoText: {
    marginTop: layout.space.sm,
  },
});
