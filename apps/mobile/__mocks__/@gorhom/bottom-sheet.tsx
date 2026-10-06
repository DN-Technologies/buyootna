import React, { forwardRef, useImperativeHandle } from 'react';
import { TextInput, View } from 'react-native';

export const present = jest.fn();
export const dismiss = jest.fn();
export const close = jest.fn();

export const BottomSheetModal = forwardRef<any, any>(({ children }, ref) => {
  useImperativeHandle(ref, () => ({
    present,
    dismiss,
    close,
    snapToIndex: jest.fn(),
    snapToPosition: jest.fn(),
    expand: jest.fn(),
    collapse: jest.fn(),
    forceClose: jest.fn(),
  }));

  return <View>{children}</View>;
});
BottomSheetModal.displayName = 'BottomSheetModal';

export const BottomSheetView = ({ children, ...props }: any) => (
  <View {...props}>{children}</View>
);

export const BottomSheetScrollView = ({ children, ...props }: any) => (
  <View {...props}>{children}</View>
);

export const BottomSheetFlatList = ({ data = [], renderItem, keyExtractor }: any) => (
  <View>
    {data.map((item: any, index: number) => (
      <React.Fragment key={keyExtractor ? keyExtractor(item, index) : index}>
        {renderItem({ item, index })}
      </React.Fragment>
    ))}
  </View>
);

export const BottomSheetFooter = ({ children }: any) => <View>{children}</View>;

export const BottomSheetTextInput = (props: any) => <TextInput {...props} />;

export const BottomSheetBackdrop = () => null;

export const BottomSheetModalProvider = ({ children }: any) => <>{children}</>;

export default {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetTextInput,
  BottomSheetBackdrop,
  BottomSheetModalProvider,
};
