import { Sidebar } from '@/src/components/layout/SideBar'
import { Header } from '@/src/components/layout/Header'
import { Toaster } from '@/src/components/ui/sonner'
import { useState, useEffect } from 'react'
import { useAppSelector } from '@/src/store/hooks'
import { RootState } from '@/src/store'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import SidePanel from '@/src/components/sidePanel'
import { useSidePanel } from '@/src/components/sidePanel'
import { useRef } from 'react'
import { JobForm } from '@/src/components/job'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const { state: sidePanelState } = useSidePanel()
  const prevCollapse = useRef<boolean | null>(null)
  const wasAutoCollapsed = useRef(false)
  const lastPanelOpen = useRef(false)
  const autoCollapseInProgress = useRef(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [showCreateJobModal, setShowCreateJobModal] = useState<boolean>(false)
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

  // Auto-collapse sidebar when side panel is open, restore on close
  useEffect(() => {
    const opening = sidePanelState.isOpen && !lastPanelOpen.current
    const closing = !sidePanelState.isOpen && lastPanelOpen.current
    lastPanelOpen.current = sidePanelState.isOpen

    if (opening) {
      if (!isSidebarCollapsed) {
        prevCollapse.current = isSidebarCollapsed
        wasAutoCollapsed.current = true
        autoCollapseInProgress.current = true
        setIsSidebarCollapsed(true)
      } else {
        wasAutoCollapsed.current = true
      }
    } else if (closing) {
      if (wasAutoCollapsed.current && prevCollapse.current !== null) {
        setIsSidebarCollapsed(prevCollapse.current)
      }
      prevCollapse.current = null
      wasAutoCollapsed.current = false
      autoCollapseInProgress.current = false
    }

    // clear in-progress flag once collapse applied
    if (autoCollapseInProgress.current && isSidebarCollapsed) {
      autoCollapseInProgress.current = false
    }
  }, [sidePanelState.isOpen, isSidebarCollapsed])

  // If user expands sidebar while panel is open, hide the panel
  useEffect(() => {
    if (autoCollapseInProgress.current) return
    if (!isSidebarCollapsed && sidePanelState.isOpen) {
      SidePanel.close()
      wasAutoCollapsed.current = false
      prevCollapse.current = null
    }
  }, [isSidebarCollapsed, sidePanelState.isOpen])

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
        <Header
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onCreateJobClick={() => setShowCreateJobModal(true)}
        />

        <SidePanel.Viewport
          minHeight="min-h-0"
          className="flex-1  bg-neutral-50 dark:bg-neutral-950 min-h-0"
        >
          <main className="flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-950">
            <div
              className={`container mx-auto px-4 py-6 sm:px-6 max-w-[1700px]`}
            >
              {children}
            </div>
          </main>
        </SidePanel.Viewport>
      </div>
      <JobForm
        open={showCreateJobModal}
        onOpenChange={setShowCreateJobModal}
        jobId={null}
        formData={undefined}
        onJobUpdated={() => setShowCreateJobModal(false)}
      />
      <Toaster />
    </div>
  )
}
