import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Share } from 'react-native';

import { chatService } from '@/shared/api/chat.service';
import { favoritesService } from '@/shared/api/favorites.service';
import { reelsService } from '@/shared/api/reels.service';
import { useAuthGuard } from '@/shared/hooks/auth/useAuthGuard';
import { useBlockFlow } from '@/shared/hooks/blocks/useBlocks';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

import type { ViewerReel } from '../types';

// The website has no page per reel yet: the site itself, where the app can be
// downloaded (as when sharing a profile)
const SITE_URL = 'https://buyootna.cloud';

const serverMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  return typeof message === 'string' ? message : null;
};

/**
 * What can be done with a reel: like, open its listing or profile, message
 * its author, share, report or block (someone else's), delete (your own).
 * Everything that needs an account asks a guest to sign in first.
 */
export function useReelActions({
  update,
  updateAuthor,
  removeWhere,
  setSheetOpen,
}: {
  update: (id: string, patch: Partial<ViewerReel>) => void;
  updateAuthor: (authorId: string, patch: Partial<ViewerReel>) => void;
  removeWhere: (shouldRemove: (reel: ViewerReel) => boolean) => void;
  // Pauses the video while a sheet or question is up
  setSheetOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const { guardAction, authSheetRef } = useAuthGuard();
  const { askToBlock } = useBlockFlow();
  const activeIdentityId = useAuthStore((s) => s.activeIdentity?.id ?? null);
  const reportSheet = useRef<BottomSheetModal>(null);
  const reporting = useRef<string | null>(null);

  const isMine = (reel: ViewerReel) =>
    reel.author.identityId === activeIdentityId;

  /** Shows at once; the server's answer settles the count. */
  const toggleLike = (reel: ViewerReel) =>
    guardAction(async () => {
      const liked = !reel.liked;
      update(reel.id, {
        liked,
        likeCount: Math.max(0, reel.likeCount + (liked ? 1 : -1)),
      });
      try {
        const state = liked
          ? await reelsService.like(reel.id)
          : await reelsService.unlike(reel.id);
        update(reel.id, state);
      } catch {
        update(reel.id, { liked: reel.liked, likeCount: reel.likeCount });
      }
    });

  /** Follows or unfollows the author, across all of its reels here. */
  const toggleFollow = (reel: ViewerReel) =>
    guardAction(async () => {
      const followed = !reel.followed;
      const authorId = reel.author.identityId;
      updateAuthor(authorId, { followed });
      try {
        // It toggles on the server: its answer settles any disagreement
        const { favorited } = await favoritesService.toggleProvider(authorId);
        updateAuthor(authorId, { followed: favorited });
      } catch {
        updateAuthor(authorId, { followed: reel.followed });
      }
    });

  /** A double tap only ever likes. */
  const like = (reel: ViewerReel) => {
    if (!reel.liked) void toggleLike(reel);
  };

  const openProfile = (reel: ViewerReel) => {
    const base = reel.author.type === 'COMPANY' ? '/company' : '/office';
    router.push(`${base}/${reel.author.identityId}` as never);
  };

  const openListing = (propertyId: string) =>
    router.push(`/property/${propertyId}` as never);

  const message = (reel: ViewerReel) =>
    guardAction(async () => {
      try {
        const conversation = await chatService.createConversation(
          reel.author.identityId,
          reel.property?.id,
        );
        router.push(`/chat/${conversation.id}` as never);
      } catch (error) {
        showAlert('تنبيه', serverMessage(error) ?? 'تعذر بدء المحادثة');
      }
    });

  const share = async (reel: ViewerReel) => {
    try {
      await Share.share({
        title: reel.author.name,
        message: `شاهد هذا الفيديو من ${reel.author.name} على بيوتنا\n${SITE_URL}`,
      });
    } catch (error) {
      console.warn('Sharing the reel failed:', error);
    }
  };

  const submitReport = async (reason: string, description?: string) => {
    const id = reporting.current;
    if (!id) return;
    try {
      await reelsService.report(id, reason, description);
      showAlert('تم الإرسال', 'تم إرسال البلاغ بنجاح وسيقوم فريق الدعم بمراجعته.');
    } catch (error) {
      showAlert('خطأ', serverMessage(error) ?? 'تعذر إرسال البلاغ');
    }
  };

  const remove = async (reel: ViewerReel) => {
    try {
      await reelsService.remove(reel.id);
      removeWhere((r) => r.id === reel.id);
    } catch (error) {
      showAlert('خطأ', serverMessage(error) ?? 'تعذر حذف الفيديو');
    }
  };

  const closeSheet = () => setSheetOpen(false);

  const options = (reel: ViewerReel) => {
    setSheetOpen(true);
    if (isMine(reel)) {
      showAlert('خيارات', '', [
        {
          text: 'حذف الفيديو',
          style: 'destructive',
          onPress: () => void remove(reel).finally(closeSheet),
        },
        { text: 'إلغاء', style: 'cancel', onPress: closeSheet },
      ]);
      return;
    }
    showAlert('خيارات', '', [
      {
        text: 'إبلاغ عن الفيديو',
        onPress: () => {
          void guardAction(() => {
            reporting.current = reel.id;
            reportSheet.current?.present();
          }).finally(() => {
            // A guest got the sign-in sheet instead
            if (!reporting.current) closeSheet();
          });
        },
      },
      {
        text: 'حظر الحساب',
        style: 'destructive',
        onPress: () => {
          void guardAction(() => {
            askToBlock(
              { identityId: reel.author.identityId },
              reel.author.name,
              () => {
                removeWhere(
                  (r) => r.author.identityId === reel.author.identityId,
                );
                closeSheet();
              },
              closeSheet,
            );
          });
        },
      },
      { text: 'إلغاء', style: 'cancel', onPress: closeSheet },
    ]);
  };

  return {
    isMine,
    like,
    toggleLike,
    toggleFollow,
    openProfile,
    openListing,
    message,
    share,
    options,
    submitReport,
    reportSheet,
    authSheetRef,
    onReportClosed: () => {
      reporting.current = null;
      closeSheet();
    },
  };
}
