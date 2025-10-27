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
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import {
  ArrowLeft,
  CreditCard,
  Save,
  Shield,
  DollarSign,
  Building2,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { Loading, ButtonLoading } from '@/src/components/ui/loading'
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
  logoUrl: string
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
  creditCardProcessingFees: {
    paidBy: string
  }
  weproFeeConfiguration: {
    weproFeeType: string
    weproFee: {
      $numberDecimal: string
    }
    weproAdditionalCharges: {
      $numberDecimal: string
    }
  }
  weproInvoice: {
    companyName: string
    companyEmail: string
    companyPhone: string
    address: string
    addressLine2: string
    city: string
    state: string
    zipCode: string
    country: string
    addressId: string
    lat: number | null
    lng: number | null
  }
}

interface StripeAccountResponse {
  success: boolean
  message: string
  data: StripeAccount
}

interface FormData {
  accountNickname: string
  businessName: string
  isDefault: boolean
  isActive: boolean
  stripeSettings: {
    onboardingType: string
    dashboardType: string
  }
  creditCardProcessingFees: {
    paidBy: string
  }
  weproFeeConfiguration: {
    weproFeeType: string
    weproFee: string
    weproAdditionalCharges: string
  }
  weproInvoice: {
    companyName: string
    companyEmail: string
    companyPhone: string
    address: string
    addressLine2: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

interface ValidationErrors {
  accountNickname?: string
  businessName?: string
  stripeSettings?: {
    onboardingType?: string
    dashboardType?: string
  }
  creditCardProcessingFees?: {
    paidBy?: string
  }
  weproFeeConfiguration?: {
    weproFeeType?: string
    weproFee?: string
    weproAdditionalCharges?: string
  }
  weproInvoice?: {
    companyName?: string
    companyEmail?: string
    companyPhone?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
}

export default function CreateStripeAccountPage(): React.JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const { checkPermission } = usePermissions()

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

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState<FormData>({
    accountNickname: '',
    businessName: '',
    isDefault: false,
    isActive: true,
    stripeSettings: {
      onboardingType: 'hosted',
      dashboardType: 'express',
    },
    creditCardProcessingFees: {
      paidBy: 'Company',
    },
    weproFeeConfiguration: {
      weproFeeType: 'No',
      weproFee: '0',
      weproAdditionalCharges: '0',
    },
    weproInvoice: {
      companyName: '',
      companyEmail: '',
      companyPhone: '',
      address: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  })

  // Check if we're editing (id exists in URL)
  const isEditing = Boolean(id)

  // Load Stripe account data if editing
  useEffect(() => {
    const loadStripeAccountData = async () => {
      if (isEditing && id && typeof id === 'string') {
        setIsLoading(true)
        try {
          const response = await apiService.get<StripeAccountResponse>(
            `/v1/stripe-accounts/${id}`
          )
          if (response.data.success && response.data.data) {
            const accountData = response.data.data
            setFormData({
              accountNickname: accountData.accountNickname,
              businessName: accountData.businessName,
              isDefault: accountData.isDefault,
              isActive: accountData.isActive,
              stripeSettings: {
                onboardingType: accountData.stripeSettings.onboardingType,
                dashboardType: accountData.stripeSettings.dashboardType,
              },
              creditCardProcessingFees: {
                paidBy: accountData.creditCardProcessingFees.paidBy,
              },
              weproFeeConfiguration: {
                weproFeeType: accountData.weproFeeConfiguration.weproFeeType,
                weproFee:
                  accountData.weproFeeConfiguration.weproFee.$numberDecimal,
                weproAdditionalCharges:
                  accountData.weproFeeConfiguration.weproAdditionalCharges
                    .$numberDecimal,
              },
              weproInvoice: {
                companyName: accountData.weproInvoice.companyName,
                companyEmail: accountData.weproInvoice.companyEmail,
                companyPhone: accountData.weproInvoice.companyPhone,
                address: accountData.weproInvoice.address,
                addressLine2: accountData.weproInvoice.addressLine2,
                city: accountData.weproInvoice.city,
                state: accountData.weproInvoice.state,
                zipCode: accountData.weproInvoice.zipCode,
                country: accountData.weproInvoice.country,
              },
            })
          }
        } catch (error) {
          console.error('Error loading Stripe account data:', error)
          toast.error('Failed to load Stripe account', {
            description: 'An error occurred while loading the account data.',
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadStripeAccountData()
  }, [id, isEditing])

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear validation error when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleNestedInputChange = (
    parentField: keyof FormData,
    childField: string,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value,
      },
    }))

    // Clear validation error when user starts typing
    if (validationErrors[parentField]?.[childField as keyof any]) {
      setValidationErrors(prev => ({
        ...prev,
        [parentField]: {
          ...prev[parentField],
          [childField]: undefined,
        },
      }))
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // Validate account nickname
    if (!formData.accountNickname.trim()) {
      errors.accountNickname = 'Account nickname is required'
    } else if (formData.accountNickname.length > 100) {
      errors.accountNickname = 'Account nickname must not exceed 100 characters'
    }

    // Validate business name
    if (formData.businessName && formData.businessName.length > 100) {
      errors.businessName = 'Business name must not exceed 100 characters'
    }

    // Validate Stripe settings
    const stripeSettingsErrors: ValidationErrors['stripeSettings'] = {}
    if (!formData.stripeSettings.onboardingType) {
      stripeSettingsErrors.onboardingType = 'Onboarding type is required'
    }
    if (!formData.stripeSettings.dashboardType) {
      stripeSettingsErrors.dashboardType = 'Dashboard type is required'
    }
    if (Object.keys(stripeSettingsErrors).length > 0) {
      errors.stripeSettings = stripeSettingsErrors
    }

    // Validate credit card processing fees
    const creditCardErrors: ValidationErrors['creditCardProcessingFees'] = {}
    if (!formData.creditCardProcessingFees.paidBy) {
      creditCardErrors.paidBy = 'Payment responsibility is required'
    }
    if (Object.keys(creditCardErrors).length > 0) {
      errors.creditCardProcessingFees = creditCardErrors
    }

    // Validate WePro fee configuration
    const weproFeeErrors: ValidationErrors['weproFeeConfiguration'] = {}
    if (!formData.weproFeeConfiguration.weproFeeType) {
      weproFeeErrors.weproFeeType = 'WePro fee type is required'
    }
    if (formData.weproFeeConfiguration.weproFeeType !== 'No') {
      if (!formData.weproFeeConfiguration.weproFee.trim()) {
        weproFeeErrors.weproFee =
          'WePro fee is required when fee type is not "No"'
      } else if (
        isNaN(parseFloat(formData.weproFeeConfiguration.weproFee)) ||
        parseFloat(formData.weproFeeConfiguration.weproFee) < 0
      ) {
        weproFeeErrors.weproFee = 'WePro fee must be a valid positive number'
      }
      if (!formData.weproFeeConfiguration.weproAdditionalCharges.trim()) {
        weproFeeErrors.weproAdditionalCharges =
          'Additional charges are required when fee type is not "No"'
      } else if (
        isNaN(
          parseFloat(formData.weproFeeConfiguration.weproAdditionalCharges)
        ) ||
        parseFloat(formData.weproFeeConfiguration.weproAdditionalCharges) < 0
      ) {
        weproFeeErrors.weproAdditionalCharges =
          'Additional charges must be a valid positive number'
      }
    }
    if (Object.keys(weproFeeErrors).length > 0) {
      errors.weproFeeConfiguration = weproFeeErrors
    }

    // Validate WePro invoice information
    const weproInvoiceErrors: ValidationErrors['weproInvoice'] = {}
    if (
      formData.weproInvoice.companyName &&
      formData.weproInvoice.companyName.length > 100
    ) {
      weproInvoiceErrors.companyName =
        'Company name must not exceed 100 characters'
    }
    if (
      formData.weproInvoice.companyEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.weproInvoice.companyEmail)
    ) {
      weproInvoiceErrors.companyEmail = 'Please enter a valid email address'
    }
    if (
      formData.weproInvoice.companyPhone &&
      formData.weproInvoice.companyPhone.length > 20
    ) {
      weproInvoiceErrors.companyPhone =
        'Phone number must not exceed 20 characters'
    }
    if (
      formData.weproInvoice.address &&
      formData.weproInvoice.address.length > 200
    ) {
      weproInvoiceErrors.address = 'Address must not exceed 200 characters'
    }
    if (formData.weproInvoice.city && formData.weproInvoice.city.length > 50) {
      weproInvoiceErrors.city = 'City must not exceed 50 characters'
    }
    if (
      formData.weproInvoice.state &&
      formData.weproInvoice.state.length > 50
    ) {
      weproInvoiceErrors.state = 'State must not exceed 50 characters'
    }
    if (
      formData.weproInvoice.zipCode &&
      formData.weproInvoice.zipCode.length > 20
    ) {
      weproInvoiceErrors.zipCode = 'Zip code must not exceed 20 characters'
    }
    if (
      formData.weproInvoice.country &&
      formData.weproInvoice.country.length > 50
    ) {
      weproInvoiceErrors.country = 'Country must not exceed 50 characters'
    }
    if (Object.keys(weproInvoiceErrors).length > 0) {
      errors.weproInvoice = weproInvoiceErrors
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form data
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting')
      return
    }

    setIsSaving(true)

    try {
      // Prepare the payload
      const payload = {
        accountNickname: formData.accountNickname,
        businessName: formData.businessName,
        isDefault: formData.isDefault,
        isActive: formData.isActive,
        stripeSettings: {
          onboardingType: formData.stripeSettings.onboardingType,
          dashboardType: formData.stripeSettings.dashboardType,
        },
        creditCardProcessingFees: {
          paidBy: formData.creditCardProcessingFees.paidBy,
        },
        weproFeeConfiguration: {
          weproFeeType: formData.weproFeeConfiguration.weproFeeType,
          weproFee: {
            $numberDecimal: formData.weproFeeConfiguration.weproFee,
          },
          weproAdditionalCharges: {
            $numberDecimal:
              formData.weproFeeConfiguration.weproAdditionalCharges,
          },
        },
        weproInvoice: {
          companyName: formData.weproInvoice.companyName,
          companyEmail: formData.weproInvoice.companyEmail,
          companyPhone: formData.weproInvoice.companyPhone,
          address: formData.weproInvoice.address,
          addressLine2: formData.weproInvoice.addressLine2,
          city: formData.weproInvoice.city,
          state: formData.weproInvoice.state,
          zipCode: formData.weproInvoice.zipCode,
          country: formData.weproInvoice.country,
        },
      }

      // Make API call to create or update the Stripe account
      if (isEditing && id) {
        console.log('Updating Stripe account:', { id, payload })
        const response = await apiService.put(
          `/v1/stripe-accounts/${id}`,
          payload
        )
        console.log('Stripe account updated successfully:', response.data)

        // Show success toast for update
        toast.success('Stripe account updated successfully!', {
          description: 'The Stripe account information has been updated.',
        })
      } else {
        console.log('Creating Stripe account:', payload)
        const response = await apiService.post('/v1/stripe-accounts', payload)
        console.log('Stripe account created successfully:', response.data)

        // Show success toast for creation
        toast.success('Stripe account created successfully!', {
          description: 'The new Stripe account has been added to the system.',
        })
      }

      // Redirect back to Stripe accounts page after a short delay to show the toast
      setTimeout(() => {
        router.push('/stripeAccounts')
      }, 1000)
    } catch (error: any) {
      console.error('Error saving Stripe account:', error)
      // Show error toast
      toast.error('Failed to save Stripe account', {
        description:
          error.response?.data?.message ||
          'An error occurred while saving the Stripe account.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/stripeAccounts')
  }

  if (isLoading) {
    return (
      <>
        <Head>
          <title>
            {isEditing ? 'Edit Stripe Account' : 'Create Stripe Account'} -
            WePro
          </title>
          <meta
            name="description"
            content={
              isEditing
                ? 'Edit Stripe account details'
                : 'Create a new Stripe account'
            }
          />
        </Head>
        <div className="p-6">
          <Loading message="Loading Stripe account details..." />
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>
          {isEditing ? 'Edit Stripe Account' : 'Create Stripe Account'} - WePro
        </title>
        <meta
          name="description"
          content={
            isEditing
              ? 'Edit Stripe account details'
              : 'Create a new Stripe account'
          }
        />
      </Head>

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Stripe Accounts
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEditing ? 'Edit Stripe Account' : 'Create New Stripe Account'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Basic Information
                </CardTitle>

                {/* Active/Inactive Toggle */}
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="isActive"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    {formData.isActive ? 'Active Account' : 'Inactive Account'}
                  </Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Nickname */}
              <div className="space-y-2">
                <Label htmlFor="accountNickname">Account Nickname *</Label>
                <Input
                  id="accountNickname"
                  value={formData.accountNickname}
                  onChange={e =>
                    handleInputChange('accountNickname', e.target.value)
                  }
                  placeholder="Enter account nickname"
                  maxLength={100}
                  required
                  className={
                    validationErrors.accountNickname
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                {validationErrors.accountNickname && (
                  <p className="text-sm text-red-500">
                    {validationErrors.accountNickname}
                  </p>
                )}
                <p
                  className={`text-xs ${
                    formData.accountNickname.length > 100
                      ? 'text-red-500'
                      : formData.accountNickname.length > 80
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {formData.accountNickname.length}/100 characters
                </p>
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={e =>
                    handleInputChange('businessName', e.target.value)
                  }
                  placeholder="Enter business name"
                  maxLength={100}
                  className={
                    validationErrors.businessName
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                {validationErrors.businessName && (
                  <p className="text-sm text-red-500">
                    {validationErrors.businessName}
                  </p>
                )}
                <p
                  className={`text-xs ${
                    formData.businessName.length > 100
                      ? 'text-red-500'
                      : formData.businessName.length > 80
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {formData.businessName.length}/100 characters
                </p>
              </div>

              {/* Default Account Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={checked =>
                    setFormData(prev => ({ ...prev, isDefault: checked }))
                  }
                />
                <Label
                  htmlFor="isDefault"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Set as Default Account
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Stripe Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Stripe Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Onboarding Type */}
                <div className="space-y-2">
                  <Label htmlFor="onboardingType">Onboarding Type *</Label>
                  <Select
                    value={formData.stripeSettings.onboardingType}
                    onValueChange={value => {
                      handleNestedInputChange(
                        'stripeSettings',
                        'onboardingType',
                        value
                      )
                      if (validationErrors.stripeSettings?.onboardingType) {
                        setValidationErrors(prev => ({
                          ...prev,
                          stripeSettings: {
                            ...prev.stripeSettings,
                            onboardingType: undefined,
                          },
                        }))
                      }
                    }}
                    required
                  >
                    <SelectTrigger
                      className={
                        validationErrors.stripeSettings?.onboardingType
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }
                    >
                      <SelectValue placeholder="Select onboarding type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hosted">Hosted</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.stripeSettings?.onboardingType && (
                    <p className="text-sm text-red-500">
                      {validationErrors.stripeSettings.onboardingType}
                    </p>
                  )}
                </div>

                {/* Dashboard Type */}
                <div className="space-y-2">
                  <Label htmlFor="dashboardType">Dashboard Type *</Label>
                  <Select
                    value={formData.stripeSettings.dashboardType}
                    onValueChange={value => {
                      handleNestedInputChange(
                        'stripeSettings',
                        'dashboardType',
                        value
                      )
                      if (validationErrors.stripeSettings?.dashboardType) {
                        setValidationErrors(prev => ({
                          ...prev,
                          stripeSettings: {
                            ...prev.stripeSettings,
                            dashboardType: undefined,
                          },
                        }))
                      }
                    }}
                    required
                  >
                    <SelectTrigger
                      className={
                        validationErrors.stripeSettings?.dashboardType
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }
                    >
                      <SelectValue placeholder="Select dashboard type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.stripeSettings?.dashboardType && (
                    <p className="text-sm text-red-500">
                      {validationErrors.stripeSettings.dashboardType}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Card Processing Fees Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Credit Card Processing Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="paidBy">Processing Fees Paid By *</Label>
                <Select
                  value={formData.creditCardProcessingFees.paidBy}
                  onValueChange={value => {
                    handleNestedInputChange(
                      'creditCardProcessingFees',
                      'paidBy',
                      value
                    )
                    if (validationErrors.creditCardProcessingFees?.paidBy) {
                      setValidationErrors(prev => ({
                        ...prev,
                        creditCardProcessingFees: {
                          ...prev.creditCardProcessingFees,
                          paidBy: undefined,
                        },
                      }))
                    }
                  }}
                  required
                >
                  <SelectTrigger
                    className={
                      validationErrors.creditCardProcessingFees?.paidBy
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                  >
                    <SelectValue placeholder="Select who pays processing fees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Company">Company</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.creditCardProcessingFees?.paidBy && (
                  <p className="text-sm text-red-500">
                    {validationErrors.creditCardProcessingFees.paidBy}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* WePro Fee Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                WePro Fee Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="weproFeeType">WePro Fee Type *</Label>
                <Select
                  value={formData.weproFeeConfiguration.weproFeeType}
                  onValueChange={value => {
                    handleNestedInputChange(
                      'weproFeeConfiguration',
                      'weproFeeType',
                      value
                    )
                    if (validationErrors.weproFeeConfiguration?.weproFeeType) {
                      setValidationErrors(prev => ({
                        ...prev,
                        weproFeeConfiguration: {
                          ...prev.weproFeeConfiguration,
                          weproFeeType: undefined,
                        },
                      }))
                    }
                  }}
                  required
                >
                  <SelectTrigger
                    className={
                      validationErrors.weproFeeConfiguration?.weproFeeType
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                  >
                    <SelectValue placeholder="Select WePro fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">No Fee</SelectItem>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                    <SelectItem value="Fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.weproFeeConfiguration?.weproFeeType && (
                  <p className="text-sm text-red-500">
                    {validationErrors.weproFeeConfiguration.weproFeeType}
                  </p>
                )}
              </div>

              {formData.weproFeeConfiguration.weproFeeType !== 'No' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* WePro Fee */}
                  <div className="space-y-2">
                    <Label htmlFor="weproFee">WePro Fee *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                        {formData.weproFeeConfiguration.weproFeeType ===
                        'Percentage'
                          ? '%'
                          : '$'}
                      </span>
                      <Input
                        id="weproFee"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.weproFeeConfiguration.weproFee}
                        onChange={e =>
                          handleNestedInputChange(
                            'weproFeeConfiguration',
                            'weproFee',
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        className={`pl-8 ${
                          validationErrors.weproFeeConfiguration?.weproFee
                            ? 'border-red-500 focus:border-red-500'
                            : ''
                        }`}
                        required
                      />
                    </div>
                    {validationErrors.weproFeeConfiguration?.weproFee && (
                      <p className="text-sm text-red-500">
                        {validationErrors.weproFeeConfiguration.weproFee}
                      </p>
                    )}
                  </div>

                  {/* Additional Charges */}
                  <div className="space-y-2">
                    <Label htmlFor="weproAdditionalCharges">
                      Additional Charges *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                        $
                      </span>
                      <Input
                        id="weproAdditionalCharges"
                        type="number"
                        step="0.01"
                        min="0"
                        value={
                          formData.weproFeeConfiguration.weproAdditionalCharges
                        }
                        onChange={e =>
                          handleNestedInputChange(
                            'weproFeeConfiguration',
                            'weproAdditionalCharges',
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        className={`pl-8 ${
                          validationErrors.weproFeeConfiguration
                            ?.weproAdditionalCharges
                            ? 'border-red-500 focus:border-red-500'
                            : ''
                        }`}
                        required
                      />
                    </div>
                    {validationErrors.weproFeeConfiguration
                      ?.weproAdditionalCharges && (
                      <p className="text-sm text-red-500">
                        {
                          validationErrors.weproFeeConfiguration
                            .weproAdditionalCharges
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* WePro Invoice Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                WePro Invoice Information
              </CardTitle>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Optional billing information for WePro invoices
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.weproInvoice.companyName}
                    onChange={e =>
                      handleNestedInputChange(
                        'weproInvoice',
                        'companyName',
                        e.target.value
                      )
                    }
                    placeholder="Enter company name"
                    maxLength={100}
                    className={
                      validationErrors.weproInvoice?.companyName
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                  />
                  {validationErrors.weproInvoice?.companyName && (
                    <p className="text-sm text-red-500">
                      {validationErrors.weproInvoice.companyName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={formData.weproInvoice.companyEmail}
                    onChange={e =>
                      handleNestedInputChange(
                        'weproInvoice',
                        'companyEmail',
                        e.target.value
                      )
                    }
                    placeholder="Enter company email"
                    className={
                      validationErrors.weproInvoice?.companyEmail
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                  />
                  {validationErrors.weproInvoice?.companyEmail && (
                    <p className="text-sm text-red-500">
                      {validationErrors.weproInvoice.companyEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="companyPhone">Company Phone</Label>
                <Input
                  id="companyPhone"
                  value={formData.weproInvoice.companyPhone}
                  onChange={e =>
                    handleNestedInputChange(
                      'weproInvoice',
                      'companyPhone',
                      e.target.value
                    )
                  }
                  placeholder="Enter company phone"
                  maxLength={20}
                  className={
                    validationErrors.weproInvoice?.companyPhone
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                {validationErrors.weproInvoice?.companyPhone && (
                  <p className="text-sm text-red-500">
                    {validationErrors.weproInvoice.companyPhone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.weproInvoice.address}
                  onChange={e =>
                    handleNestedInputChange(
                      'weproInvoice',
                      'address',
                      e.target.value
                    )
                  }
                  placeholder="Enter street address"
                  maxLength={200}
                  className={
                    validationErrors.weproInvoice?.address
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                {validationErrors.weproInvoice?.address && (
                  <p className="text-sm text-red-500">
                    {validationErrors.weproInvoice.address}
                  </p>
                )}
              </div>

              {/* Address Line 2 */}
              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  value={formData.weproInvoice.addressLine2}
                  onChange={e =>
                    handleNestedInputChange(
                      'weproInvoice',
                      'addressLine2',
                      e.target.value
                    )
                  }
                  placeholder="Apartment, suite, unit, etc."
                  maxLength={200}
                />
              </div>

              {/* City, State, Zip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.weproInvoice.city}
                    onChange={e =>
                      handleNestedInputChange(
                        'weproInvoice',
                        'city',
                        e.target.value
                      )
                    }
                    placeholder="Enter city"
                    maxLength={50}
                    className={
                      validationErrors.weproInvoice?.city
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                  />
                  {validationErrors.weproInvoice?.city && (
                    <p className="text-sm text-red-500">
                      {validationErrors.weproInvoice.city}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.weproInvoice.state}
                    onChange={e =>
                      handleNestedInputChange(
                        'weproInvoice',
                        'state',
                        e.target.value
                      )
                    }
                    placeholder="Enter state"
                    maxLength={50}
                    className={
                      validationErrors.weproInvoice?.state
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                  />
                  {validationErrors.weproInvoice?.state && (
                    <p className="text-sm text-red-500">
                      {validationErrors.weproInvoice.state}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.weproInvoice.zipCode}
                    onChange={e =>
                      handleNestedInputChange(
                        'weproInvoice',
                        'zipCode',
                        e.target.value
                      )
                    }
                    placeholder="Enter zip code"
                    maxLength={20}
                    className={
                      validationErrors.weproInvoice?.zipCode
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                  />
                  {validationErrors.weproInvoice?.zipCode && (
                    <p className="text-sm text-red-500">
                      {validationErrors.weproInvoice.zipCode}
                    </p>
                  )}
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.weproInvoice.country}
                  onChange={e =>
                    handleNestedInputChange(
                      'weproInvoice',
                      'country',
                      e.target.value
                    )
                  }
                  placeholder="Enter country"
                  maxLength={50}
                  className={
                    validationErrors.weproInvoice?.country
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                {validationErrors.weproInvoice?.country && (
                  <p className="text-sm text-red-500">
                    {validationErrors.weproInvoice.country}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isSaving}
            >
              {isSaving ? (
                <ButtonLoading
                  message={isEditing ? 'Updating...' : 'Creating...'}
                />
              ) : (
                <>
                  {isEditing ? (
                    <Save className="w-4 h-4 mr-2" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  {isEditing ? 'Update Account' : 'Create Account'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
