import { validateChangePassword, type ChangePasswordFieldError } from '@/features/perfil/validation';
import { supabase } from '@/lib/supabase';

const AVATAR_BUCKET = 'avatars';
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

type AvatarAsset = {
  uri: string;
  fileSize?: number | null;
  mimeType?: string;
};

function resolveImageContentType(fileExt: string): string {
  if (fileExt === 'png') {
    return 'image/png';
  }

  if (fileExt === 'webp') {
    return 'image/webp';
  }

  return 'image/jpeg';
}

function buildAvatarPublicUrl(filePath: string): string {
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function requestAvatarLibraryPermission(): Promise<boolean> {
  const ImagePicker = await import('expo-image-picker');
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

export async function pickAvatarImage(): Promise<AvatarAsset | null> {
  const ImagePicker = await import('expo-image-picker');
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permissão negada para acessar a galeria de fotos.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0];
}

export async function uploadProfileAvatar(
  userId: string,
  asset: AvatarAsset,
): Promise<string> {
  if (asset.fileSize && asset.fileSize > MAX_AVATAR_BYTES) {
    throw new Error('A imagem deve ter no máximo 5 MB.');
  }

  const fileExt = asset.uri.split('.').pop()?.split('?')[0]?.toLowerCase() ?? 'jpg';
  const contentType = asset.mimeType ?? resolveImageContentType(fileExt);
  const filePath = `${userId}/avatar.${fileExt === 'jpeg' ? 'jpg' : fileExt}`;

  const response = await fetch(asset.uri);

  if (!response.ok) {
    throw new Error('Não foi possível ler a imagem selecionada.');
  }

  const arrayBuffer = await response.arrayBuffer();
  return uploadAvatarBuffer(userId, filePath, arrayBuffer, contentType);
}

export async function uploadProfileAvatarFromFile(
  userId: string,
  file: File,
): Promise<string> {
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('A imagem deve ter no máximo 5 MB.');
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const contentType = file.type || resolveImageContentType(fileExt);
  const filePath = `${userId}/avatar.${fileExt === 'jpeg' ? 'jpg' : fileExt}`;
  const arrayBuffer = await file.arrayBuffer();
  return uploadAvatarBuffer(userId, filePath, arrayBuffer, contentType);
}

async function uploadAvatarBuffer(
  userId: string,
  filePath: string,
  arrayBuffer: ArrayBuffer,
  contentType: string,
): Promise<string> {
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const publicUrl = buildAvatarPublicUrl(filePath);

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  return publicUrl;
}

export async function changePassword(params: {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ChangePasswordFieldError | null> {
  const validationError = validateChangePassword(params);

  if (validationError) {
    return validationError;
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: params.email.trim().toLowerCase(),
    password: params.currentPassword,
  });

  if (signInError) {
    return { field: 'currentPassword', message: 'Senha atual incorreta.' };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: params.newPassword,
  });

  if (updateError) {
    return { field: 'general', message: updateError.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ must_change_password: false })
      .eq('id', user.id);

    if (profileError && !profileError.message.includes('must_change_password')) {
      return { field: 'general', message: profileError.message };
    }
  }

  return null;
}
