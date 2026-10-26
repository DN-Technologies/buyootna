'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut, Loader2 } from 'lucide-react'
import { ChevronDownIcon } from '@/components/icons/AdminIcons'
import SideNav from '@/components/SideNav'
import { api } from '@/lib/api'
import {
  clearSession,
  getStoredUser,
  getToken,
  type StoredUser,
} from '@/lib/auth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null)

  useEffect(() => {
    let cancelled = false

    async function checkAuth() {
      const token = getToken()
      if (!token) {
        router.replace('/auth/login')
        return
      }

      // Optimistically show cached user info & layout while we verify the session.
      setCurrentUser(getStoredUser())
      setAuthorized(true)

      try {
        const res = await api.get('/users/me')
        const user = res.data?.user

        if (!user?.isAdmin) {
          clearSession()
          if (!cancelled) {
            setAuthorized(false)
            router.replace('/auth/login')
          }
          return
        }

        if (!cancelled) {
          setCurrentUser(user)
        }
      } catch {
        if (!cancelled) {
          setAuthorized(false)
          router.replace('/auth/login')
        }
      }
    }

    checkAuth()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = () => {
    clearSession()
    router.push('/auth/login')
  }

  const adminName = currentUser?.name || currentUser?.email || 'مشرف'

  if (!authorized) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-white text-[#111111]" dir="rtl">
      {/* Desktop Sidebar (Always Visible) */}
      <div className="hidden md:block shrink-0 h-screen sticky top-0">
        <SideNav />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed inset-y-0 right-0 z-50 transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-200 ease-in-out md:hidden`}
      >
        <SideNav />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Figma TopBar (node 2321:591) */}
        <header
          className="h-17.5 bg-white border-b border-[#ECECEC] flex items-center justify-between px-8 shrink-0 z-30"
          dir="rtl"
        >
          {/* Right Side (RTL): Mobile toggle */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-[#6B6A6A] hover:bg-[#F8F9FA] transition"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Left Side (RTL): the signed-in admin */}
          <div className="flex items-center gap-5.5">
            {/* Profile Dropdown Toggle matching Figma 2321:561 */}
            <div className="relative">
              <div
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition"
              >
                <ChevronDownIcon className="w-4 h-4 text-[#111111]" />
                <div className="flex flex-col gap-0.5 text-right">
                  <p className="font-['Cairo'] font-semibold text-[16px] text-[#111111] leading-[1.2]">
                    {adminName}
                  </p>
                  <p className="font-['Cairo'] font-normal text-[13px] text-[#6B6A6A] leading-[1.2]">
                    مشرف عام
                  </p>
                </div>
                <div className="rounded-full w-10 h-10 bg-[#F1F5F9] border border-[#ECECEC] shrink-0 flex items-center justify-center font-['Cairo'] font-bold text-[16px] text-primary">
                  {adminName.charAt(0)}
                </div>
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowProfileDropdown(false)}
                  />
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-[#ECECEC] rounded-xl shadow-lg py-1 z-20 text-right">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center justify-end gap-2 font-['Cairo'] font-semibold transition"
                    >
                      <span>تسجيل الخروج</span>
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
