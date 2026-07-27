export const Platform = { OS: 'web' as const, select: <T>(spec: { web?: T; default?: T }) => spec.web ?? spec.default };

export const AppState = {
  addEventListener: () => ({ remove: () => undefined }),
};

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T) => styles,
  hairlineWidth: 1,
};

export const View = 'div';
export const Text = 'span';
export const Pressable = 'button';
export const ScrollView = 'div';
export const ActivityIndicator = 'span';
export const RefreshControl = 'div';
export const useWindowDimensions = () => ({ width: 1024, height: 768 });
