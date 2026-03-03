import React from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/src/components/ui/button'
import {
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Receipt,
  ExternalLink,
} from 'lucide-react'
import { usePermissions } from '@/src/hooks/usePermissions'

interface TemplateSubNavigationItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  moduleCodes?: string[]
}

const templateSubNavigationItems: TemplateSubNavigationItem[] = [
  {
    path: '/settings/templates/sms',
    label: 'SMS Templates',
    icon: MessageSquare,
    moduleCodes: ['MOD033'],
  },
  {
    path: '/settings/templates/voice',
    label: 'Voice Templates',
    icon: Phone,
    moduleCodes: ['MOD034'],
  },
  {
    path: '/settings/templates/email',
    label: 'Email Templates',
    icon: Mail,
    moduleCodes: ['MOD035'],
  },
  {
    path: '/settings/templates/jobs',
    label: 'Jobs Templates',
    icon: FileText,
    moduleCodes: ['MOD037'],
  },
  {
    path: '/settings/templates/invoice',
    label: 'Invoice Templates',
    icon: Receipt,
    moduleCodes: ['MOD036'],
  },
  {
    path: '/settings/templates/external-jobs',
    label: 'External Job Templates',
    icon: ExternalLink,
    moduleCodes: ['MOD038'],
  },
]

interface TemplatesSubNavigationProps {
  className?: string
}

export const TemplatesSubNavigation: React.FC<TemplatesSubNavigationProps> = ({
  className = '',
}) => {
  const router = useRouter()
  const currentPath = router.pathname

  const { checkPermission } = usePermissions()

  const isActive = (path: string) => {
    return currentPath === path
  }

  const filteredNavigation = templateSubNavigationItems.filter(item => {
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
