import { Text } from 'react-native';

export default function FieldLabel({ children }: { children: string }) {
  return (
    <Text
      className="mb-2 font-cairo-medium text-xs text-[#111111]"
      style={{ writingDirection: 'rtl' }}
    >
      {children}
    </Text>
  );
}
