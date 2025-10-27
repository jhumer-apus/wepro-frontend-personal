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

import { ArrowLeft, Building2, Save, Shield } from 'lucide-react'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { cn } from '@/src/lib/utils'
import { usePermissions } from '@/src/hooks/usePermissions'
import { Switch } from '@/src/components/ui/switch'

interface FormData {
  name: string
  code: string
  isP1: boolean
  active: boolean
}

interface ValidationErrors {
  name?: string
  code?: string
}

export default function CreateIndustryPage(): React.JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const { checkPermission } = usePermissions()

  // Check if we're editing (id exists in URL)
  const isEditing = Boolean(id)

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    isP1: false,
    active: true,
  })

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isFormValid, setIsFormValid] = useState(false)

  const user = useSelector((state: RootState) => state.user.data)
  const tenantId = user?.tenantId

  // Fetch industry data if editing
  useEffect(() => {
    const fetchIndustryData = async () => {
      if (isEditing && id && typeof id === 'string' && tenantId) {
        setIsLoading(true)
        try {
          const response = await apiService.get(`/v1/industries/${id}`)
          if (response.data.success) {
            const industryData = response.data.data
            setFormData({
              name: industryData.name || '',
              code: industryData.code || '',
              isP1: industryData.isP1 || false,
              active:
                industryData.active !== undefined ? industryData.active : true,
            })
          } else {
            toast.error('Failed to load industry data', {
              description:
                response.data.message ||
                'The industry information could not be retrieved.',
            })
            router.push('/industries')
          }
        } catch (error: any) {
          console.error('Error fetching industry data:', error)
          toast.error('Failed to load industry data', {
            description:
              error.response?.data?.message ||
              'An error occurred while loading the industry.',
          })
          router.push('/industries')
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (isEditing && id && tenantId) {
      fetchIndustryData()
    }
  }, [isEditing, id, tenantId, router])

  // Validate form whenever formData changes
  useEffect(() => {
    const errors: ValidationErrors = {}

    if (!formData.name.trim()) {
      errors.name = 'Industry name is required'
    }

    if (!formData.code.trim()) {
      errors.code = 'Industry code is required'
    }

    setValidationErrors(errors)
    setIsFormValid(Object.keys(errors).length === 0)
  }, [formData])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid || !tenantId) {
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        ...formData,
        tenant_id: tenantId,
      }

      if (isEditing && id) {
        // Update existing industry
        await apiService.put(`/v1/industries/${id}`, payload)
        toast.success('Industry updated successfully!', {
          description: 'The industry has been updated in the system.',
        })
      } else {
        // Create new industry
        await apiService.post('/v1/industries', payload)
        toast.success('Industry created successfully!', {
          description: 'The new industry has been added to the system.',
        })
      }

      router.push('/industries')
    } catch (error: any) {
      console.error('Error saving industry:', error)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} industry`, {
        description:
          error.response?.data?.message ||
          `An error occurred while ${isEditing ? 'updating' : 'creating'} the industry.`,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/industries')
  }

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading Industry - WePro</title>
        </Head>
        <div className="p-6">
          <Loading message="Loading industry details..." />
        </div>
      </>
    )
  }

  // Check permission to access this page
  if (
    !checkPermission('MOD012', isEditing ? 'edit' : 'create') &&
    !checkPermission('MOD013', isEditing ? 'edit' : 'create')
  ) {
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
            You don't have permission to {isEditing ? 'edit' : 'create'}{' '}
            industries.
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

  return (
    <>
      <Head>
        <title>{isEditing ? 'Edit Industry' : 'Create Industry'} - WePro</title>
        <meta
          name="description"
          content={
            isEditing ? 'Edit WePro industry' : 'Create new WePro industry'
          }
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Industries
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEditing ? 'Edit Industry' : 'Create New Industry'}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            {isEditing
              ? 'Update industry information and settings'
              : 'Add a new industry to your system'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Industry Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Industry Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Industry Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter industry name"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  required
                  className={cn(
                    validationErrors.name &&
                      'border-red-500 focus:border-red-500'
                  )}
                  autoComplete="off"
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500">
                    {validationErrors.name}
                  </p>
                )}
              </div>

              {/* Industry Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Industry Code *</Label>
                <Input
                  id="code"
                  placeholder="Enter industry code (e.g., IND001)"
                  value={formData.code}
                  onChange={e => handleInputChange('code', e.target.value)}
                  required
                  className={cn(
                    validationErrors.code &&
                      'border-red-500 focus:border-red-500'
                  )}
                  autoComplete="off"
                />
                {validationErrors.code && (
                  <p className="text-sm text-red-500">
                    {validationErrors.code}
                  </p>
                )}
              </div>

              {/* P1 Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">P1 Status</Label>
                  <p className="text-sm text-neutral-500">
                    Mark this industry as P1 eligible
                  </p>
                </div>
                <Switch
                  checked={formData.isP1}
                  onCheckedChange={checked =>
                    handleInputChange('isP1', checked)
                  }
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Active Status</Label>
                  <p className="text-sm text-neutral-500">
                    Enable or disable this industry
                  </p>
                </div>
                <Switch
                  checked={formData.active}
                  onCheckedChange={checked =>
                    handleInputChange('active', checked)
                  }
                />
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
              disabled={!isFormValid || isSaving}
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
                  {isEditing ? 'Update Industry' : 'Create Industry'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
