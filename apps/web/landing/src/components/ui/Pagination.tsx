import Link from "next/link";

interface PaginationProps {
  current: number;
  totalPages: number;
  // Builds the URL of a page, keeping the current filters
  hrefFor: (page: number) => string;
}

/** Previous / next links with the position, for the listing pages. */
export default function Pagination({
  current,
  totalPages,
  hrefFor,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const linkClass =
    "flex h-10 items-center rounded-full border border-line px-5 text-sm font-bold text-ink transition hover:bg-tag";
  const disabledClass =
    "flex h-10 items-center rounded-full border border-line px-5 text-sm font-bold text-muted opacity-50";

  return (
    <nav
      aria-label="الصفحات"
      className="flex items-center justify-center gap-4 pt-4"
    >
      {current > 1 ? (
        <Link href={hrefFor(current - 1)} className={linkClass}>
          السابق
        </Link>
      ) : (
        <span className={disabledClass}>السابق</span>
      )}
      <span className="text-sm font-medium text-muted">
        صفحة {current} من {totalPages}
      </span>
      {current < totalPages ? (
        <Link href={hrefFor(current + 1)} className={linkClass}>
          التالي
        </Link>
      ) : (
        <span className={disabledClass}>التالي</span>
      )}
    </nav>
  );
}
