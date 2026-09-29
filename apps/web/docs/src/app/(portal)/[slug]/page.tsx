import { notFound } from "next/navigation";
import { getSection } from "@/data/sections";
import { canSeeSection } from "@/lib/access";
import { requireSession } from "@/lib/session";
import {
  getCurrentRelease,
  getLatestResults,
  getReleases,
} from "@/lib/releases";
import { UserStoryCard } from "@/components/UserStoryCard";
import { SectionHeader } from "@/components/SectionHeader";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireSession();
  const section = getSection(slug);

  // A section this role can't see answers exactly like one that doesn't exist
  if (!section || !canSeeSection(user.role, section.slug)) {
    notFound();
  }

  const release = await getCurrentRelease(await getReleases());
  const results = release ? await getLatestResults(release.id) : {};

  return (
    <div className="space-y-8">
      <SectionHeader section={section} />

      <div className="space-y-6">
        {section.stories.map((story) => (
          <UserStoryCard
            key={story.id}
            story={story}
            tracking={{
              role: user.role,
              releaseId: release?.id ?? null,
              releaseOpen: release?.status === "OPEN",
              current: results[story.id],
            }}
          />
        ))}
      </div>
    </div>
  );
}
