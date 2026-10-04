import { Text } from 'react-native';

export default function FieldLabel({
  children,
  optional = false,
  className,
}: {
  children: string;
  // Adds a grey "(اختياري)" after the label
  optional?: boolean;
  // Overrides the default sizing (e.g. the company edit-profile's 14px labels)
  className?: string;
}) {
  return (
    <Text
      className={
        className ?? 'mb-2 font-cairo-medium text-xs text-[#111111]'
      }
      style={{ writingDirection: 'rtl' }}
    >
      {children}
      {optional && (
        <Text className="font-cairo text-xs text-[#6B6A6A]"> (اختياري)</Text>
      )}
    </Text>
  );
}
