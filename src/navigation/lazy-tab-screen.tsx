import React, { Suspense, type ComponentType } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

function TabScreenFallback() {
  return (
    <View style={styles.fallback}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export function createLazyTabScreen<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
): ComponentType<P> {
  const LazyComponent = React.lazy(loader);

  return function LazyTabScreen(props: P) {
    return (
      <Suspense fallback={<TabScreenFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

export function createLazyNamedScreen<P extends object>(
  loader: () => Promise<Record<string, unknown>>,
  exportName: string,
): ComponentType<P> {
  return createLazyTabScreen(() =>
    loader().then((module) => ({
      default: module[exportName] as ComponentType<P>,
    })),
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
