import {
  Search,
  Bell,
  Settings,
  User,
  Moon,
  Sun,
  Menu,
  LogOut,
  Clock,
  X,
} from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/router'
import { useAppSelector, useAppDispatch } from '@/src/store/hooks'
import { logout as logoutAction } from '@/src/store/slices/authSlice'
import { clearUserData } from '@/src/store/slices/userSlice'
import { apiService } from '@/src/services/api'
import { useState, useEffect } from 'react'
import { usePermissions } from '@/src/hooks/usePermissions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/src/components/ui/dialog'
import { Textarea } from '@/src/components/ui/textarea'

interface HeaderProps {
  onMenuClick: () => void
}

interface TimesheetStatus {
  status: 'IN' | 'OUT'
  since: string
  activeTimesheet: any
}

interface TimesheetResponse {
  success: boolean
  message: string
  data: TimesheetStatus
}

export function Header({ onMenuClick }: HeaderProps): React.JSX.Element {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.user.data)
  const { checkPermission, getUserType } = usePermissions()
  const [timesheetStatus, setTimesheetStatus] = useState<'IN' | 'OUT'>('OUT')
  const [timesheetData, setTimesheetData] = useState<TimesheetStatus | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [showClockModal, setShowClockModal] = useState(false)
  const [clockNotes, setClockNotes] = useState('')
  const [clockAction, setClockAction] = useState<'IN' | 'OUT'>('OUT')
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  // Format time with user's timezone
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone:
        user?.timezoneId?.value ||
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  }

  // Check if user has permission to clock in or out
  const canClockIn = checkPermission('MOD009', 'clock_in')
  const canClockOut = checkPermission('MOD009', 'clock_out')
  const showClockButton = canClockIn || canClockOut

  const handleLogout = () => {
    dispatch(logoutAction())
    dispatch(clearUserData())
    router.push('/login')
  }

  const fetchTimesheetStatus = async () => {
    try {
      const response = await apiService.get<TimesheetResponse>(
        '/v1/timesheets/status'
      )
      if (response.data.success) {
        setTimesheetStatus(response.data.data.status)
        setTimesheetData(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch timesheet status:', error)
    }
  }

  const handleClockAction = async () => {
    if (timesheetStatus === 'OUT') {
      // Clock in - show modal for notes
      setClockAction('IN')
      setShowClockModal(true)
    } else {
      // Clock out - show modal for notes
      setClockAction('OUT')
      setShowClockModal(true)
    }
  }

  const handleClockIn = async () => {
    setIsLoading(true)
    try {
      await apiService.post('/v1/timesheets/clock-in', {
        source: 'web',
        notes: clockNotes || 'Starting work',
      })
      setTimesheetStatus('IN')
      setShowClockModal(false)
      setClockNotes('')
    } catch (error) {
      console.error('Failed to clock in:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockOut = async () => {
    setIsLoading(true)
    try {
      await apiService.post('/v1/timesheets/clock-out', {
        notes: clockNotes || 'Ending work',
      })
      setTimesheetStatus('OUT')
      setShowClockModal(false)
      setClockNotes('')
    } catch (error) {
      console.error('Failed to clock out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockSubmit = () => {
    if (clockAction === 'IN') {
      handleClockIn()
    } else {
      handleClockOut()
    }
  }

  const closeModal = () => {
    setShowClockModal(false)
    setClockNotes('')
  }

  useEffect(() => {
    if (showClockButton) {
      fetchTimesheetStatus()
    }
  }, [showClockButton])

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/95 px-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/95 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        {/* Desktop Search - Always visible */}
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            type="search"
            placeholder="Search jobs, customers, admin team..."
            className="pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#53a533]/50 focus:border-[#53a533]/50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>

        {/* Mobile Search - Toggle between icon and input */}
        <div className="md:hidden">
          {!showMobileSearch ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSearch(true)}
              className="h-10 w-10 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Search className="h-5 w-5" />
            </Button>
          ) : (
            <div className="relative flex items-center gap-2">
              <Search className="absolute left-3 h-4 w-4 text-neutral-400" />
              <Input
                type="search"
                placeholder="Search jobs, customers, admin team..."
                className="pl-10 pr-10 py-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-[#53a533]/50 focus:border-[#53a533]/50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-1 h-8 w-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        {/* Clock In/Out Button - Only show if user has permission */}
        {/* Hide on mobile when search is active */}
        {showClockButton && (
          <div className={`flex items-center space-x-2 ${showMobileSearch ? 'hidden md:flex' : ''}`}>
            {/* Display since time when clocked in */}
            {timesheetStatus === 'IN' && timesheetData?.since && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                Since {formatTime(timesheetData.since)}
              </div>
            )}
            <Button
              onClick={handleClockAction}
              disabled={isLoading}
              className={`h-10 px-4 rounded-xl transition-all duration-200 font-medium ${
                timesheetStatus === 'IN'
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <Clock className="mr-2 h-4 w-4" />
              {isLoading
                ? 'Loading...'
                : timesheetStatus === 'IN'
                  ? 'Clock Out'
                  : 'Clock In'}
            </Button>
          </div>
        )}

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="h-10 w-10 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-red-500"></span>
          <span className="absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full bg-red-500"></span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 px-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="ml-3 text-sm font-medium hidden md:block">
                {user?.username || 'User'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 shadow-xl border-neutral-200 dark:border-neutral-800"
          >
            <DropdownMenuItem
              className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200"
              onClick={() => router.push('/profile')}
            >
              <User className="mr-3 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors duration-200"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Clock In/Out Modal */}
      <Dialog open={showClockModal} onOpenChange={setShowClockModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {clockAction === 'IN' ? 'Clock In' : 'Clock Out'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Notes (optional)
              </label>
              <Textarea
                id="notes"
                placeholder={
                  clockAction === 'IN'
                    ? 'Enter any notes about starting your work...'
                    : 'Enter any notes about your work session...'
                }
                value={clockNotes}
                onChange={e => setClockNotes(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleClockSubmit}
              disabled={isLoading}
              className={
                clockAction === 'IN'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }
            >
              {isLoading
                ? clockAction === 'IN'
                  ? 'Clocking In...'
                  : 'Clocking Out...'
                : clockAction === 'IN'
                  ? 'Clock In'
                  : 'Clock Out'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
