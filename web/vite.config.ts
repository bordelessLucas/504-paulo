import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const supabaseUrl = env.VITE_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey =
    env.VITE_SUPABASE_ANON_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

  return {
    plugins: [react()],
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
          replacement: path.resolve(__dirname, 'src/shims/expo-stub.ts'),
        },
        {
          find: 'expo-file-system',
          replacement: path.resolve(__dirname, 'src/shims/expo-stub.ts'),
        },
        {
          find: 'expo-image-picker',
          replacement: path.resolve(__dirname, 'src/shims/expo-stub.ts'),
        },
        {
          find: 'expo-print',
          replacement: path.resolve(__dirname, 'src/shims/expo-stub.ts'),
        },
        {
          find: 'expo-sharing',
          replacement: path.resolve(__dirname, 'src/shims/expo-stub.ts'),
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
      port: 5173,
      fs: {
        allow: [path.resolve(__dirname, '..')],
      },
    },
  };
});
