import type { ViewStyle } from 'react-native';

// A control floating over content (the home's header over its list): white,
// with a soft shadow
export const FLOATING: ViewStyle = {
  backgroundColor: '#FFFFFF',
  shadowColor: '#000000',
  shadowOpacity: 0.1,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
};
