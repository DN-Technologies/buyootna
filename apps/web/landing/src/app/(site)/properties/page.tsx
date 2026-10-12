import type { Metadata } from "next";

import PropertyCard from "@/components/cards/PropertyCard";
import SearchFilter from "@/components/home/SearchFilter";
import ListingShell, { EmptyResults } from "@/components/layout/ListingShell";
import Pagination from "@/components/ui/Pagination";
import { LISTING_TYPES, PROPERTY_CATEGORIES } from "@/lib/categories";
import { getProperties } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { hrefWith, pageParam, param, type RawSearchParams } from "@/lib/searchParams";
import type { ListingType } from "@/lib/types";

export const metadata: Metadata = {
  title: "العقارات — بيوتنا",
  description: "تصفح العقارات المعروضة للبيع والإيجار والبدل في الكويت.",
};

const PAGE_SIZE = 12;

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;

  // Only values the search offers reach the API
  const type = LISTING_TYPES.find((t) => t.id === param(params, "type"))?.id as
    | ListingType
    | undefined;
  const category = PROPERTY_CATEGORIES.find(
    (c) => c.id === param(params, "category"),
  )?.id;
  const governorateId = param(params, "governorateId");
  const areaId = param(params, "areaId");
  const maxPriceText = param(params, "maxPrice");
  const maxPrice = maxPriceText ? Number(maxPriceText) : undefined;
  const page = pageParam(params);

  const filters = {
    type,
    category,
    governorateId,
    areaId,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
  };
  const { data, meta } = await getProperties({ ...filters, page, limit: PAGE_SIZE });

  return (
    <ListingShell
      title="العقارات"
      countLabel={meta.total ? `${formatNumber(meta.total)} إعلان` : undefined}
    >
      {/* Remounts with the URL so the fields always show the applied search */}
      <SearchFilter
        key={JSON.stringify(filters)}
        initial={{ type, category, governorateId, areaId, maxPrice: maxPriceText }}
      />

      {data.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <EmptyResults message="لا توجد عقارات مطابقة لبحثك. جرّب تغيير خيارات التصفية." />
      )}

      <Pagination
        current={meta.current || page}
        totalPages={meta.totalPages}
        hrefFor={(target) => hrefWith("/properties", { ...filters, page: target })}
      />
    </ListingShell>
  );
}
