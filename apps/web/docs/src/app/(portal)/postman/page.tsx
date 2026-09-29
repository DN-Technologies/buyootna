import { notFound } from "next/navigation";
import { PostmanView } from "@/components/PostmanView";
import { canSeePostman } from "@/lib/access";
import { requireSession } from "@/lib/session";

export default async function PostmanPage() {
  const user = await requireSession();
  if (!canSeePostman(user.role)) notFound();
  return <PostmanView />;
}
