import { Image } from 'expo-image';
import { useState } from 'react';
import { FlatList, View } from 'react-native';

interface ProjectPhotoCarouselProps {
  images: string[];
  width: number;
  height: number;
  testID?: string;
}

/** A project's photos, swiped one at a time, with the Figma dots (a long one for the current photo). */
export default function ProjectPhotoCarousel({
  images,
  width,
  height,
  testID,
}: ProjectPhotoCarouselProps) {
  const [index, setIndex] = useState(0);

  return (
    <View testID={testID} style={{ width, height }} className="overflow-hidden rounded-[2px]">
      <FlatList
        data={images}
        keyExtractor={(uri, i) => `${i}-${uri}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(Math.abs(e.nativeEvent.contentOffset.x) / width))
        }
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            contentFit="cover"
            style={{ width, height }}
          />
        )}
      />
      {images.length > 1 && (
        <View
          pointerEvents="none"
          className="absolute bottom-[11px] w-full flex-row items-center justify-center gap-1"
        >
          {images.map((uri, i) => (
            <View
              key={`${i}-${uri}`}
              className={`h-[6px] rounded-full ${
                i === index ? 'w-4 bg-white' : 'w-[6px] bg-white/60'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
