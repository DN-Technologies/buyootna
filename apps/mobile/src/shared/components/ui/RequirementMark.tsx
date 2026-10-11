import { Text } from 'react-native';

interface RequirementMarkProps {
  required?: boolean;
  optional?: boolean;
}

/**
 * What follows a field's label: a red * for a required field, "(اختياري)" for
 * an optional one, nothing otherwise. Nest it inside the label's <Text>.
 */
export default function RequirementMark({
  required,
  optional,
}: RequirementMarkProps) {
  if (required) {
    return (
      <Text testID="required-mark" className="text-red-500">
        {' *'}
      </Text>
    );
  }
  if (optional) {
    return (
      <Text
        testID="optional-mark"
        className="font-cairo text-[12px] text-[#6B6A6A]"
      >
        {' (اختياري)'}
      </Text>
    );
  }
  return null;
}
