import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet, TextInput, View } from 'react-native';
import { Button, Text, useTheme as usePaperTheme } from 'react-native-paper';

import { Fonts, layout } from '@/constants/theme';
import {
  requiresEvidencia,
  requiresJustificativa,
  type RespostaFormState,
} from '@/features/avaliacao/validation';
import { useTheme } from '@/hooks/use-theme';

type AvaliacaoGovernancaFieldsProps = {
  resposta: RespostaFormState;
  onChange: (patch: Partial<RespostaFormState>) => void;
  showValidation?: boolean;
  validationMessage?: string | null;
};

async function pickEvidencia(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const imageResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: false,
  });

  if (!imageResult.canceled && imageResult.assets[0]) {
    return `Imagem: ${imageResult.assets[0].fileName ?? imageResult.assets[0].uri.split('/').pop() ?? 'anexo'}`;
  }

  const docResult = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (!docResult.canceled && docResult.assets[0]) {
    return `Documento: ${docResult.assets[0].name}`;
  }

  return null;
}

export function AvaliacaoGovernancaFields({
  resposta,
  onChange,
  showValidation = false,
  validationMessage = null,
}: AvaliacaoGovernancaFieldsProps) {
  const theme = useTheme();
  const paperTheme = usePaperTheme();
  const nota = resposta.nota;
  const needsJustificativa = requiresJustificativa(nota);
  const needsEvidencia = requiresEvidencia(nota);

  if (!needsJustificativa && !needsEvidencia) {
    return null;
  }

  return (
    <View style={styles.container}>
      {needsJustificativa ? (
        <View style={styles.fieldGroup}>
          <Text variant="labelLarge" style={{ color: paperTheme.colors.onSurface, fontFamily: Fonts.sansMedium }}>
            Justificativa *
          </Text>
          <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
            Notas 0 ou 1 exigem justificativa obrigatória.
          </Text>
          <TextInput
            multiline
            placeholder="Descreva o motivo da nota atribuída"
            placeholderTextColor={theme.placeholder}
            style={[
              styles.textInput,
              {
                color: theme.text,
                backgroundColor: theme.inputBackground,
                borderColor: showValidation && validationMessage ? theme.danger : theme.border,
              },
            ]}
            value={resposta.justificativa}
            onChangeText={(justificativa) => onChange({ justificativa })}
          />
        </View>
      ) : null}

      {needsEvidencia ? (
        <View style={styles.fieldGroup}>
          <Text variant="labelLarge" style={{ color: paperTheme.colors.onSurface, fontFamily: Fonts.sansMedium }}>
            Evidência *
          </Text>
          <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
            Nota 3 exige evidência do desempenho excepcional.
          </Text>
          <Button
            icon="paperclip"
            mode="outlined"
            onPress={() => {
              void (async () => {
                const evidencia = await pickEvidencia();
                if (evidencia) {
                  onChange({ evidencia });
                }
              })();
            }}>
            {resposta.evidencia.trim() ? 'Trocar evidência' : 'Anexar evidência'}
          </Button>
          {resposta.evidencia.trim() ? (
            <Text variant="bodySmall" style={{ color: paperTheme.colors.primary }}>
              {resposta.evidencia}
            </Text>
          ) : null}
        </View>
      ) : null}

      {showValidation && validationMessage ? (
        <Text variant="bodySmall" style={{ color: paperTheme.colors.error }}>
          {validationMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: layout.space.md,
  },
  fieldGroup: {
    gap: layout.space.sm,
  },
  textInput: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: layout.radius.sm,
    paddingHorizontal: layout.space.lg,
    paddingVertical: layout.space.md,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
});
