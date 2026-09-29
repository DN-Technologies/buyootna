import "server-only";
import { cookies } from "next/headers";
import { apiFetch } from "./api";
import { getSessionToken } from "./session";
import { RELEASE_COOKIE, type DocsRelease, type StoryResult } from "./tracking";

export async function getReleases(): Promise<DocsRelease[]> {
  const res = await apiFetch("/qa-portal/releases", {
    token: await getSessionToken(),
  });
  return res.ok ? ((await res.json()) as DocsRelease[]) : [];
}

/** The release picked in the sidebar, else the newest open one. */
export async function getCurrentRelease(
  releases: DocsRelease[],
): Promise<DocsRelease | null> {
  const picked = (await cookies()).get(RELEASE_COOKIE)?.value;
  return (
    releases.find((r) => r.id === picked) ??
    releases.find((r) => r.status === "OPEN") ??
    releases[0] ??
    null
  );
}

/** Every story's current result in a release, keyed by story id. */
export async function getLatestResults(
  releaseId: string,
): Promise<Record<string, StoryResult>> {
  const res = await apiFetch(`/qa-portal/releases/${releaseId}/results`, {
    token: await getSessionToken(),
  });
  if (!res.ok) return {};
  const rows = (await res.json()) as StoryResult[];
  return Object.fromEntries(rows.map((row) => [row.storyId, row]));
}
