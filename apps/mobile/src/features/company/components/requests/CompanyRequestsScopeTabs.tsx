import { Text, TouchableOpacity, View } from 'react-native';

import { RequestScope } from './types';

export interface CompanyRequestsScopeTabsProps {
  activeScope: RequestScope;
  onScopeChange: (scope: RequestScope) => void;
}

export default function CompanyRequestsScopeTabs({
  activeScope,
  onScopeChange,
}: CompanyRequestsScopeTabsProps) {
  const isCompany = activeScope === 'company';
  const isPublic = activeScope === 'public';

  return (
    <View className="border-b border-[#EBECEE] bg-white px-4">
      {/* RTL flex-row: Child 0 is Visual Right ("خاصة بالشركة"), Child 1 is Visual Left ("عامة") */}
      <View className="flex-row items-center justify-between">
        {/* Visual Right (Child 0): خاصة بالشركة */}
        <TouchableOpacity
          testID="company-requests-tab-company"
          onPress={() => onScopeChange('company')}
          activeOpacity={0.7}
          className="h-[44px] flex-1 items-center justify-between pt-3.5"
        >
          <Text
            className={`text-[15px] ${
              isCompany
                ? 'font-almarai-bold text-[#15304D]'
                : 'font-almarai-regular text-[#6B6A6A]'
            }`}
            style={{ writingDirection: 'rtl' }}
          >
            خاصة بالشركة
          </Text>
          <View
            className={`h-[2px] w-full rounded-t-[6px] ${
              isCompany ? 'bg-[#15304D]' : 'bg-transparent'
            }`}
          />
        </TouchableOpacity>

        {/* Visual Left (Child 1): عامة */}
        <TouchableOpacity
          testID="company-requests-tab-public"
          onPress={() => onScopeChange('public')}
          activeOpacity={0.7}
          className="h-[44px] flex-1 items-center justify-between pt-3.5"
        >
          <Text
            className={`text-[15px] ${
              isPublic
                ? 'font-almarai-bold text-[#15304D]'
                : 'font-almarai-regular text-[#6B6A6A]'
            }`}
            style={{ writingDirection: 'rtl' }}
          >
            عامة
          </Text>
          <View
            className={`h-[2px] w-full rounded-t-[6px] ${
              isPublic ? 'bg-[#15304D]' : 'bg-transparent'
            }`}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
