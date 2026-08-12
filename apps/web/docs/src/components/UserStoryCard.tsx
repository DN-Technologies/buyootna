import { CheckCircle2, ExternalLink, FlaskConical, Frame, User } from "lucide-react";
import { UserStory } from "@/data/types";
import { PriorityBadge } from "./PriorityBadge";
import { FIGMA_FILE_URL } from "@/lib/figma";

export function UserStoryCard({ story }: { story: UserStory }) {
  return (
    <article
      id={story.id}
      className="rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 p-6 shadow-lg shadow-black/20"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">{story.title}</h3>
        <PriorityBadge priority={story.priority} />
      </div>

      {story.endUserStory && (
        <div className="mt-3 flex gap-2.5 rounded-xl border border-[#1B2936] bg-[#0F1E2E]/60 px-4 py-3">
          <User className="mt-0.5 h-4 w-4 flex-none text-accent" />
          <p className="text-sm italic leading-relaxed text-[#DCE1E6]">
            {story.endUserStory}
          </p>
        </div>
      )}

      <p className="mt-3 text-sm leading-relaxed text-[#B9C3CC]">{story.story}</p>

      {story.figmaFrameUrl ? (
        <a
          href={story.figmaFrameUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-light transition-colors hover:bg-accent/20"
        >
          <Frame className="h-3.5 w-3.5" />
          View Figma frame
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <a
          href={FIGMA_FILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-[#2A3A47] px-3 py-1 text-xs font-medium text-[#7C8894] transition-colors hover:border-[#3A4E5E] hover:text-[#B9C3CC]"
          title="No frame linked yet for this story — opens the general Figma file"
        >
          <Frame className="h-3.5 w-3.5" />
          No frame linked yet
        </a>
      )}

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2 text-accent">
            <CheckCircle2 className="h-4 w-4" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">
              Acceptance Criteria
            </h4>
          </div>
          <ul className="mt-2 space-y-1.5 text-sm text-[#DCE1E6]">
            {story.acceptanceCriteria.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent">–</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2 text-accent">
            <FlaskConical className="h-4 w-4" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">
              Test Scenarios
            </h4>
          </div>
          <ul className="mt-2 space-y-1.5 text-sm text-[#DCE1E6]">
            {story.testScenarios.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
