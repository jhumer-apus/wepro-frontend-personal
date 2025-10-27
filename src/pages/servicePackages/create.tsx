import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { RootState } from '@/src/store/index'
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
import { Switch } from '@/src/components/ui/switch'
import {
  ArrowLeft,
  Package,
  Save,
  DollarSign,
  Shield,
  Plus,
  X,
  Clock,
} from 'lucide-react'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { ServicePackage } from '@/src/constants/interface/servicePackage'
import { usePermissions } from '@/src/hooks/usePermissions'

interface FormData {
  title: string
  description: string
  chargeModel: 'call' | 'minute' | 'second' | ''
  chargeAmount: string
  chargeOver: string
  minimumMonthlySpend: string
  features: string[]
  isActive: boolean
  isPublic: boolean
}

interface ValidationErrors {
  title?: string
  description?: string
  chargeModel?: string
  chargeAmount?: string
  chargeOver?: string
  minimumMonthlySpend?: string
  features?: string
}

export default function CreateServicePackagePage(): React.JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const { getUserType, checkPermission } = usePermissions()

  // Check if user type is P1, if not show unauthorized
  const userType = getUserType()

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    chargeModel: '',
    chargeAmount: '',
    chargeOver: '',
    minimumMonthlySpend: '',
    features: [''],
    isActive: true,
    isPublic: true,
  })

  // Get user data from Redux
  const userData = useSelector((state: RootState) => state.user.data)

  // Check if we're editing (id exists in URL)
  const isEditing = Boolean(id)

  // Load service package data if editing
  useEffect(() => {
    const loadServicePackageData = async () => {
      if (isEditing && id && typeof id === 'string') {
        setIsLoading(true)
        try {
          const response = await apiService.get(
            `/v1/answering-services/packages/${id}`
          )
          if (response.data.success && response.data.message?.package) {
            const packageData: ServicePackage = response.data.message.package
            setFormData({
              title: packageData.title,
              description: packageData.description,
              chargeModel: packageData.chargeModel as
                | 'call'
                | 'minute'
                | 'second',
              chargeAmount: packageData.chargeAmount.toString(),
              chargeOver: packageData.chargeOver?.toString(),
              minimumMonthlySpend: packageData.minimumMonthlySpend.toString(),
              features:
                packageData.features.length > 0 ? packageData.features : [''],
              isActive: packageData.isActive,
              isPublic: packageData.isPublic,
            })
          }
        } catch (error) {
          console.error('Error loading service package data:', error)
          toast.error('Failed to load service package', {
            description:
              'An error occurred while loading the service package details.',
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadServicePackageData()
  }, [id, isEditing])

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | string[]
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

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData(prev => ({
      ...prev,
      features: newFeatures,
    }))

    // Clear validation error when user starts typing
    if (validationErrors.features) {
      setValidationErrors(prev => ({
        ...prev,
        features: undefined,
      }))
    }
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, ''],
    }))
  }

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        features: newFeatures,
      }))
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // Validate title
    if (!formData.title.trim()) {
      errors.title = 'Package title is required'
    } else if (formData.title.length > 100) {
      errors.title = 'Package title must not exceed 100 characters'
    }

    // Validate description
    if (!formData.description.trim()) {
      errors.description = 'Package description is required'
    } else if (formData.description.length > 500) {
      errors.description = 'Package description must not exceed 500 characters'
    }

    // Validate charge model
    if (!formData.chargeModel) {
      errors.chargeModel = 'Charge model is required'
    }

    // Validate charge amount
    if (!formData.chargeAmount.trim()) {
      errors.chargeAmount = 'Charge amount is required'
    } else if (
      isNaN(parseFloat(formData.chargeAmount)) ||
      parseFloat(formData.chargeAmount) < 0
    ) {
      errors.chargeAmount = 'Charge amount must be a valid positive number'
    }

    // Validate charge over (only for call model)
    if (formData.chargeModel === 'call') {
      if (!formData.chargeOver.trim()) {
        errors.chargeOver = 'Charge over time is required for call model'
      } else if (
        isNaN(parseInt(formData.chargeOver)) ||
        parseInt(formData.chargeOver) < 0
      ) {
        errors.chargeOver =
          'Charge over time must be a valid non-negative integer'
      }
    }

    // Validate minimum monthly spend
    if (!formData.minimumMonthlySpend.trim()) {
      errors.minimumMonthlySpend = 'Minimum monthly spend is required'
    } else if (
      isNaN(parseFloat(formData.minimumMonthlySpend)) ||
      parseFloat(formData.minimumMonthlySpend) < 0
    ) {
      errors.minimumMonthlySpend =
        'Minimum monthly spend must be a valid positive number'
    }

    // Validate features (at least one non-empty feature required)
    const validFeatures = formData.features.filter(
      feature => feature.trim() !== ''
    )
    if (validFeatures.length === 0) {
      errors.features = 'At least one feature is required'
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
      toast.error('User data not available. Please try again.')
      return
    }

    setIsSaving(true)

    try {
      // Filter out empty features
      const validFeatures = formData.features.filter(
        feature => feature.trim() !== ''
      )

      // Prepare the payload based on charge model
      let payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        chargeModel: formData.chargeModel,
        chargeAmount: parseFloat(formData.chargeAmount),
        minimumMonthlySpend: parseFloat(formData.minimumMonthlySpend),
        features: validFeatures,
        isActive: formData.isActive,
        isPublic: formData.isPublic,
      }

      // Add chargeOver only for call model
      if (formData.chargeModel === 'call') {
        payload.chargeOver = parseInt(formData.chargeOver)
      }

      // Make API call to create or update the service package
      if (isEditing && id && typeof id === 'string') {
        console.log('Updating service package:', { id, payload })
        const response = await apiService.updateServicePackage(id, payload)
        console.log('Service package updated successfully:', response.data)

        // Show success toast for update
        toast.success('Service package updated successfully!', {
          description: 'The service package information has been updated.',
        })
      } else {
        console.log('Creating service package:', payload)
        const response = await apiService.createServicePackage(payload)
        console.log('Service package created successfully:', response.data)

        // Show success toast for creation
        toast.success('Service package created successfully!', {
          description: 'The new service package has been added to the system.',
        })
      }

      // Redirect back to service packages page after a short delay to show the toast
      setTimeout(() => {
        router.push('/servicePackages')
      }, 1000)
    } catch (error: any) {
      console.error('Error saving service package:', error)
      // Show error toast
      toast.error('Failed to save service package', {
        description:
          error.response?.data?.message ||
          'An error occurred while saving the service package.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/servicePackages')
  }

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

  if (isLoading) {
    return (
      <>
        <Head>
          <title>
            {isEditing ? 'Edit Service Package' : 'Create Service Package'} -
            WePro
          </title>
          <meta
            name="description"
            content={
              isEditing
                ? 'Edit service package details'
                : 'Create a new service package'
            }
          />
        </Head>
        <div className="p-6">
          <Loading
            message={
              isLoading ? 'Loading service package details...' : 'Loading...'
            }
          />
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>
          {isEditing ? 'Edit Service Package' : 'Create Service Package'} -
          WePro
        </title>
        <meta
          name="description"
          content={
            isEditing
              ? 'Edit service package details'
              : 'Create a new service package'
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
            Back to Service Packages
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEditing ? 'Edit Service Package' : 'Create New Service Package'}
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

                {/* Active/Inactive Toggle */}
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="isActive"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    {formData.isActive ? 'Active Package' : 'Inactive Package'}
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
              {/* Package Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Package Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder="Enter service package title"
                  maxLength={100}
                  required
                  className={
                    validationErrors.title
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-500">
                    {validationErrors.title}
                  </p>
                )}
                <p
                  className={`text-xs ${
                    formData.title.length > 100
                      ? 'text-red-500'
                      : formData.title.length > 80
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Package Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Package Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Enter detailed description of the service package"
                  maxLength={500}
                  rows={3}
                  required
                  className={
                    validationErrors.description
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-500">
                    {validationErrors.description}
                  </p>
                )}
                <p
                  className={`text-xs ${
                    formData.description.length > 500
                      ? 'text-red-500'
                      : formData.description.length > 400
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {formData.description.length}/500 characters
                </p>
              </div>

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
            </CardContent>
          </Card>

          {/* Pricing Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Information
              </CardTitle>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Configure the billing model and pricing structure for this
                service package
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Charge Model */}
              <div className="space-y-2">
                <Label htmlFor="chargeModel">Charge Model *</Label>
                <Select
                  value={formData.chargeModel}
                  onValueChange={value => {
                    handleInputChange(
                      'chargeModel',
                      value as 'call' | 'minute' | 'second'
                    )
                    // Clear chargeOver validation error when user changes model
                    if (validationErrors.chargeOver) {
                      setValidationErrors(prev => ({
                        ...prev,
                        chargeOver: undefined,
                      }))
                    }
                  }}
                  required
                >
                  <SelectTrigger
                    className={
                      validationErrors.chargeModel
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                  >
                    <SelectValue placeholder="Select charge model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call-based billing</SelectItem>
                    <SelectItem value="minute">Minute-based billing</SelectItem>
                    <SelectItem value="second">Second-based billing</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.chargeModel && (
                  <p className="text-sm text-red-500">
                    {validationErrors.chargeModel}
                  </p>
                )}
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formData.chargeModel === 'call' &&
                    'Billing starts after a specified time threshold'}
                  {formData.chargeModel === 'minute' &&
                    'Billing is calculated per minute'}
                  {formData.chargeModel === 'second' &&
                    'Billing is calculated per second'}
                </p>
              </div>

              {/* Charge Amount and Charge Over */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Charge Amount */}
                <div className="space-y-2">
                  <Label htmlFor="chargeAmount">Charge Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                      $
                    </span>
                    <Input
                      id="chargeAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.chargeAmount}
                      onChange={e =>
                        handleInputChange('chargeAmount', e.target.value)
                      }
                      placeholder="0.00"
                      className={`pl-8 ${validationErrors.chargeAmount ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                    />
                  </div>
                  {validationErrors.chargeAmount && (
                    <p className="text-sm text-red-500">
                      {validationErrors.chargeAmount}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Amount charged per {formData.chargeModel || 'unit'}
                  </p>
                </div>

                {/* Charge Over (only for call model) */}
                {formData.chargeModel === 'call' && (
                  <div className="space-y-2">
                    <Label htmlFor="chargeOver">Charge Over (seconds) *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
                      <Input
                        id="chargeOver"
                        type="number"
                        step="1"
                        min="0"
                        value={formData.chargeOver}
                        onChange={e =>
                          handleInputChange('chargeOver', e.target.value)
                        }
                        placeholder="30"
                        className={`pl-10 ${validationErrors.chargeOver ? 'border-red-500 focus:border-red-500' : ''}`}
                        required
                      />
                    </div>
                    {validationErrors.chargeOver && (
                      <p className="text-sm text-red-500">
                        {validationErrors.chargeOver}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Free time before billing starts
                    </p>
                  </div>
                )}
              </div>

              {/* Minimum Monthly Spend */}
              <div className="space-y-2">
                <Label htmlFor="minimumMonthlySpend">
                  Minimum Monthly Spend *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                    $
                  </span>
                  <Input
                    id="minimumMonthlySpend"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimumMonthlySpend}
                    onChange={e =>
                      handleInputChange('minimumMonthlySpend', e.target.value)
                    }
                    placeholder="0.00"
                    className={`pl-8 ${validationErrors.minimumMonthlySpend ? 'border-red-500 focus:border-red-500' : ''}`}
                    required
                  />
                </div>
                {validationErrors.minimumMonthlySpend && (
                  <p className="text-sm text-red-500">
                    {validationErrors.minimumMonthlySpend}
                  </p>
                )}
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Minimum amount customer must spend per month
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Package Features
              </CardTitle>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                List the key features and benefits included in this service
                package
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <div className="flex-1">
                      <Input
                        value={feature}
                        onChange={e =>
                          handleFeatureChange(index, e.target.value)
                        }
                        placeholder={`Enter feature ${index + 1}...`}
                        className={
                          validationErrors.features
                            ? 'border-red-500 focus:border-red-500'
                            : 'group-hover:border-neutral-400 transition-colors'
                        }
                      />
                    </div>
                    {formData.features.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove feature"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFeature}
                    className="w-full border-dashed border-2 hover:border-solid hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Feature
                  </Button>
                </div>
              </div>

              {validationErrors.features && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {validationErrors.features}
                </div>
              )}

              <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-md">
                💡 <strong>Tip:</strong> Be specific about what each feature
                includes. For example, "24/7 Live Answering" is better than just
                "Live Answering".
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
                  {isEditing
                    ? 'Update Service Package'
                    : 'Create Service Package'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
