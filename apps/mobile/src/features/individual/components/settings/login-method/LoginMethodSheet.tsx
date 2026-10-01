import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import LoginMethodActions from './LoginMethodActions';
import LoginMethodHeader from './LoginMethodHeader';
import LoginMethodOptions from './LoginMethodOptions';
import LoginMethodToast from './LoginMethodToast';
import { useLoginMethod } from './useLoginMethod';

export { PHONE_NOT_VERIFIED_MESSAGE } from './constants';

interface LoginMethodSheetProps {
  // Called after a successful save, with the server's message
  onSaved: (message: string) => void;
}

/**
 * طريقة تسجيل الدخول: which identifier password login accepts -- email or
 * phone, or (the default) either. The phone can only be chosen once it is
 * SMS-verified (Edit Profile); tapping it before that explains why.
 */
const LoginMethodSheet = forwardRef<BottomSheetModal, LoginMethodSheetProps>(
  ({ onSaved }, ref) => {
    const dismiss = useCallback(() => {
      if (ref && 'current' in ref) ref.current?.dismiss();
    }, [ref]);

    const method = useLoginMethod({ dismiss, onSaved });

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        onChange={(index) => {
          if (index === 0) void method.load();
        }}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#111111', width: 40 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <BottomSheetView className="px-4 pb-8 pt-2">
          {method.warning && (
            <LoginMethodToast kind="warning" message={method.warning} inline />
          )}

          <LoginMethodHeader />

          {!method.data && !method.loadError && (
            <ActivityIndicator className="my-10" color="#15304D" />
          )}
          {method.loadError && (
            <Text className="my-8 text-center font-cairo-medium text-sm text-red-500">
              {method.loadError}
            </Text>
          )}
          {method.data && (
            <LoginMethodOptions
              data={method.data}
              selected={method.selected}
              onChoose={method.choose}
            />
          )}

          <LoginMethodActions
            canSave={!!method.data}
            isSaving={method.isSaving}
            onSave={method.save}
            onCancel={dismiss}
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

LoginMethodSheet.displayName = 'LoginMethodSheet';

export default LoginMethodSheet;
