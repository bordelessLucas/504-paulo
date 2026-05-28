import { ThemedText } from '@/components/themed-text';
import { ScreenShell } from '@/components/navigation/screen-shell';

export function MinhasAvaliacoesScreen() {
  return (
    <ScreenShell
      title="Minhas avaliações"
      description="Visualize avaliações recebidas e o status de cada ciclo.">
      <ThemedText themeColor="textSecondary" style={{ fontSize: 15, lineHeight: 22 }}>
        Lista de avaliações quinzenais, semestrais e autoavaliações aparecerá aqui.
      </ThemedText>
    </ScreenShell>
  );
}
