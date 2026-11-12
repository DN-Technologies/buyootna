// The (individual) tabs' screen options.
//
// «إضافة إعلان» is a hidden tab with its own stack (the form, then
// «معاينة الإعلان»). A tab keeps its stack when left, so after «حفظ كمسودة»
// (or publishing) took the user to نشاطي, the next «+» opened the form on
// top of the old preview and Back landed on that empty preview (QA). Leaving
// the tab now takes its stack back to the form.
const RESET_ON_LEAVE = new Set(['add-listing']);

export function individualTabOptions({ route }: { route: { name: string } }) {
  return {
    headerShown: false,
    popToTopOnBlur: RESET_ON_LEAVE.has(route.name),
  };
}
