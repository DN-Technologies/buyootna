import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import { sections } from "@/data/sections";

export default function Home() {
  const totalStories = sections.reduce((sum, s) => sum + s.stories.length, 0);

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3 text-accent">
        <BookOpenCheck className="h-6 w-6" />
        <span className="text-sm font-semibold uppercase tracking-wider">
          QA User Stories
        </span>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-white">Buyootna QA Docs</h1>
        <p className="mt-3 max-w-2xl text-[#B9C3CC]">
          User stories and test scenarios for QA engineers testing the
          Buyootna platform — the mobile app, every web portal, and the API.
          Each story is grounded in features that actually exist in the
          codebase today, including known stubs and placeholders that should
          be tracked as gaps rather than re-filed as new bugs.
        </p>
        <p className="mt-2 text-sm text-[#7C8894]">
          {sections.length} sections · {totalStories} user stories
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
                {section.title}
              </h2>
              <ArrowRight className="h-4 w-4 text-[#7C8894] transition-transform group-hover:translate-x-1 group-hover:text-accent" />
            </div>
            <p className="mt-2 text-sm text-[#B9C3CC]">{section.summary}</p>
            <p className="mt-3 text-xs text-[#7C8894]">
              {section.stories.length} user stories
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
