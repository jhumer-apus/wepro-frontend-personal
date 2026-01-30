import React, { useState, useEffect } from 'react'
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
  Bell,
  FileText,
  Megaphone,
  FileBarChart,
} from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
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

export function Sidebar(): React.JSX.Element {
  const router = useRouter()
  const location: string = router.pathname
  const { user } = useUser()
  const { checkPermission, getUserType } = usePermissions()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
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
    // {
    //   name: 'Schedule',
    //   href: '/schedule',
    //   icon: Calendar,
    // },
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
      <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-full py-3 hover:scale-105 transition-transform duration-200"
        >
          <img
            src={mounted && resolvedTheme === 'dark' ? logoAlt.src : logo.src}
            alt="WePro Logo"
            className="h-6 w-auto object-contain max-w-[160px] filter drop-shadow-sm"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        {filteredNavigation.map(item => {
          const isActive = location.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-brandGreen-900 to-brandGreen-300 text-white shadow-lg shadow-brandGreen-900/25'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 transition-colors',
                  isActive
                    ? 'text-white'
                    : 'text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
                )}
              />
              {item.name}
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
                  'group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-[#53a533] to-[#53a533] text-white shadow-lg shadow-[#53a533]/25'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 transition-colors',
                    isActive
                      ? 'text-white'
                      : 'text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
                  )}
                />
                {item.name}
                {item.badge && (
                  <span className="ml-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 text-xs font-semibold text-white shadow-lg">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
