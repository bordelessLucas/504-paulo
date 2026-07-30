export type ImagePickerAsset = {
  uri: string;
  width?: number;
  height?: number;
  mimeType?: string;
  fileName?: string;
  fileSize?: number;
  file?: File;
};

export type ImagePickerResult =
  | { canceled: true; assets: null }
  | { canceled: false; assets: ImagePickerAsset[] };

async function pickImage(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.capture = 'environment';
    input.style.display = 'none';
    document.body.appendChild(input);

    const cleanup = () => input.remove();

    input.addEventListener(
      'change',
      () => {
        const file = input.files?.[0] ?? null;
        cleanup();
        resolve(file);
      },
      { once: true },
    );

    input.addEventListener(
      'cancel',
      () => {
        cleanup();
        resolve(null);
      },
      { once: true },
    );

    input.click();
  });
}

export async function requestMediaLibraryPermissionsAsync() {
  return { status: 'granted' as const, granted: true };
}

export async function requestCameraPermissionsAsync() {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { status: 'denied' as const, granted: false };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    for (const track of stream.getTracks()) {
      track.stop();
    }
    return { status: 'granted' as const, granted: true };
  } catch {
    return { status: 'denied' as const, granted: false };
  }
}

export async function launchImageLibraryAsync(options?: {
  mediaTypes?: unknown;
  quality?: number;
  allowsEditing?: boolean;
}): Promise<ImagePickerResult> {
  void options;
  const file = await pickImage('image/*');
  if (!file) {
    return { canceled: true, assets: null };
  }
  return {
    canceled: false,
    assets: [
      {
        uri: URL.createObjectURL(file),
        mimeType: file.type || 'image/jpeg',
        fileName: file.name,
        fileSize: file.size,
        file,
      },
    ],
  };
}

export async function launchCameraAsync(options?: {
  quality?: number;
  allowsEditing?: boolean;
}): Promise<ImagePickerResult> {
  void options;
  const permission = await requestCameraPermissionsAsync();
  if (!permission.granted) {
    return { canceled: true, assets: null };
  }
  const file = await pickImage('image/*');
  if (!file) {
    return { canceled: true, assets: null };
  }
  return {
    canceled: false,
    assets: [
      {
        uri: URL.createObjectURL(file),
        mimeType: file.type || 'image/jpeg',
        fileName: file.name,
        fileSize: file.size,
        file,
      },
    ],
  };
}

export const MediaTypeOptions = {
  Images: 'Images',
  Videos: 'Videos',
  All: 'All',
} as const;

export default {
  requestMediaLibraryPermissionsAsync,
  requestCameraPermissionsAsync,
  launchImageLibraryAsync,
  launchCameraAsync,
  MediaTypeOptions,
};
