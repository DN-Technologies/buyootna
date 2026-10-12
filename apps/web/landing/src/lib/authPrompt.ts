// Whether the "sign in to continue" dialog is showing. Kept outside React so
// any button, in a server-rendered card or a client menu, can open it without
// a provider around the page.
let open = false
const listeners = new Set<() => void>()

function set(next: boolean) {
  if (open === next) return
  open = next
  listeners.forEach((listener) => listener())
}

export const openAuthPrompt = () => set(true)
export const closeAuthPrompt = () => set(false)

export function subscribeAuthPrompt(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const isAuthPromptOpen = () => open
