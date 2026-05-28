import { ThemedText } from '@/components/themed-text';
import { ScreenShell } from '@/components/navigation/screen-shell';

export function MinhaEquipeScreen() {
  return (
    <ScreenShell
      title="Minha equipe"
      description="Veja colaboradores sob sua supervisão e o status das avaliações.">
      <ThemedText themeColor="textSecondary" style={{ fontSize: 15, lineHeight: 22 }}>
        Lista de colaboradores, departamentos e pendências de avaliação serão exibidos aqui.
      </ThemedText>
    </ScreenShell>
  );
}
