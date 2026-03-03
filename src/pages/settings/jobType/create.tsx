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

interface Industry {
  _id: string
  name: string
  code: string
  isP1: boolean
  active: boolean
}

interface JobType {
  _id: string
  name: string
  code: string
  industry_code: string
  parent_code: string | null
  isP1: boolean
  active: boolean
  level: number
  description: string
}

export default function CreateJobTypePage() {
  const router = useRouter()
  const { id } = router.query
  const { checkPermission, getUserType } = usePermissions()

  // Check if we're editing (id exists in URL)
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    industry_code: '',
    parent_code: '',
    description: '',
    car_info: false,
    active: true,
    isSubType: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [industriesLoading, setIndustriesLoading] = useState(false)
  const [availableIndustries, setAvailableIndustries] = useState<Industry[]>([])
  const [industryOpen, setIndustryOpen] = useState(false)
  const [jobTypesLoading, setJobTypesLoading] = useState(false)
  const [jobTypesSearching, setJobTypesSearching] = useState(false)
  const [availableJobTypes, setAvailableJobTypes] = useState<JobType[]>([])
  const [jobTypeOpen, setJobTypeOpen] = useState(false)
  const [jobTypeSearch, setJobTypeSearch] = useState('')

  const user = useAppSelector(state => state.user.data)
  const tenantId = user?.tenantId

  // Fetch industries from API
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setIndustriesLoading(true)
        const userType = getUserType()
        let url = '/v3/industries'

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
  }, []) // Remove getUserType from dependencies since it's stable

  // Fetch job type data for editing
  useEffect(() => {
    const fetchJobTypeForEdit = async () => {
      if (isEditing && id && typeof id === 'string' && !formData.name) {
        console.log('Fetching job type for edit:', id)
        try {
          setSubmitting(true)
          const userType = getUserType()
          let url = `/v3/job-types/${id}`

          const response = await apiService.get(url)
          if (response.data.success) {
            const jobType = response.data.message
            console.log('Job type data loaded:', jobType)
            setFormData({
              name: jobType.name || '',
              industry_code: jobType.industry_code || '',
              parent_code: jobType.parent_code || '',
              description: jobType.description || '',
              car_info: jobType.car_info || false,
              active: jobType.active !== undefined ? jobType.active : true,
              isSubType: Boolean(jobType.parent_code),
            })
          }
        } catch (error) {
          console.error('Error fetching job type for edit:', error)
          toast.error('Failed to load job type data')
        } finally {
          setSubmitting(false)
        }
      }
    }

    fetchJobTypeForEdit()
  }, [id, isEditing, formData.name]) // Added formData.name to prevent unnecessary API calls

  // Fetch job types from API
  const fetchJobTypes = useCallback(async () => {
    try {
      setJobTypesLoading(true)
      const userType = getUserType()
      let url = '/v3/job-types'

      if (userType === 'P1') {
        url += '/P1'
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: '1',
        limit: '20',
        sort: 'name',
      })

      // Only include industry_code if it's selected
      if (formData.industry_code) {
        params.append('industry_code', formData.industry_code)
      }

      url += `?${params.toString()}`

      const response = await apiService.get(url)
      if (response.data.success) {
        setAvailableJobTypes(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching job types:', error)
      toast.error('Failed to load job types')
    } finally {
      setJobTypesLoading(false)
    }
  }, [formData.industry_code])

  useEffect(() => {
    // Only fetch if we have an industry_code and we're in sub-type mode
    if (formData.industry_code && formData.isSubType) {
      console.log('Fetching job types for industry:', formData.industry_code)
      fetchJobTypes()
    }
  }, [formData.industry_code, formData.isSubType, fetchJobTypes]) // Refetch when industry_code or isSubType changes

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Fetch job types with search
  const fetchJobTypesWithSearch = useCallback(
    async (searchTerm: string) => {
      try {
        console.log('fetchJobTypesWithSearch called with:', searchTerm)
        setJobTypesSearching(true)
        const userType = getUserType()
        let url = '/v3/job-types'

        if (userType === 'P1') {
          url += '/P1'
        }

        // Build query parameters
        const params = new URLSearchParams({
          page: '1',
          limit: '20',
          sort: 'name',
          search: searchTerm,
        })

        // Only include industry_code if it's selected
        if (formData.industry_code) {
          params.append('industry_code', formData.industry_code)
        }

        url += `?${params.toString()}`
        console.log('Making API call to:', url)

        const response = await apiService.get(url)
        console.log('API response:', response.data)
        if (response.data.success) {
          setAvailableJobTypes(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching job types with search:', error)
        toast.error('Failed to load job types')
      } finally {
        setJobTypesSearching(false)
      }
    },
    [formData.industry_code]
  )

  const getSelectedIndustryName = () => {
    const selectedIndustry = availableIndustries.find(
      i => i.code === formData.industry_code
    )
    return selectedIndustry
      ? `${selectedIndustry.name} (${selectedIndustry.code})`
      : ''
  }

  const getSelectedJobTypeName = () => {
    const selectedJobType = availableJobTypes.find(
      j => j.code === formData.parent_code
    )
    return selectedJobType
      ? `${selectedJobType.name} (${selectedJobType.code})`
      : ''
  }

  // Check permission to access this page
  if (
    !isEditing &&
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
              onClick={() => router.push('/settings/jobType')}
              variant="outline"
            >
              Back to Job Types
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (
    isEditing &&
    !checkPermission('MOD014', 'edit') &&
    !checkPermission('MOD015', 'edit')
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
            You don't have permission to edit job types.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => router.push('/settings/jobType')}
              variant="outline"
            >
              Back to Job Types
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

    // Validate parent_code only if it's a sub type
    if (formData.isSubType && !formData.parent_code.trim()) {
      toast.error('Parent code is required for sub types')
      return
    }

    try {
      setSubmitting(true)
      const userType = getUserType()
      let url = '/v3/job-types'

      // Prepare payload according to API specification
      const payload: any = {
        name: formData.name.trim(),
        industry_code: formData.industry_code.trim(),
        description: formData.description.trim(),
        active: formData.active,
        car_info: formData.car_info,
      }

      // Only include parent_code if it's a sub type
      if (formData.isSubType) {
        payload.parent_code = formData.parent_code.trim()
      }

      console.log('Sending payload to API:', payload)
      console.log('API endpoint:', url)

      let response
      if (isEditing && id) {
        // Edit mode - PUT request
        response = await apiService.put(`${url}/${id}`, payload)
        console.log('API response (edit):', response.data)
      } else {
        // Create mode - POST request
        if (userType === 'P1') {
          url += '/p1' // Note: lowercase 'p1' as per API specification
        }
        response = await apiService.post(url, payload)
        console.log('API response (create):', response.data)
      }

      if (response.data.success) {
        const action = isEditing ? 'updated' : 'created'
        toast.success(`Job type ${action} successfully!`, {
          description: `The job type has been ${action} in the system.`,
        })

        // Redirect back to job types list
        router.push('/settings/jobType')
      } else {
        console.error('API returned error:', response.data)
        const action = isEditing ? 'updating' : 'creating'
        toast.error(
          `Failed to ${action === 'updating' ? 'update' : 'create'} job type`,
          {
            description:
              response.data.message ||
              `An error occurred while ${action} the job type.`,
          }
        )
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

    // Reset parent_code when unchecking isSubType
    if (field === 'isSubType' && !value) {
      setFormData(prev => ({
        ...prev,
        parent_code: '',
      }))
    }

    // Reset parent_code when industry_code is cleared
    if (field === 'industry_code' && !value) {
      setFormData(prev => ({
        ...prev,
        parent_code: '',
      }))
    }
  }

  const handleIndustrySelect = (industryCode: string) => {
    setFormData(prev => ({
      ...prev,
      industry_code: industryCode,
      parent_code: '', // Clear parent_code when industry changes
    }))
    setIndustryOpen(false)

    // Refresh job types for the new industry
    if (formData.isSubType) {
      // Use setTimeout to avoid calling fetchJobTypes during state update
      setTimeout(() => fetchJobTypes(), 0)
    }
  }

  const handleJobTypeSelect = (jobTypeCode: string) => {
    setFormData(prev => ({
      ...prev,
      parent_code: jobTypeCode,
    }))
    setJobTypeOpen(false)
    setJobTypeSearch('') // Reset search when selection is made
  }

  // Debounced search function using useRef to maintain timeout across renders
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const debouncedSearch = React.useCallback(
    (searchTerm: string) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        console.log('Debounced search triggered with term:', searchTerm)
        if (searchTerm.trim().length >= 2) {
          console.log(
            'Calling fetchJobTypesWithSearch with:',
            searchTerm.trim()
          )
          fetchJobTypesWithSearch(searchTerm.trim())
        } else if (searchTerm.trim().length === 0) {
          console.log('Calling fetchJobTypes (empty search)')
          // If search term is empty, fetch all job types using the original function
          fetchJobTypes()
        }
        // If search term is 1 character, don't make API call
      }, 500) // 500ms delay
    },
    [fetchJobTypes, fetchJobTypesWithSearch]
  )

  const handleJobTypeSearchChange = (searchValue: string) => {
    console.log('Search value changed:', searchValue)
    setJobTypeSearch(searchValue)
    debouncedSearch(searchValue)
  }

  const handleCancel = () => {
    router.push('/settings/jobType')
  }

  return (
    <>
      <Head>
        <title>
          {isEditing ? 'Edit Job Type' : 'Create Job Type'} - Settings - WePro
        </title>
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
            Back to Job Types
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEditing ? 'Edit Job Type' : 'Create New Job Type'}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            {isEditing
              ? 'Update the job type information below'
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
              {/* Industry Code */}
              <div className="space-y-2">
                <Label htmlFor="industry_code">Industry Code *</Label>
                <Popover open={industryOpen} onOpenChange={setIndustryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={industryOpen}
                      className="w-full justify-between"
                      disabled={industriesLoading}
                    >
                      {industriesLoading
                        ? 'Loading industries...'
                        : formData.industry_code
                          ? getSelectedIndustryName()
                          : 'Select an industry...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Search industry..." />
                      <CommandList>
                        <CommandEmpty>
                          {industriesLoading
                            ? 'Loading industries...'
                            : 'No industry found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {availableIndustries.map(industry => (
                            <CommandItem
                              key={industry._id}
                              value={`${industry.name} ${industry.code}`}
                              onSelect={() =>
                                handleIndustrySelect(industry.code)
                              }
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  formData.industry_code === industry.code
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {industry.name} ({industry.code})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Select an industry from the dropdown
                </p>
              </div>

              {/* Is Sub Type Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isSubType"
                  checked={formData.isSubType}
                  onChange={e =>
                    handleFormChange('isSubType', e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label
                  htmlFor="isSubType"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Is sub type
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Check if this job type is a sub-category of another job type
                </p>
              </div>

              {/* Parent Code - Only show when isSubType is checked */}
              {formData.isSubType && (
                <div className="space-y-2">
                  <Label htmlFor="parent_code">Parent Job Type *</Label>
                  <Popover
                    open={jobTypeOpen}
                    onOpenChange={open => {
                      setJobTypeOpen(open)
                      if (!open) {
                        setJobTypeSearch('') // Reset search when dropdown is closed
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={jobTypeOpen}
                        className="w-full justify-between"
                        disabled={jobTypesLoading || !formData.industry_code}
                      >
                        {!formData.industry_code
                          ? 'Select an industry first...'
                          : jobTypesLoading
                            ? 'Loading job types...'
                            : formData.parent_code
                              ? getSelectedJobTypeName()
                              : 'Select a parent job type...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command shouldFilter={false}>
                        <div className="relative">
                          <CommandInput
                            placeholder="Search parent job type..."
                            value={jobTypeSearch}
                            onValueChange={handleJobTypeSearchChange}
                          />
                          {jobTypesSearching && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CommandList>
                          <CommandEmpty>
                            {jobTypesSearching
                              ? 'Searching...'
                              : jobTypesLoading
                                ? 'Loading job types...'
                                : 'No job type found.'}
                          </CommandEmpty>
                          <CommandGroup>
                            {availableJobTypes.map(jobType => (
                              <CommandItem
                                key={jobType._id}
                                value={`${jobType.name} ${jobType.code}`}
                                onSelect={() =>
                                  handleJobTypeSelect(jobType.code)
                                }
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    formData.parent_code === jobType.code
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {jobType.name} ({jobType.code})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {!formData.industry_code
                      ? 'Please select an industry first to choose a parent job type'
                      : 'Select a parent job type from the dropdown'}
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
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Job Type' : 'Create Job Type'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
