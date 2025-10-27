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
import { Badge } from '@/src/components/ui/badge'
import { Separator } from '@/src/components/ui/separator'
import {
  ArrowLeft,
  Edit,
  Package,
  DollarSign,
  Clock,
  Users,
  Shield,
  Calendar,
  Code,
} from 'lucide-react'
import { ServicePackage } from '@/src/constants/interface/servicePackage'
import { apiService } from '@/src/services/api'
import { useAppSelector } from '@/src/store/hooks'
import { toast } from 'sonner'
import { usePermissions } from '@/src/hooks/usePermissions'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

const getChargeModelBadgeColor = (chargeModel: string) => {
  switch (chargeModel) {
    case 'call':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'minute':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'monthly':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const getStatusBadgeColor = (isActive: boolean) => {
  return isActive
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

export default function ServicePackageViewPage(): React.JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const { getUserType, checkPermission } = usePermissions()
  const user = useAppSelector(state => state.user.data)
  const tenantId = user?.tenantId

  const [packageData, setPackageData] = useState<ServicePackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user type is P1, if not show unauthorized
  const userType = getUserType()

  useEffect(() => {
    const fetchServicePackage = async () => {
      if (!id || typeof id !== 'string') return

      try {
        setLoading(true)
        const response = await apiService.get(
          `/v1/answering-services/packages/${id}`
        )
        setPackageData(response.data.message.package)
        setError(null)
      } catch (err: any) {
        setError('Failed to fetch service package details')
        console.error(err)
        toast.error('Failed to load service package', {
          description:
            err.response?.data?.message ||
            'An error occurred while loading the service package.',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchServicePackage()
  }, [id])

  // Check if user type is P1, if not show unauthorized
  if (!checkPermission('MOD043', 'view')) {
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
            You don&apos;t have permission to view this page.
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
            <Package className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Loading Service Package...
          </h3>
        </div>
      </div>
    )
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
            <Package className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {error || 'Service Package Not Found'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            The service package you&apos;re looking for doesn&apos;t exist or
            you don&apos;t have permission to view it.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => router.push('/servicePackages')}
              variant="outline"
            >
              Back to Service Packages
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{packageData.title} - Service Package Details - WePro</title>
        <meta
          name="description"
          content={`View details for ${packageData.title} service package`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="p-6">
        {/* Back Button and Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/servicePackages')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Service Packages
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {packageData.title}
              </h1>
            </div>
            <Button
              onClick={() =>
                router.push(`/servicePackages/create?id=${packageData._id}`)
              }
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Package
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Package Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Package Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Title
                  </label>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {packageData.title}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Description
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {packageData.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Package Code
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Code className="w-4 h-4 text-neutral-500" />
                      <Badge variant="outline" className="font-mono">
                        {packageData.packageCode}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Status
                    </label>
                    <div className="mt-1">
                      <Badge
                        className={getStatusBadgeColor(packageData.isActive)}
                      >
                        {packageData.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Charge Model
                    </label>
                    <div className="mt-1">
                      <Badge
                        className={getChargeModelBadgeColor(
                          packageData.chargeModel
                        )}
                      >
                        {packageData.chargeModel.charAt(0).toUpperCase() +
                          packageData.chargeModel.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Charge Amount
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatPrice(packageData.chargeAmount)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Charge Over (seconds)
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {packageData.chargeOver} seconds
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Minimum Monthly Spend
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatPrice(packageData.minimumMonthlySpend)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Pricing Description
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-md">
                    {packageData.formattedPricing.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {packageData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-md"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-neutral-900 dark:text-neutral-100">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Visibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Public Package
                    </span>
                    <Badge
                      className={
                        packageData.isPublic
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      }
                    >
                      {packageData.isPublic ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Created Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Created Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created By
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {packageData.createdBy.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500">
                    @{packageData.createdBy.username}
                  </p>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created At
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {formatDate(packageData.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Last Updated
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {formatDate(packageData.updatedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Package ID */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Package ID
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-md">
                  <code className="text-xs text-neutral-600 dark:text-neutral-400 break-all">
                    {packageData._id}
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
