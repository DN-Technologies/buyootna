import { View } from 'react-native';

// width of each placeholder bubble and whether it is mine, oldest first
const BUBBLES: { width: string; mine: boolean; lines: number }[] = [
  { width: 'w-3/5', mine: false, lines: 2 },
  { width: 'w-2/5', mine: true, lines: 1 },
  { width: 'w-1/2', mine: false, lines: 1 },
  { width: 'w-3/5', mine: true, lines: 2 },
  { width: 'w-2/5', mine: false, lines: 1 },
  { width: 'w-1/2', mine: true, lines: 1 },
];

/** Placeholder of the message list while a conversation loads. */
export default function ChatMessagesSkeleton() {
  return (
    <View className="flex-1 justify-end gap-3 px-4 pb-4">
      {BUBBLES.map((bubble, index) => (
        <View
          key={index}
          className={bubble.mine ? 'items-start' : 'items-end'}
        >
          <View
            className={`gap-2 rounded-2xl px-4 py-3 ${bubble.width} ${
              bubble.mine ? 'bg-slate-200' : 'bg-slate-100'
            }`}
          >
            {Array.from({ length: bubble.lines }).map((_, line) => (
              <View
                key={line}
                className={`h-3 rounded-md bg-white/70 ${
                  line === bubble.lines - 1 && bubble.lines > 1
                    ? 'w-2/3'
                    : 'w-full'
                }`}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
