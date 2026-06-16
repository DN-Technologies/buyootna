import { Fragment } from 'react';
import { Text, View } from 'react-native';

export interface PropertyDetailsBodyProps {
  type: 'SALE' | 'RENT' | 'EXCHANGE';
  description: string;
  features: string[];
  // Exchange Specific
  exchangeRequirement?: string;
  // Rent Specific
  additionalCosts?: string;
  rentTerms?: string;
}

// Helper component for consistent section titles and spacing
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View className="mb-6">
    <Text
      className="mb-2 font-cairo-semibold text-sm text-[#6B6A6A]"
      style={{ writingDirection: 'rtl' }}
    >
      {title}
    </Text>
    {children}
  </View>
);

export default function PropertyDetailsBody({
  type,
  description,
  features,
  exchangeRequirement,
  additionalCosts,
  rentTerms,
}: PropertyDetailsBodyProps) {
  return (
    <View className="px-5">
      {/* --- 1. EXCHANGE SPECIFIC: Required Property --- */}
      {type === 'EXCHANGE' && exchangeRequirement && (
        <Section title="المطلوب">
          <Text
            className="font-cairo-semibold text-sm leading-6 text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            {exchangeRequirement}
          </Text>
        </Section>
      )}

      {/* --- 2. Features Row (مزايا العقار) --- */}
      {features && features.length > 0 && (
        <Section
          title={
            type === 'EXCHANGE' ? 'مزايا العقار / التخصيص' : 'مزايا العقار'
          }
        >
          <View className="flex-row flex-wrap">
            {features.map((feature, index) => (
              <Fragment key={index}>
                <Text
                  className="font-cairo-medium text-sm text-[#111111]"
                  style={{ writingDirection: 'rtl' }}
                >
                  {feature}
                </Text>
                {/* Add a bullet separator between items, but not after the last one */}
                {index < features.length - 1 && (
                  <Text
                    className="mx-3 font-cairo-bold text-sm text-[#94A3B8]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    <View className="mx-4 h-4 w-[0.5px] bg-[#D7D7D7]" />
                  </Text>
                )}
              </Fragment>
            ))}
          </View>
        </Section>
      )}

      {/* --- 3. RENT SPECIFIC: Additional Costs & Terms --- */}
      {type === 'RENT' && (
        <>
          {additionalCosts && (
            <Section title="المصاريف الإضافية">
              <Text
                className="font-cairo-medium text-sm leading-6 text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {additionalCosts}
              </Text>
            </Section>
          )}

          {rentTerms && (
            <Section title="شروط الإيجار">
              <Text
                className="font-cairo-medium text-sm leading-6 text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {rentTerms}
              </Text>
            </Section>
          )}
        </>
      )}

      {/* --- 4. Main Description (الوصف) --- */}
      {type !== 'EXCHANGE' && (
        <Section title="الوصف">
          <Text
            className="font-cairo-medium text-sm leading-7 text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            {description}
          </Text>
        </Section>
      )}
    </View>
  );
}
