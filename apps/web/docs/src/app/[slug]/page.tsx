import { notFound } from "next/navigation";
import { sections, getSection } from "@/data/sections";
import { UserStoryCard } from "@/components/UserStoryCard";

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
      <div>
        <h1 className="text-2xl font-bold text-white">{section.title}</h1>
        <p className="mt-2 max-w-2xl text-[#B9C3CC]">{section.summary}</p>
      </div>

      <div className="space-y-6">
        {section.stories.map((story) => (
          <UserStoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
