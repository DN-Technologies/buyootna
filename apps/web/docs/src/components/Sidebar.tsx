"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  Building2,
  LayoutDashboard,
  Lock,
  Send,
  Server,
  Smartphone,
  Store,
  Tag,
  User,
  Warehouse,
  Wrench,
} from "lucide-react";
import { sections } from "@/data/sections";
import { DocSection } from "@/data/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "mobile-shared": Smartphone,
  "mobile-individual": User,
  "mobile-company": Building2,
  "mobile-office": Lock,
  "web-admin": LayoutDashboard,
  "web-companies": Building2,
  "web-offices": Store,
  "web-management": Warehouse,
  "web-landing": Wrench,
  api: Server,
};

const MOBILE_SLUGS = new Set([
  "mobile-shared",
  "mobile-individual",
  "mobile-company",
  "mobile-office",
]);

const RESOURCES = [
  { href: "/postman", label: "Postman Collection", icon: Send },
  { href: "/versions", label: "App Versions", icon: Tag },
];

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: DocSection[];
  pathname: string;
}) {
  return (
    <div className="mt-6 first:mt-0">
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[#7C8894]">
        {label}
      </p>
      <nav className="mt-1 flex flex-col gap-1">
        {items.map((section) => {
          const href = `/${section.slug}`;
          const isActive = pathname === href;
          const Icon = ICONS[section.slug] ?? Server;
          return (
            <Link
              key={section.slug}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-[#B9C3CC] hover:bg-[#0F1E2E] hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {section.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const mobileSections = sections.filter((s) => MOBILE_SLUGS.has(s.slug));
  const webSections = sections.filter((s) => !MOBILE_SLUGS.has(s.slug));

  return (
    <aside className="flex h-full w-64 flex-none flex-col overflow-y-auto border-r border-[#1B2936] bg-[#070D14] px-4 py-6">
      <Link href="/" className="flex items-center gap-2 px-2 pb-6">
        <BookOpenCheck className="h-5 w-5 text-accent" />
        <div>
          <p className="text-sm font-semibold text-white">Buyootna QA Docs</p>
          <p className="text-xs text-[#7C8894]">docs.buyootna.cloud</p>
        </div>
      </Link>

      <NavGroup label="Mobile" items={mobileSections} pathname={pathname} />
      <NavGroup label="Web & API" items={webSections} pathname={pathname} />

      <div className="mt-6">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[#7C8894]">
          Resources
        </p>
        <nav className="mt-1 flex flex-col gap-1">
          {RESOURCES.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-[#B9C3CC] hover:bg-[#0F1E2E] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
