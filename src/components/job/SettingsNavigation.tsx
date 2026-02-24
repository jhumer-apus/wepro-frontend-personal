import React from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/src/components/ui/button'
import { usePermissions } from '@/src/hooks/usePermissions'
import { Building2, Briefcase, Bell, FileText, Megaphone } from 'lucide-react'

interface NavigationItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  moduleCodes?: string[]
}

const mainNavigationItems: NavigationItem[] = [
  {
    path: '/settings/company/profile',
    label: 'Company',
    icon: Building2,
    moduleCodes: ['MOD028', 'MOD027', 'MOD008'],
  },
  {
    path: '/settings/job/categories-types',
    label: 'Job',
    icon: Briefcase,
    moduleCodes: [
      'MOD012',
      'MOD013',
      'MOD014',
      'MOD015',
      'MOD019',
      'MOD020',
      'MOD021',
      'MOD022',
      'MOD023',
      'MOD024',
      'MOD029',
      'MOD025',
      'MOD026',
    ],
  },
  {
    path: '/settings/notifications',
    label: 'Notifications',
    icon: Bell,
  },
  {
    path: '/settings/templates/sms',
    label: 'Templates',
    icon: FileText,
    moduleCodes: ['MOD033', 'MOD034', 'MOD035', 'MOD037', 'MOD036', 'MOD038'],
  },
  {
    path: '/settings/knowledgeHub/announcements',
    label: 'Knowledge Hub',
    icon: Megaphone,
    moduleCodes: ['MOD030', 'MOD032', 'MOD031'],
  },
]

interface SettingsNavigationProps {
  className?: string
}

export const SettingsNavigation: React.FC<SettingsNavigationProps> = ({
  className = '',
}) => {
  const router = useRouter()
  const currentPath = router.pathname
  const { checkPermission } = usePermissions()

  const filteredNavigation = mainNavigationItems.filter(item => {
    if (!item.moduleCodes) {
      return true
    }

    const userModuleCodes = item.moduleCodes
    // Check if user has view permission for at least one of the moduleCodes
    return userModuleCodes.some(moduleCode =>
      checkPermission(moduleCode, 'view')
    )
  })

  const isActive = (path: string) => {
    // Check if current path starts with the navigation item path
    // This handles nested routes properly
    if (path === '/settings/company/profile') {
      return currentPath.startsWith('/settings/company')
    }
    if (path.startsWith('/settings/job')) {
      return currentPath.startsWith('/settings/job')
    }
    if (path === '/settings/notifications') {
      return currentPath.startsWith('/settings/notifications')
    }
    if (path === '/settings/templates/sms') {
      return currentPath.startsWith('/settings/templates')
    }
    if (path === '/settings/knowledgeHub/announcements') {
      return currentPath.startsWith('/settings/knowledgeHub')
    }
    return currentPath === path
  }

  return (
    <div className={`flex gap-1 sm:space-x-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1 overflow-x-auto sm:overflow-x-visible scrollbar-hide ${className}`}>
      {filteredNavigation.map(item => {
        const Icon = item.icon
        const active = isActive(item.path)

        return (
          <Button
            key={item.path}
            variant={active ? 'default' : 'ghost'}
            onClick={() => router.push(item.path)}
            className={`flex-shrink-0 sm:flex-1 flex items-center justify-center text-xs sm:text-sm px-3 sm:px-4 ${
              active ? 'text-white' : ''
            } ${!active ? 'hover:bg-neutral-200 dark:hover:bg-neutral-700' : ''}`}
          >
            <Icon className="w-4 h-4 sm:mr-2" />
            {item.label}
          </Button>
        )
      })}
    </div>
  )
}
