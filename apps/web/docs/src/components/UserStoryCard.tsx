import { CheckCircle2, FlaskConical } from "lucide-react";
import { UserStory } from "@/data/types";
import { PriorityBadge } from "./PriorityBadge";

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

      <p className="mt-3 text-sm leading-relaxed text-[#B9C3CC]">{story.story}</p>

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
