import React from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/src/components/ui/button'
import { Bell, FileText, StickyNote } from 'lucide-react'
import { usePermissions } from '@/src/hooks/usePermissions'

interface KnowledgeHubSubNavigationItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  moduleCodes: string[]
}

const knowledgeHubSubNavigationItems: KnowledgeHubSubNavigationItem[] = [
  {
    path: '/settings/knowledgeHub/announcements',
    label: 'Announcements',
    icon: Bell,
    moduleCodes: ['MOD030'],
  },
  {
    path: '/settings/knowledgeHub/notes',
    label: 'Notes',
    icon: StickyNote,
    moduleCodes: ['MOD032'],
  },
  {
    path: '/settings/knowledgeHub/scripts',
    label: 'Scripts',
    icon: FileText,
    moduleCodes: ['MOD031'],
  },
]

interface KnowledgeHubSubNavigationProps {
  className?: string
}

export const KnowledgeHubSubNavigation: React.FC<
  KnowledgeHubSubNavigationProps
> = ({ className = '' }) => {
  const router = useRouter()
  const currentPath = router.pathname

  const { checkPermission } = usePermissions()

  const isActive = (path: string) => {
    return currentPath === path
  }

  const filteredNavigation = knowledgeHubSubNavigationItems.filter(item => {
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
