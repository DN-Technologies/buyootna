// The sign-in pages keep the dark portal look; the public site is light
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#0A1118] text-[#ECEFF2]">
      {children}
    </div>
  )
}
