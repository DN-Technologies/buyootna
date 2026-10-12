// Whether the "اختر نوع حسابك للبدء" dialog is showing. Kept outside React,
// like the sign-in prompt, so any "create account" button can open it.
let open = false
const listeners = new Set<() => void>()

function set(next: boolean) {
  if (open === next) return
  open = next
  listeners.forEach((listener) => listener())
}

export const openAccountTypePicker = () => set(true)
export const closeAccountTypePicker = () => set(false)

export function subscribeAccountTypePicker(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const isAccountTypePickerOpen = () => open
