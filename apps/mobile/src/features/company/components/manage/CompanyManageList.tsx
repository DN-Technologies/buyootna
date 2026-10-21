import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ConfirmActionSheet from '@/features/individual/components/activity/offers/ConfirmActionSheet';
import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';

import CompanyFormHeader from '../CompanyFormHeader';
import CompanySubmitButton from '../CompanySubmitButton';

export interface ManageListItem {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
}

interface CompanyManageListProps {
  title: string;
  // Shown above the rows (e.g. the company's specialty)
  intro?: string | null;
  items: ManageListItem[];
  isLoading: boolean;
  onRefresh: () => Promise<unknown>;
  emptyTitle: string;
  emptyDescription: string;
  addLabel: string;
  onAdd: () => void;
  onBack: () => void;
  deleteTitle: string;
  deleteDescription: string;
  onDelete: (id: string) => Promise<void>;
}

/**
 * A company's own services or projects (More › الخدمات / معرض الأعمال):
 * the rows, deleting one after a confirmation, and the add button that
 * opens the form.
 */
export default function CompanyManageList({
  title,
  intro,
  items,
  isLoading,
  onRefresh,
  emptyTitle,
  emptyDescription,
  addLabel,
  onAdd,
  onBack,
  deleteTitle,
  deleteDescription,
  onDelete,
}: CompanyManageListProps) {
  const confirmRef = useRef<BottomSheetModal>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const askToDelete = (id: string) => {
    setPendingId(id);
    confirmRef.current?.present();
  };

  const confirmDelete = async () => {
    // The sheet closes itself
    const id = pendingId;
    setPendingId(null);
    if (!id) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <CompanyFormHeader title={title} onBack={onBack} />

      {isLoading ? (
        <View className="px-4 pt-4">
          {[1, 2, 3].map((key) => (
            <ListRowSkeleton key={key} showIcon={false} />
          ))}
        </View>
      ) : items.length === 0 ? (
        <View
          testID="manage-list-empty"
          className="flex-1 items-center justify-center gap-2 px-6"
        >
          <Text
            className="text-center font-cairo-bold text-[16px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            {emptyTitle}
          </Text>
          <Text
            className="text-center font-cairo-semibold text-[14px] leading-[22px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {emptyDescription}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
          }
        >
          {!!intro && (
            <Text
              className="font-cairo-semibold text-[14px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              {intro}
            </Text>
          )}
          {items.map((item) => (
            <View
              key={item.id}
              testID={`manage-row-${item.id}`}
              className="flex-row items-center gap-3 rounded-[6px] bg-[#F9FAFE] p-3"
            >
              {!!item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  contentFit="cover"
                  style={{ width: 56, height: 56, borderRadius: 6 }}
                />
              )}
              <View className="flex-1 gap-1">
                <Text
                  className="font-cairo-semibold text-[14px] text-[#111111]"
                  style={{ writingDirection: 'rtl' }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {!!item.subtitle && (
                  <Text
                    className="font-cairo-medium text-[12px] text-[#6B6A6A]"
                    style={{ writingDirection: 'rtl' }}
                    numberOfLines={2}
                  >
                    {item.subtitle}
                  </Text>
                )}
              </View>
              {deletingId === item.id ? (
                <ActivityIndicator size="small" color="#9C1E28" />
              ) : (
                <TouchableOpacity
                  testID={`manage-delete-${item.id}`}
                  accessibilityLabel={`حذف ${item.title}`}
                  activeOpacity={0.7}
                  onPress={() => askToDelete(item.id)}
                  disabled={!!deletingId}
                  className="h-9 w-9 items-center justify-center rounded-full bg-white"
                >
                  <Feather name="trash-2" size={18} color="#9C1E28" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* --- Fixed bottom CTA --- */}
      <View className="px-4 pb-8 pt-3">
        <CompanySubmitButton label={addLabel} disabled={false} onPress={onAdd} />
      </View>

      <ConfirmActionSheet
        ref={confirmRef}
        variant="danger"
        title={deleteTitle}
        description={deleteDescription}
        confirmLabel="حذف"
        onConfirm={confirmDelete}
        onCancel={() => setPendingId(null)}
      />
    </SafeAreaView>
  );
}
