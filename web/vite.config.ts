import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const supabaseUrl = env.VITE_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey =
    env.VITE_SUPABASE_ANON_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: [
          'favicon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'icons.svg',
        ],
        manifest: {
          id: '/',
          name: 'Vertek Avalia',
          short_name: 'Vertek Avalia',
          description: 'Avaliação de desempenho e gestão de pessoas — Vertek Avalia',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          display_override: ['standalone', 'minimal-ui', 'browser'],
          orientation: 'portrait-primary',
          background_color: '#F0EDE4',
          theme_color: '#012D60',
          lang: 'pt-BR',
          dir: 'ltr',
          categories: ['business', 'productivity'],
          shortcuts: [
            {
              name: 'Como instalar o app',
              short_name: 'Instalar',
              url: '/instalar',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Painel de Avaliações',
              short_name: 'Avaliar',
              url: '/app/painel-avaliacao',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Dashboard Gerencial',
              short_name: 'Gerencial',
              url: '/app/gerencial',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Meu Perfil',
              short_name: 'Perfil',
              url: '/app/perfil',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
          ],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/, /supabase\.co/],
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webmanifest,woff2}'],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.hostname.includes('supabase.co'),
              handler: 'NetworkOnly',
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'vertek-images',
                expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: ({ request }) =>
                request.destination === 'script' || request.destination === 'style',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'vertek-static',
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    envDir: path.resolve(__dirname, '..'),
    envPrefix: ['VITE_', 'EXPO_PUBLIC_'],
    define: {
      'process.env.EXPO_PUBLIC_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'process.env.NODE_ENV': JSON.stringify(mode),
      'import.meta.env.EXPO_PUBLIC_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.EXPO_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: [
        {
          find: 'react',
          replacement: path.resolve(__dirname, '../node_modules/react'),
        },
        {
          find: 'react-dom',
          replacement: path.resolve(__dirname, '../node_modules/react-dom'),
        },
        {
          find: 'react/jsx-runtime',
          replacement: path.resolve(__dirname, '../node_modules/react/jsx-runtime.js'),
        },
        {
          find: 'react/jsx-dev-runtime',
          replacement: path.resolve(__dirname, '../node_modules/react/jsx-dev-runtime.js'),
        },
        {
          find: '@/lib/supabase-storage',
          replacement: path.resolve(__dirname, 'src/lib/supabase-storage.ts'),
        },
        {
          find: '@/lib/supabase',
          replacement: path.resolve(__dirname, 'src/lib/supabase.ts'),
        },
        {
          find: '@/features/subscription/subscription-storage',
          replacement: path.resolve(__dirname, 'src/adapters/subscription-storage.ts'),
        },
        {
          find: '@/features/auth/auth-context',
          replacement: path.resolve(__dirname, 'src/contexts/auth-context.tsx'),
        },
        {
          find: '@/features/gerencial/export-ficha-pdf',
          replacement: path.resolve(__dirname, 'src/adapters/export-ficha-pdf.ts'),
        },
        {
          find: 'react-native',
          replacement: path.resolve(__dirname, 'src/shims/react-native.ts'),
        },
        {
          find: '@react-native-async-storage/async-storage',
          replacement: path.resolve(__dirname, 'src/shims/async-storage.ts'),
        },
        {
          find: 'expo-router',
          replacement: path.resolve(__dirname, 'src/shims/expo-router.ts'),
        },
        {
          find: '@expo/vector-icons/Ionicons',
          replacement: path.resolve(__dirname, 'src/shims/vector-icons.ts'),
        },
        {
          find: '@expo/vector-icons',
          replacement: path.resolve(__dirname, 'src/shims/vector-icons.ts'),
        },
        {
          find: 'expo-document-picker',
          replacement: path.resolve(__dirname, 'src/shims/expo-document-picker.ts'),
        },
        {
          find: 'expo-image-picker',
          replacement: path.resolve(__dirname, 'src/shims/expo-image-picker.ts'),
        },
        {
          find: 'expo-file-system',
          replacement: path.resolve(__dirname, 'src/shims/expo-file-system.ts'),
        },
        {
          find: 'expo-print',
          replacement: path.resolve(__dirname, 'src/shims/expo-print.ts'),
        },
        {
          find: 'expo-sharing',
          replacement: path.resolve(__dirname, 'src/shims/expo-sharing.ts'),
        },
        {
          find: 'expo-font',
          replacement: path.resolve(__dirname, 'src/shims/expo-stub.ts'),
        },
        {
          find: 'expo-haptics',
          replacement: path.resolve(__dirname, 'src/shims/expo-stub.ts'),
        },
        {
          find: 'expo-sqlite',
          replacement: path.resolve(__dirname, 'src/shims/expo-stub.ts'),
        },
        {
          find: 'expo-sensors',
          replacement: path.resolve(__dirname, 'src/shims/expo-stub.ts'),
        },
        {
          find: 'expo-splash-screen',
          replacement: path.resolve(__dirname, 'src/shims/expo-stub.ts'),
        },
        {
          find: 'expo-constants',
          replacement: path.resolve(__dirname, 'src/shims/expo-stub.ts'),
        },
        {
          find: 'expo-linking',
          replacement: path.resolve(__dirname, 'src/shims/expo-stub.ts'),
        },
        {
          find: '@',
          replacement: path.resolve(__dirname, '../src'),
        },
      ],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['react-native', 'expo-sqlite', 'expo-router'],
    },
    server: {
      port: 5180,
      strictPort: true,
      fs: {
        allow: [path.resolve(__dirname, '..')],
      },
    },
  };
});
