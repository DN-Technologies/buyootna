import React from 'react';
import { View } from 'react-native';

// FlashList relies on native layout measurement to decide what to render,
// which the RN test renderer never performs — under jest it renders empty
// placeholder views instead of actual item content. Tests that need to
// assert on rendered list items (e.g. chat messages) need real content in
// the tree, so this mock renders `data` directly via `renderItem`/
// `keyExtractor`, skipping virtualization entirely. Good enough for
// assertions on presence/order of content; not a virtualization/perf test.
export function FlashList<T>({
  data,
  renderItem,
  keyExtractor,
  ListEmptyComponent,
  ListHeaderComponent,
}: {
  data: readonly T[] | null | undefined;
  renderItem: (info: { item: T; index: number }) => React.ReactElement | null;
  keyExtractor?: (item: T, index: number) => string;
  ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
  ListHeaderComponent?: React.ComponentType | React.ReactElement | null;
  [key: string]: unknown;
}) {
  // Rendered like the real list: an element as-is, a component via
  // createElement -- so a component recreated every render remounts here too
  const renderSlot = (
    slot: React.ComponentType | React.ReactElement | null | undefined,
  ) =>
    !slot
      ? null
      : React.isValidElement(slot)
        ? slot
        : React.createElement(slot as React.ComponentType);

  const header = renderSlot(ListHeaderComponent);

  if (!data || data.length === 0) {
    if (!header && !ListEmptyComponent) return null;
    return (
      <View>
        {header}
        {renderSlot(ListEmptyComponent)}
      </View>
    );
  }

  return (
    <View>
      {header}
      {data.map((item, index) => (
        <React.Fragment key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem({ item, index })}
        </React.Fragment>
      ))}
    </View>
  );
}

export default FlashList;
