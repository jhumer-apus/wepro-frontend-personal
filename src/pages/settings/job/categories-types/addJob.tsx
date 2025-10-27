import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import {
  ArrowLeft,
  Briefcase,
  Loader2,
  Shield,
  ChevronsUpDown,
  Check,
} from 'lucide-react'
import { usePermissions } from '@/src/hooks/usePermissions'
import { apiService } from '@/src/services/api'
import { useAppSelector } from '@/src/store/hooks'
import { toast } from 'sonner'

interface Industry {
  _id: string
  name: string
  code: string
  isP1: boolean
  active: boolean
}

export default function AddJobTypePage() {
  const router = useRouter()
  const { industry, parent } = router.query
  const { checkPermission, getUserType } = usePermissions()

  const [formData, setFormData] = useState({
    name: '',
    industry_code: '',
    parent_code: '',
    description: '',
    car_info: false,
    active: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [industriesLoading, setIndustriesLoading] = useState(false)
  const [availableIndustries, setAvailableIndustries] = useState<Industry[]>([])

  const user = useAppSelector(state => state.user.data)
  const tenantId = user?.tenantId

  // Set industry code and parent code from URL query when component mounts
  useEffect(() => {
    if (industry && typeof industry === 'string') {
      setFormData(prev => ({
        ...prev,
        industry_code: industry,
      }))
    }
    if (parent && typeof parent === 'string') {
      setFormData(prev => ({
        ...prev,
        parent_code: parent,
      }))
    }
  }, [industry, parent])

  // Fetch industries from API
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setIndustriesLoading(true)
        const userType = getUserType()
        let url = '/v1/industries'

        if (userType === 'P1') {
          url += '/P1'
        }

        url += '?sort=-createdAt&page=1&limit=50'

        const response = await apiService.get(url)
        if (response.data.success) {
          setAvailableIndustries(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching industries:', error)
        toast.error('Failed to load industries')
      } finally {
        setIndustriesLoading(false)
      }
    }

    fetchIndustries()
  }, [])

  // Check permission to access this page
  if (
    !checkPermission('MOD014', 'create') &&
    !checkPermission('MOD015', 'create')
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
            You don't have permission to create job types.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => router.push('/settings/job/categories-types')}
              variant="outline"
            >
              Back to Job Categories & Types
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Job type name is required')
      return
    }

    if (!formData.industry_code.trim()) {
      toast.error('Industry code is required')
      return
    }

    if (!formData.description.trim()) {
      toast.error('Description is required')
      return
    }

    try {
      setSubmitting(true)
      const userType = getUserType()
      let url = '/v1/job-types'

      // Prepare payload according to API specification
      const payload: any = {
        name: formData.name.trim(),
        industry_code: formData.industry_code.trim(),
        description: formData.description.trim(),
        active: formData.active,
        car_info: formData.car_info,
      }

      // Include parent_code if it exists (for sub-types)
      if (formData.parent_code.trim()) {
        payload.parent_code = formData.parent_code.trim()
      }

      console.log('Sending payload to API:', payload)
      console.log('API endpoint:', url)

      // Create mode - POST request
      if (userType === 'P1') {
        url += '/p1' // Note: lowercase 'p1' as per API specification
      }
      const response = await apiService.post(url, payload)
      console.log('API response (create):', response.data)

      if (response.data.success) {
        toast.success('Job type created successfully!', {
          description: 'The job type has been created in the system.',
        })

        // Redirect back to job categories & types list
        router.push('/settings/job/categories-types')
      } else {
        console.error('API returned error:', response.data)
        toast.error('Failed to create job type', {
          description:
            response.data.message ||
            'An error occurred while creating the job type.',
        })
      }
    } catch (err: any) {
      console.error('Error creating job type:', err)
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      })
      toast.error('Failed to create job type', {
        description:
          err.response?.data?.message ||
          err.message ||
          'An error occurred while creating the job type.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCancel = () => {
    router.push('/settings/job/categories-types')
  }

  return (
    <>
      <Head>
        <title>Add Job Type - Settings - WePro</title>
        <meta name="description" content="Create a new job type category" />
      </Head>

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Job Categories & Types
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {formData.parent_code ? 'Add New Sub-Type' : 'Add New Job Type'}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            {formData.parent_code
              ? 'Add a new sub-type to organize and classify your business data'
              : 'Add a new job type category to organize and classify your business data'}
          </p>
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="space-y-6"
          autoComplete="off"
        >
          {/* Job Type Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Job Type Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Industry Code - Read Only */}
              <div className="space-y-2">
                <Label>Industry</Label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {availableIndustries.find(
                        i => i.code === formData.industry_code
                      )?.name || 'Loading...'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Code:{' '}
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {formData.industry_code}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Industry is preselected and cannot be changed
                </p>
              </div>

              {/* Parent Job Type - Only show when parent_code exists */}
              {formData.parent_code && (
                <div className="space-y-2">
                  <Label>Parent Job Type</Label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {formData.parent_code}
                      </div>
                      <div className="text-sm text-gray-500">
                        This job type will be a sub-type of the selected parent
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Parent job type is preselected and cannot be changed
                  </p>
                </div>
              )}

              {/* Job Type Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Job Type Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Custom Installation Service, Emergency Repair, Maintenance"
                  value={formData.name}
                  onChange={e => handleFormChange('name', e.target.value)}
                  required
                  className="h-12 text-base"
                  autoComplete="off"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Enter a descriptive name for the job type category
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  placeholder="e.g., Custom HVAC installation for residential properties"
                  value={formData.description}
                  onChange={e =>
                    handleFormChange('description', e.target.value)
                  }
                  required
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Provide a detailed description of this job type
                </p>
              </div>

              {/* Car Info Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="car_info"
                  checked={formData.car_info}
                  onChange={e => handleFormChange('car_info', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label
                  htmlFor="car_info"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Car Info
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Check if this job type requires car information
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="space-y-1">
                  <Label
                    htmlFor="active"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Active Status
                  </Label>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formData.active
                      ? 'Job type will be active and available for use'
                      : 'Job type will be inactive and hidden'}
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={checked =>
                    handleFormChange('active', checked)
                  }
                  className="ml-4"
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
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Create Job Type
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
