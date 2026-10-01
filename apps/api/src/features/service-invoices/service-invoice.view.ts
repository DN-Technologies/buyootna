import type { Prisma } from '@prisma/client';

// What every invoice view needs: the invoice plus the issuing company's
// header (name, logo, specialty) and the client persona's name
export const INVOICE_INCLUDE = {
  identity: {
    select: {
      companyData: { select: { name: true, logoUrl: true, specialty: true } },
    },
  },
} satisfies Prisma.CompanyInvoiceInclude;

export type InvoiceWithCompany = Prisma.CompanyInvoiceGetPayload<{
  include: typeof INVOICE_INCLUDE;
}>;

export interface InvoiceItemView {
  name: string;
  price: number;
  qty: number;
}

/** The shape the app reads, for the client and the company alike. */
export function toInvoiceView(invoice: InvoiceWithCompany) {
  const company = invoice.identity.companyData;
  return {
    id: invoice.id,
    invoiceNo: invoice.invoiceNo,
    title: invoice.title,
    clientName: invoice.clientName,
    // Whether the invoice reaches a client's account in the app
    linkedToClient: !!invoice.clientIdentityId,
    warrantyMonths: invoice.warrantyMonths,
    issueDate: invoice.issueDate,
    items: (invoice.items ?? []) as unknown as InvoiceItemView[],
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    total: invoice.total,
    paidAt: invoice.paidAt,
    createdAt: invoice.createdAt,
    company: {
      name: company?.name ?? '',
      logoUrl: company?.logoUrl ?? null,
      specialty: company?.specialty ?? null,
    },
  };
}

export type InvoiceView = ReturnType<typeof toInvoiceView>;
