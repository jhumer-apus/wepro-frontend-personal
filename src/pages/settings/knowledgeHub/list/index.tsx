import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { usePermissions } from '@/src/hooks/usePermissions'
import { Bell, Building2, Briefcase, FileText, Megaphone } from 'lucide-react'

export default function KnowledgeHubListPage() {
  const router = useRouter()
  const { checkPermission } = usePermissions()

  return (
    <>
      <Head>
        <title>Knowledge Hub List - WePro</title>
        <meta name="description" content="Manage knowledge hub list" />
      </Head>
      <div className="space-y-6">
        {/* Main Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
          <Button
            variant="ghost"
            onClick={() => router.push('/settings/company/profile')}
            className="flex-1 flex items-center justify-center"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Company
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/settings/job/industry')}
            className="flex-1 flex items-center justify-center"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Job
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/settings/notifications')}
            className="flex-1 flex items-center justify-center"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/settings/templates/sms')}
            className="flex-1 flex items-center justify-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button
            variant="default"
            onClick={() => router.push('/settings/knowledgeHub/announcements')}
            className="flex-1 flex items-center justify-center"
          >
            <Megaphone className="w-4 h-4 mr-2" />
            Knowledge Hub
          </Button>
        </div>

        {/* Sub Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant="default"
            onClick={() => router.push('/settings/knowledgeHub/announcements')}
            className="flex-1 flex items-center justify-center"
          >
            <Megaphone className="w-4 h-4 mr-2" />
            Knowledge Hub List
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/settings/knowledgeHub/announcements')}
            className="flex-1 flex items-center justify-center"
          >
            <Bell className="w-4 h-4 mr-2" />
            Announcements
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/settings/knowledgeHub/scripts')}
            className="flex-1 flex items-center justify-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Notes/Scripts
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Knowledge Hub List
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Knowledge Hub List
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Knowledge hub list management interface will be implemented here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
