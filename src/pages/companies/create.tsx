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
import {
  ArrowLeft,
  Building2,
  Save,
  Check,
  ChevronsUpDown,
  Shield,
} from 'lucide-react'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/src/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover'
import { cn } from '@/src/lib/utils'
import { usePermissions } from '@/src/hooks/usePermissions'
import { Timezone } from '@/src/constants/interface/timezone'
import { Package } from '@/src/constants/interface/package'

interface FormData {
  name: string
  companyName: string
  type: 'Tenant'
  username: string
  password: string
  packageId: string
  timezoneId: string
}

interface ValidationErrors {
  name?: string
  companyName?: string
  username?: string
  password?: string
  packageId?: string
  timezoneId?: string
}

export default function CreateCompanyPage(): React.JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const { checkPermission } = usePermissions()

  // Check if we're editing (id exists in URL)
  const isEditing = Boolean(id)

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [timezonesLoading, setTimezonesLoading] = useState(false)
  const [packagesLoading, setPackagesLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [availableTimezones, setAvailableTimezones] = useState<Timezone[]>([])
  const [availablePackages, setAvailablePackages] = useState<Package[]>([])
  const [formData, setFormData] = useState<FormData>({
    name: '',
    companyName: '',
    type: 'Tenant',
    username: '',
    password: '',
    packageId: '',
    timezoneId: '',
  })

  // Dropdown states
  const [timezoneOpen, setTimezoneOpen] = useState(false)
  const [packageOpen, setPackageOpen] = useState(false)

  // Get user data from Redux
  const userData = useSelector((state: RootState) => state.user.data)

  // Fetch timezones from API
  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        setTimezonesLoading(true)
        const response = await apiService.get('/v1/timezones?page=1&limit=10')
        setAvailableTimezones(response.data.data)
      } catch (error) {
        console.error('Error fetching timezones:', error)
      } finally {
        setTimezonesLoading(false)
      }
    }

    fetchTimezones()
  }, [])

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      if (userData?.tenantId) {
        try {
          setPackagesLoading(true)
          const response = await apiService.get(
            `/v1/packages?type=P2&tenantId=${userData.tenantId}&page=1&limit=20`
          )
          setAvailablePackages(response.data.data)
        } catch (error) {
          console.error('Error fetching packages:', error)
        } finally {
          setPackagesLoading(false)
        }
      }
    }

    fetchPackages()
  }, [userData?.tenantId])

  // Load company data if editing
  useEffect(() => {
    const loadCompanyData = async () => {
      if (isEditing && id && typeof id === 'string' && userData?.tenantId) {
        // Wait for packages and timezones to be loaded first
        if (availablePackages.length === 0 || availableTimezones.length === 0) {
          console.log('Waiting for packages and timezones to load...')
          return
        }

        setIsLoading(true)
        try {
          // Fetch company data from API
          const response = await apiService.get(
            `/v1/users/tenant/${id}?tenantId=${userData.tenantId}`
          )
          const companyData = response.data.data

          console.log('Company data received:', companyData) // Debug log
          console.log('Company data keys:', Object.keys(companyData)) // Debug log to see all available fields

          if (companyData) {
            // Extract packageId and timezoneId from nested objects
            const packageId =
              companyData.packageId?._id ||
              companyData.packageId ||
              companyData.package ||
              companyData.package_id ||
              ''
            const timezoneId =
              companyData.timezoneId?._id ||
              companyData.timezoneId ||
              companyData.timezone ||
              companyData.timezone_id ||
              ''

            setFormData({
              name: companyData.name || companyData.companyName || '',
              companyName: companyData.companyName || companyData.name || '',
              type: 'Tenant',
              username: companyData.username || companyData.userName || '',
              password: '', // Don't populate password for security
              packageId: packageId,
              timezoneId: timezoneId,
            })

            console.log('Form data set:', {
              name: companyData.name || companyData.companyName || '',
              companyName: companyData.companyName || companyData.name || '',
              username: companyData.username || companyData.userName || '',
              packageId: packageId,
              timezoneId: timezoneId,
            })

            console.log('Extracted IDs:', {
              packageId: packageId,
              timezoneId: timezoneId,
              originalPackageId: companyData.packageId,
              originalTimezoneId: companyData.timezoneId,
            })
          }
        } catch (error) {
          console.error('Error loading company data:', error)
          toast.error('Failed to load company data', {
            description:
              'Please try again or contact support if the issue persists.',
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadCompanyData()
  }, [
    id,
    isEditing,
    userData?.tenantId,
    availablePackages.length,
    availableTimezones.length,
  ])

  const handleInputChange = (field: keyof FormData, value: string) => {
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

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // Validate company name
    if (!formData.name.trim()) {
      errors.name = 'Company name is required'
    }

    // Validate company name
    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required'
    }

    // Validate username
    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    }

    // Validate password (only required when creating new company)
    if (!isEditing && !formData.password.trim()) {
      errors.password = 'Password is required'
    }

    // Validate package ID
    if (!formData.packageId.trim()) {
      errors.packageId = 'Package ID is required'
    }

    // Validate timezone ID
    if (!formData.timezoneId.trim()) {
      errors.timezoneId = 'Timezone ID is required'
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
        companyName: formData.companyName,
        type: formData.type,
        username: formData.username,
        password: formData.password,
        packageId: formData.packageId,
        timezoneId: formData.timezoneId,
      }

      // Make API call to create or update the company
      if (isEditing && id) {
        console.log('Updating company:', { id, payload })

        // Create update payload without password if it's empty
        const updatePayload: any = {
          name: payload.name,
          companyName: payload.companyName,
          username: payload.username,
          packageId: payload.packageId,
          timezoneId: payload.timezoneId,
        }

        // Only include password if it's provided (for editing) or required (for creating)
        if (!isEditing || formData.password) {
          updatePayload.password = formData.password
        }

        const response = await apiService.put(
          `/v1/users/tenant/${id}?tenantId=${userData.tenantId}`,
          updatePayload
        )
        console.log('Company updated successfully:', response.data)

        // Show success toast for update
        toast.success('Company updated successfully!', {
          description: 'The company information has been updated.',
        })
      } else {
        console.log('Creating company:', payload)
        // Make actual API call to create company
        const response = await apiService.post('/v1/users', payload)
        console.log('Company created successfully:', response.data)

        // Show success toast for creation
        toast.success('Company created successfully!', {
          description: 'The new company has been added to the system.',
        })
      }

      // Redirect back to companies page after a short delay to show the toast
      setTimeout(() => {
        router.push('/companies')
      }, 1000)
    } catch (error: any) {
      console.error('Error saving company:', error)
      // Show error toast
      toast.error('Failed to save company', {
        description:
          error.response?.data?.details?.[0]?.message ||
          error.response?.data?.error ||
          'An error occurred while saving the company.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/companies')
  }

  const getSelectedPackageName = () => {
    const selectedPackage = availablePackages.find(
      p => p._id === formData.packageId
    )
    return selectedPackage ? selectedPackage.name : ''
  }

  const getSelectedTimezoneName = () => {
    const selectedTimezone = availableTimezones.find(
      t => t._id === formData.timezoneId
    )
    return selectedTimezone ? selectedTimezone.name : ''
  }

  // Check permission for create mode
  if (!isEditing && !checkPermission('MOD004', 'create')) {
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

  // Check permission for edit mode
  if (isEditing && !checkPermission('MOD004', 'edit')) {
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

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading Company - WePro</title>
        </Head>
        <div className="p-6">
          <Loading message="Loading company details..." />
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{isEditing ? 'Edit Company' : 'Create Company'} - WePro</title>
        <meta
          name="description"
          content={isEditing ? 'Edit company details' : 'Create a new company'}
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
            Back to Companies
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEditing ? 'Edit Company' : 'Create New Company'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="Enter name"
                  required
                  className={
                    validationErrors.name
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                  autoComplete="off"
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500">
                    {validationErrors.name}
                  </p>
                )}
              </div>

              {/* Company Name Field */}
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={e =>
                    handleInputChange('companyName', e.target.value)
                  }
                  placeholder="Enter company name"
                  required
                  className={
                    validationErrors.companyName
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                  autoComplete="off"
                />
                {validationErrors.companyName && (
                  <p className="text-sm text-red-500">
                    {validationErrors.companyName}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={e => handleInputChange('username', e.target.value)}
                  placeholder="Enter username"
                  required
                  className={
                    validationErrors.username
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                  autoComplete="off"
                />
                {validationErrors.username && (
                  <p className="text-sm text-red-500">
                    {validationErrors.username}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password {isEditing ? '' : '*'}
                  {isEditing && (
                    <span className="text-sm text-neutral-500 ml-1">
                      (Leave blank to keep current)
                    </span>
                  )}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  placeholder={
                    isEditing
                      ? 'Leave blank to keep current password'
                      : 'Enter password'
                  }
                  required={!isEditing}
                  className={
                    validationErrors.password
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                  autoComplete="new-password"
                />
                {validationErrors.password && (
                  <p className="text-sm text-red-500">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Package Dropdown */}
              <div className="space-y-2">
                <Label>Package *</Label>
                <Popover open={packageOpen} onOpenChange={setPackageOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={packageOpen}
                      className="w-full justify-between"
                      disabled={packagesLoading}
                    >
                      {packagesLoading
                        ? 'Loading packages...'
                        : formData.packageId
                          ? getSelectedPackageName()
                          : 'Select package...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search packages..."
                        className="focus:ring-0 focus:outline-none focus:border-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-0"
                      />
                      <CommandList>
                        <CommandEmpty>
                          {packagesLoading
                            ? 'Loading packages...'
                            : 'No package found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {availablePackages.map(pkg => (
                            <CommandItem
                              key={pkg._id}
                              onSelect={() => {
                                handleInputChange('packageId', pkg._id)
                                setPackageOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  formData.packageId === pkg._id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {pkg.name}
                              <span className="text-sm text-neutral-500 ml-2">
                                - {pkg.type} • ${pkg.price}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {validationErrors.packageId && (
                  <p className="text-sm text-red-500">
                    {validationErrors.packageId}
                  </p>
                )}
              </div>

              {/* Timezone Dropdown */}
              <div className="space-y-2">
                <Label>Timezone *</Label>
                <Popover open={timezoneOpen} onOpenChange={setTimezoneOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={timezoneOpen}
                      className="w-full justify-between"
                      disabled={timezonesLoading}
                    >
                      {timezonesLoading
                        ? 'Loading timezones...'
                        : formData.timezoneId
                          ? getSelectedTimezoneName()
                          : 'Select timezone...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search timezones..."
                        className="focus:ring-0 focus:outline-none focus:border-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-0"
                      />
                      <CommandList>
                        <CommandEmpty>
                          {timezonesLoading
                            ? 'Loading timezones...'
                            : 'No timezone found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {availableTimezones.map(timezone => (
                            <CommandItem
                              key={timezone._id}
                              onSelect={() => {
                                handleInputChange('timezoneId', timezone._id)
                                setTimezoneOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  formData.timezoneId === timezone._id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {timezone.name} ({timezone.location})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {validationErrors.timezoneId && (
                  <p className="text-sm text-red-500">
                    {validationErrors.timezoneId}
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
                    <Building2 className="w-4 h-4 mr-2" />
                  )}
                  {isEditing ? 'Update Company' : 'Create Company'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
