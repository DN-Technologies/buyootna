import { Search } from "lucide-react";

interface ListSearchBarProps {
  // Where the form submits (the listing page itself)
  action: string;
  placeholder: string;
  defaultValue?: string;
  // Filters to keep when searching, e.g. the selected category
  hidden?: Record<string, string | undefined>;
}

/** A plain search box that submits as a GET, so it works without JavaScript. */
export default function ListSearchBar({
  action,
  placeholder,
  defaultValue,
  hidden = {},
}: ListSearchBarProps) {
  return (
    <form action={action} method="get" role="search" className="flex w-full gap-3">
      {Object.entries(hidden).map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null,
      )}
      <label className="flex h-12 flex-1 items-center gap-2 rounded-full border border-line bg-white px-5">
        <Search className="h-4 w-4 shrink-0 text-muted" />
        <span className="sr-only">{placeholder}</span>
        <input
          type="search"
          name="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-base font-medium text-ink outline-none placeholder:text-muted"
        />
      </label>
      <button
        type="submit"
        className="flex h-12 shrink-0 items-center rounded-full bg-brand px-6 text-sm font-bold text-white transition hover:bg-brand-dark"
      >
        بحث
      </button>
    </form>
  );
}
