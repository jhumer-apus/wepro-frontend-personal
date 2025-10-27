import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Building2, Users, Database } from 'lucide-react'
import { usePermissions } from '@/src/hooks/usePermissions'

export default function CompanySettingsPage() {
  const router = useRouter()
  const { checkPermission } = usePermissions()

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  return (
    <>
      <Head>
        <title>Company Settings - WePro</title>
        <meta name="description" content="Manage company settings" />
      </Head>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/company/profile')}
            className="flex-1 flex items-center justify-center"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Profile
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/company/franchises')}
            className="flex-1 flex items-center justify-center"
          >
            <Users className="w-4 h-4 mr-2" />
            Franchises
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/company/sources')}
            className="flex-1 flex items-center justify-center"
          >
            <Database className="w-4 h-4 mr-2" />
            Sources
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Company Settings
            </h1>
          </div>
          <Button variant="outline" onClick={() => router.push('/settings')}>
            Back to Settings
          </Button>
        </div>

        {/* Content Area */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Company Settings
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Select a tab above to manage company settings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
