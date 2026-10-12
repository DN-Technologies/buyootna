import type { Metadata } from "next";
import Link from "next/link";

import CompanyCard from "@/components/cards/CompanyCard";
import ListingShell, { EmptyResults } from "@/components/layout/ListingShell";
import ListSearchBar from "@/components/ui/ListSearchBar";
import Pagination from "@/components/ui/Pagination";
import { COMPANY_CATEGORIES } from "@/lib/categories";
import { getCompanies } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { hrefWith, pageParam, param, type RawSearchParams } from "@/lib/searchParams";

export const metadata: Metadata = {
  title: "شركات الخدمات — بيوتنا",
  description: "اكتشف شركات المقاولات والتشطيب والصيانة والخدمات العقارية في الكويت.",
};

const PAGE_SIZE = 12;

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const category = COMPANY_CATEGORIES.find((c) => c === param(params, "category"));
  const search = param(params, "search");
  const page = pageParam(params);

  const { data, meta } = await getCompanies({ category, search, page, limit: PAGE_SIZE });

  return (
    <ListingShell
      title="شركات الخدمات"
      countLabel={meta.total ? `${formatNumber(meta.total)} شركة` : undefined}
    >
      <ListSearchBar
        action="/companies"
        placeholder="ابحث باسم الشركة"
        defaultValue={search}
        hidden={{ category }}
      />

      <nav
        aria-label="نوع الخدمة"
        className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5"
      >
        {["", ...COMPANY_CATEGORIES].map((name) => {
          const active = (category ?? "") === name;
          return (
            <Link
              key={name || "all"}
              href={hrefWith("/companies", { category: name || undefined, search })}
              aria-current={active ? "page" : undefined}
              className={`flex h-10 shrink-0 items-center rounded-full border px-4 text-sm whitespace-nowrap transition ${
                active
                  ? "border-brand bg-brand font-bold text-white"
                  : "border-line bg-white font-medium text-ink hover:bg-tag"
              }`}
            >
              {name || "الكل"}
            </Link>
          );
        })}
      </nav>

      {data.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      ) : (
        <EmptyResults message="لا توجد شركات مطابقة لبحثك." />
      )}

      <Pagination
        current={meta.current || page}
        totalPages={meta.totalPages}
        hrefFor={(target) => hrefWith("/companies", { category, search, page: target })}
      />
    </ListingShell>
  );
}
