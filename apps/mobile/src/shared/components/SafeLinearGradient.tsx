import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient';
import { UIManager, View } from 'react-native';

export function SafeLinearGradient({ colors, style, children, ...props }: LinearGradientProps) {
  const isAvailable = Boolean(
    UIManager.getViewManagerConfig && UIManager.getViewManagerConfig('ExpoLinearGradient')
  );

  if (!isAvailable) {
    const backgroundColor = Array.isArray(colors) && colors.length > 0 ? String(colors[0]) : '#FF8D28';
    return (
      <View style={[{ backgroundColor }, style]}>
        {children}
      </View>
    );
  }

  return (
    <LinearGradient colors={colors} style={style} {...props}>
      {children}
    </LinearGradient>
  );
}

export default SafeLinearGradient;
