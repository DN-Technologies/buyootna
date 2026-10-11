import { Text } from 'react-native';

import type { RepublishMode } from './republishCredits';

const description = (mode: RepublishMode, days: number) => {
  if (mode === 'zero-credit') {
    return 'لا يوجد لديك رصيد إعلانات حاليًا.\nلبدء إعادة نشر إعلانك، اختر إحدى الباقات المتاحة.';
  }
  const base = `سيتم خصم إعلان واحد من رصيدك، وسيتم نشر الإعلان لمدة ${days} يومًا`;
  return mode === 'multi'
    ? `${base}، اختر نوع الإعلان الذي تريد إعادة نشره به:`
    : `${base}.`;
};

// Title and the explanation for the current credit situation. `days` is
// the listing duration of the credit that will be spent.
export default function RepublishSheetText({
  mode,
  days = 30,
}: {
  mode: RepublishMode;
  days?: number;
}) {
  return (
    <>
      <Text
        className="mb-2 text-center font-cairo-semibold text-[18px] leading-[24px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        إعادة نشر الإعلان؟
      </Text>
      <Text
        className={`w-[305px] text-center font-cairo-medium text-[14px] leading-[22px] text-[#7E7D7D] ${
          mode === 'multi' ? 'mb-4' : ''
        }`}
        style={{ writingDirection: 'rtl' }}
      >
        {description(mode, days)}
      </Text>
    </>
  );
}
