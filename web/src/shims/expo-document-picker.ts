export type DocumentPickerAsset = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
  file?: File;
};

export type DocumentPickerResult =
  | { canceled: true; assets: null }
  | { canceled: false; assets: DocumentPickerAsset[] };

function pickFile(accept: string, multiple: boolean): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.style.display = 'none';
    document.body.appendChild(input);

    const cleanup = () => {
      input.remove();
    };

    input.addEventListener(
      'change',
      () => {
        const files = Array.from(input.files ?? []);
        cleanup();
        resolve(files);
      },
      { once: true },
    );

    input.addEventListener(
      'cancel',
      () => {
        cleanup();
        resolve([]);
      },
      { once: true },
    );

    input.click();
  });
}

export async function getDocumentAsync(options?: {
  type?: string | string[];
  multiple?: boolean;
  copyToCacheDirectory?: boolean;
}): Promise<DocumentPickerResult> {
  const accept = Array.isArray(options?.type)
    ? options.type.join(',')
    : (options?.type ?? '*/*');
  const files = await pickFile(accept, Boolean(options?.multiple));

  if (files.length === 0) {
    return { canceled: true, assets: null };
  }

  return {
    canceled: false,
    assets: files.map((file) => ({
      uri: URL.createObjectURL(file),
      name: file.name,
      mimeType: file.type || undefined,
      size: file.size,
      file,
    })),
  };
}

export default { getDocumentAsync };
