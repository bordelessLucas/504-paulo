import { useWindowDimensions } from 'react-native';

import { SPLIT_LAYOUT_MIN_WIDTH } from '@/constants/layout';

export function useIsDesktopLayout() {
  const { width } = useWindowDimensions();
  return width >= SPLIT_LAYOUT_MIN_WIDTH;
}
