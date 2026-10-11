import { View } from 'react-native';

const Card = ({ children }: { children: React.ReactNode }) => (
  <View className="w-full gap-3 rounded-[6px] border border-[#ECECEC] bg-[#FEFEFE] p-[14px]">
    {children}
  </View>
);

const Divider = () => <View className="h-px w-full bg-[#ECECEC]" />;

// icon circle + label + value, like an info cell of the details card
const Cell = ({ valueWidth = 'w-24' }: { valueWidth?: string }) => (
  <View className="flex-row items-start gap-[6px]">
    <View className="h-6 w-6 rounded-full bg-slate-200" />
    <View className="gap-[6px]">
      <View className="h-3 w-16 rounded-md bg-slate-100" />
      <View className={`h-3.5 rounded-md bg-slate-200 ${valueWidth}`} />
    </View>
  </View>
);

/** Placeholder of the request details screen while the request loads. */
export default function RequestDetailsSkeleton() {
  return (
    <View testID="request-details-skeleton" className="gap-6 p-4">
      {/* Status row: last update (right), tag (left) */}
      <View className="h-[21px] flex-row items-center justify-between">
        <View className="h-3 w-32 rounded-md bg-slate-100" />
        <View className="h-5 w-20 rounded-lg bg-slate-100" />
      </View>

      <View className="gap-3">
        {/* Info card */}
        <View className="w-full gap-4 rounded-[6px] border border-[#ECECEC] bg-[#FEFEFE] p-[14px]">
          <View className="flex-row items-center justify-between gap-[27px]">
            <Cell />
            <Cell valueWidth="w-20" />
          </View>
          <Divider />
          <View className="flex-row items-center justify-between gap-[27px]">
            <Cell />
            <Cell valueWidth="w-28" />
          </View>
          <Divider />
          <Cell valueWidth="w-56" />
        </View>

        {/* Description card */}
        <Card>
          <View className="h-3.5 w-14 rounded-md bg-slate-100" />
          <Divider />
          <View className="h-3.5 w-full rounded-md bg-slate-200" />
          <View className="h-3.5 w-4/5 rounded-md bg-slate-200" />
          <View className="h-3.5 w-3/5 rounded-md bg-slate-100" />
        </Card>

        {/* Attachments card */}
        <Card>
          <View className="h-3.5 w-16 rounded-md bg-slate-100" />
          <Divider />
          <View className="flex-row gap-2">
            {[0, 1, 2].map((i) => (
              <View key={i} className="h-[52px] flex-1 rounded-[2px] bg-slate-200" />
            ))}
          </View>
        </Card>
      </View>
    </View>
  );
}
