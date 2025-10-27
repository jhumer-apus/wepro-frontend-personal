import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import {
  Building2,
  Edit,
  Save,
  X,
  Factory,
  Briefcase,
  Shield,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePermissions } from '@/src/hooks/usePermissions'

export default function CompanyProfilePage() {
  const router = useRouter()
  const { checkPermission, getUserType } = usePermissions()
  const [isEditing, setIsEditing] = useState(false)
  const userType = getUserType()

  const TABS = [
    ...((getUserType() !== 'P1' && checkPermission('MOD008', 'view')) || true
      ? [
          {
            key: 'companyProfile',
            label: 'Company Profile',
            icon: Building2,
            path: '/settings/companyProfile',
          },
        ]
      : []),
    ...(checkPermission('MOD012', 'view') || checkPermission('MOD013', 'view')
      ? [
          {
            key: 'industry',
            label: 'Industry',
            icon: Factory,
            path: '/settings/industry',
          },
        ]
      : []),
    ...(checkPermission('MOD014', 'view') || checkPermission('MOD015', 'view')
      ? [
          {
            key: 'jobType',
            label: 'Job Type',
            icon: Briefcase,
            path: '/settings/jobType',
          },
        ]
      : []),
  ]

  useEffect(() => {
    if (userType === 'P1') {
      router.push('/settings/industry')
    }
  }, [userType, router])

  if (userType === 'P1') {
    return null // Return null while redirecting
  }

  // Check permission to access this page
  if (!(getUserType() !== 'P1' && checkPermission('MOD008', 'view'))) {
    // if (checkPermission('MOD012', 'view')) {
    //   router.push('/settings/industry');
    //   return null; // Return null while redirecting
    // } else {
    //   router.push('/settings/jobType');
    //   return null; // Return null while redirecting
    // }
  }

  return (
    <>
      <Head>
        <title>Company Profile - Settings - WePro</title>
        <meta
          name="description"
          content="Manage your company profile and business information"
        />
      </Head>

      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = tab.key === 'companyProfile'
            return (
              <Button
                key={tab.key}
                variant={isActive ? 'default' : 'ghost'}
                className="flex-1 flex items-center justify-center"
                onClick={() => router.push(tab.path)}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span>{tab.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Company Profile
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={() => setIsEditing(false)}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Card className="wepro-card wepro-card-dark">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 dark:text-neutral-400">
              Company profile management features coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
