import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Bell } from 'lucide-react'
import { SettingsNavigation } from '@/src/components/job'
import { usePermissions } from '@/src/hooks/usePermissions'

export default function NotificationsSettingsPage() {
  const router = useRouter()
  const { checkPermission } = usePermissions()

  return (
    <>
      <Head>
        <title>Notifications - WePro</title>
        <meta name="description" content="Manage system notifications" />
      </Head>
      <div className="space-y-6">
        {/* Main Tab Navigation */}
        <SettingsNavigation />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Notifications
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Notifications
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Configure system notifications and preferences
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
