import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

// The dimmed backdrop every sheet here uses; tapping it closes the sheet
export default function SheetBackdrop(props: any) {
  return (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
    />
  );
}
