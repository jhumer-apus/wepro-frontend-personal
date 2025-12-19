import React from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/src/components/ui/button'
import { usePermissions } from '@/src/hooks/usePermissions'
import { Building2, Users, Database } from 'lucide-react'

interface CompanySubNavigationItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const companySubNavigationItems: CompanySubNavigationItem[] = [
  {
    path: '/settings/company/profile',
    label: 'Profile',
    icon: Building2,
    moduleCodes: ['MOD028'],
  },
  {
    path: '/settings/company/franchises',
    label: 'Franchises',
    icon: Users,
    moduleCodes: ['MOD027'],
  },
  {
    path: '/settings/company/sources',
    label: 'Sources',
    icon: Database,
    moduleCodes: ['MOD008'],
  },
]

interface CompanySettingsSubNavigationProps {
  className?: string
}

export const CompanySettingsSubNavigation: React.FC<
  CompanySettingsSubNavigationProps
> = ({ className = '' }) => {
  const router = useRouter()
  const currentPath = router.pathname

  const { checkPermission } = usePermissions()

  const filteredNavigation = companySubNavigationItems.filter(item => {
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
    return currentPath === path
  }

  return (
    <div className={`flex space-x-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1 ${className}`}>
      {filteredNavigation.map(item => {
        const Icon = item.icon
        const active = isActive(item.path)

        return (
          <Button
            key={item.path}
            variant={active ? 'default' : 'ghost'}
            onClick={() => router.push(item.path)}
            className={`flex-1 flex items-center justify-center ${
              active ? 'text-white' : ''
            } ${!active ? 'hover:bg-neutral-200 dark:hover:bg-neutral-700' : ''}`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {item.label}
          </Button>
        )
      })}
    </div>
  )
}
