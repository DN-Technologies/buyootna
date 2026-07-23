import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface AddReviewSheetProps {
  onSubmit: (comment: string) => void;
  onClose?: () => void;
}

const AddReviewSheet = forwardRef<BottomSheetModal, AddReviewSheetProps>(
  ({ onSubmit, onClose }, ref) => {
    const [commentText, setCommentText] = useState('');
    const snapPoints = useMemo(() => ['55%'], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    const handleDismiss = () => {
      // @ts-ignore
      ref.current?.dismiss();
      if (onClose) onClose();
    };

    const handlePublish = () => {
      if (!commentText.trim()) return;
      onSubmit(commentText.trim());
      setCommentText('');
      handleDismiss();
    };

    const isSubmitActive = commentText.trim().length > 0;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          backgroundColor: '#111111',
          width: 44,
          height: 4,
          borderRadius: 2,
        }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 28 }}
      >
        <BottomSheetView className="flex-1 px-6 pb-8 pt-2">
          {/* Header Row */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-cairo-bold text-lg text-[#111111]">
              شارك برأيك
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDismiss}
              className="p-1"
            >
              <Feather name="x" size={20} color="#111111" />
            </TouchableOpacity>
          </View>

          {/* Comment Input Box */}
          <View className="mt-2 min-h-[160px] flex-1 rounded-2xl border border-[#E2E8F0] bg-white p-4">
            <BottomSheetTextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="شاركونا رأيك..."
              placeholderTextColor="#A0AEC0"
              multiline
              textAlignVertical="top"
              style={{
                fontFamily: 'Cairo-Regular',
                fontSize: 14,
                color: '#111111',
                writingDirection: 'rtl',
                textAlign: 'right',
                minHeight: 120,
              }}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={isSubmitActive ? 0.8 : 1}
            disabled={!isSubmitActive}
            onPress={handlePublish}
            className={`mt-6 h-12 w-full items-center justify-center rounded-full ${
              isSubmitActive ? 'bg-[#15304D]' : 'bg-[#A0AEC0]'
            }`}
          >
            <Text className="font-cairo-bold text-base text-white">نشر</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

AddReviewSheet.displayName = 'AddReviewSheet';

export default AddReviewSheet;
