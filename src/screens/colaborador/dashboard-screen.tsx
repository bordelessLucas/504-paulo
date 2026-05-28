import { ThemedText } from '@/components/themed-text';
import { ScreenShell } from '@/components/navigation/screen-shell';

export function ColaboradorDashboardScreen() {
  return (
    <ScreenShell
      title="Dashboard do colaborador"
      description="Acompanhe suas avaliações, feedbacks recebidos e pontos de melhoria.">
      <ThemedText themeColor="textSecondary" style={{ fontSize: 15, lineHeight: 22 }}>
        Em breve: histórico de avaliações quinzenais e semestrais, autoavaliação e plano de ação.
      </ThemedText>
    </ScreenShell>
  );
}
