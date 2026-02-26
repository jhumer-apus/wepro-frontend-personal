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
import { ArrowLeft, Building2, Edit, Package, Shield } from 'lucide-react'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { Loading } from '@/src/components/ui/loading'
import { Industry } from '@/src/constants/interface/industry'
import { usePermissions } from '@/src/hooks/usePermissions'
import { Badge } from '@/src/components/ui/badge'
import { Label } from '@/src/components/ui/label'

interface IndustryResponse {
  success: boolean
  message: string
  data: Industry
}

export default function IndustryViewPage(): React.JSX.Element {
  const router = useRouter()
  const { checkPermission } = usePermissions()

  // Check permission to access this page
  if (!checkPermission('MOD004', 'view')) {
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
  const [industryData, setIndustryData] = useState<Industry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIndustryData = async () => {
      if (id && typeof id === 'string') {
        setLoading(true)
        setError(null)
        try {
          // Call the actual API endpoint
          const response = await apiService.get<IndustryResponse>(
            `/v3/industries/${id}`
          )

          if (response.data.success) {
            setIndustryData(response.data.data)
          } else {
            setError(response.data.message || 'Failed to load industry data')
            toast.error('Failed to load industry data', {
              description:
                response.data.message ||
                'The industry information could not be retrieved.',
            })
          }
        } catch (error: any) {
          console.error('Error fetching industry data:', error)
          setError(
            error.response?.data?.message ||
              'An error occurred while loading the industry'
          )
          toast.error('Failed to load industry data', {
            description:
              error.response?.data?.message ||
              'An error occurred while loading the industry.',
          })
        } finally {
          setLoading(false)
        }
      }
    }

    if (id) {
      fetchIndustryData()
    }
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

  const getStatusBadgeColor = (active: boolean) => {
    return active
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }

  const getP1BadgeColor = (isP1: boolean) => {
    return isP1
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  if (loading) {
    return <Loading message="Loading industry data..." />
  }

  if (error || !industryData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
            <Building2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Error Loading Industry
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {error || 'The industry information could not be loaded.'}
          </p>
          <div className="mt-6 space-x-3">
            <Button
              onClick={() => router.push('/industries')}
              variant="outline"
            >
              Back to Industries
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="wepro-button-gradient text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{industryData.name} - Industry Details - WePro</title>
        <meta
          name="description"
          content={`View details for ${industryData.name} industry`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/industries')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Industries
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {industryData.name}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Industry Details
              </p>
            </div>
          </div>
          {checkPermission('MOD004', 'edit') && (
            <Button
              onClick={() =>
                router.push(`/industries/create?id=${industryData._id}`)
              }
              className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Industry
            </Button>
          )}
        </div>

        {/* Industry Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Industry Name
                  </Label>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                    {industryData.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Industry Code
                  </Label>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                    {industryData.code}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    P1 Status
                  </Label>
                  <div className="mt-1">
                    <Badge className={getP1BadgeColor(industryData.isP1)}>
                      {industryData.isP1 ? 'P1 Eligible' : 'Non-P1'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Status
                  </Label>
                  <div className="mt-1">
                    <Badge className={getStatusBadgeColor(industryData.active)}>
                      {industryData.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created At
                  </Label>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                    {formatDate(industryData.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Last Updated
                  </Label>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                    {formatDate(industryData.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Industry ID
                  </Label>
                  <p className="text-sm font-mono text-neutral-900 dark:text-neutral-100 mt-1">
                    {industryData._id}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Version
                  </Label>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                    {industryData.__v}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {checkPermission('MOD004', 'edit') && (
                <Button
                  onClick={() =>
                    router.push(`/industries/create?id=${industryData._id}`)
                  }
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Industry
                </Button>
              )}
              <Button
                onClick={() => router.push('/industries')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                View All Industries
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
