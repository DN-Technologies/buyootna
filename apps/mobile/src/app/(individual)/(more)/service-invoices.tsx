import { ServiceInvoicesScreen } from '@/features/service-invoices';

// فواتير الخدمات: invoices companies addressed to this account
export default function ServiceInvoicesRoute() {
  return <ServiceInvoicesScreen mode="client" />;
}
