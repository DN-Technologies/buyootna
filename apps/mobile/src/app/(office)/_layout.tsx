import ComingSoonGate from '@/shared/components/auth/ComingSoonGate';

// Office accounts are temporarily disabled — show the lock screen instead
// of the real tab navigator.
export default function OfficeLayout() {
  return <ComingSoonGate />;
}
