import { Feather, FontAwesome } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface AddReviewSheetProps {
  onSubmit: (comment: string, rating: number) => void;
  onClose?: () => void;
}

const AddReviewSheet = forwardRef<BottomSheetModal, AddReviewSheetProps>(
  ({ onSubmit, onClose }, ref) => {
    const [commentText, setCommentText] = useState('');
    const [rating, setRating] = useState(5);
    const snapPoints = useMemo(() => ['62%'], []);

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
      onSubmit(commentText.trim(), rating);
      setCommentText('');
      setRating(5);
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
          <View className="mb-3 flex-row items-center justify-between">
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

          {/* Interactive Star Rating Bar */}
          <View className="mb-4 flex-row items-center justify-center gap-3 rounded-xl bg-[#F8FAFC] py-2.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                activeOpacity={0.7}
                onPress={() => setRating(star)}
                className="p-1"
              >
                <FontAwesome
                  name="star"
                  size={26}
                  color={star <= rating ? '#FFB400' : '#CBD5E1'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Comment Input Box */}
          <View className="mt-1 min-h-[140px] flex-1 rounded-2xl border border-[#E2E8F0] bg-white p-4">
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
                minHeight: 110,
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
