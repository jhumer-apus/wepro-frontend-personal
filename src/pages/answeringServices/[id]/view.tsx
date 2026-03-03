import React, { useState, useEffect } from 'react'
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
import { useSelector } from 'react-redux'
import { RootState } from '@/src/store'
import { usePermissions } from '@/src/hooks/usePermissions'

interface TenantUserResponse {
  success: boolean
  message: string
  data: Company
}

export default function AnsweringServiceViewPage(): React.JSX.Element {
  const router = useRouter()
  const { checkPermission } = usePermissions()

  // Check permission to access this page
  if (!checkPermission('MOD005', 'view')) {
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

  const { id } = router.query
  const [answeringServiceData, setAnsweringServiceData] =
    useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get user data from Redux store to access tenantId
  const userData = useSelector((state: RootState) => state.user.data)

  useEffect(() => {
    const fetchAnsweringServiceData = async () => {
      if (id && typeof id === 'string' && userData?.tenantId) {
        setLoading(true)
        setError(null)
        try {
          // Call the actual API endpoint
          const response = await apiService.get<TenantUserResponse>(
            `/v3/users/tenant/${id}?tenantId=${userData.tenantId}`
          )

          if (response.data.success) {
            setAnsweringServiceData(response.data.data)
          } else {
            setError(
              response.data.message || 'Failed to load answering service data'
            )
            toast.error('Failed to load answering service data', {
              description:
                response.data.message ||
                'The answering service information could not be retrieved.',
            })
          }
        } catch (error: any) {
          console.error('Error fetching answering service data:', error)
          setError(
            error.response?.data?.message ||
              'An error occurred while loading the answering service'
          )
          toast.error('Failed to load answering service data', {
            description:
              error.response?.data?.message ||
              'An error occurred while loading the answering service.',
          })
        } finally {
          setLoading(false)
        }
      } else if (!userData?.tenantId) {
        setError('No tenant ID available')
        setLoading(false)
        toast.error('Configuration Error', {
          description: 'Tenant ID is not available. Please contact support.',
        })
      }
    }

    fetchAnsweringServiceData()
  }, [id, userData?.tenantId])

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
      router.push(`/answeringServices/create?id=${id}`)
    }
  }

  const handleBack = () => {
    router.push('/answeringServices')
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Answering Service - WePro</title>
        </Head>
        <div className="p-6">
          <Loading message="Loading answering service details..." />
        </div>
      </>
    )
  }

  if (error || !answeringServiceData) {
    return (
      <>
        <Head>
          <title>Answering Service Not Found - WePro</title>
        </Head>
        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Answering Services
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Building2 className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Answering Service Not Found
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {error ||
                  'The answering service you are looking for does not exist.'}
              </p>
              <Button onClick={handleBack} variant="outline">
                Back to Answering Services
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Short helpers for packageId/timezoneId (string | object)
  const pkg = answeringServiceData?.packageId
  const tz = answeringServiceData?.timezoneId
  const pkgName = (pkg && typeof pkg === 'object' ? pkg.name : pkg) ?? '-'
  const pkgType = (pkg && typeof pkg === 'object' ? pkg.type : null) ?? '-'
  const pkgPrice = (pkg && typeof pkg === 'object' ? pkg.price : null) ?? '-'
  const pkgPublic = pkg && typeof pkg === 'object' && 'isPublic' in pkg ? (pkg.isPublic ? 'Yes' : 'No') : '-'
  const tzName = (tz && typeof tz === 'object' ? tz.name : tz) ?? '-'
  const tzValue = (tz && typeof tz === 'object' ? tz.value : null) ?? '-'

  return (
    <>
      <Head>
        <title>
          {answeringServiceData.name} - Answering Service Details - WePro
        </title>
        <meta
          name="description"
          content={`View details for ${answeringServiceData.name}`}
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
            Back to Answering Services
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {answeringServiceData.name}
              </h1>
            </div>
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Answering Service
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Answering Service Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Answering Service Name
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {answeringServiceData.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Username
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {answeringServiceData.username}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {formatDate(answeringServiceData.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Last Updated
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {formatDate(answeringServiceData.updatedAt)}
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
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">{pkgName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Package Type
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">{pkgType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Price
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">{pkgPrice !== '-' ? `$${pkgPrice}` : '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Public Package
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">{pkgPublic}</p>
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
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">{tzName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Timezone Value
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">{tzValue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
