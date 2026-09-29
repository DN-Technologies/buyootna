import { Sidebar } from "@/components/Sidebar";
import { canSeePostman } from "@/lib/access";
import { navSectionsFor } from "@/lib/nav";
import { requireSession } from "@/lib/session";

// Every portal page depends on who is signed in
export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireSession();

  return (
    <>
      <Sidebar
        sections={navSectionsFor(user.role)}
        user={user}
        showPostman={canSeePostman(user.role)}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-8 py-10">{children}</div>
      </main>
    </>
  );
}
