import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";

interface SelectionCardProps {
  title: string;
  description: string;
  type: "individual" | "company";
  isSelected: boolean;
  onPress: () => void;
}

export default function SelectionCard({
  title,
  description,
  type,
  isSelected,
  onPress,
}: SelectionCardProps) {
  // Dynamic styling based on selection state
  const containerBg = isSelected ? "bg-secondary" : "bg-white";
  const borderColor = isSelected ? "border-secondary" : "border-gray-200";
  const descColor = isSelected ? "text-gray-300" : "text-gray-medium";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        borderRadius: 8,
      }}
      className={`flex-row gap-3 items-center px-2 py-3 mb-4 rounedd-2xl border-[1.5px] ${containerBg} ${borderColor}`}
    >
      {/* Text Content */}
      <View className="flex-1 items-start">
        <Text
          className={`text-lg font-cairo-semibold mb-1 text-right w-full ${
            isSelected ? "text-white" : "text-charcoal"
          }`}
        >
          {title}
        </Text>
        <Text
          className={`text-sm text-right font-cairo-medium w-full leading-5 ${descColor}`}
        >
          {description}
        </Text>
      </View>

      {/* Icon Container */}
      <View
        style={{ width: 40, height: 40 }}
        className="rounded-full bg-[#F5F7F9] items-center justify-center mr-4"
      >
        {type === "individual" ? (
          <Image
            source={require("@/assets/icons/individual-icon.svg")}
            style={{
              width: 25,
              height: 25,
            }}
          />
        ) : (
          <Image
            source={require("@/assets/icons/company-icon.svg")}
            style={{
              width: 25,
              height: 25,
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
