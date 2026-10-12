import type { Metadata } from "next";

import OfficeCard from "@/components/cards/OfficeCard";
import ListingShell, { EmptyResults } from "@/components/layout/ListingShell";
import ListSearchBar from "@/components/ui/ListSearchBar";
import Pagination from "@/components/ui/Pagination";
import { getOffices } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { hrefWith, pageParam, param, type RawSearchParams } from "@/lib/searchParams";

export const metadata: Metadata = {
  title: "المكاتب العقارية — بيوتنا",
  description: "تصفح المكاتب العقارية المعتمدة في الكويت وتواصل معها.",
};

const PAGE_SIZE = 16;

export default async function OfficesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const search = param(params, "search");
  const page = pageParam(params);

  const { data, meta } = await getOffices({ search, page, limit: PAGE_SIZE });

  return (
    <ListingShell
      title="المكاتب العقارية"
      countLabel={meta.total ? `${formatNumber(meta.total)} مكتب` : undefined}
    >
      <ListSearchBar
        action="/offices"
        placeholder="ابحث باسم المكتب"
        defaultValue={search}
      />

      {data.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((office) => (
            <OfficeCard key={office.id} office={office} />
          ))}
        </div>
      ) : (
        <EmptyResults message="لا توجد مكاتب مطابقة لبحثك." />
      )}

      <Pagination
        current={meta.current || page}
        totalPages={meta.totalPages}
        hrefFor={(target) => hrefWith("/offices", { search, page: target })}
      />
    </ListingShell>
  );
}
