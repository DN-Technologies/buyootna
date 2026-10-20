import { useRouter } from 'expo-router';

import { chatService } from '@/shared/api/chat.service';
import { storiesService } from '@/shared/api/stories.service';
import { showAlert } from '@/shared/utils/alert';

import type { StoryAuthorStories, ViewerStory } from '../types';

const serverMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  return typeof message === 'string' ? message : null;
};

/**
 * What can be done with the story on screen: reply to its author in chat
 * (about the linked listing, if any), report it, or delete it (the author's
 * own).
 */
export function useStoryActions({
  author,
  current,
  afterDelete,
  setReplying,
}: {
  author: StoryAuthorStories | undefined;
  current: ViewerStory | undefined;
  afterDelete: () => Promise<unknown>;
  // The viewer pauses the story while a reply opens the chat
  setReplying: (replying: boolean) => void;
}) {
  const router = useRouter();

  const reply = async () => {
    if (!author || !current) return;
    setReplying(true);
    try {
      const conversation = await chatService.createConversation(
        author.author.identityId,
        current.property?.id,
      );
      router.push(`/chat/${conversation.id}` as never);
    } catch (error) {
      showAlert('تنبيه', serverMessage(error) ?? 'تعذر بدء المحادثة');
    } finally {
      setReplying(false);
    }
  };

  const report = async (reason: string, description?: string) => {
    if (!current) return;
    try {
      await storiesService.report(current.id, reason, description);
      showAlert('تم الإرسال', 'تم إرسال البلاغ بنجاح وسيقوم فريق الدعم بمراجعته.');
    } catch (error) {
      showAlert('خطأ', serverMessage(error) ?? 'تعذر إرسال البلاغ');
    }
  };

  const remove = async () => {
    if (!current) return;
    try {
      await storiesService.remove(current.id);
      await afterDelete();
    } catch (error) {
      showAlert('خطأ', serverMessage(error) ?? 'تعذر حذف القصة');
    }
  };

  return { reply, report, remove };
}
