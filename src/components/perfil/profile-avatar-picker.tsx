import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, layout } from '@/constants/theme';
import { pickAvatarImage, uploadProfileAvatar } from '@/features/perfil/profile-api';
import { useTheme } from '@/hooks/use-theme';

type ProfileAvatarPickerProps = {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  onAvatarUpdated: (url: string) => void;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function ProfileAvatarPicker({
  userId,
  name,
  avatarUrl,
  onAvatarUpdated,
}: ProfileAvatarPickerProps) {
  const theme = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickAvatar = async () => {
    if (isUploading) {
      return;
    }

    setError(null);

    try {
      const asset = await pickAvatarImage();

      if (!asset) {
        return;
      }

      setIsUploading(true);
      const publicUrl = await uploadProfileAvatar(userId, asset);
      onAvatarUpdated(publicUrl);
    } catch (pickError) {
      setError(
        pickError instanceof Error ? pickError.message : 'Não foi possível atualizar a foto.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Alterar foto de perfil"
        disabled={isUploading}
        onPress={() => void handlePickAvatar()}
        style={({ pressed }) => [
          styles.avatarButton,
          pressed && !isUploading && styles.pressed,
        ]}>
        <View style={styles.avatarWrap}>
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: theme.accentMuted, borderColor: theme.border },
            ]}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <ThemedText style={[styles.initials, { color: theme.accent }]}>
                {getInitials(name)}
              </ThemedText>
            )}
          </View>

          <View
            style={[
              styles.editBadge,
              {
                backgroundColor: theme.primary,
                borderColor: theme.background,
              },
            ]}>
            {isUploading ? (
              <ActivityIndicator color={theme.textOnPrimary} size="small" />
            ) : (
              <Ionicons color={theme.textOnPrimary} name="camera-outline" size={16} />
            )}
          </View>
        </View>
      </Pressable>

      <ThemedText themeColor="textSecondary" style={styles.hint}>
        Toque para alterar a foto
      </ThemedText>

      {error ? (
        <ThemedText themeColor="danger" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const AVATAR_SIZE = 112;
const BADGE_SIZE = 32;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: layout.space.sm,
    paddingTop: layout.space.sm,
  },
  avatarButton: {
    alignItems: 'center',
  },
  avatarWrap: {
    width: AVATAR_SIZE + 8,
    height: AVATAR_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 36,
    lineHeight: 42,
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
});
