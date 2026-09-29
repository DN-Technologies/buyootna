import { Sidebar } from "@/components/Sidebar";
import { canSeePostman } from "@/lib/access";
import { navSectionsFor } from "@/lib/nav";
import { requireSession } from "@/lib/session";
import { getCurrentRelease, getReleases } from "@/lib/releases";

// Every portal page depends on who is signed in
export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireSession();
  const releases = await getReleases();
  const current = await getCurrentRelease(releases);

  return (
    <>
      <Sidebar
        sections={navSectionsFor(user.role)}
        user={user}
        showPostman={canSeePostman(user.role)}
        releases={releases.map(({ id, name, status }) => ({ id, name, status }))}
        currentReleaseId={current?.id ?? null}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-8 py-10">{children}</div>
      </main>
    </>
  );
}
