import { Feather } from '@expo/vector-icons';
import { AudioPlayer, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import MessageTicks from '@/shared/components/chat/MessageTicks';
import { formatDuration } from '@/shared/utils/chatAttachments';
import { cachedVoiceFile, keepVoiceFile } from '@/shared/utils/chatMediaCache';
import { MessageStatus } from '@/shared/utils/chatReceipts';

interface VoiceMessageBubbleProps {
  // The note's link (signed), or the local file while it's being sent
  uri: string;
  durationMs?: number | null;
  isMine: boolean;
  timestamp: string;
  quote?: ReactNode;
  sending?: boolean;
  failed?: boolean;
  onRetry?: () => void;
  // A fresh link: the signed one expires after 15 minutes
  refreshUri?: () => Promise<string>;
  // My message: sending / sent / delivered / read ticks
  tickStatus?: MessageStatus | null;
}

// Links older than this are renewed before playing
const LINK_FRESH_MS = 10 * 60 * 1000;

// One voice note plays at a time: starting one pauses the other
let playing: AudioPlayer | null = null;

/** 🎤 A voice note: play / pause, progress and length. */
export default function VoiceMessageBubble({
  uri,
  durationMs,
  isMine,
  timestamp,
  quote,
  sending = false,
  failed = false,
  onRetry,
  refreshUri,
  tickStatus,
}: VoiceMessageBubbleProps) {
  // The link the bubble opened with. The server re-signs links on every
  // load of the messages, and following each new one rebuilt the player --
  // and fetched the note again -- every time the chat was reopened (QA)
  const [source] = useState(uri);
  const player = useAudioPlayer(source);
  const linkedAt = useRef(Date.now());
  const status = useAudioPlayerStatus(player);

  // Played before: use the copy kept on the phone, with no network at all
  const local = useRef(false);
  useEffect(() => {
    let cancelled = false;
    void cachedVoiceFile(source).then((file) => {
      if (cancelled || !file) return;
      try {
        player.replace(file);
        local.current = true;
      } catch {
        // Released meanwhile: the link still plays
      }
    });
    return () => {
      cancelled = true;
    };
  }, [player, source]);

  // Back to the start once it finishes
  useEffect(() => {
    if (status.didJustFinish) {
      player.pause();
      void player.seekTo(0);
    }
  }, [status.didJustFinish, player]);
  useEffect(
    () => () => {
      if (playing === player) playing = null;
    },
    [player],
  );

  const toggle = async () => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (
      !local.current &&
      refreshUri &&
      Date.now() - linkedAt.current > LINK_FRESH_MS
    ) {
      try {
        player.replace(await refreshUri());
        linkedAt.current = Date.now();
      } catch {
        // Try with the link we have
      }
    }
    // Kept on the phone for the next time this chat is opened (the newest
    // link: the one the bubble opened with may have expired)
    if (!local.current && !sending) void keepVoiceFile(uri);
    if (playing && playing !== player) {
      try {
        playing.pause();
      } catch {
        // That bubble is gone
      }
    }
    playing = player;
    player.play();
  };

  const totalMs = durationMs || (status.duration ?? 0) * 1000;
  const currentMs = (status.currentTime ?? 0) * 1000;
  const progress = totalMs > 0 ? Math.min(1, currentMs / totalMs) : 0;
  // My bubbles are navy, theirs light: colours follow the background
  const onLight = !isMine;
  const fg = onLight ? '#15304D' : '#FFFFFF';

  return (
    <View className={`mb-4 w-full flex-row ${isMine ? 'justify-start' : 'justify-end'}`}>
      <View className={`max-w-[80%] ${isMine ? 'items-start' : 'items-end'}`}>
        <View
          testID="voice-bubble"
          className={`w-60 rounded-md px-3 py-2.5 ${
            isMine ? 'rounded-br-none bg-[#15304D]' : 'rounded-bl-none bg-[#F9FAFE]'
          }`}
        >
          {quote}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              testID="voice-play"
              accessibilityLabel={status.playing ? 'إيقاف مؤقت' : 'تشغيل'}
              disabled={sending}
              onPress={toggle}
              className={`h-10 w-10 items-center justify-center rounded-full ${
                onLight ? 'bg-[#15304D]' : 'bg-white'
              }`}
            >
              {sending ? (
                <ActivityIndicator size="small" color={onLight ? '#FFFFFF' : '#15304D'} />
              ) : (
                <Feather
                  name={status.playing ? 'pause' : 'play'}
                  size={18}
                  color={onLight ? '#FFFFFF' : '#15304D'}
                />
              )}
            </TouchableOpacity>
            <View className="flex-1">
              <View
                className={`h-1 overflow-hidden rounded-full ${onLight ? 'bg-[#CBD5E1]' : 'bg-white/30'}`}
              >
                <View
                  testID="voice-progress"
                  className="h-1 rounded-full"
                  style={{ width: `${progress * 100}%`, backgroundColor: fg }}
                />
              </View>
              <Text
                testID="voice-duration"
                className="mt-1.5 font-cairo text-[12px]"
                style={{ color: fg, opacity: 0.8 }}
              >
                {formatDuration(status.playing || currentMs > 0 ? currentMs : totalMs)}
              </Text>
            </View>
            <Feather name="mic" size={16} color={fg} />
          </View>
          {failed && (
            <TouchableOpacity
              testID="voice-retry"
              onPress={onRetry}
              className="mt-2 flex-row items-center gap-1.5"
            >
              <Feather name="rotate-cw" size={14} color="#DC2626" />
              <Text className="font-cairo-semibold text-[12px] text-[#DC2626]">
                تعذر الإرسال · إعادة المحاولة
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="mt-1 flex-row items-center gap-1 px-1">
          <MessageTicks status={tickStatus} />
          <Text className="font-cairo text-[13px] text-[#6B6A6A]">{timestamp}</Text>
        </View>
      </View>
    </View>
  );
}
