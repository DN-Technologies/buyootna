import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

// NativeWind only turns `className` into `style` for React Native's own
// components. Third-party ones must be registered, or their classes are
// silently dropped -- an expo-image sized only with "h-11 w-11" renders at
// 0x0, which is how chat avatars, sent photos and pinned-ad images all
// went missing. Registered once here, for the whole app.
cssInterop(Image, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });
