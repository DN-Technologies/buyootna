import { ReleasesView, type ReleaseProgress } from "@/components/ReleasesView";
import { sections } from "@/data/sections";
import { canSeeSection } from "@/lib/access";
import { apiFetch } from "@/lib/api";
import { getReleases } from "@/lib/releases";
import { getSessionToken, requireSession } from "@/lib/session";
import type { ResultStatus } from "@/lib/tracking";

export default async function ReleasesPage() {
  const user = await requireSession();
  const token = await getSessionToken();

  // Progress is measured against the stories this role can see
  const visible = sections.filter((s) => canSeeSection(user.role, s.slug));
  const storySection = new Map(
    visible.flatMap((s) =>
      s.stories.map((story) => [story.id, { slug: s.slug, title: story.title }] as const),
    ),
  );

  const releases = await getReleases();
  const progress: ReleaseProgress[] = await Promise.all(
    releases.map(async (release) => {
      const res = await apiFetch(`/qa-portal/releases/${release.id}/summary`, { token });
      const summary = res.ok
        ? ((await res.json()) as {
            stories: { storyId: string; status: ResultStatus; authorName: string }[];
          })
        : { stories: [] };
      const known = summary.stories.filter((s) => storySection.has(s.storyId));
      const counts = { PASS: 0, FAIL: 0, BLOCKED: 0, NOT_RUN: 0, READY_FOR_RETEST: 0 };
      for (const s of known) counts[s.status] += 1;
      return {
        release,
        counts,
        total: storySection.size,
        issues: known
          .filter((s) => s.status === "FAIL" || s.status === "BLOCKED")
          .map((s) => ({
            storyId: s.storyId,
            status: s.status,
            slug: storySection.get(s.storyId)!.slug,
            title: storySection.get(s.storyId)!.title,
          })),
      };
    }),
  );

  return <ReleasesView progress={progress} isAdmin={user.role === "ADMIN"} />;
}
