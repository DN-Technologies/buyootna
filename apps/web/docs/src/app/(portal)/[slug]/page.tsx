import { notFound } from "next/navigation";
import { getSection } from "@/data/sections";
import { canSeeSection } from "@/lib/access";
import { requireSession } from "@/lib/session";
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

  return (
    <div className="space-y-8">
      <SectionHeader section={section} />

      <div className="space-y-6">
        {section.stories.map((story) => (
          <UserStoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
