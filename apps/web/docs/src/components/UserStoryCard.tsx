"use client";

import { CheckCircle2, ExternalLink, FlaskConical, Frame, User } from "lucide-react";
import { UserStory, t } from "@/data/types";
import { PriorityBadge } from "./PriorityBadge";
import { FIGMA_FILE_URL } from "@/lib/figma";
import { useLanguage } from "@/contexts/LanguageContext";
import { chrome } from "@/lib/chrome";

export function UserStoryCard({ story }: { story: UserStory }) {
  const { lang } = useLanguage();
  const c = chrome[lang];

  return (
    <article
      id={story.id}
      className="rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 p-6 shadow-lg shadow-black/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <a
            href={`#${story.id}`}
            dir="ltr"
            className="inline-block font-mono text-[11px] tracking-tight text-[#7C8894] transition-colors hover:text-accent-light"
            title={c.storyIdTooltip}
          >
            {story.id}
          </a>
          <h3 className="mt-0.5 text-lg font-semibold text-white">
            {t(story.title, lang)}
          </h3>
        </div>
        <PriorityBadge priority={story.priority} />
      </div>

      {story.endUserStory && (
        <div className="mt-3 flex gap-2.5 rounded-xl border border-[#1B2936] bg-[#0F1E2E]/60 px-4 py-3">
          <User className="mt-0.5 h-4 w-4 flex-none text-accent" />
          <p className="text-sm italic leading-relaxed text-[#DCE1E6]">
            {t(story.endUserStory, lang)}
          </p>
        </div>
      )}

      <p className="mt-3 text-sm leading-relaxed text-[#B9C3CC]">
        {t(story.story, lang)}
      </p>

      {story.figmaFrameUrls && story.figmaFrameUrls.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {story.figmaFrameUrls.map((frame, i) => (
            <a
              key={frame.url + i}
              href={frame.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-light transition-colors hover:bg-accent/20"
            >
              <Frame className="h-3.5 w-3.5" />
              {frame.label ? t(frame.label, lang) : c.figmaViewFrame}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      ) : (
        <a
          href={FIGMA_FILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-[#2A3A47] px-3 py-1 text-xs font-medium text-[#7C8894] transition-colors hover:border-[#3A4E5E] hover:text-[#B9C3CC]"
          title={c.figmaNoFrameTooltip}
        >
          <Frame className="h-3.5 w-3.5" />
          {c.figmaNoFrame}
        </a>
      )}

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2 text-accent">
            <CheckCircle2 className="h-4 w-4" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">
              {c.acceptanceCriteria}
            </h4>
          </div>
          <ul className="mt-2 space-y-2 text-sm text-[#DCE1E6]">
            {t(story.acceptanceCriteria, lang).map((item, i) => (
              <li key={i} className="flex gap-2">
                <span
                  dir="ltr"
                  className="mt-0.5 flex-none rounded border border-[#2A3A47] bg-[#0F1E2E] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent-light"
                  title={c.acTooltip}
                >
                  AC-{String(i + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2 text-accent">
            <FlaskConical className="h-4 w-4" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">
              {c.testScenarios}
            </h4>
          </div>
          <ul className="mt-2 space-y-2 text-sm text-[#DCE1E6]">
            {t(story.testScenarios, lang).map((item, i) => (
              <li key={i} className="flex gap-2">
                <span
                  dir="ltr"
                  className="mt-0.5 flex-none rounded border border-[#2A3A47] bg-[#0F1E2E] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent-light"
                  title={c.tcTooltip}
                >
                  TC-{String(i + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
