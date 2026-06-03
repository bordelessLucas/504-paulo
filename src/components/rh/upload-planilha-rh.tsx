import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import {
  isAcceptedSpreadsheetFile,
  readPickedDocumentText,
} from '@/features/rh/read-picked-document';
import { uploadProfilesFromCsv } from '@/features/rh/upload-profiles-batch';
import { useUserRole } from '@/hooks/use-user-role';
import { useTheme } from '@/hooks/use-theme';
import { isAdminDashboardRole } from '@/types/supabase';

type UploadStatus = 'idle' | 'loading' | 'success' | 'error';

type UploadPlanilhaRHProps = {
  onImported?: (count: number) => void;
};

export function UploadPlanilhaRH({ onImported }: UploadPlanilhaRHProps) {
  const theme = useTheme();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const canUpload = isAdminDashboardRole(role);
  const isBusy = status === 'loading';

  const handlePickAndUpload = useCallback(async () => {
    if (!canUpload || isBusy) {
      return;
    }

    try {
      setStatus('loading');
      setMessage(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: Platform.OS === 'web' ? ['text/csv', 'text/plain', 'application/vnd.ms-excel', '*/*'] : '*/*',
        copyToCacheDirectory: true,
        multiple: false,
        base64: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        setStatus('idle');
        return;
      }

      const asset = result.assets[0];

      if (!isAcceptedSpreadsheetFile(asset.name)) {
        setStatus('error');
        setMessage('Selecione um arquivo .csv (ou .txt com conteúdo CSV).');
        return;
      }

      setFileName(asset.name);

      const csvContent = await readPickedDocumentText(asset);

      const uploadResult = await uploadProfilesFromCsv(csvContent);

      if (uploadResult.importedCount === 0 && uploadResult.skippedErrors.length > 0) {
        setStatus('error');
        setMessage(uploadResult.skippedErrors.slice(0, 3).join('\n'));
        return;
      }

      const createdSuffix =
        uploadResult.createdAuthCount > 0
          ? ` ${uploadResult.createdAuthCount} conta(s) criada(s) com senha padrão.`
          : '';

      const warningSuffix =
        uploadResult.skippedErrors.length > 0
          ? ` (${uploadResult.skippedErrors.length} linha(s) ignorada(s))`
          : '';

      setStatus('success');
      setMessage(
        `${uploadResult.importedCount} perfil(is) importado(s) com sucesso.${createdSuffix}${warningSuffix}`,
      );
      onImported?.(uploadResult.importedCount);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Não foi possível importar a planilha.');
    }
  }, [canUpload, isBusy, onImported]);

  if (isRoleLoading) {
    return null;
  }

  if (!canUpload) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}>
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          Apenas RH, CEO e administradores podem importar planilhas de RH.
        </ThemedText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Importar colaboradores</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.hint}>
          Arquivo .csv: email, nome, funcao, departamento, data_admissao, status, role. E-mails novos
          recebem acesso automaticamente (senha padrão: 12345678).
        </ThemedText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Selecionar planilha CSV para importar"
        disabled={isBusy}
        onPress={() => void handlePickAndUpload()}
        style={({ pressed }) => [
          styles.uploadButton,
          {
            backgroundColor: theme.background,
            borderColor: theme.border,
          },
          pressed && !isBusy && styles.pressed,
          isBusy && styles.disabled,
        ]}>
        {isBusy ? (
          <ActivityIndicator color={theme.text} />
        ) : (
          <Ionicons color={theme.text} name="cloud-upload-outline" size={20} />
        )}
        <ThemedText style={styles.uploadLabel}>
          {isBusy ? 'Importando...' : 'Selecionar planilha CSV'}
        </ThemedText>
      </Pressable>

      {fileName ? (
        <ThemedText themeColor="textSecondary" style={styles.fileName}>
          Arquivo: {fileName}
        </ThemedText>
      ) : null}

      {message ? (
        <ThemedText
          themeColor={status === 'error' ? 'danger' : 'textSecondary'}
          style={styles.feedback}>
          {message}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  uploadLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  fileName: {
    fontSize: 12,
    lineHeight: 16,
  },
  feedback: {
    fontSize: 13,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.6,
  },
});
