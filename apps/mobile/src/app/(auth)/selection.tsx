import FormInput from "@/components/FormInput";
import { useForm } from "react-hook-form";
import { View } from "react-native";

export default function Selection() {
  const { control } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <FormInput
        control={control}
        name="email"
        label="البريد الالكتروني"
        placeholder="alisalem@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <FormInput
        control={control}
        name="password"
        label="كلمة المرور"
        placeholder="**************"
        isPassword={true}
      />
    </View>
  );
}
