import AccountTypeDialog from "@/components/auth/AccountTypeDialog";
import AuthPromptDialog from "@/components/layout/AuthPromptDialog";
import SiteFooter from "@/components/layout/SiteFooter";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white text-ink">
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <AuthPromptDialog />
      <AccountTypeDialog />
    </div>
  );
}
