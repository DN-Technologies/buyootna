import { HomeView } from "@/components/HomeView";
import { canSeePostman } from "@/lib/access";
import { navSectionsFor } from "@/lib/nav";
import { requireSession } from "@/lib/session";

export default async function Home() {
  const user = await requireSession();
  return (
    <HomeView
      sections={navSectionsFor(user.role)}
      showPostman={canSeePostman(user.role)}
    />
  );
}
