import { Feather } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Modal, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface VideoPlayerModalProps {
  // The video's (signed) link; null = closed
  url: string | null;
  onClose: () => void;
}

function Player({ url }: { url: string }) {
  const player = useVideoPlayer(url, (p) => {
    p.play();
  });
  return (
    <VideoView
      testID="video-player"
      player={player}
      style={{ flex: 1 }}
      contentFit="contain"
      nativeControls
    />
  );
}

/** Full-screen player for a chat video. */
export default function VideoPlayerModal({ url, onClose }: VideoPlayerModalProps) {
  const insets = useSafeAreaInsets();
  if (!url) return null;
  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <Player url={url} />
        <TouchableOpacity
          testID="video-player-close"
          accessibilityLabel="إغلاق"
          onPress={onClose}
          className="absolute left-4 h-10 w-10 items-center justify-center rounded-full bg-black/50"
          style={{ top: insets.top + 8 }}
        >
          <Feather name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
