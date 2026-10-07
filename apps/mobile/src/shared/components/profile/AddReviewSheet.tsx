import { Feather, FontAwesome } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';
import { useKeyboardHeight } from '@/shared/hooks/useKeyboardHeight';

interface AddReviewSheetProps {
  onSubmit: (comment: string, rating: number) => void;
  onClose?: () => void;
}

const AddReviewSheet = forwardRef<BottomSheetModal, AddReviewSheetProps>(
  ({ onSubmit, onClose }, ref) => {
    const [commentText, setCommentText] = useState('');
    const [rating, setRating] = useState(5);
    // 92% while typing: the sheet rises and its content makes room for the
    // keyboard (bottom padding = keyboard height), so the text box shrinks
    // instead of hiding under the keyboard (QA)
    const snapPoints = useMemo(() => ['62%', '92%'], []);
    const keyboardHeight = useKeyboardHeight();

    useEffect(() => {
      if (keyboardHeight > 0) {
        // @ts-ignore
        ref.current?.snapToIndex(1);
      }
    }, [keyboardHeight, ref]);

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

    // The stars are enough; the comment is optional
    const handlePublish = () => {
      if (rating < 1) return;
      onSubmit(commentText.trim(), rating);
      setCommentText('');
      setRating(5);
      handleDismiss();
    };

    const isSubmitActive = rating > 0;

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
        // "extend" never translates the sheet, so it can't double up with the
        // keyboard padding below; it only targets the tallest snap point
        keyboardBehavior="extend"
        // Only the two snap points above (index 1 = the typing height)
        enableDynamicSizing={false}
        keyboardBlurBehavior="restore"
        // No android_keyboardInputMode="adjustResize": with edge-to-edge the
        // window never resizes, and in that mode the sheet doesn't move either,
        // so the keyboard covered it. The default lets the sheet rise itself.
      >
        <SafeBottomSheetView
          className="flex-1 px-6 pb-8 pt-2"
          style={keyboardHeight > 0 ? { paddingBottom: keyboardHeight + 12 } : undefined}
        >
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
              placeholder="شاركونا رأيك (اختياري)..."
              placeholderTextColor="#A0AEC0"
              multiline
              textAlignVertical="top"
              style={{
                fontFamily: 'Cairo_400Regular',
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
        </SafeBottomSheetView>
      </BottomSheetModal>
    );
  },
);

AddReviewSheet.displayName = 'AddReviewSheet';

export default AddReviewSheet;
