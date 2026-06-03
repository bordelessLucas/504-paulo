import type { DocumentPickerAsset } from 'expo-document-picker';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';

const CSV_EXTENSIONS = ['.csv', '.txt'];

export function isAcceptedSpreadsheetFile(fileName: string): boolean {
  const lower = fileName.trim().toLowerCase();
  return CSV_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export async function readPickedDocumentText(asset: DocumentPickerAsset): Promise<string> {
  if (Platform.OS === 'web') {
    if (asset.file) {
      return asset.file.text();
    }

    if (asset.uri.startsWith('data:')) {
      const response = await fetch(asset.uri);
      return response.text();
    }

    const response = await fetch(asset.uri);
    if (!response.ok) {
      throw new Error('Não foi possível ler o arquivo selecionado.');
    }

    return response.text();
  }

  const file = new File(asset.uri);
  return file.text();
}
