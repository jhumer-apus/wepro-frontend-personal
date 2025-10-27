import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { ArrowLeft, Edit, Info, Shield, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/src/store/index'
import { apiService } from '@/src/services/api'
import { usePermissions } from '@/src/hooks/usePermissions'
import { UserData, ApiResponse } from '@/src/constants/interface/users'

export default function ViewTeamMember() {
  const router = useRouter()
  const { checkPermission, getUserType } = usePermissions()

  // Check permission to access this page based on user type
  const userType = getUserType()

  if (userType === 'P1') {
    // P1 users need MOD003 permission
    if (!checkPermission('MOD003', 'view')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Access Denied
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You don't have permission to view this page.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }
  } else if (userType === 'P5') {
    // P5 users need either MOD006 OR MOD003 permission
    if (
      !checkPermission('MOD006', 'view') &&
      !checkPermission('MOD003', 'view')
    ) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Access Denied
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You don't have permission to view this page.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }
  } else {
    // Other user types need MOD006 permission
    if (!checkPermission('MOD006', 'view')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Access Denied
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You don't have permission to view this page.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }
  }

  const { id } = router.query

  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get user data from Redux for tenantId
  const currentUser = useSelector((state: RootState) => state.user.data)

  useEffect(() => {
    const fetchUserData = async () => {
      if (
        id &&
        typeof id === 'string' &&
        router.isReady &&
        currentUser?.tenantId
      ) {
        setLoading(true)
        setError(null)

        try {
          const response = await apiService.get<ApiResponse>(`/v1/users/${id}`)

          if (response.data.success) {
            setUserData(response.data.data)
          } else {
            setError(response.data.message || 'Failed to load user data')
          }
        } catch (error: any) {
          console.error('Error fetching user data:', error)
          setError(error.response?.data?.message || 'Failed to load user data')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserData()
  }, [id, router.isReady, currentUser?.tenantId])

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'P5':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'P4':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'P3':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'P2':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'P1':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'Suspended':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'Deleted':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            {error || 'User Not Found'}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {error || "The user you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.push('/team/teamMembers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team Members
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{userData.name} - View Team Member - Admin Team - WePro</title>
        <meta
          name="description"
          content={`View details for ${userData.name}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/team/teamMembers')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Team Members
          </button>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {userData.name}
            </h1>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Full Name
                  </label>
                  <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {userData.name}
                  </div>
                </div>

                {/* Personnel Type field hidden
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Personnel Type
                  </label>
                  <div className="mt-1">
                    <Badge className={getTypeBadgeColor(userData.type)}>
                      {userData.type}
                    </Badge>
                  </div>
                </div>
                */}

                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Username
                  </label>
                  <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                    {userData.username}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge className={getStatusBadgeColor(userData.status)}>
                      {userData.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Password
                  </label>
                  <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                    ••••••••
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Role Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Role Name
                  </label>
                  <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {userData.roleId.name}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timezone Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timezone Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Timezone Name
                  </label>
                  <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {userData.timezoneId.name}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Timezone Value
                  </label>
                  <div className="mt-1 text-neutral-900 dark:text-neutral-100 font-mono text-sm">
                    {userData.timezoneId.value}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timestamps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created At
                  </label>
                  <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                    {formatDate(userData.createdAt)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Last Updated
                  </label>
                  <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                    {formatDate(userData.updatedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={() =>
                router.push(`/team/teamMembers/create?id=${userData._id}`)
              }
              className="wepro-button-gradient text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Team Member
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
