import { Image, ScrollView, Text, View } from 'react-native';

interface PreviewImageGalleryProps {
  images: string[];
}

export default function PreviewImageGallery({
  images,
}: PreviewImageGalleryProps) {
  return (
    <View className="w-full">
      <Text
        className="pb-2 font-cairo-medium text-[13px] text-[#A0A0A0]"
        style={{ writingDirection: 'rtl' }}
      >
        الصور
      </Text>
      {images.length > 0 ? (
        <Image
          source={{ uri: images[0] }}
          className="h-52 w-full rounded-2xl"
          resizeMode="cover"
        />
      ) : (
        <Image
          source={require('@/assets/images/no-image.png')}
          className="h-52 w-full rounded-2xl"
          resizeMode="cover"
        />
      )}

      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ flexDirection: 'row-reverse', gap: 10 }}
        >
          {images.slice(1).map((uri, idx) => (
            <Image
              key={idx}
              source={{ uri }}
              className="h-16 w-16 rounded-xl border border-gray-100"
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
