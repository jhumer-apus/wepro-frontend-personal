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
  CreditCard,
  DollarSign,
  Clock,
  Shield,
  Calendar,
  Code,
  CheckCircle,
  AlertCircle,
  X,
  Building2,
  User,
} from 'lucide-react'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { Loading } from '@/src/components/ui/loading'
import { usePermissions } from '@/src/hooks/usePermissions'

// Interface for Stripe Account data
interface StripeAccount {
  _id: string
  ownerTenantId: string
  ownerType: string
  accountType: string
  stripeConnectAccountId: string
  accountNickname: string
  businessName: string
  isDefault: boolean
  isActive: boolean
  stripeAccountStatus: string
  chargesEnabled: boolean
  detailsSubmitted: boolean
  payoutsEnabled: boolean
  totalVolume: number
  totalTransactions: number
  createdBy: {
    _id: string
    name: string
    username: string
  }
  lastSyncAt: string | null
  assignedToAccounts: any[]
  assignedToSources: any[]
  createdAt: string
  updatedAt: string
  accountCode: string
  displayName: string
  id: string
  stripeSettings: {
    onboardingType: string
    dashboardType: string
  }
}

interface StripeAccountResponse {
  success: boolean
  message: string
  data: StripeAccount
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'restricted':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const getAccountTypeBadgeColor = (accountType: string) => {
  switch (accountType) {
    case 'default':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'secondary':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const getEnabledBadgeColor = (enabled: boolean) => {
  return enabled
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

export default function StripeAccountViewPage(): React.JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const { checkPermission } = usePermissions()

  const [accountData, setAccountData] = useState<StripeAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStripeAccount = async () => {
      if (!id || typeof id !== 'string') return

      try {
        setLoading(true)
        setError(null)
        const response = await apiService.get<StripeAccountResponse>(
          `/v3/stripe-accounts/${id}`
        )

        if (response.data.success) {
          setAccountData(response.data.data)
        } else {
          setError(response.data.message || 'Failed to load Stripe account')
          toast.error('Failed to load Stripe account', {
            description:
              response.data.message ||
              'The Stripe account information could not be retrieved.',
          })
        }
      } catch (err: any) {
        setError('Failed to fetch Stripe account details')
        console.error(err)
        toast.error('Failed to load Stripe account', {
          description:
            err.response?.data?.message ||
            'An error occurred while loading the Stripe account.',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStripeAccount()
  }, [id])

  const handleEdit = () => {
    if (id) {
      router.push(`/stripeAccounts/create?id=${id}`)
    }
  }

  const handleBack = () => {
    router.push('/stripeAccounts')
  }

  // Check permission to access this page
  if (!checkPermission('MOD047', 'view')) {
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
      <>
        <Head>
          <title>Loading Stripe Account - WePro</title>
        </Head>
        <div className="p-6">
          <Loading message="Loading Stripe account details..." />
        </div>
      </>
    )
  }

  if (error || !accountData) {
    return (
      <>
        <Head>
          <title>Stripe Account Not Found - WePro</title>
        </Head>
        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Stripe Accounts
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Stripe Account Not Found
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {error ||
                  'The Stripe account you are looking for does not exist.'}
              </p>
              <Button onClick={handleBack} variant="outline">
                Back to Stripe Accounts
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
          {accountData.displayName} - Stripe Account Details - WePro
        </title>
        <meta
          name="description"
          content={`View details for ${accountData.displayName} Stripe account`}
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
            Back to Stripe Accounts
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {accountData.displayName}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                {accountData.accountNickname}
              </p>
            </div>
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Account
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Account Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Display Name
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {accountData.displayName}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Account Nickname
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {accountData.accountNickname}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Account Code
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Code className="w-4 h-4 text-neutral-500" />
                      <Badge variant="outline" className="font-mono">
                        {accountData.accountCode}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Account Type
                    </label>
                    <div className="mt-1">
                      <Badge
                        className={getAccountTypeBadgeColor(
                          accountData.accountType
                        )}
                      >
                        {accountData.accountType.charAt(0).toUpperCase() +
                          accountData.accountType.slice(1)}
                      </Badge>
                      {accountData.isDefault && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {accountData.businessName && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Business Name
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {accountData.businessName}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Stripe Status
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={getStatusBadgeColor(
                          accountData.stripeAccountStatus
                        )}
                      >
                        {accountData.stripeAccountStatus
                          .charAt(0)
                          .toUpperCase() +
                          accountData.stripeAccountStatus.slice(1)}
                      </Badge>
                      {accountData.isActive ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Details Submitted
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={getEnabledBadgeColor(
                          accountData.detailsSubmitted
                        )}
                      >
                        {accountData.detailsSubmitted ? 'Yes' : 'No'}
                      </Badge>
                      {accountData.detailsSubmitted ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Charges Enabled
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={getEnabledBadgeColor(
                          accountData.chargesEnabled
                        )}
                      >
                        {accountData.chargesEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Payouts Enabled
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={getEnabledBadgeColor(
                          accountData.payoutsEnabled
                        )}
                      >
                        {accountData.payoutsEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Total Volume
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(accountData.totalVolume)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Total Transactions
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {accountData.totalTransactions.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Stripe Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Stripe Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Onboarding Type
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {accountData.stripeSettings.onboardingType
                      .charAt(0)
                      .toUpperCase() +
                      accountData.stripeSettings.onboardingType.slice(1)}
                  </p>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Dashboard Type
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {accountData.stripeSettings.dashboardType
                      .charAt(0)
                      .toUpperCase() +
                      accountData.stripeSettings.dashboardType.slice(1)}
                  </p>
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
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-neutral-500" />
                    <div>
                      <p className="text-neutral-900 dark:text-neutral-100">
                        {accountData.createdBy.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">
                        @{accountData.createdBy.username}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created At
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {formatDate(accountData.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Last Updated
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {formatDate(accountData.updatedAt)}
                  </p>
                </div>

                {accountData.lastSyncAt && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Last Sync
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {formatDate(accountData.lastSyncAt)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Owner Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Owner Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Owner Type
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {accountData.ownerType}
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
