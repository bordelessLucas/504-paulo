import { StyleSheet, View } from 'react-native';
import { ProgressBar, Text, useTheme as usePaperTheme } from 'react-native-paper';

import { Fonts, layout } from '@/constants/theme';

type AvaliacaoWizardProgressProps = {
  currentStep: number;
  totalSteps: number;
  sectionLabel: string;
};

export function AvaliacaoWizardProgress({
  currentStep,
  totalSteps,
  sectionLabel,
}: AvaliacaoWizardProgressProps) {
  const paperTheme = usePaperTheme();
  const progress = totalSteps > 0 ? currentStep / totalSteps : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="labelLarge" style={{ color: paperTheme.colors.onSurface, fontFamily: Fonts.sansMedium }}>
          {sectionLabel}
        </Text>
        <Text variant="labelMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
          {currentStep} de {totalSteps}
        </Text>
      </View>
      <ProgressBar progress={progress} color={paperTheme.colors.primary} style={styles.bar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: layout.space.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: layout.space.md,
  },
  bar: {
    height: 6,
    borderRadius: layout.radius.pill,
  },
});
