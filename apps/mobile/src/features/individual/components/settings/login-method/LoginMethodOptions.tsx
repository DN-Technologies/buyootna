import { View } from 'react-native';

import type {
  LoginMethod,
  LoginMethodResponse,
} from '@/shared/api/settings.service';

import LoginMethodOption from './LoginMethodOption';

interface LoginMethodOptionsProps {
  data: LoginMethodResponse;
  selected: LoginMethod;
  onChoose: (method: LoginMethod) => void;
}

// Either (the default), email, or a verified phone
export default function LoginMethodOptions({
  data,
  selected,
  onChoose,
}: LoginMethodOptionsProps) {
  return (
    <View className="gap-3">
      <LoginMethodOption
        id="BOTH"
        title="البريد الالكتروني أو رقم الهاتف"
        selected={selected === 'BOTH'}
        disabled={false}
        onPress={() => onChoose('BOTH')}
      />
      <LoginMethodOption
        id="EMAIL"
        title="البريد الالكتروني"
        subtitle={data.email}
        selected={selected === 'EMAIL'}
        disabled={!data.email}
        onPress={() => onChoose('EMAIL')}
      />
      <LoginMethodOption
        id="PHONE"
        title="رقم الهاتف"
        subtitle={data.phone}
        selected={selected === 'PHONE'}
        disabled={!data.phoneVerified}
        onPress={() => onChoose('PHONE')}
      />
    </View>
  );
}
