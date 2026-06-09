import * as ImagePicker from 'expo-image-picker';

import { validateChangePassword, type ChangePasswordFieldError } from '@/features/perfil/validation';
import { supabase } from '@/lib/supabase';

const AVATAR_BUCKET = 'avatars';
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

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
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

export async function pickAvatarImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const hasPermission = await requestAvatarLibraryPermission();

  if (!hasPermission) {
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
  asset: ImagePicker.ImagePickerAsset,
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

  return null;
}
