import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { cn } from '@/src/lib/utils'
import { useUser } from '@/src/hooks/useUser'
import { usePermissions } from '@/src/hooks/usePermissions'
import { useTheme } from 'next-themes'
import logo from '../../../public/logo.png'
import logoAlt from '../../../public/logo-alt.png'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart3,
  Calendar,
  Settings,
  Zap,
  Home,
  MessageSquare,
  CreditCard,
  PhoneCall,
  Package,
  Building2,
  Phone,
  Database,
  Clock,
  Factory,
  MapPinned,
  Bell,
  FileText,
  Megaphone,
  FileBarChart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  subItems?: Array<{
    name: string
    href: string
    hoverItems?: Array<{
      name: string
      href: string
    }>
  }>
  moduleCodes?: {
    [key: string]: string[]
  }
}

const secondaryNavigation: NavigationItem[] = [
  // {
  //   name: 'AI Assistant',
  //   href: '/ai',
  //   icon: Zap,
  //   badge: 'AI',
  // },
  // {
  //   name: 'Settings',
  //   href: '/settings',
  //   icon: Settings,
    // moduleCodes: {
    //   P1: ['MOD012', 'MOD014'],
    //   P2: ['MOD013', 'MOD015'],
    //   P3: ['MOD013', 'MOD015'],
    //   P4: ['MOD013', 'MOD015'],
    //   P5: ['MOD012', 'MOD014', 'MOD013', 'MOD015'],
    //   Tenant: ['MOD013', 'MOD015'],
    // }
  // },
]

interface SidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps): React.JSX.Element {
  const router = useRouter()
  const location: string = router.pathname
  const { user } = useUser()
  const { checkPermission, getUserType } = usePermissions()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Reports: false,
  })
  const [hoveredSubItem, setHoveredSubItem] = useState<string | null>(null)
  const [hoverMenu, setHoverMenu] = useState<{
    key: string
    items: Array<{ name: string; href: string }>
    top: number
    left: number
  } | null>(null)
  const closeHoverTimeoutRef = useRef<number | null>(null)

  const clearHoverCloseTimeout = () => {
    if (closeHoverTimeoutRef.current !== null) {
      window.clearTimeout(closeHoverTimeoutRef.current)
      closeHoverTimeoutRef.current = null
    }
  }

  const scheduleHoverClose = () => {
    clearHoverCloseTimeout()
    closeHoverTimeoutRef.current = window.setTimeout(() => {
      setHoveredSubItem(null)
      setHoverMenu(null)
    }, 120)
  }

  const openHoverMenu = (
    hoverKey: string,
    items: Array<{ name: string; href: string }>,
    target: HTMLDivElement
  ) => {
    clearHoverCloseTimeout()
    const rect = target.getBoundingClientRect()
    setHoveredSubItem(hoverKey)
    setHoverMenu({
      key: hoverKey,
      items,
      top: rect.top,
      left: rect.right + 4,
    })
  }

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    return () => {
      if (closeHoverTimeoutRef.current !== null) {
        window.clearTimeout(closeHoverTimeoutRef.current)
      }
    }
  }, [])

  console.log('User slice data:', user)

  // Create navigation array with conditional name for Admin Team
  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Jobs',
      href: '/jobs',
      icon: Briefcase,
      moduleCodes: {
        P1: ['MOD002', 'MOD003'],
        P2: ['MOD007', 'MOD006'],
        P3: ['MOD007', 'MOD006'],
        P4: ['MOD007', 'MOD006'],
        P5: ['MOD002', 'MOD003', 'MOD007', 'MOD006'],
        Tenant: ['MOD007', 'MOD006'],
      },
    },
    // {
    //   name: getUserType() === 'P1' ? 'Admin Team' : 'Team',
    //   href: '/team',
    //   icon: Users,
    //   moduleCodes: {
    //     P1: ['MOD002', 'MOD003'],
    //     P2: ['MOD007', 'MOD006'],
    //     P3: ['MOD007', 'MOD006'],
    //     P4: ['MOD007', 'MOD006'],
    //     P5: ['MOD002', 'MOD003', 'MOD007', 'MOD006'],
    //     Tenant: ['MOD007', 'MOD006'],
    //   },
    // },
    // {
    //   name: 'Reports',
    //   href: '/reports',
    //   icon: FileBarChart,
    //   moduleCodes: {
    //     P1: ['MOD017'],
    //     P2: ['MOD010'],
    //     P3: ['MOD010'],
    //     P4: ['MOD010'],
    //     P5: ['MOD010', 'MOD017'],
    //     Tenant: ['MOD010'],
    //   },
    // },
    {
      name: 'Customers',
      href: '/customers',
      icon: Home,
    },
    {
      name: 'Schedule',
      href: '/schedule',
      icon: Calendar,
    },
    {
      name: 'Live Map',
      href: '/live-map',
      icon: MapPinned,
    },
    // {
    //   name: 'WePro Phone',
    //   href: '/calls',
    //   icon: PhoneCall,
    //   moduleCodes: {
    //     P1: ['MOD042'],
    //     P2: ['MOD039', 'MOD041', 'MOD043'],
    //     P3: ['MOD039', 'MOD041', 'MOD043'],
    //     P4: ['MOD039', 'MOD041', 'MOD043'],
    //     P5: ['MOD039', 'MOD041', 'MOD043'],
    //     Tenant: ['MOD039', 'MOD041', 'MOD043'],
    //   },
    // },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileBarChart,
      subItems: [
        {
          name: 'Agents',
          href: '/reports/agents',
          hoverItems: [
            { name: 'Calls', href: '/reports/agents/calls' },
            { name: 'Jobs', href: '/reports/agents/jobs' },
            {
              name: 'Answering Service Jobs',
              href: '/reports/agents/answering-service-jobs',
            },
            { name: 'Timesheet', href: '/reports/agents/timesheet' },
          ],
        },
        { name: 'Commissions', href: '/reports/commissions' },
        { name: 'Job Statistics', href: '/reports/job-statistics' },
      ],
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageSquare,
    },
    {
      name: 'Packages',
      href: '/packages',
      icon: Package,
    },
    // {
    //   name: 'Service Packages',
    //   href: '/servicePackages',
    //   icon: Package,
    //   moduleCodes: {
    //     P5: ['MOD043'],
    //     Tenant: ['MOD043'],
    //   },
    // },
    // {
    //   name: 'Get Paid with WePro',
    //   href: '/stripeAccounts',
    //   icon: CreditCard,
    //   moduleCodes: {
    //     P5: ['MOD047'],
    //     Tenant: ['MOD047'],
    //   },
    // },
    {
      name: 'Companies',
      href: '/companies',
      icon: Building2,
      moduleCodes: {
        P1: ['MOD004'],
        P5: ['MOD004'],
      },
    },

    {
      name: 'Source Providers',
      href: '/sourceProviders',
      icon: Database,
      moduleCodes: {
        P1: ['MOD011'],
        P5: ['MOD011'],
      },
    },
    {
      name: 'Answering Services',
      href: '/answeringServices',
      icon: Phone,
      moduleCodes: {
        P1: ['MOD005'],
        P5: ['MOD005'],
      },
    },
    // {
    //   name: 'Timesheet',
    //   href: '/timesheet',
    //   icon: Clock,
    //   moduleCodes: {
    //     P1: ['MOD016'],
    //     P2: ['MOD009'],
    //     P3: ['MOD009'],
    //     P4: ['MOD009'],
    //     P5: ['MOD009', 'MOD016'],
    //     Tenant: ['MOD009'],
    //   },
    // },
    {
      name: 'Billing',
      href: '/billing',
      icon: CreditCard,
    }
  ]

  // Filter navigation items based on permissions
  const filteredNavigation = navigation.filter(item => {
    const userType = getUserType()
    if (item.name === 'Dashboard') {
      return true
    }
    if (item.name === 'Customers') {
      return true
    }
    if (item.name === 'Schedule') {
      return true
    }
    if (item.name === 'Live Map') {
      return true
    }
    if (item.name === 'Messages') {
      return true
    }
    if (item.name === 'Reports') {
      return true
    }
    if (item.name === 'Billing Answering Subscription') {
      return true
    }
    // If user is P1, show all items (existing behavior)
    // if (userType === 'P1' && item.name !== 'Timesheet') {
    //   return true
    // }
    // item?.moduleCodes?.[userType]
    if (!item?.moduleCodes) {
      if (userType === 'P1') {
        return true
      }
      return false
    }

    if (!item.moduleCodes || !userType || !item.moduleCodes[userType]) {
      return false
    }

    // If user is not P1, check if they have view permission for at least one moduleCode
    if (item.moduleCodes && userType && item.moduleCodes[userType]) {
      const userModuleCodes = item.moduleCodes[userType]
      // Check if user has view permission for at least one of the moduleCodes
      return userModuleCodes.some(
        (moduleCode: string) =>
          checkPermission(moduleCode, 'read') ||
          checkPermission(moduleCode, 'view') ||
          checkPermission(moduleCode, 'view_all_logs') ||
          checkPermission(moduleCode, 'view_timesheet') ||
          checkPermission(moduleCode, 'view_all_timesheets')
      )
    }
    // If no moduleCodes defined, show the item (existing behavior for items without moduleCodes)
    return true
  })

  // Filter secondary navigation items based on permissions
  const filteredSecondaryNavigation = secondaryNavigation.filter(item => {
    const userType = getUserType()
    return true
    // If user is P1, show all items (existing behavior)
    if (userType === 'P1') {
      return true
    }
    if (!item.moduleCodes || !userType) {
      return false
    }

    // Check if user has view permission for at least one of the moduleCodes
    const userModuleCodes = item.moduleCodes![userType!]
    if (userModuleCodes) {
      return userModuleCodes.some((moduleCode: string) =>
        checkPermission(moduleCode, 'view')
      )
    }

    return false

    // If no moduleCodes defined, show the item (existing behavior for items without moduleCodes)
    return true
  })

  return (
    <div className="flex h-full flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      {/* Logo */}
      <div
        className={cn(
          'relative flex items-center h-16 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0',
          isCollapsed ? 'px-3 justify-center' : 'px-4 justify-between'
        )}
      >
        {!isCollapsed &&
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center py-3 transition-transform duration-200',
              isCollapsed ? 'hover:scale-100' : 'hover:scale-105'
            )}
          >
            <img
              src={mounted && resolvedTheme === 'dark' ? logoAlt.src : logo.src}
              alt="WePro Logo"
              className={cn(
                'h-6 w-auto object-contain filter drop-shadow-sm',
                isCollapsed ? 'max-w-[40px]' : 'max-w-[160px]'
              )}
            />
          </Link>
        }
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            // className="hidden lg:inline-flex absolute right-3 h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            className="hidden lg:inline-flex block h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          'flex-1 space-y-1 px-4 py-4 overflow-y-auto',
          isCollapsed && 'px-2'
        )}
      >
        {filteredNavigation.map(item => {
          const hasSubItems = Boolean(item.subItems?.length)
          const isSubItemActive = item.subItems?.some(subItem =>
            location.startsWith(subItem.href)
          )
          const isActive = location.startsWith(item.href) || Boolean(isSubItemActive)
          const isExpanded = expandedSections[item.name]

          if (hasSubItems) {
            return (
              <div key={item.name}>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSections(prev => ({
                      ...prev,
                      [item.name]: !prev[item.name],
                    }))
                  }
                  className={cn(
                    'group flex w-full items-center rounded-xl py-3 text-sm font-medium transition-all duration-200',
                    isCollapsed ? 'justify-center px-3' : 'px-4',
                    isActive
                      ? 'bg-gradient-to-r from-brandGreen-900 to-brandGreen-300 text-white shadow-lg shadow-brandGreen-900/25'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                  )}
                  title={item.name}
                  aria-label={item.name}
                  aria-expanded={Boolean(isExpanded)}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      !isCollapsed && 'mr-3',
                      isActive
                        ? 'text-white'
                        : 'text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
                    )}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="truncate">{item.name}</span>
                      <ChevronDown
                        className={cn(
                          'ml-auto h-4 w-4 transition-transform duration-200',
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        )}
                      />
                    </>
                  )}
                </button>
                {!isCollapsed && (
                  <div
                    className={cn(
                      'ml-7 overflow-hidden transition-all duration-300 ease-in-out',
                      isExpanded ? 'mt-1 max-h-60 opacity-100' : 'mt-0 max-h-0 opacity-0'
                    )}
                  >
                    <div className="space-y-1 pb-1">
                    {item.subItems?.map(subItem => {
                      const isSubActive = location.startsWith(subItem.href)
                      const hasHoverItems = Boolean(subItem.hoverItems?.length)
                      const hoverKey = `${item.name}-${subItem.name}`
                      const isHoverOpen = hoveredSubItem === hoverKey
                      return (
                        <div
                          key={subItem.name}
                          className="relative"
                          onMouseEnter={(event: React.MouseEvent<HTMLDivElement>) => {
                            if (hasHoverItems && subItem.hoverItems) {
                              openHoverMenu(hoverKey, subItem.hoverItems, event.currentTarget)
                            }
                          }}
                          onMouseLeave={() => {
                            if (hasHoverItems) {
                              scheduleHoverClose()
                            }
                          }}
                        >
                          {hasHoverItems ? (
                            <button
                              type="button"
                              className={cn(
                                'group flex w-full items-center rounded-lg px-3 py-2 text-sm text-left transition-all duration-200',
                                isHoverOpen &&
                                  'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100',
                                isSubActive
                                  ? 'bg-brandGreen-100 text-brandGreen-900 dark:bg-brandGreen-900/30 dark:text-brandGreen-100'
                                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                              )}
                              aria-haspopup="menu"
                              aria-expanded={isHoverOpen}
                            >
                              <span className="truncate">{subItem.name}</span>
                              <ChevronRight className="ml-auto h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100" />
                            </button>
                          ) : (
                            <Link
                              href={subItem.href}
                              className={cn(
                                'group flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200',
                                isSubActive
                                  ? 'bg-brandGreen-100 text-brandGreen-900 dark:bg-brandGreen-900/30 dark:text-brandGreen-100'
                                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                              )}
                            >
                              <span className="truncate">{subItem.name}</span>
                            </Link>
                          )}
                        </div>
                      )
                    })}
                    </div>
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-200',
                isCollapsed ? 'justify-center px-3' : 'px-4',
                isActive
                  ? 'bg-gradient-to-r from-brandGreen-900 to-brandGreen-300 text-white shadow-lg shadow-brandGreen-900/25'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
              )}
              title={item.name}
              aria-label={item.name}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  !isCollapsed && 'mr-3',
                  isActive
                    ? 'text-white'
                    : 'text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
                )}
              />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-4">
          {filteredSecondaryNavigation.map(item => {
            const isActive = location.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-200',
                  isCollapsed ? 'justify-center px-3' : 'px-4',
                  isActive
                    ? 'bg-gradient-to-r from-[#53a533] to-[#53a533] text-white shadow-lg shadow-[#53a533]/25'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                )}
                title={item.name}
                aria-label={item.name}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    !isCollapsed && 'mr-3',
                    isActive
                      ? 'text-white'
                      : 'text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
                {!isCollapsed && item.badge && (
                  <span className="ml-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 text-xs font-semibold text-white shadow-lg">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
      {!isCollapsed && hoverMenu && (
        <div
          className="fixed z-[80] w-60 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl transition-all duration-150 dark:border-neutral-700 dark:bg-neutral-900"
          style={{ top: hoverMenu.top, left: hoverMenu.left }}
          onMouseEnter={clearHoverCloseTimeout}
          onMouseLeave={scheduleHoverClose}
        >
          <div className="space-y-1">
            {hoverMenu.items.map(hoverItem => {
              const isHoverItemActive = location.startsWith(hoverItem.href)
              return (
                <Link
                  key={hoverItem.name}
                  href={hoverItem.href}
                  className={cn(
                    'block rounded-lg px-3 py-2 text-sm transition-all duration-200',
                    isHoverItemActive
                      ? 'bg-brandGreen-100 text-brandGreen-900 dark:bg-brandGreen-900/30 dark:text-brandGreen-100'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                  )}
                >
                  {hoverItem.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
