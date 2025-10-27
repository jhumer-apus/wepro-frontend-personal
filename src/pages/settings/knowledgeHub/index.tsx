import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Bell, FileText, Megaphone } from 'lucide-react'
import {
  SettingsNavigation,
  KnowledgeHubSubNavigation,
} from '@/src/components/job'
import { usePermissions } from '@/src/hooks/usePermissions'

export default function KnowledgeHubSettingsPage() {
  const router = useRouter()
  const { checkPermission } = usePermissions()

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  return (
    <>
      <Head>
        <title>Knowledge Hub - WePro</title>
        <meta name="description" content="Manage knowledge hub and scripts" />
      </Head>
      <div className="space-y-6">
        {/* Main Tab Navigation */}
        <SettingsNavigation />

        {/* Sub Tab Navigation */}
        <KnowledgeHubSubNavigation />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Knowledge Hub
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Knowledge Hub
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Select a tab above to manage knowledge hub and scripts
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
