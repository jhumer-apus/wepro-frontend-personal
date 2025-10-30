import React from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/src/components/ui/button'
import { usePermissions } from '@/src/hooks/usePermissions'
import {
  Factory,
  CheckCircle,
  Layers,
  Tag,
  FileText,
  MapPin,
  Database,
} from 'lucide-react'

interface SubNavigationItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  requiresPermission?: boolean
  permissionCheck?: () => boolean
}

const subNavigationItems: SubNavigationItem[] = [
  // {
  //   path: '/settings/job/industry',
  //   label: 'Industry',
  //   icon: Factory,
  //   moduleCodes: ['MOD012', 'MOD013'],
  // },
  // {
  //   path: '/settings/job/types',
  //   label: 'Job Types',
  //   icon: CheckCircle,
  //   moduleCodes: ['MOD014', 'MOD015'],
  // },
  {
    path: '/settings/job/categories-types',
    label: 'Job Industries & Types',
    icon: Layers,
    moduleCodes: ['MOD012', 'MOD013', 'MOD014', 'MOD015'],
  },
  {
    path: '/settings/job/status',
    label: 'Job Status',
    icon: Tag,
    moduleCodes: ['MOD019', 'MOD020'],
  },
  {
    path: '/settings/job/tags',
    label: 'Job Tags',
    icon: Tag,
    moduleCodes: ['MOD021', 'MOD022'],
  },
  {
    path: '/settings/job/tag-notes',
    label: 'Job Tag Notes',
    icon: FileText,
    moduleCodes: ['MOD023', 'MOD024'],
  },
  {
    path: '/settings/job/metro-area',
    label: 'Metro Area',
    icon: MapPin,
    moduleCodes: ['MOD029'],
  },
  {
    path: '/settings/job/custom-fields',
    label: 'Custom Fields',
    icon: Database,
    moduleCodes: ['MOD025', 'MOD026'],
  },
]

interface JobSettingsSubNavigationProps {
  className?: string
  getUserType?: () => string | null
  checkPermission?: (module: string, action: string) => boolean
}

export const JobSettingsSubNavigation: React.FC<
  JobSettingsSubNavigationProps
> = ({ className = '', getUserType }) => {
  const router = useRouter()
  const currentPath = router.pathname
  const { checkPermission } = usePermissions()

  const isActive = (path: string) => {
    return currentPath === path
  }

  const filteredNavigation = subNavigationItems.filter(item => {
    if (!item.moduleCodes) {
      return true
    }

    const userModuleCodes = item.moduleCodes
    // Check if user has view permission for at least one of the moduleCodes
    return userModuleCodes.some(moduleCode =>
      checkPermission(moduleCode, 'view')
    )
  })

  return (
    <div
      className={`flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1 ${className}`}
    >
      {filteredNavigation.map(item => {
        const Icon = item.icon
        const active = isActive(item.path)

        return (
          <Button
            key={item.path}
            variant={active ? 'default' : 'ghost'}
            onClick={() => router.push(item.path)}
            className={'flex-1 items-center justify-center'}
          >
            <Icon className="w-4 h-4 mr-2" />
            {item.label}
          </Button>
        )
      })}
    </div>
  )
}
