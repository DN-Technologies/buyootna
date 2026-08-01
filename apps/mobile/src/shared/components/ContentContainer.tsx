import { useWindowDimensions, View, ViewProps, ViewStyle } from 'react-native';

interface ContentContainerProps extends ViewProps {
  children: React.ReactNode;
}

export default function ContentContainer({
  children,
  className,
  style,
  ...props
}: ContentContainerProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Constrain max width for iPad / Tablets and center it
  const containerStyle: ViewStyle = isTablet
    ? {
        maxWidth: 680,
        width: '100%',
        alignSelf: 'center',
      }
    : {};

  return (
    <View style={[containerStyle, style]} className={className} {...props}>
      {children}
    </View>
  );
}
