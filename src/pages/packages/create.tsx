import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { RootState } from '@/src/store/index'
import { usePackageModules } from '@/src/hooks/usePackageModules'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { Loading, ButtonLoading } from '@/src/components/ui/loading'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Switch } from '@/src/components/ui/switch'
import {
  ArrowLeft,
  Package,
  Save,
  Users,
  DollarSign,
  Shield,
} from 'lucide-react'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { PackageModule } from '@/src/constants/interface/module'
import { usePermissions } from '@/src/hooks/usePermissions'

interface FormData {
  name: string
  type: 'P2' | 'P3' | 'P4' | ''
  interval: 'Yearly' | 'Monthly' | 'Weekly' | ''
  price: string
  modules: string[]
  isPublic: boolean
  limits: {
    users: string
    numbers: string
    minutes: string
    sms: string
    whatsappSms: string
    emails: string
  }
  additionalPricing: {
    userMonthly: string
    numberMonthly: string
    perMinute: string
    perSms: string
    perWhatsappSms: string
    perEmail: string
  }
}

interface ValidationErrors {
  name?: string
  type?: string
  interval?: string
  price?: string
  modules?: string
  limits?: {
    users?: string
    numbers?: string
    minutes?: string
    sms?: string
    whatsappSms?: string
    emails?: string
  }
  additionalPricing?: {
    userMonthly?: string
    numberMonthly?: string
    perMinute?: string
    perSms?: string
    perWhatsappSms?: string
    perEmail?: string
  }
}

export default function CreatePackagePage(): React.JSX.Element {
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

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: '',
    interval: '',
    price: '',
    modules: [],
    isPublic: true,
    limits: {
      users: '',
      numbers: '',
      minutes: '',
      sms: '',
      whatsappSms: '',
      emails: '',
    },
    additionalPricing: {
      userMonthly: '',
      numberMonthly: '',
      perMinute: '',
      perSms: '',
      perWhatsappSms: '',
      perEmail: '',
    },
  })

  // Get user data from Redux
  const userData = useSelector((state: RootState) => state.user.data)

  // Use custom hook for package modules
  const { modules: availableModules, loading: modulesLoading } =
    usePackageModules()

  // Check if we're editing (id exists in URL)
  const isEditing = Boolean(id)

  // Load package data if editing
  useEffect(() => {
    const loadPackageData = async () => {
      if (isEditing && id && typeof id === 'string') {
        setIsLoading(true)
        try {
          const response = await apiService.get(`/v1/packages/${id}/modules`)
          if (response.data.success && response.data.data) {
            const packageData = response.data.data
            setFormData({
              name: packageData.name,
              type: packageData.type,
              interval: packageData.interval as 'Yearly' | 'Monthly' | 'Weekly',
              price: packageData.price.toString(),
              modules: packageData.modules.map(
                (m: PackageModule) => m.moduleCode
              ),
              isPublic: packageData.isPublic ?? true,
              limits: {
                users: packageData.limits.users.toString(),
                numbers: packageData.limits.numbers.toString(),
                minutes: packageData.limits.minutes.toString(),
                sms: packageData.limits.sms.toString(),
                whatsappSms: packageData.limits.whatsappSms.toString(),
                emails: packageData.limits.emails.toString(),
              },
              additionalPricing: {
                userMonthly:
                  packageData.additionalPricing.userMonthly.toString(),
                numberMonthly:
                  packageData.additionalPricing.numberMonthly.toString(),
                perMinute: packageData.additionalPricing.perMinute.toString(),
                perSms: packageData.additionalPricing.perSms.toString(),
                perWhatsappSms:
                  packageData.additionalPricing.perWhatsappSms.toString(),
                perEmail: packageData.additionalPricing.perEmail.toString(),
              },
            })
          }
        } catch (error) {
          console.error('Error loading package data:', error)
          // You might want to show an error message to the user here
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadPackageData()
  }, [id, isEditing])

  const handleInputChange = (
    field: keyof FormData,
    value: string | string[]
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

  const handleLimitsChange = (
    field: keyof FormData['limits'],
    value: string
  ) => {
    // Only allow integers (no decimals)
    const integerValue = value.replace(/[^0-9]/g, '')
    setFormData(prev => ({
      ...prev,
      limits: {
        ...prev.limits,
        [field]: integerValue,
      },
    }))

    // Clear validation error when user starts typing
    if (validationErrors.limits?.[field]) {
      setValidationErrors(prev => ({
        ...prev,
        limits: {
          ...prev.limits,
          [field]: undefined,
        },
      }))
    }
  }

  const handleAdditionalPricingChange = (
    field: keyof FormData['additionalPricing'],
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      additionalPricing: {
        ...prev.additionalPricing,
        [field]: value,
      },
    }))

    // Clear validation error when user starts typing
    if (validationErrors.additionalPricing?.[field]) {
      setValidationErrors(prev => ({
        ...prev,
        additionalPricing: {
          ...prev.additionalPricing,
          [field]: undefined,
        },
      }))
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // Validate package name
    if (!formData.name.trim()) {
      errors.name = 'Package name is required'
    } else if (formData.name.length > 100) {
      errors.name = 'Package name must not exceed 100 characters'
    }

    // Validate type
    if (!formData.type) {
      errors.type = 'Package type is required'
    }

    // Validate interval
    if (!formData.interval) {
      errors.interval = 'Billing interval is required'
    }

    // Validate price
    if (!formData.price.trim()) {
      errors.price = 'Price is required'
    } else if (
      isNaN(parseFloat(formData.price)) ||
      parseFloat(formData.price) < 0
    ) {
      errors.price = 'Price must be a valid positive number'
    }

    // Validate modules (at least one required)
    if (formData.modules.length === 0) {
      errors.modules = 'At least one module is required'
    }

    // Validate limits fields
    const limitsErrors: ValidationErrors['limits'] = {}

    // Validate users
    if (!formData.limits.users.trim()) {
      limitsErrors.users = 'Users limit is required'
    } else if (
      isNaN(parseInt(formData.limits.users)) ||
      parseInt(formData.limits.users) < 0
    ) {
      limitsErrors.users = 'Users limit must be a non-negative integer'
    }

    // Validate numbers
    if (!formData.limits.numbers.trim()) {
      limitsErrors.numbers = 'Numbers limit is required'
    } else if (
      isNaN(parseInt(formData.limits.numbers)) ||
      parseInt(formData.limits.numbers) < 0
    ) {
      limitsErrors.numbers = 'Numbers limit must be a non-negative integer'
    }

    // Validate minutes
    if (!formData.limits.minutes.trim()) {
      limitsErrors.minutes = 'Minutes limit is required'
    } else if (
      isNaN(parseInt(formData.limits.minutes)) ||
      parseInt(formData.limits.minutes) < 0
    ) {
      limitsErrors.minutes = 'Minutes limit must be a non-negative integer'
    }

    // Validate sms
    if (!formData.limits.sms.trim()) {
      limitsErrors.sms = 'SMS limit is required'
    } else if (
      isNaN(parseInt(formData.limits.sms)) ||
      parseInt(formData.limits.sms) < 0
    ) {
      limitsErrors.sms = 'SMS limit must be a non-negative integer'
    }

    // Validate whatsappSms
    if (!formData.limits.whatsappSms.trim()) {
      limitsErrors.whatsappSms = 'WhatsApp SMS limit is required'
    } else if (
      isNaN(parseInt(formData.limits.whatsappSms)) ||
      parseInt(formData.limits.whatsappSms) < 0
    ) {
      limitsErrors.whatsappSms =
        'WhatsApp SMS limit must be a non-negative integer'
    }

    // Validate emails
    if (!formData.limits.emails.trim()) {
      limitsErrors.emails = 'Emails limit is required'
    } else if (
      isNaN(parseInt(formData.limits.emails)) ||
      parseInt(formData.limits.emails) < 0
    ) {
      limitsErrors.emails = 'Emails limit must be a non-negative integer'
    }

    // Add limits errors if any exist
    if (Object.keys(limitsErrors).length > 0) {
      errors.limits = limitsErrors
    }

    // Validate additional pricing fields
    const additionalPricingErrors: ValidationErrors['additionalPricing'] = {}

    // Validate userMonthly
    if (!formData.additionalPricing.userMonthly.trim()) {
      additionalPricingErrors.userMonthly = 'User monthly pricing is required'
    } else if (
      isNaN(parseFloat(formData.additionalPricing.userMonthly)) ||
      parseFloat(formData.additionalPricing.userMonthly) < 0
    ) {
      additionalPricingErrors.userMonthly =
        'User monthly pricing must be a non-negative number'
    }

    // Validate numberMonthly
    if (!formData.additionalPricing.numberMonthly.trim()) {
      additionalPricingErrors.numberMonthly =
        'Number monthly pricing is required'
    } else if (
      isNaN(parseFloat(formData.additionalPricing.numberMonthly)) ||
      parseFloat(formData.additionalPricing.numberMonthly) < 0
    ) {
      additionalPricingErrors.numberMonthly =
        'Number monthly pricing must be a non-negative number'
    }

    // Validate perMinute
    if (!formData.additionalPricing.perMinute.trim()) {
      additionalPricingErrors.perMinute = 'Per minute pricing is required'
    } else if (
      isNaN(parseFloat(formData.additionalPricing.perMinute)) ||
      parseFloat(formData.additionalPricing.perMinute) < 0
    ) {
      additionalPricingErrors.perMinute =
        'Per minute pricing must be a non-negative number'
    }

    // Validate perSms
    if (!formData.additionalPricing.perSms.trim()) {
      additionalPricingErrors.perSms = 'Per SMS pricing is required'
    } else if (
      isNaN(parseFloat(formData.additionalPricing.perSms)) ||
      parseFloat(formData.additionalPricing.perSms) < 0
    ) {
      additionalPricingErrors.perSms =
        'Per SMS pricing must be a non-negative number'
    }

    // Validate perWhatsappSms
    if (!formData.additionalPricing.perWhatsappSms.trim()) {
      additionalPricingErrors.perWhatsappSms =
        'Per WhatsApp SMS pricing is required'
    } else if (
      isNaN(parseFloat(formData.additionalPricing.perWhatsappSms)) ||
      parseFloat(formData.additionalPricing.perWhatsappSms) < 0
    ) {
      additionalPricingErrors.perWhatsappSms =
        'Per WhatsApp SMS pricing must be a non-negative number'
    }

    // Validate perEmail
    if (!formData.additionalPricing.perEmail.trim()) {
      additionalPricingErrors.perEmail = 'Per email pricing is required'
    } else if (
      isNaN(parseFloat(formData.additionalPricing.perEmail)) ||
      parseFloat(formData.additionalPricing.perEmail) < 0
    ) {
      additionalPricingErrors.perEmail =
        'Per email pricing must be a non-negative number'
    }

    // Add additional pricing errors if any exist
    if (Object.keys(additionalPricingErrors).length > 0) {
      errors.additionalPricing = additionalPricingErrors
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

    if (!userData?.tenantId) {
      alert('User data not available. Please try again.')
      return
    }

    setIsSaving(true)

    try {
      // Prepare the payload
      const payload = {
        name: formData.name,
        type: formData.type,
        interval: formData.interval,
        price: parseFloat(formData.price),
        limits: {
          users: parseInt(formData.limits.users) || 0,
          numbers: parseInt(formData.limits.numbers) || 0,
          minutes: parseInt(formData.limits.minutes) || 0,
          sms: parseInt(formData.limits.sms) || 0,
          whatsappSms: parseInt(formData.limits.whatsappSms) || 0,
          emails: parseInt(formData.limits.emails) || 0,
        },
        additionalPricing: {
          userMonthly: parseFloat(formData.additionalPricing.userMonthly) || 0,
          numberMonthly:
            parseFloat(formData.additionalPricing.numberMonthly) || 0,
          perMinute: parseFloat(formData.additionalPricing.perMinute) || 0,
          perSms: parseFloat(formData.additionalPricing.perSms) || 0,
          perWhatsappSms:
            parseFloat(formData.additionalPricing.perWhatsappSms) || 0,
          perEmail: parseFloat(formData.additionalPricing.perEmail) || 0,
        },
        tenantId: userData.tenantId,
        isPublic: formData.isPublic,
        modules: formData.modules, // Array of module codes
      }

      // Make API call to create or update the package
      if (isEditing && id) {
        console.log('Updating package:', { id, payload })
        const response = await apiService.put(
          `/v1/packages/with-modules/${id}`,
          payload
        )
        console.log('Package updated successfully:', response.data)

        // Show success toast for update
        toast.success('Package updated successfully!', {
          description: 'The package information has been updated.',
        })
      } else {
        console.log('Creating package:', payload)
        const response = await apiService.post(
          '/v1/packages/with-modules',
          payload
        )
        console.log('Package created successfully:', response.data)

        // Show success toast for creation
        toast.success('Package created successfully!', {
          description: 'The new package has been added to the system.',
        })
      }

      // Redirect back to packages page after a short delay to show the toast
      setTimeout(() => {
        router.push('/packages')
      }, 1000)
    } catch (error: any) {
      console.error('Error saving package:', error)
      // Show error toast
      toast.error('Failed to save package', {
        description:
          error.response?.data?.message ||
          'An error occurred while saving the package.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleModule = (moduleValue: string) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.includes(moduleValue)
        ? prev.modules.filter(m => m !== moduleValue)
        : [...prev.modules, moduleValue],
    }))

    // Clear modules validation error when user selects/deselects a module
    if (validationErrors.modules) {
      setValidationErrors(prev => ({
        ...prev,
        modules: undefined,
      }))
    }
  }

  const handleCancel = () => {
    router.push('/packages')
  }

  if (isLoading || modulesLoading) {
    return (
      <>
        <Head>
          <title>{isEditing ? 'Edit Package' : 'Create Package'} - WePro</title>
          <meta
            name="description"
            content={
              isEditing ? 'Edit package details' : 'Create a new package'
            }
          />
        </Head>
        <div className="p-6">
          <Loading
            message={
              isLoading ? 'Loading package details...' : 'Loading modules...'
            }
          />
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{isEditing ? 'Edit Package' : 'Create Package'} - WePro</title>
        <meta
          name="description"
          content={isEditing ? 'Edit package details' : 'Create a new package'}
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
            Back to Packages
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEditing ? 'Edit Package' : 'Create New Package'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Basic Information
                </CardTitle>

                {/* Public/Private Toggle */}
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="isPublic"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    {formData.isPublic ? 'Public Package' : 'Private Package'}
                  </Label>
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, isPublic: checked }))
                    }
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Package Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Package Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="Enter package name"
                  maxLength={100}
                  required
                  className={
                    validationErrors.name
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500">
                    {validationErrors.name}
                  </p>
                )}
                <p
                  className={`text-xs ${
                    formData.name.length > 100
                      ? 'text-red-500'
                      : formData.name.length > 80
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {formData.name.length}/100 characters
                </p>
              </div>

              {/* Type, Price, and Interval in a single row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={value => {
                      handleInputChange('type', value as 'P2' | 'P3' | 'P4')
                      // Clear validation error when user selects a type
                      if (validationErrors.type) {
                        setValidationErrors(prev => ({
                          ...prev,
                          type: undefined,
                        }))
                      }
                    }}
                    required
                  >
                    <SelectTrigger
                      className={
                        validationErrors.type
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }
                    >
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P2">P2: Companies</SelectItem>
                      <SelectItem value="P3">P3: Source Providers</SelectItem>
                      <SelectItem value="P4">P4: Answering Services</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.type && (
                    <p className="text-sm text-red-500">
                      {validationErrors.type}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={e => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      className={`pl-8 ${validationErrors.price ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                    />
                  </div>
                  {validationErrors.price && (
                    <p className="text-sm text-red-500">
                      {validationErrors.price}
                    </p>
                  )}
                </div>

                {/* Interval */}
                <div className="space-y-2">
                  <Label htmlFor="interval">Interval *</Label>
                  <Select
                    value={formData.interval}
                    onValueChange={value => {
                      handleInputChange(
                        'interval',
                        value as 'Yearly' | 'Monthly' | 'Weekly'
                      )
                      // Clear validation error when user selects an interval
                      if (validationErrors.interval) {
                        setValidationErrors(prev => ({
                          ...prev,
                          interval: undefined,
                        }))
                      }
                    }}
                    required
                  >
                    <SelectTrigger
                      className={
                        validationErrors.interval
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }
                    >
                      <SelectValue placeholder="Select billing interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.interval && (
                    <p className="text-sm text-red-500">
                      {validationErrors.interval}
                    </p>
                  )}
                </div>
              </div>

              {/* Modules */}
              <div className="space-y-2">
                <Label>Modules *</Label>
                <div
                  className={`flex flex-wrap gap-2 ${validationErrors.modules ? 'border border-red-500 rounded-lg p-3' : ''}`}
                >
                  {availableModules.map(module => (
                    <div
                      key={module._id}
                      className="flex items-center gap-2 bg-white dark:bg-neutral-800 px-3 py-2 rounded-full border shadow-sm"
                    >
                      <Checkbox
                        id={`module-${module.code}`}
                        checked={formData.modules.includes(module.code)}
                        onCheckedChange={() => toggleModule(module.code)}
                      />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {module.name} ({module.code})
                      </span>
                    </div>
                  ))}
                </div>
                {validationErrors.modules && (
                  <p className="text-sm text-red-500">
                    {validationErrors.modules}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Limits Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Package Limits
              </CardTitle>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Set the maximum limits for users, numbers, minutes, SMS,
                WhatsApp SMS, and emails
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="users">Users *</Label>
                  <Input
                    id="users"
                    type="number"
                    step="1"
                    min="0"
                    value={formData.limits.users}
                    onChange={e => handleLimitsChange('users', e.target.value)}
                    placeholder="0"
                    className={
                      validationErrors.limits?.users
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                    required
                  />
                  {validationErrors.limits?.users && (
                    <p className="text-sm text-red-500">
                      {validationErrors.limits.users}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numbers">Numbers *</Label>
                  <Input
                    id="numbers"
                    type="number"
                    step="1"
                    min="0"
                    value={formData.limits.numbers}
                    onChange={e =>
                      handleLimitsChange('numbers', e.target.value)
                    }
                    placeholder="0"
                    className={
                      validationErrors.limits?.numbers
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                    required
                  />
                  {validationErrors.limits?.numbers && (
                    <p className="text-sm text-red-500">
                      {validationErrors.limits.numbers}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minutes">Minutes *</Label>
                  <Input
                    id="minutes"
                    type="number"
                    step="1"
                    min="0"
                    value={formData.limits.minutes}
                    onChange={e =>
                      handleLimitsChange('minutes', e.target.value)
                    }
                    placeholder="0"
                    className={
                      validationErrors.limits?.minutes
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                    required
                  />
                  {validationErrors.limits?.minutes && (
                    <p className="text-sm text-red-500">
                      {validationErrors.limits.minutes}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sms">SMS *</Label>
                  <Input
                    id="sms"
                    type="number"
                    step="1"
                    min="0"
                    value={formData.limits.sms}
                    onChange={e => handleLimitsChange('sms', e.target.value)}
                    placeholder="0"
                    className={
                      validationErrors.limits?.sms
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                    required
                  />
                  {validationErrors.limits?.sms && (
                    <p className="text-sm text-red-500">
                      {validationErrors.limits.sms}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappSms">WhatsApp SMS *</Label>
                  <Input
                    id="whatsappSms"
                    type="number"
                    step="1"
                    min="0"
                    value={formData.limits.whatsappSms}
                    onChange={e =>
                      handleLimitsChange('whatsappSms', e.target.value)
                    }
                    placeholder="0"
                    className={
                      validationErrors.limits?.whatsappSms
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                    required
                  />
                  {validationErrors.limits?.whatsappSms && (
                    <p className="text-sm text-red-500">
                      {validationErrors.limits.whatsappSms}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emails">Emails *</Label>
                  <Input
                    id="emails"
                    type="number"
                    step="1"
                    min="0"
                    value={formData.limits.emails}
                    onChange={e => handleLimitsChange('emails', e.target.value)}
                    placeholder="0"
                    className={
                      validationErrors.limits?.emails
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                    required
                  />
                  {validationErrors.limits?.emails && (
                    <p className="text-sm text-red-500">
                      {validationErrors.limits.emails}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Pricing Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Additional Pricing
              </CardTitle>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Set pricing for additional usage beyond the base package limits
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userMonthly">User Monthly *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                      $
                    </span>
                    <Input
                      id="userMonthly"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.additionalPricing.userMonthly}
                      onChange={e =>
                        handleAdditionalPricingChange(
                          'userMonthly',
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                      className={`pl-8 ${
                        validationErrors.additionalPricing?.userMonthly
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }`}
                      required
                    />
                  </div>
                  {validationErrors.additionalPricing?.userMonthly && (
                    <p className="text-sm text-red-500">
                      {validationErrors.additionalPricing.userMonthly}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberMonthly">Number Monthly *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                      $
                    </span>
                    <Input
                      id="numberMonthly"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.additionalPricing.numberMonthly}
                      onChange={e =>
                        handleAdditionalPricingChange(
                          'numberMonthly',
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                      className={`pl-8 ${
                        validationErrors.additionalPricing?.numberMonthly
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }`}
                      required
                    />
                  </div>
                  {validationErrors.additionalPricing?.numberMonthly && (
                    <p className="text-sm text-red-500">
                      {validationErrors.additionalPricing.numberMonthly}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perMinute">Per Minute *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                      $
                    </span>
                    <Input
                      id="perMinute"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.additionalPricing.perMinute}
                      onChange={e =>
                        handleAdditionalPricingChange(
                          'perMinute',
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                      className={`pl-8 ${
                        validationErrors.additionalPricing?.perMinute
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }`}
                      required
                    />
                  </div>
                  {validationErrors.additionalPricing?.perMinute && (
                    <p className="text-sm text-red-500">
                      {validationErrors.additionalPricing.perMinute}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perSms">Per SMS *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                      $
                    </span>
                    <Input
                      id="perSms"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.additionalPricing.perSms}
                      onChange={e =>
                        handleAdditionalPricingChange('perSms', e.target.value)
                      }
                      placeholder="0.00"
                      className={`pl-8 ${
                        validationErrors.additionalPricing?.perSms
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }`}
                      required
                    />
                  </div>
                  {validationErrors.additionalPricing?.perSms && (
                    <p className="text-sm text-red-500">
                      {validationErrors.additionalPricing.perSms}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perWhatsappSms">Per WhatsApp SMS *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                      $
                    </span>
                    <Input
                      id="perWhatsappSms"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.additionalPricing.perWhatsappSms}
                      onChange={e =>
                        handleAdditionalPricingChange(
                          'perWhatsappSms',
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                      className={`pl-8 ${
                        validationErrors.additionalPricing?.perWhatsappSms
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }`}
                      required
                    />
                  </div>
                  {validationErrors.additionalPricing?.perWhatsappSms && (
                    <p className="text-sm text-red-500">
                      {validationErrors.additionalPricing.perWhatsappSms}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perEmail">Per Email *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                      $
                    </span>
                    <Input
                      id="perEmail"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.additionalPricing.perEmail}
                      onChange={e =>
                        handleAdditionalPricingChange(
                          'perEmail',
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                      className={`pl-8 ${
                        validationErrors.additionalPricing?.perEmail
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }`}
                      required
                    />
                  </div>
                  {validationErrors.additionalPricing?.perEmail && (
                    <p className="text-sm text-red-500">
                      {validationErrors.additionalPricing.perEmail}
                    </p>
                  )}
                </div>
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
                    <Package className="w-4 h-4 mr-2" />
                  )}
                  {isEditing ? 'Update Package' : 'Create Package'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
