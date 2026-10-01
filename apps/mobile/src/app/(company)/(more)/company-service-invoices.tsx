import { ServiceInvoicesScreen } from '@/features/service-invoices';

// فواتير الخدمات: the invoices this company issued
export default function CompanyServiceInvoicesRoute() {
  return <ServiceInvoicesScreen mode="company" />;
}
