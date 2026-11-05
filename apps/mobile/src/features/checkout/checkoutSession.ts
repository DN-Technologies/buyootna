/**
 * Whether the «الدفع» screen is waiting on Tap. Tap's checkout returns
 * through the payment-callback deep link; while this screen is open it
 * reads the outcome itself, so app/payment-callback.tsx only steps back
 * instead of showing a second message.
 */
let open = false;

export const checkoutSession = {
  begin: () => {
    open = true;
  },
  end: () => {
    open = false;
  },
  isOpen: () => open,
};
