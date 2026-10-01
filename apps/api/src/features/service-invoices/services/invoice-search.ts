import type { Prisma } from '@prisma/client';
import type { InvoiceSort } from '../dto/list-service-invoices.dto';

/** Search (invoice no., service, company / client name) and date order. */
export function invoiceListQuery(
  search: string | undefined,
  sort: InvoiceSort | undefined,
  nameField: 'company' | 'client',
) {
  const q = search?.trim();
  const where: Prisma.CompanyInvoiceWhereInput = q
    ? {
        OR: [
          { invoiceNo: { contains: q, mode: 'insensitive' } },
          { title: { contains: q, mode: 'insensitive' } },
          nameField === 'company'
            ? {
                identity: {
                  companyData: { name: { contains: q, mode: 'insensitive' } },
                },
              }
            : { clientName: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {};
  const orderBy: Prisma.CompanyInvoiceOrderByWithRelationInput[] = [
    { issueDate: sort === 'oldest' ? 'asc' : 'desc' },
    { createdAt: sort === 'oldest' ? 'asc' : 'desc' },
  ];
  return { where, orderBy };
}
