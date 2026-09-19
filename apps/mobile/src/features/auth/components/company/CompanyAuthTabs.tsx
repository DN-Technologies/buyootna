import { Platform,Text, TouchableOpacity, View } from 'react-native';

interface CompanyAuthTabsProps {
  mode: 'login' | 'signup';
  onChangeMode: (mode: 'login' | 'signup') => void;
}

export const CompanyAuthTabs: React.FC<CompanyAuthTabsProps> = ({
  mode,
  onChangeMode,
}) => {
  return (
    <View className="mb-10 w-[75%] flex-row self-center rounded-3xl bg-accent p-1">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChangeMode('signup')}
        className={`flex-1 items-center rounded-3xl py-2 ${
          mode === 'signup' ? 'bg-primary' : 'bg-transparent'
        }`}
      >
        <Text
          className={`font-cairo-bold text-sm ${
            mode === 'signup' ? 'text-white' : 'text-slate-500'
          }`}
          style={{ paddingTop: Platform.OS === 'ios' ? 4 : 0 }}
        >
          تسجيل جديد
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChangeMode('login')}
        className={`flex-1 items-center rounded-3xl py-2 ${
          mode === 'login' ? 'bg-primary' : 'bg-transparent'
        }`}
      >
        <Text
          className={`font-cairo-bold text-sm ${
            mode === 'login' ? 'text-white' : 'text-slate-500'
          }`}
          style={{ paddingTop: Platform.OS === 'ios' ? 4 : 0 }}
        >
          تسجيل دخول
        </Text>
      </TouchableOpacity>
    </View>
  );
};
