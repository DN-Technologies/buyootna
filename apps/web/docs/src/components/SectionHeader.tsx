"use client";

import { DocSection, t } from "@/data/types";
import { useLanguage } from "@/contexts/LanguageContext";

export function SectionHeader({ section }: { section: DocSection }) {
  const { lang } = useLanguage();
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">{t(section.title, lang)}</h1>
      <p className="mt-2 max-w-2xl text-[#B9C3CC]">{t(section.summary, lang)}</p>
    </div>
  );
}
