import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import {
  ArrowLeft,
  Building2,
  Edit,
  Package,
  Clock,
  Shield,
} from 'lucide-react'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { Loading } from '@/src/components/ui/loading'
import { Company } from '@/src/constants/interface/company'
import { usePermissions } from '@/src/hooks/usePermissions'

interface TenantUserResponse {
  success: boolean
  message: string
  data: Company
}

export default function SourceProviderViewPage(): React.JSX.Element {
  const router = useRouter()
  const { checkPermission } = usePermissions()
  const { id } = router.query
  const [sourceProviderData, setSourceProviderData] = useState<Company | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSourceProviderData = async () => {
      if (id && typeof id === 'string') {
        setLoading(true)
        setError(null)
        try {
          // Call the actual API endpoint
          const response = await apiService.get<TenantUserResponse>(
            `/v1/users/tenant/${id}`
          )

          if (response.data.success) {
            setSourceProviderData(response.data.data)
          } else {
            setError(
              response.data.message || 'Failed to load source provider data'
            )
            toast.error('Failed to load source provider data', {
              description:
                response.data.message ||
                'The source provider information could not be retrieved.',
            })
          }
        } catch (error: any) {
          console.error('Error fetching source provider data:', error)
          setError(
            error.response?.data?.message ||
              'An error occurred while loading the source provider'
          )
          toast.error('Failed to load source provider data', {
            description:
              error.response?.data?.message ||
              'An error occurred while loading the source provider.',
          })
        } finally {
          setLoading(false)
        }
      }
    }

    fetchSourceProviderData()
  }, [id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleEdit = () => {
    if (id) {
      router.push(`/sourceProviders/create?id=${id}`)
    }
  }

  const handleBack = () => {
    router.push('/sourceProviders')
  }
  // Check permission to access this page
  if (!checkPermission('MOD011', 'view')) {
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
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Source Provider - WePro</title>
        </Head>
        <div className="p-6">
          <Loading message="Loading source provider details..." />
        </div>
      </>
    )
  }

  if (error || !sourceProviderData) {
    return (
      <>
        <Head>
          <title>Source Provider Not Found - WePro</title>
        </Head>
        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Source Providers
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Building2 className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Source Provider Not Found
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {error ||
                  'The source provider you are looking for does not exist.'}
              </p>
              <Button onClick={handleBack} variant="outline">
                Back to Source Providers
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>
          {sourceProviderData.name} - Source Provider Details - WePro
        </title>
        <meta
          name="description"
          content={`View details for ${sourceProviderData.name}`}
        />
      </Head>

      <div className="p-6">
        {/* Back Button and Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Source Providers
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {sourceProviderData.name}
              </h1>
            </div>
            <Button
              onClick={handleEdit}
              className="flex items-center gap-2"
              disabled={!checkPermission('MOD011', 'edit')}
            >
              <Edit className="w-4 h-4" />
              Edit Source Provider
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Source Provider Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Source Provider Name
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {sourceProviderData.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Username
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {sourceProviderData.username}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {formatDate(sourceProviderData.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Last Updated
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {formatDate(sourceProviderData.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Package Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Package Name
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {sourceProviderData.packageId.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Package Type
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {sourceProviderData.packageId.type}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Price
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    ${sourceProviderData.packageId.price}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Public Package
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {sourceProviderData.packageId.isPublic ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timezone Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timezone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Timezone
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {sourceProviderData.timezoneId.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Timezone Value
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {sourceProviderData.timezoneId.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
