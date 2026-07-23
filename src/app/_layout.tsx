import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableFreeze } from 'react-native-screens';

import { Colors } from '@/constants/theme';
import { ThemedView } from '@/components/themed-view';
import { ToastProvider } from '@/components/ui/toast';
import { ThemeProvider, useThemeContext } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/features/auth/auth-context';
import { SubscriptionProvider } from '@/features/subscription/subscription-context';
import { AppPaperProvider } from '@/providers/app-paper-provider';

SplashScreen.preventAutoHideAsync();
enableFreeze(true);

const NavigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.accent,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

const NavigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.accent,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
  },
};

function RootNavigator() {
  const { isLoading } = useAuth();
  const { isDark } = useThemeContext();

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
    <NavigationThemeProvider value={isDark ? NavigationDarkTheme : NavigationLightTheme}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(paywall)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    Korataki_Regular: require('../../assets/fonts/Biko-Bold.ttf'),
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
      <ThemeProvider>
        <AppPaperProvider>
          <ToastProvider>
            <AuthProvider>
              <SubscriptionProvider>
                <RootNavigator />
              </SubscriptionProvider>
            </AuthProvider>
          </ToastProvider>
        </AppPaperProvider>
      </ThemeProvider>
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
