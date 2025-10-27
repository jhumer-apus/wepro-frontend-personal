import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { usePermissions } from '@/src/hooks/usePermissions'
// Icons from lucide-react
import {
  Factory,
  Briefcase,
  CheckCircle,
  Tag,
  FileText,
  MapPin,
  Layers,
  Shield,
  Database,
} from 'lucide-react'

export default function JobSettingsPage() {
  const router = useRouter()
  const { checkPermission } = usePermissions()

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  return (
    <>
      <Head>
        <title>Job Settings - WePro</title>
        <meta name="description" content="Manage job settings" />
      </Head>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap space-x-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/job/industry')}
            className="flex items-center justify-center mb-2"
          >
            <Factory className="w-4 h-4 mr-2" />
            Industry
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/job/types')}
            className="flex items-center justify-center mb-2"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Job Types
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/job/categories-types')}
            className="flex items-center justify-center mb-2"
          >
            <Layers className="w-4 h-4 mr-2" />
            Job Industries & Types
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/job/status')}
            className="flex items-center justify-center mb-2"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Job Status
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/job/tags')}
            className="flex items-center justify-center mb-2"
          >
            <Tag className="w-4 h-4 mr-2" />
            Job Tags
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/job/tag-notes')}
            className="flex items-center justify-center mb-2"
          >
            <FileText className="w-4 h-4 mr-2" />
            Job Notes
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/job/metro-area')}
            className="flex items-center justify-center mb-2"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Metro Area
          </Button>

          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/job/custom-fields')}
            className="flex items-center justify-center mb-2"
          >
            <Database className="w-4 h-4 mr-2" />
            Custom Fields
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Job Settings
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
              <Briefcase className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Job Settings
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Select a tab above to manage job settings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
