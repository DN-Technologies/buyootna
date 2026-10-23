import type { MyCompanyService } from '@/shared/api/company.service';

/** What a sub-service is called: its own title for "اخرى". */
export const serviceName = (service: MyCompanyService) =>
  service.title || service.type;

/** «3 خدمات نشطة 2 خدمات مخفية» under the collapsed list. */
export function servicesSummary(services: { isHidden?: boolean }[]): string {
  const hidden = services.filter((s) => s.isHidden).length;
  const active = services.length - hidden;
  return hidden
    ? `${active} خدمات نشطة ${hidden} خدمات مخفية`
    : `${active} خدمات نشطة`;
}
