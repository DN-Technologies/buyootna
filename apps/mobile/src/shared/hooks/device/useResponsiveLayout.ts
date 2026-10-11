import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLandscape = width > height && isTablet;

  // Grid column counts for list grids (e.g. property grids)
  const cardColumns = isLandscape ? 3 : isTablet ? 2 : 1;

  // Padding sizes
  const horizontalPadding = isTablet ? 24 : 16;

  return {
    width,
    height,
    isTablet,
    isLandscape,
    cardColumns,
    horizontalPadding,
  };
}
