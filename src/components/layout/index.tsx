import { Sidebar } from '@/src/components/layout/SideBar'
import { Header } from '@/src/components/layout/Header'
import { Toaster } from '@/src/components/ui/sonner'
import { useState, useEffect } from 'react'
import { useAppSelector } from '@/src/store/hooks'
import { RootState } from '@/src/store'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const { isAuthenticated, loading } = useAppSelector(
    (state: RootState) => state.auth
  )
  const router = useRouter()
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render layout for login page
  if (router.pathname === '/login') {
    return <>{children}</>
  }

  // Show loading while checking authentication or theme is not mounted
  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      </div>
    )
  }

  // Don't render layout if not authenticated (but allow access to public pages)
  if (!isAuthenticated && router.pathname !== '/') {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`hidden lg:flex lg:flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        />
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform lg:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-950">
          <div
            className={`container mx-auto px-4 py-6 sm:px-4 ${
              isSidebarCollapsed ? 'max-w-[1800px]' : ''
            }`}
          >
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
