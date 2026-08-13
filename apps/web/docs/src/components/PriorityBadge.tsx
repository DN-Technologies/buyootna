import { UserStory } from "@/data/types";

const STYLES: Record<UserStory["priority"], string> = {
  P0: "bg-[#3A1A1A] text-[#F0958A] border-[#5A2626]",
  P1: "bg-[#3A2E14] text-[#E0B96B] border-[#5A4A26]",
  P2: "bg-[#152A1E] text-[#8FCBA0] border-[#264A32]",
};

export function PriorityBadge({ priority }: { priority: UserStory["priority"] }) {
  return (
    <span
      dir="ltr"
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold tracking-wide ${STYLES[priority]}`}
    >
      {priority}
    </span>
  );
}
