import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetFooter,
  type BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VerifiedBadgeIcon } from '@/assets/icons/activity';
import { reelsService } from '@/shared/api/reels.service';
import ReportReasonSheet from '@/shared/components/report/ReportReasonSheet';
import { useBlockFlow } from '@/shared/hooks/blocks/useBlocks';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';
import { formatTimeAgo } from '@/shared/utils/helpers/time';

import { useReelComments } from '../hooks/useReelComments';
import type { ReelComment, ViewerReel } from '../types';

const COMMENT_MAX = 500;

function CommentRow({
  comment,
  onOptions,
}: {
  comment: ReelComment;
  onOptions: (comment: ReelComment) => void;
}) {
  return (
    <Pressable
      testID={`reel-comment-${comment.id}`}
      onLongPress={() => onOptions(comment)}
      className="flex-row px-[16px] py-[10px]"
      style={{ gap: 10 }}
    >
      <View className="size-[36px] items-center justify-center overflow-hidden rounded-full bg-[#DEE3E8]">
        {comment.author.avatarUrl ? (
          <Image
            source={{ uri: comment.author.avatarUrl }}
            contentFit="cover"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <Text className="font-cairo-bold text-[14px] text-[#15304D]">
            {comment.author.name.trim().charAt(0)}
          </Text>
        )}
      </View>
      <View className="flex-1 items-start" style={{ gap: 2 }}>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <Text
            numberOfLines={1}
            className="shrink font-cairo-semibold text-[13px] leading-[20px] text-[#111111]"
          >
            {comment.author.name}
          </Text>
          {comment.author.isVerified && <VerifiedBadgeIcon size={12} />}
          <Text className="font-cairo text-[11px] leading-[18px] text-[#6B6A6A]">
            {formatTimeAgo(comment.createdAt)}
          </Text>
        </View>
        <Text
          className="font-cairo text-[14px] leading-[22px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {comment.body}
        </Text>
      </View>
      <TouchableOpacity
        testID={`reel-comment-options-${comment.id}`}
        onPress={() => onOptions(comment)}
        hitSlop={8}
        accessibilityLabel="خيارات التعليق"
      >
        <Feather name="more-vertical" size={16} color="#6B6A6A" />
      </TouchableOpacity>
    </Pressable>
  );
}

interface ReelCommentsSheetProps {
  reel: ViewerReel | null;
  // Runs it signed in; a guest gets the sign-in sheet
  guard: (action: () => void | Promise<void>) => Promise<void>;
  onCountChange: (reelId: string, by: 1 | -1) => void;
  onBlocked: (identityId: string) => void;
  onClose: () => void;
}

/**
 * A reel's comments, newest first, with the box to add one. A long press or ⋮
 * offers delete (your own, or any on your reel), and report and block
 * (Guideline 1.2).
 */
const ReelCommentsSheet = forwardRef<BottomSheetModal, ReelCommentsSheetProps>(
  ({ reel, guard, onCountChange, onBlocked, onClose }, ref) => {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['75%'], []);
    const data = useReelComments(reel?.id ?? null);
    const { askToBlock } = useBlockFlow();
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const reportSheet = useRef<BottomSheetModal>(null);
    const reporting = useRef<string | null>(null);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
      [],
    );

    const send = () =>
      guard(async () => {
        const body = text.trim();
        if (!reel || !body || sending) return;
        setSending(true);
        try {
          await data.add(body);
          setText('');
          onCountChange(reel.id, 1);
        } catch (error) {
          showAlert('تنبيه', getApiErrorMessage(error, 'تعذر إرسال التعليق'));
        } finally {
          setSending(false);
        }
      });

    const options = (comment: ReelComment) => {
      if (!reel) return;
      const removeOption = {
        text: 'حذف التعليق',
        style: 'destructive' as const,
        onPress: () => {
          data
            .remove(comment.id)
            .then(() => onCountChange(reel.id, -1))
            .catch((error: unknown) =>
              showAlert('خطأ', getApiErrorMessage(error, 'تعذر حذف التعليق')),
            );
        },
      };
      showAlert('خيارات', '', [
        ...(comment.canDelete ? [removeOption] : []),
        ...(comment.mine
          ? []
          : [
              {
                text: 'إبلاغ عن التعليق',
                onPress: () => {
                  void guard(() => {
                    reporting.current = comment.id;
                    reportSheet.current?.present();
                  });
                },
              },
              {
                text: 'حظر الحساب',
                style: 'destructive' as const,
                onPress: () => {
                  void guard(() => {
                    askToBlock(
                      { identityId: comment.author.identityId },
                      comment.author.name,
                      () => {
                        data.dropAuthor(comment.author.identityId);
                        onBlocked(comment.author.identityId);
                      },
                    );
                  });
                },
              },
            ]),
        { text: 'إلغاء', style: 'cancel' as const },
      ]);
    };

    const submitReport = async (reason: string, description?: string) => {
      const id = reporting.current;
      if (!id) return;
      try {
        await reelsService.reportComment(id, reason, description);
        showAlert(
          'تم الإرسال',
          'تم إرسال البلاغ بنجاح وسيقوم فريق الدعم بمراجعته.',
        );
      } catch (error) {
        showAlert('خطأ', getApiErrorMessage(error, 'تعذر إرسال البلاغ'));
      }
    };

    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) => (
        <BottomSheetFooter {...props} bottomInset={0}>
          <View
            className="flex-row items-end border-t border-[#ECECEC] bg-white px-[12px] pt-[8px]"
            style={{ gap: 8, paddingBottom: insets.bottom + 8 }}
          >
            <BottomSheetTextInput
              testID="reel-comment-input"
              value={text}
              onChangeText={setText}
              placeholder="اكتب تعليقاً..."
              placeholderTextColor="#6B6A6A"
              multiline
              maxLength={COMMENT_MAX}
              style={{
                flex: 1,
                maxHeight: 96,
                minHeight: 42,
                borderRadius: 21,
                paddingHorizontal: 14,
                paddingVertical: 10,
                backgroundColor: '#F1F5F9',
                fontFamily: 'Cairo_400Regular',
                fontSize: 14,
                textAlign: 'right',
                writingDirection: 'rtl',
                color: '#111111',
              }}
            />
            <TouchableOpacity
              testID="reel-comment-send"
              onPress={() => void send()}
              disabled={!text.trim() || sending}
              accessibilityLabel="إرسال التعليق"
              className="size-[42px] items-center justify-center rounded-full bg-[#15304D]"
              style={{ opacity: text.trim() ? 1 : 0.5 }}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather name="send" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </BottomSheetFooter>
      ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [insets.bottom, sending, text],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
        footerComponent={renderFooter}
        onDismiss={onClose}
      >
        <Text className="pb-[8px] text-center font-cairo-bold text-[15px] text-[#111111]">
          التعليقات
        </Text>
        <BottomSheetFlatList
          testID="reel-comments"
          data={data.comments}
          keyExtractor={(c: ReelComment) => c.id}
          renderItem={({ item }: { item: ReelComment }) => (
            <CommentRow comment={item} onOptions={options} />
          )}
          onEndReached={() => void data.loadMore()}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: 90 + insets.bottom }}
          ListEmptyComponent={
            <View className="items-center pt-[48px]" style={{ gap: 12 }}>
              {data.loading ? (
                <ActivityIndicator color="#15304D" />
              ) : data.failed ? (
                <>
                  <Text className="font-cairo text-[14px] text-[#6B6A6A]">
                    تعذر تحميل التعليقات
                  </Text>
                  <TouchableOpacity
                    testID="reel-comments-retry"
                    onPress={() => void data.retry()}
                  >
                    <Text className="font-cairo-semibold text-[14px] text-[#15304D]">
                      إعادة المحاولة
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text className="font-cairo text-[14px] text-[#6B6A6A]">
                  كن أول من يعلق
                </Text>
              )}
            </View>
          }
        />
        <ReportReasonSheet
          ref={reportSheet}
          onSubmit={(reason, description) =>
            void submitReport(reason, description)
          }
          onClose={() => {
            reporting.current = null;
          }}
        />
      </BottomSheetModal>
    );
  },
);

ReelCommentsSheet.displayName = 'ReelCommentsSheet';

export default ReelCommentsSheet;
