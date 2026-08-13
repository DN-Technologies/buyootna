import { notFound } from "next/navigation";
import { sections, getSection } from "@/data/sections";
import { UserStoryCard } from "@/components/UserStoryCard";
import { SectionHeader } from "@/components/SectionHeader";

export function generateStaticParams() {
  return sections.map((section) => ({ slug: section.slug }));
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = getSection(slug);

  if (!section) {
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
