import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { SettingsNavigation } from '@/src/components/job'
import { usePermissions } from '@/src/hooks/usePermissions'
import {
  MessageSquare,
  Phone,
  Mail,
  Briefcase,
  Receipt,
  ExternalLink,
} from 'lucide-react'

export default function TemplatesSettingsPage() {
  const router = useRouter()
  const { checkPermission } = usePermissions()

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  return (
    <>
      <Head>
        <title>Templates - WePro</title>
        <meta name="description" content="Manage system templates" />
      </Head>
      <div className="space-y-6">
        {/* Main Tab Navigation */}
        <SettingsNavigation />

        {/* Tab Navigation */}
        <div className="flex flex-wrap space-x-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/templates/sms')}
            className="flex items-center justify-center mb-2"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            SMS Templates
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/templates/voice')}
            className="flex items-center justify-center mb-2"
          >
            <Phone className="w-4 h-4 mr-2" />
            Voice Templates
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/templates/email')}
            className="flex items-center justify-center mb-2"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Templates
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/templates/jobs')}
            className="flex items-center justify-center mb-2"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Jobs Templates
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/templates/invoice')}
            className="flex items-center justify-center mb-2"
          >
            <Receipt className="w-4 h-4 mr-2" />
            Invoice Templates
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/settings/templates/external-jobs')}
            className="flex items-center justify-center mb-2"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            External Job Templates
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Templates
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
              <MessageSquare className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Templates
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Select a tab above to manage system templates
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
