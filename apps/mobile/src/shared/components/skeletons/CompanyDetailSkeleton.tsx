import { ScrollView, View } from 'react-native';

export default function CompanyDetailSkeleton() {
  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 110 }}
    >
      <View className="px-5 pt-4">
        {/* --- Header Card --- */}
        <View className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Cover Banner + Overlapping Logo */}
          <View className="relative h-20 bg-slate-200">
            <View className="absolute -bottom-8 left-5 h-16 w-16 rounded-2xl border-2 border-white bg-slate-300" />
          </View>

          <View className="px-5 pb-4 pt-10">
            {/* Name Row */}
            <View className="mb-2 h-5 w-40 rounded-md bg-slate-200" />

            {/* Rating Row */}
            <View className="mb-3 h-4 w-24 rounded-md bg-slate-100" />

            {/* Bio Lines */}
            <View className="mb-3 gap-2">
              <View className="h-3.5 w-full rounded bg-slate-100" />
              <View className="h-3.5 w-2/3 rounded bg-slate-100" />
            </View>

            {/* Location Row */}
            <View className="mb-4 h-4 w-32 rounded-md bg-slate-100" />

            {/* Three-Column Metrics Bar */}
            <View className="mb-4 flex-row items-center rounded-2xl bg-[#F8FAFC] px-2 py-3">
              <View className="flex-1 items-center gap-1.5">
                <View className="h-4 w-6 rounded bg-slate-200" />
                <View className="h-3 w-12 rounded bg-slate-100" />
              </View>
              <View className="h-8 w-[1px] bg-gray-200" />
              <View className="flex-1 items-center gap-1.5">
                <View className="h-4 w-6 rounded bg-slate-200" />
                <View className="h-3 w-12 rounded bg-slate-100" />
              </View>
              <View className="h-8 w-[1px] bg-gray-200" />
              <View className="flex-1 items-center gap-1.5">
                <View className="h-4 w-10 rounded bg-slate-200" />
                <View className="h-3 w-14 rounded bg-slate-100" />
              </View>
            </View>
          </View>
        </View>

        {/* --- Tab Row --- */}
        <View className="mb-6 flex-row items-center gap-6 border-b border-gray-200 pb-3">
          <View className="h-4 w-16 rounded bg-slate-200" />
          <View className="h-4 w-16 rounded bg-slate-100" />
          <View className="h-4 w-16 rounded bg-slate-100" />
        </View>

        {/* --- Working Hours Block --- */}
        <View className="mb-6 rounded-xl bg-[#F9FAFE] p-4">
          <View className="mb-3 h-4 w-24 rounded bg-slate-200" />
          <View className="h-3.5 w-full rounded bg-slate-100" />
        </View>

        {/* --- Reviews Toolbar --- */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="h-3.5 w-16 rounded bg-slate-200" />
          <View className="h-3.5 w-20 rounded bg-slate-100" />
        </View>

        {/* --- Reviews Summary Block --- */}
        <View className="mb-4 h-24 w-full rounded-xl bg-slate-100" />

        {/* --- Review Rows --- */}
        {[1, 2].map((key) => (
          <View
            key={key}
            className="mb-4 flex-row items-start gap-3 border-b border-gray-100 pb-4"
          >
            <View className="h-10 w-10 rounded-full bg-slate-200" />
            <View className="flex-1 gap-2">
              <View className="h-3.5 w-24 rounded bg-slate-200" />
              <View className="h-3.5 w-full rounded bg-slate-100" />
              <View className="h-3.5 w-2/3 rounded bg-slate-100" />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
