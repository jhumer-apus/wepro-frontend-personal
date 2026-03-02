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
import {
  ArrowLeft,
  Package,
  Users,
  Phone,
  Clock,
  MessageSquare,
  Mail,
  DollarSign,
  Calendar,
  Edit,
  Shield,
} from 'lucide-react'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { Loading } from '@/src/components/ui/loading'
import { Module } from '@/src/constants/interface/module'
import { Package as PackageInterface } from '@/src/constants/interface/package'
import { usePermissions } from '@/src/hooks/usePermissions'

export default function PackageViewPage(): React.JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const { getUserType } = usePermissions()

  // Check if user type is P1, if not show unauthorized
  const userType = getUserType()
  if (userType !== 'P1') {
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

  const [packageData, setPackageData] = useState<PackageInterface | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPackageData = async () => {
      if (id && typeof id === 'string') {
        setLoading(true)
        setError(null)
        try {
          const response = await apiService.get(`/v3/packages/${id}/modules`)
          if (response.data.success && response.data.data) {
            setPackageData(response.data.data)
          } else {
            setError('Failed to load package data')
            toast.error('Failed to load package data', {
              description: 'The package information could not be retrieved.',
            })
          }
        } catch (error: any) {
          console.error('Error fetching package data:', error)
          setError(
            error.response?.data?.message ||
              'An error occurred while loading the package'
          )
          toast.error('Failed to load package data', {
            description:
              error.response?.data?.message ||
              'An error occurred while loading the package.',
          })
        } finally {
          setLoading(false)
        }
      }
    }

    fetchPackageData()
  }, [id])

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'P2':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'P3':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'P4':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getIntervalBadgeColor = (interval: string) => {
    switch (interval) {
      case 'Weekly':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'Monthly':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
      case 'Yearly':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

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

  const handleEdit = () => {
    if (id) {
      router.push(`/packages/create?id=${id}`)
    }
  }

  const handleBack = () => {
    router.push('/packages')
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Package - WePro</title>
        </Head>
        <div className="p-6">
          <Loading message="Loading package details..." />
        </div>
      </>
    )
  }

  if (error || !packageData) {
    return (
      <>
        <Head>
          <title>Package Not Found - WePro</title>
        </Head>
        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Packages
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Package Not Found
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {error || 'The package you are looking for does not exist.'}
              </p>
              <Button onClick={handleBack} variant="outline">
                Back to Packages
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
        <title>{packageData.name} - Package Details - WePro</title>
        <meta
          name="description"
          content={`View details for ${packageData.name} package`}
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
            Back to Packages
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {packageData.name}
              </h1>
            </div>
            <Button onClick={handleEdit} className="flex items-center gap-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Package Name
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {packageData.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Price
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatPrice(packageData.price)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Type
                    </label>
                    <div className="mt-1">
                      <Badge className={getTypeBadgeColor(packageData.type)}>
                        {packageData.type}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Billing Interval
                    </label>
                    <div className="mt-1">
                      <Badge
                        className={getIntervalBadgeColor(packageData.interval)}
                      >
                        {packageData.interval}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Package Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Package Limits
                </CardTitle>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Maximum limits for this package
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Users
                      </p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {packageData.limits.users.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Numbers
                      </p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {packageData.limits.numbers.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Minutes
                      </p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {packageData.limits.minutes.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        SMS
                      </p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {packageData.limits.sms.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        WhatsApp SMS
                      </p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {packageData.limits.whatsappSms.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Emails
                      </p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {packageData.limits.emails.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Additional Pricing
                </CardTitle>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Pricing for usage beyond package limits
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      User Monthly
                    </p>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatPrice(packageData.additionalPricing.userMonthly)}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Number Monthly
                    </p>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatPrice(packageData.additionalPricing.numberMonthly)}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Per Minute
                    </p>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatPrice(packageData.additionalPricing.perMinute)}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Per SMS
                    </p>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatPrice(packageData.additionalPricing.perSms)}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Per WhatsApp SMS
                    </p>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatPrice(
                        packageData.additionalPricing.perWhatsappSms
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Per Email
                    </p>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatPrice(packageData.additionalPricing.perEmail)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Included Modules
                </CardTitle>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {packageData.modules.length} module(s) included in this
                  package
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {packageData.modules.map((moduleItem: Module) => (
                    <div
                      key={moduleItem._id}
                      className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {moduleItem.module.name}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {moduleItem.module.code}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Package Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Package Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created By
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {packageData.createdBy.name}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    @{packageData.createdBy.username}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created
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
          </div>
        </div>
      </div>
    </>
  )
}
