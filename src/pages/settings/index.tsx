import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { useState, useEffect } from 'react'
import { usePermissions } from '@/src/hooks/usePermissions'
import {
  Building2,
  Briefcase,
  Bell,
  FileText,
  Megaphone,
  Settings as SettingsIcon,
  Users,
  Database,
  Factory,
  CheckCircle,
  Tag,
  MapPin,
  MessageSquare,
  Phone,
  Mail,
  Receipt,
  ExternalLink,
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>('company')
  const { checkPermission } = usePermissions()

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  // Redirect to company profile by default
  useEffect(() => {
    if (router.pathname === '/settings') {
      router.push('/settings/company/profile')
    }
  }, [router])

  return (
    <>
      <Head>
        <title>Settings - WePro</title>
        <meta name="description" content="Manage WePro system settings" />
      </Head>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={activeTab === 'company' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('company')}
            className="flex-1 flex items-center justify-center"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Company
          </Button>
          <Button
            variant={activeTab === 'job' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('job')}
            className="flex-1 flex items-center justify-center"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Job
          </Button>
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('notifications')}
            className="flex-1 flex items-center justify-center"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button
            variant={activeTab === 'templates' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('templates')}
            className="flex-1 flex items-center justify-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button
            variant={activeTab === 'knowledgeHub' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('knowledgeHub')}
            className="flex-1 flex items-center justify-center"
          >
            <Megaphone className="w-4 h-4 mr-2" />
            Knowledge Hub
          </Button>
        </div>

        {/* Sub Tab Navigation */}
        {activeTab === 'company' && (
          <div className="flex space-x-1 bg-gray-50 rounded-lg p-1">
            <Button
              variant="ghost"
              onClick={() => handleTabClick('/settings/company/profile')}
              className="flex items-center justify-center"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleTabClick('/settings/company/franchises')}
              className="flex items-center justify-center"
            >
              <Users className="w-4 h-4 mr-2" />
              Franchises
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleTabClick('/settings/company/sources')}
              className="flex items-center justify-center"
            >
              <Database className="w-4 h-4 mr-2" />
              Sources
            </Button>
          </div>
        )}

        {activeTab === 'job' && (
          <div className="flex flex-wrap space-x-1 bg-gray-50 rounded-lg p-1">
            <Button
              variant="ghost"
              onClick={() => handleTabClick('/settings/job/industry')}
              className="flex items-center justify-center mb-1"
            >
              <Factory className="w-4 h-4 mr-2" />
              Industry
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleTabClick('/settings/job/types')}
              className="flex items-center justify-center mb-1"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Job Types
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleTabClick('/settings/job/status')}
              className="flex items-center justify-center mb-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Job Status
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleTabClick('/settings/job/tags')}
              className="flex items-center justify-center mb-1"
            >
              <Tag className="w-4 h-4 mr-2" />
              Job Tags
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleTabClick('/settings/job/tag-notes')}
              className="flex items-center justify-center mb-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Job Tag Notes
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleTabClick('/settings/job/metro-area')}
              className="flex items-center justify-center mb-1"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Metro Area
            </Button>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="flex flex-wrap space-x-1 bg-gray-50 rounded-lg p-1">
            <Button
              variant="ghost"
              onClick={() => handleTabClick('/settings/templates/sms')}
              className="flex items-center justify-center mb-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS Templates
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleTabClick('/settings/templates/voice')}
              className="flex items-center justify-center mb-1"
            >
              <Phone className="w-4 h-4 mr-2" />
              Voice Templates
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleTabClick('/settings/templates/email')}
              className="flex items-center justify-center mb-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Templates
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleTabClick('/settings/templates/jobs')}
              className="flex items-center justify-center mb-1"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Jobs Templates
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleTabClick('/settings/templates/invoice')}
              className="flex items-center justify-center mb-1"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Invoice Templates
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                handleTabClick('/settings/templates/external-jobs')
              }
              className="flex items-center justify-center mb-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              External Job Templates
            </Button>
          </div>
        )}

        {activeTab === 'knowledgeHub' && (
          <div className="flex space-x-1 bg-gray-50 rounded-lg p-1">
            <Button
              variant="ghost"
              onClick={() =>
                handleTabClick('/settings/knowledgeHub/announcements')
              }
              className="flex-1 flex items-center justify-center"
            >
              <Megaphone className="w-4 h-4 mr-2" />
              Knowledge Hub
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleTabClick('/settings/knowledgeHub/scripts')}
              className="flex-1 flex items-center justify-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Notes/Scripts
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Settings
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <SettingsIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                {activeTab === 'company' && 'Company Settings'}
                {activeTab === 'job' && 'Job Settings'}
                {activeTab === 'notifications' && 'Notifications'}
                {activeTab === 'templates' && 'Templates'}
                {activeTab === 'knowledgeHub' && 'Knowledge Hub'}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {activeTab === 'company' &&
                  'Manage company profile, franchises, and sources'}
                {activeTab === 'job' &&
                  'Manage job industry, types, status, tags, and metro areas'}
                {activeTab === 'notifications' &&
                  'Configure system notifications and preferences'}
                {activeTab === 'templates' &&
                  'Manage SMS, Voice, Email, Jobs, Invoice, and External Job templates'}
                {activeTab === 'knowledgeHub' &&
                  'Manage system knowledge hub, notes, and scripts'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
