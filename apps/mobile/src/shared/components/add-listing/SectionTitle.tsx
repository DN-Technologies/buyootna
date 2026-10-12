import { Text } from 'react-native';

/** A form section heading, e.g. معلومات العقار. */
export default function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      className="font-cairo-semibold text-lg text-black"
      style={{ writingDirection: 'rtl' }}
    >
      {children}
    </Text>
  );
}
