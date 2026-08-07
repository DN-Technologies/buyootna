import ComingSoonGate from '@/shared/components/ComingSoonGate';

// Company accounts are temporarily disabled — show the lock screen instead
// of the real tab navigator.
export default function CompanyLayout() {
  return <ComingSoonGate />;
}
