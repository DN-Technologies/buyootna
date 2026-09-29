"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck, Send, Tag } from "lucide-react";
import { t } from "@/data/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { chrome } from "@/lib/chrome";
import type { NavSection } from "@/lib/nav";

export function HomeView({
  sections,
  showPostman,
}: {
  // Only the sections this role may open (filtered on the server)
  sections: NavSection[];
  showPostman: boolean;
}) {
  const { lang } = useLanguage();
  const c = chrome[lang];
  const totalStories = sections.reduce((sum, s) => sum + s.storyCount, 0);

  const resources = [
    ...(showPostman
      ? [
          {
            href: "/postman",
            icon: Send,
            title: c.navPostman,
            summary: c.homePostmanCardSummary,
          },
        ]
      : []),
    {
      href: "/versions",
      icon: Tag,
      title: c.navVersions,
      summary: c.homeVersionsCardSummary,
    },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3 text-accent">
        <BookOpenCheck className="h-6 w-6" />
        <span className="text-sm font-semibold uppercase tracking-wider">
          {c.homeEyebrow}
        </span>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-white">{c.homeTitle}</h1>
        <p className="mt-3 max-w-2xl text-[#B9C3CC]">{c.homeDescription}</p>
        <p className="mt-2 text-sm text-[#7C8894]">
          {sections.length} {c.homeStatsSections} · {totalStories}{" "}
          {c.homeStatsStories}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.slug}
            href={`/${section.slug}`}
            className="group rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 p-5 transition-colors hover:border-accent"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                {t(section.title, lang)}
              </h2>
              <ArrowRight className="h-4 w-4 flex-none text-[#7C8894] transition-transform rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 group-hover:text-accent" />
            </div>
            <p className="mt-2 text-sm text-[#B9C3CC]">
              {t(section.summary, lang)}
            </p>
            <p className="mt-3 text-xs text-[#7C8894]">
              {section.storyCount} {c.homeStatsStories}
            </p>
          </Link>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#7C8894]">
          {c.homeResources}
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {resources.map(({ href, icon: Icon, title, summary }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 p-5 transition-colors hover:border-accent"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 flex-none text-accent" />
                  <h2 className="text-base font-semibold text-white">
                    {title}
                  </h2>
                </div>
                <ArrowRight className="h-4 w-4 flex-none text-[#7C8894] transition-transform rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 group-hover:text-accent" />
              </div>
              <p className="mt-2 text-sm text-[#B9C3CC]">{summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
