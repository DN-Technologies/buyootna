"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  Building2,
  LayoutDashboard,
  Send,
  Server,
  Smartphone,
  Store,
  Tag,
  Warehouse,
  Wrench,
} from "lucide-react";
import { sections } from "@/data/sections";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  mobile: Smartphone,
  "web-admin": LayoutDashboard,
  "web-companies": Building2,
  "web-offices": Store,
  "web-management": Warehouse,
  "web-landing": Wrench,
  api: Server,
};

const RESOURCES = [
  { href: "/postman", label: "Postman Collection", icon: Send },
  { href: "/versions", label: "App Versions", icon: Tag },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-none flex-col border-r border-[#1B2936] bg-[#070D14] px-4 py-6">
      <Link href="/" className="flex items-center gap-2 px-2 pb-6">
        <BookOpenCheck className="h-5 w-5 text-accent" />
        <div>
          <p className="text-sm font-semibold text-white">Buyootna QA Docs</p>
          <p className="text-xs text-[#7C8894]">docs.buyootna.cloud</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {sections.map((section) => {
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

      <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-[#7C8894]">
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
    </aside>
  );
}
