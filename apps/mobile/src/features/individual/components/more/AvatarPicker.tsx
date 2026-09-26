import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

import apiClient from '@/shared/api/api';
import Avatar from '@/shared/components/ui/Avatar';
import { showAlert } from '@/shared/utils/alert';

interface AvatarPickerProps {
  currentAvatarUrl?: string;
  onUploadSuccess?: (newAvatarUrl: string) => void;
}

export default function AvatarPicker({
  currentAvatarUrl,
  onUploadSuccess,
}: AvatarPickerProps) {
  const [imageUri, setImageUri] = useState<string | undefined>(currentAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    // Request permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      showAlert(
        'صلاحية مطلوبة',
        'عذراً، نحتاج إلى إذن للوصول إلى معرض الصور الخاص بك.',
      );
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Force square crop for avatars
      quality: 0.8, // Compress slightly for faster uploads
    });

    if (!result.canceled && result.assets[0]) {
      const selectedUri = result.assets[0].uri;

      // 1. Instantly update UI for optimistic UX
      setImageUri(selectedUri);

      // 2. Upload to backend
      await handleUpload(selectedUri);
    }
  };

  const handleUpload = async (uri: string) => {
    setIsUploading(true);

    try {
      // Prepare FormData for NestJS/S3 endpoint
      const formData = new FormData();

      // React Native requires this specific object structure for file uploads
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      const normalizedUri = uri;

      formData.append('file', {
        uri: normalizedUri,
        name: filename,
        type,
      } as unknown as Blob);

      const response = await apiClient.post<{ url: string }>(
        '/media/upload/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        },
      );

      if (onUploadSuccess && response.data.url) {
        onUploadSuccess(response.data.url);
      }

      console.log('Upload successful:', response.data.url);
    } catch (error) {
      console.error('Upload failed:', error);
      showAlert('خطأ', 'حدث خطأ أثناء رفع الصورة، يرجى المحاولة مرة أخرى.');
      // Revert to original image on failure
      setImageUri(currentAvatarUrl);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="mb-8 mt-8 items-center">
      <View className="relative">
        {/* Avatar Image Container */}
        <View className="h-24 w-24 overflow-hidden rounded-2xl border border-gray-200">
          <Avatar uri={imageUri} />

          {/* Uploading Overlay */}
          {isUploading && (
            <View className="absolute inset-0 items-center justify-center bg-black/40">
              <ActivityIndicator color="#FFFFFF" size="small" />
            </View>
          )}
        </View>

        {/* Camera Icon Badge (Disabled while uploading) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={pickImage}
          disabled={isUploading}
          className="absolute -bottom-2 -left-2 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#15304D]"
        >
          <Feather name="camera" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
