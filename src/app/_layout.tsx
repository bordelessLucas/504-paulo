import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/theme';
import { ThemedView } from '@/components/themed-view';
import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider, useAuth } from '@/features/auth/auth-context';
import { AppPaperProvider } from '@/providers/app-paper-provider';

SplashScreen.preventAutoHideAsync();

const NavigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: BrandColors.primary,
    background: BrandColors.background,
    card: BrandColors.card,
    text: '#1A2332',
    border: 'rgba(1, 45, 96, 0.1)',
  },
};

const NavigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: BrandColors.primary,
    background: '#011A38',
    card: BrandColors.primary,
  },
};

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      void SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <ThemedView style={styles.loading}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? NavigationDarkTheme : NavigationLightTheme}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    Korataki_Regular: require('../../assets/fonts/Korataki-Regular.ttf'),
    Biko_Regular: require('../../assets/fonts/Biko-Regular.ttf'),
    Biko_Medium: require('../../assets/fonts/Biko-Medium.ttf'),
    Biko_Bold: require('../../assets/fonts/Biko-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppPaperProvider>
        <ToastProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </ToastProvider>
      </AppPaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
