import { useRouter } from 'next/router'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { apiService } from '@/src/services/api'
import { usePermissions } from '@/src/hooks/usePermissions'
import { toast } from 'sonner'
import {
  SettingsNavigation,
  JobSettingsSubNavigation,
} from '@/src/components/job'
import {
  Layers,
  Factory,
  CheckCircle,
  Tag,
  MapPin,
  Shield,
  Database,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Wrench,
  Clock,
  DollarSign,
  Loader2,
} from 'lucide-react'

interface Tenant {
  _id: string
  name: string
  username: string
}

interface JobType {
  _id: string
  name: string
  code: string
  description: string
  active: boolean
  level: number
  children: JobType[]
  car_info: boolean
  industry_code: string
  parent_code: string | null
  isP1: boolean
  tenant_id: Tenant
  createdBy: Tenant
  createdAt: string
  updatedAt: string
}

interface Industry {
  industry: {
    _id: string
    name: string
    code: string
    active?: boolean
  }
  jobTypes: JobType[]
  totalCount: number
}

interface ApiResponse {
  success: boolean
  message: {
    industries: Record<string, Industry>
    totalIndustries: number
    totalJobTypes: number
    filters: {
      industry_code: string
      active: boolean
      user_access: string
    }
  }
  data: string
}

export default function JobCategoriesTypesPage() {
  const router = useRouter()
  const { checkPermission, getUserType } = usePermissions()
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingJobTypeId, setEditingJobTypeId] = useState<string>('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('')
  const [selectedParent, setSelectedParent] = useState<string>('')
  const [isSubType, setIsSubType] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    car_info: false,
    active: true,
  })
  const [submitting, setSubmitting] = useState(false)

  // Industry modal state
  const [industryModalOpen, setIndustryModalOpen] = useState(false)
  const [isIndustryEditMode, setIsIndustryEditMode] = useState(false)
  const [editingIndustry, setEditingIndustry] = useState<{
    id: string
    code: string
    name: string
    active: boolean
  } | null>(null)
  const [industryFormData, setIndustryFormData] = useState({
    name: '',
    active: true,
  })
  const [industrySubmitting, setIndustrySubmitting] = useState(false)

  // Industry delete confirmation state
  const [industryDeleteDialogOpen, setIndustryDeleteDialogOpen] =
    useState(false)
  const [industryToDelete, setIndustryToDelete] = useState<{
    id: string
    code: string
    name: string
  } | null>(null)
  const [industryDeleting, setIndustryDeleting] = useState(false)

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobTypeToDelete, setJobTypeToDelete] = useState<JobType | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (
      !checkPermission('MOD012', 'view') &&
      !checkPermission('MOD013', 'view') &&
      !checkPermission('MOD014', 'view') &&
      !checkPermission('MOD015', 'view')
    ) {
      router.push('/settings/job/status')
      return
    }
    fetchJobTypesTree()
  }, [])

  const fetchJobTypesTree = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching job types tree...')
      console.log(
        'API Base URL:',
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      )

      const response = await apiService.get('/v1/job-types/tree?active=true')

      console.log('API Response:', response)

      const responseData = response.data as ApiResponse

      if (responseData.success) {
        setData(responseData)
        // Start with all levels collapsed by default
        setExpandedItems(new Set())
      } else {
        throw new Error('API returned unsuccessful response')
      }
    } catch (err: any) {
      console.error('Error fetching job types:', err)

      let errorMessage = 'An error occurred while fetching job types'

      if (err.response) {
        // Server responded with error status
        const { status, data } = err.response
        console.error(`HTTP ${status}:`, data)

        if (status === 401) {
          errorMessage = 'Authentication required. Please log in again.'
        } else if (status === 403) {
          errorMessage =
            'Access denied. You do not have permission to view job types.'
        } else if (status === 404) {
          errorMessage =
            'Job types endpoint not found. Please check the API configuration.'
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        } else {
          errorMessage = data?.message || `HTTP Error ${status}`
        }
      } else if (err.request) {
        // Network error
        console.error('Network error:', err.request)
        errorMessage = 'Network error. Please check your internet connection.'
      } else {
        // Other error
        console.error('Other error:', err.message)
        errorMessage = err.message || 'Unknown error occurred'
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const formatErrorMessage = (errorResponse: any): string => {
    // Check if response has the error structure with details
    if (errorResponse?.details && Array.isArray(errorResponse.details) && errorResponse.details.length > 0) {
      // Format field-specific validation errors
      const errorMessages = errorResponse.details
        .map((detail: any) => {
          if (detail.field && detail.message) {
            return `${detail.field}: ${detail.message}`
          }
          return detail.message || detail.error || 'Validation error'
        })
        .filter(Boolean)
      
      if (errorMessages.length > 0) {
        return errorMessages.join('\n')
      }
    }
    
    // Fall back to general error message
    return errorResponse?.error || errorResponse?.message || 'An error occurred'
  }

  const getLevelStats = (item: JobType) => {
    const jobTypeCount = item.children.filter(child => child.level === 2).length
    const subTypeCount = item.children.filter(child => child.level === 3).length

    if (item.level === 1) {
      return `${jobTypeCount} job types`
    } else if (item.level === 2) {
      return `${subTypeCount} sub-types`
    }
    return ''
  }

  const getActionButtonText = (level: number) => {
    // All job type buttons should be labeled as "Add Sub-Type"
    return 'Add Sub-Type'
  }

  const openAddJobTypeModal = (industryCode: string) => {
    setSelectedIndustry(industryCode)
    setSelectedParent('')
    setIsSubType(false)
    setIsEditMode(false)
    setEditingJobTypeId('')
    setFormData({
      name: '',
      description: '',
      car_info: false,
      active: true,
    })
    setIsModalOpen(true)
  }

  const openAddSubTypeModal = (industryCode: string, parentCode: string) => {
    console.log('openAddSubTypeModal called with:', {
      industryCode,
      parentCode,
    })
    setSelectedIndustry(industryCode)
    setSelectedParent(parentCode)
    setIsSubType(true)
    setIsEditMode(false)
    setEditingJobTypeId('')
    setFormData({
      name: '',
      description: '',
      car_info: false,
      active: true,
    })
    setIsModalOpen(true)
    console.log('Modal state after setting:', {
      isModalOpen,
      isSubType,
      selectedParent,
    })
  }

  const openEditJobTypeModal = (jobType: JobType, industryCode: string) => {
    console.log('openEditJobTypeModal called with:', { jobType, industryCode })
    setSelectedIndustry(industryCode)
    setSelectedParent(jobType.parent_code || '')
    setIsSubType(Boolean(jobType.parent_code))
    setIsEditMode(true)
    setEditingJobTypeId(jobType._id)
    setFormData({
      name: jobType.name,
      description: jobType.description,
      car_info: jobType.car_info,
      active: jobType.active,
    })
    setIsModalOpen(true)
  }

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Job type name is required')
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

      const payload: any = {
        name: formData.name.trim(),
        industry_code: selectedIndustry,
        description: formData.description.trim(),
        active: formData.active,
        car_info: formData.car_info,
      }

      // Include parent_code if it's a sub-type
      if (isSubType && selectedParent) {
        payload.parent_code = selectedParent
      }

      let response
      if (isEditMode && editingJobTypeId) {
        // Edit mode - PUT request
        response = await apiService.put(`${url}/${editingJobTypeId}`, payload)
      } else {
        // Create mode - POST request
        if (userType === 'P1') {
          url += '/p1'
        }
        response = await apiService.post(url, payload)
      }

      if (response.data.success) {
        if (isEditMode) {
          // Update existing job type in the data structure
          if (data) {
            const updatedData = { ...data }
            const industry = updatedData.message.industries[selectedIndustry]

            if (industry) {
              // Find and update the job type
              const updateJobTypeInArray = (jobTypes: JobType[]): boolean => {
                for (let i = 0; i < jobTypes.length; i++) {
                  if (jobTypes[i]._id === editingJobTypeId) {
                    jobTypes[i] = {
                      ...jobTypes[i],
                      name: formData.name,
                      description: formData.description,
                      active: formData.active,
                      car_info: formData.car_info,
                      updatedAt: new Date().toISOString(),
                    }
                    return true
                  }
                  // Check children recursively
                  if (
                    jobTypes[i].children &&
                    updateJobTypeInArray(jobTypes[i].children)
                  ) {
                    return true
                  }
                }
                return false
              }

              updateJobTypeInArray(industry.jobTypes)
              setData(updatedData)
            }
          }

          toast.success('Job type updated successfully!')
        } else {
          // Create new job type
          const newJobType = response.data.message

          if (data && newJobType) {
            const updatedData = { ...data }
            const industry = updatedData.message.industries[selectedIndustry]

            if (industry) {
              // Create the new job type object
              const newJobTypeObj: JobType = {
                _id: newJobType._id || `temp-${Date.now()}`,
                name: formData.name,
                code:
                  newJobType.code ||
                  formData.name.toLowerCase().replace(/\s+/g, '_'),
                description: formData.description,
                active: formData.active,
                level: isSubType
                  ? (() => {
                      // Calculate the actual level based on parent's level
                      const findParentLevel = (jobTypes: JobType[]): number => {
                        for (let i = 0; i < jobTypes.length; i++) {
                          if (jobTypes[i].code === selectedParent) {
                            return jobTypes[i].level + 1
                          }
                          // Recursively search in children
                          if (jobTypes[i].children) {
                            const childLevel = findParentLevel(
                              jobTypes[i].children
                            )
                            if (childLevel > 0) return childLevel
                          }
                        }
                        return 2 // Fallback to level 2 if parent not found
                      }
                      return findParentLevel(industry.jobTypes)
                    })()
                  : 1, // Level 1 for top-level job types
                children: [],
                car_info: formData.car_info,
                industry_code: selectedIndustry,
                parent_code: isSubType ? selectedParent : null,
                isP1: false,
                tenant_id: { _id: '', name: '', username: '' },
                createdBy: { _id: '', name: '', username: '' },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }

              if (isSubType) {
                // Find the parent job type at any level and add the sub-type to its children
                const findAndAddToParent = (jobTypes: JobType[]): boolean => {
                  for (let i = 0; i < jobTypes.length; i++) {
                    if (jobTypes[i].code === selectedParent) {
                      jobTypes[i].children.push(newJobTypeObj)
                      return true
                    }
                    // Recursively search in children
                    if (
                      jobTypes[i].children &&
                      findAndAddToParent(jobTypes[i].children)
                    ) {
                      return true
                    }
                  }
                  return false
                }

                findAndAddToParent(industry.jobTypes)
              } else {
                // Add to the industry's job types (top level)
                industry.jobTypes.push(newJobTypeObj)
              }

              industry.totalCount += 1
              updatedData.message.totalJobTypes += 1

              // Update the state
              setData(updatedData)
            }
          }

          toast.success('Job type created successfully!')
        }

        setIsModalOpen(false)
      } else {
        const action = isEditMode ? 'update' : 'create'
        const errorMsg = formatErrorMessage(response.data)
        toast.error(errorMsg || `Failed to ${action} job type`)
      }
    } catch (err: any) {
      console.error('Error creating/updating job type:', err)
      const errorResponse = err.response?.data || err.response || {}
      const errorMsg = formatErrorMessage(errorResponse)
      const action = isEditMode ? 'update' : 'create'
      toast.error(errorMsg || `Failed to ${action} job type`)
    } finally {
      setSubmitting(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsEditMode(false)
    setEditingJobTypeId('')
    setSelectedIndustry('')
    setSelectedParent('')
    setIsSubType(false)
    setFormData({
      name: '',
      description: '',
      car_info: false,
      active: true,
    })
  }

  const handleDeleteJobType = (jobType: JobType) => {
    setJobTypeToDelete(jobType)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!jobTypeToDelete) return

    try {
      setDeleting(true)

      // Call the DELETE endpoint
      await apiService.delete(`/v1/job-types/${jobTypeToDelete._id}`)

      // Remove the deleted job type from local state instead of refreshing
      if (data) {
        const updatedData = { ...data }

        // Find and remove the job type from all industries
        Object.keys(updatedData.message.industries).forEach(industryCode => {
          const industry = updatedData.message.industries[industryCode]

          // Function to remove job type and its children recursively
          const removeJobTypeRecursively = (jobTypes: JobType[]): boolean => {
            for (let i = 0; i < jobTypes.length; i++) {
              if (jobTypes[i]._id === jobTypeToDelete._id) {
                // Remove this job type and all its children
                const removedCount = countJobTypesAndChildren(jobTypes[i])
                jobTypes.splice(i, 1)

                // Update counts
                industry.totalCount -= removedCount
                updatedData.message.totalJobTypes -= removedCount

                return true
              }

              // Check children recursively
              if (
                jobTypes[i].children &&
                removeJobTypeRecursively(jobTypes[i].children)
              ) {
                return true
              }
            }
            return false
          }

          removeJobTypeRecursively(industry.jobTypes)
        })

        setData(updatedData)

        // Also remove from expanded items if it was expanded
        const newExpandedItems = new Set(expandedItems)
        newExpandedItems.delete(jobTypeToDelete._id)
        setExpandedItems(newExpandedItems)
      }

      // Show success toast
      toast.success('Job type deleted successfully!', {
        description: 'The job type has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setJobTypeToDelete(null)
    } catch (err: any) {
      console.error('Error deleting job type:', err)
      // Show error toast
      toast.error('Failed to delete job type', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the job type.',
      })
    } finally {
      setDeleting(false)
    }
  }

  // Helper function to count job types and their children recursively
  const countJobTypesAndChildren = (jobType: JobType): number => {
    let count = 1 // Count the current job type

    // Count all children recursively
    if (jobType.children && jobType.children.length > 0) {
      jobType.children.forEach(child => {
        count += countJobTypesAndChildren(child)
      })
    }

    return count
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setJobTypeToDelete(null)
  }

  const handleAddIndustry = () => {
    setIsIndustryEditMode(false)
    setEditingIndustry(null)
    setIndustryFormData({ name: '', active: true })
    setIndustryModalOpen(true)
  }

  const handleEditIndustry = (
    industryId: string,
    industryCode: string,
    industryName: string,
    industryActive: boolean
  ) => {
    setIsIndustryEditMode(true)
    setEditingIndustry({
      id: industryId,
      code: industryCode,
      name: industryName,
      active: industryActive,
    })
    setIndustryFormData({ name: industryName, active: industryActive })
    setIndustryModalOpen(true)
  }

  const handleIndustryFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!industryFormData.name.trim()) {
      toast.error('Industry name is required')
      return
    }

    try {
      setIndustrySubmitting(true)
      const userType = getUserType()
      let url = `/v1/industries`

      if (userType === 'P1') {
        url += `/P1`
      }

      let response
      if (isIndustryEditMode && editingIndustry) {
        // Edit mode - PUT request
        response = await apiService.put(
          `/v1/industries/${editingIndustry.id}`,
          {
            name: industryFormData.name.trim(),
            active: industryFormData.active,
          }
        )
      } else {
        // Create mode - POST request
        response = await apiService.post(url, {
          name: industryFormData.name.trim(),
          active: industryFormData.active,
        })
      }

      if (response.data.success) {
        if (isIndustryEditMode && editingIndustry) {
          // Update existing industry in local state
          if (data) {
            const updatedData = { ...data }
            const industry =
              updatedData.message.industries[editingIndustry.code]

            if (industry) {
              // Update the industry data
              industry.industry.name = industryFormData.name
              // Note: active status is not stored in the current data structure
            }

            // Update the state
            setData(updatedData)
          }

          toast.success('Industry updated successfully!', {
            description: 'The industry has been updated in the system.',
          })
        } else {
          // Add the new industry to local state without refreshing
          if (data) {
            const updatedData = { ...data }
            const newIndustry = response.data.data // Use data field, not message

            // Create the new industry structure
            const newIndustryData = {
              industry: {
                _id: newIndustry._id,
                name: newIndustry.name,
                code: newIndustry.code,
              },
              jobTypes: [],
              totalCount: 0,
            }

            // Add the new industry to the industries object
            updatedData.message.industries[newIndustry.code] = newIndustryData
            updatedData.message.totalIndustries += 1

            // Update the state
            setData(updatedData)
          }

          toast.success('Industry created successfully!', {
            description: 'The industry has been created in the system.',
          })
        }

        // Close modal and reset form
        setIndustryModalOpen(false)
        setIndustryFormData({ name: '', active: true })
        setIsIndustryEditMode(false)
        setEditingIndustry(null)
      } else {
        const errorMsg = formatErrorMessage(response.data)
        const action = isIndustryEditMode ? 'update' : 'create'
        toast.error(errorMsg || `Failed to ${action} industry`)
      }
    } catch (err: any) {
      console.error('Error creating/updating industry:', err)
      const errorResponse = err.response?.data || err.response || {}
      const errorMsg = formatErrorMessage(errorResponse)
      const action = isIndustryEditMode ? 'update' : 'create'
      toast.error(errorMsg || `Failed to ${action} industry`)
    } finally {
      setIndustrySubmitting(false)
    }
  }

  const handleIndustryFormChange = (field: string, value: string | boolean) => {
    setIndustryFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDeleteIndustry = (
    industryId: string,
    industryCode: string,
    industryName: string
  ) => {
    setIndustryToDelete({
      id: industryId,
      code: industryCode,
      name: industryName,
    })
    setIndustryDeleteDialogOpen(true)
  }

  const handleIndustryDeleteConfirm = async () => {
    if (!industryToDelete) return

    try {
      setIndustryDeleting(true)

      // Call the DELETE endpoint
      await apiService.delete(`/v1/industries/${industryToDelete.id}`)

      // Remove the deleted industry from local state without refreshing
      if (data) {
        const updatedData = { ...data }

        // Get the industry data to calculate total job types to remove
        const industryToRemove =
          updatedData.message.industries[industryToDelete.code]
        if (industryToRemove) {
          // Remove the industry
          delete updatedData.message.industries[industryToDelete.code]

          // Update counts
          updatedData.message.totalIndustries -= 1
          updatedData.message.totalJobTypes -= industryToRemove.totalCount

          // Update the state
          setData(updatedData)
        }
      }

      // Show success toast
      toast.success('Industry deleted successfully!', {
        description: 'The industry has been removed from the system.',
      })

      // Close dialog and reset state
      setIndustryDeleteDialogOpen(false)
      setIndustryToDelete(null)
    } catch (err: any) {
      console.error('Error deleting industry:', err)
      // Show error toast
      toast.error('Failed to delete industry', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the industry.',
      })
    } finally {
      setIndustryDeleting(false)
    }
  }

  const handleIndustryDeleteCancel = () => {
    setIndustryDeleteDialogOpen(false)
    setIndustryToDelete(null)
  }

  const renderJobTypeItem = (item: JobType, depth: number = 0) => {
    const isExpanded = expandedItems.has(item._id)
    const hasChildren = item.children && item.children.length > 0
    const canExpand = hasChildren && item.level < 4

    // Calculate width based on depth - each level gets slightly narrower
    const widthPercentage = Math.max(100 - depth * 8, 70) // Minimum 70% width

    return (
      <div key={item._id} className="space-y-1">
        <div
          className={`
            relative flex items-start justify-between p-4 rounded-lg border transition-all duration-200
            ${depth === 0 ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-100'}
            hover:shadow-md hover:border-gray-300 hover:bg-${depth === 0 ? 'gray-50' : 'white'}
          `}
          style={{
            width: `${widthPercentage}%`,
            marginLeft: `${depth * 24}px`,
          }}
        >
          {/* Expand/collapse button with better positioning */}
          {canExpand && (
            <button
              onClick={() => toggleExpanded(item._id)}
              className={`
                absolute p-2 hover:bg-blue-100 rounded-full transition-all duration-200
                ${isExpanded ? 'bg-blue-50 text-blue-700' : 'text-blue-600 hover:text-blue-700'}
              `}
              style={{ left: '8px', top: '16px' }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Main content with proper indentation */}
          <div
            className="flex-1"
            style={{ marginLeft: canExpand ? '40px' : '16px' }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                {/* Header with badges */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    {item.active && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    )}
                    {item.car_info && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Car Info
                      </span>
                    )}
                    {item.isP1 && (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        P1
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Stats and metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {item.code}
                  </span>
                  {getLevelStats(item)}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-4">
            {(checkPermission('MOD014', 'create') ||
              checkPermission('MOD015', 'create')) && (
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-colors"
                onClick={() => {
                  openAddSubTypeModal(item.industry_code, item.code)
                }}
              >
                <Plus className="w-4 h-4" />
                {getActionButtonText(item.level)}
              </Button>
            )}
            {((checkPermission('MOD014', 'edit') && item.isP1) ||
              (checkPermission('MOD015', 'edit') && !item.isP1)) && (
              <Button
                size="sm"
                variant="ghost"
                className="p-2 hover:bg-gray-100 transition-colors"
                onClick={() => openEditJobTypeModal(item, item.industry_code)}
              >
                <Edit className="w-4 h-4 text-gray-600" />
              </Button>
            )}
            {/* Only show delete button if job type has no subtypes */}
            {((checkPermission('MOD014', 'delete') && item.isP1) ||
              (checkPermission('MOD015', 'delete') && !item.isP1)) && (
              <>
                {(!item.children || item.children.length === 0) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                    onClick={() => handleDeleteJobType(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Children with visual connection lines */}
        {isExpanded && hasChildren && (
          <div className="relative">
            {/* Vertical connection line */}
            <div
              className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-blue-300 to-gray-200"
              style={{ left: `${depth * 24 + 16}px` }}
            />

            {/* Children container */}
            <div className="space-y-2">
              {item.children.map(child => renderJobTypeItem(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job categories...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <Wrench className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            <p>This could be due to:</p>
            <ul className="text-left mt-2 space-y-1">
              <li>• API endpoint not available</li>
              <li>• Authentication required</li>
              <li>• Network connectivity issues</li>
              <li>• Server maintenance</li>
            </ul>
          </div>
          <Button onClick={fetchJobTypesTree} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Job Industries & Types - Settings - WePro</title>
        <meta
          name="description"
          content="Organize your services with industries, job types, and sub-types"
        />
      </Head>
      <div className="space-y-6">
        {/* Main Tab Navigation */}
        <SettingsNavigation />

        {/* Sub Tab Navigation */}
        <JobSettingsSubNavigation
          getUserType={getUserType}
          checkPermission={checkPermission}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Job Industries & Types
            </h1>
          </div>
          {(checkPermission('MOD012', 'create') ||
            checkPermission('MOD013', 'create')) && (
            <Button
              onClick={handleAddIndustry}
              className="wepro-button-gradient text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Industry
            </Button>
          )}
        </div>

        {/* Content Area */}
        <Card>
          <CardContent className="pt-6">
            {data && Object.keys(data.message.industries).length > 0 ? (
              <div className="space-y-6">
                {/* Summary Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 mb-1">
                        Overview
                      </h3>
                      <p className="text-blue-700 text-sm">
                        {data.message.totalIndustries} industry •{' '}
                        {data.message.totalJobTypes} total job types
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-900">
                        {data.message.totalJobTypes}
                      </div>
                      <div className="text-blue-600 text-sm">Job Types</div>
                    </div>
                  </div>
                </div>

                {/* Industries */}
                {Object.values(data.message.industries).map(industry => (
                  <div key={industry.industry.code} className="space-y-4">
                    {/* Industry Header */}
                    <div className="border-b-2 border-gray-200 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {industry.industry.name}
                          </h2>
                          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                            {industry.totalCount} job types
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {(checkPermission('MOD014', 'create') ||
                            checkPermission('MOD015', 'create')) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-colors"
                              onClick={() =>
                                openAddJobTypeModal(industry.industry.code)
                              }
                            >
                              <Plus className="w-4 h-4" />
                              Add Job Type
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mt-2 ml-6">
                        Industry Code:{' '}
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {industry.industry.code}
                        </span>
                      </p>
                    </div>

                    {/* Job Types Tree */}
                    <div className="space-y-3">
                      {industry.jobTypes.map(jobType =>
                        renderJobTypeItem(jobType)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Layers className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No Job Industries Found
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Start by adding your first job industry to organize your
                  services.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Job Type Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditMode ? (
                <Edit className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {isEditMode
                ? isSubType
                  ? 'Edit Sub-Type'
                  : 'Edit Job Type'
                : isSubType
                  ? 'Add New Sub-Type'
                  : 'Add New Job Type'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Industry Display */}
            <div className="space-y-2">
              <Label>Industry</Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="text-sm font-medium text-gray-900">
                  {data?.message.industries[selectedIndustry]?.industry.name ||
                    selectedIndustry}
                </div>
              </div>
            </div>

            {/* Parent Job Type Display - Only show when adding sub-type */}
            {isSubType && selectedParent && (
              <div className="space-y-2">
                <Label>Parent Job Type</Label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="text-sm font-medium text-gray-900">
                    {(() => {
                      // Find the parent job type name from the data structure
                      if (data && selectedIndustry) {
                        const industry =
                          data.message.industries[selectedIndustry]
                        if (industry) {
                          const parentJobType = industry.jobTypes.find(
                            jt => jt.code === selectedParent
                          )
                          if (parentJobType) {
                            return parentJobType.name
                          }
                        }
                      }
                      return selectedParent // Fallback to code if name not found
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Job Type Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Job Type Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Custom Installation Service"
                value={formData.name}
                onChange={e => handleFormChange('name', e.target.value)}
                required
                className="h-10"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                placeholder="e.g., Custom HVAC installation for residential properties"
                value={formData.description}
                onChange={e => handleFormChange('description', e.target.value)}
                required
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={2}
              />
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
                className="text-sm font-medium text-gray-700"
              >
                Car Info
              </Label>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="space-y-1">
                <Label
                  htmlFor="active"
                  className="text-sm font-medium text-gray-700"
                >
                  Active Status
                </Label>
                <p className="text-xs text-gray-500">
                  {formData.active
                    ? 'Job type will be active'
                    : 'Job type will be inactive'}
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={checked => handleFormChange('active', checked)}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={submitting}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                size="sm"
                className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isEditMode ? (
                      <Edit className="h-4 h-4 mr-2" />
                    ) : (
                      <Plus className="h-4 h-4 mr-2" />
                    )}
                    {isEditMode ? 'Update Job Type' : 'Create Job Type'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Industry Modal - Create */}
      <Dialog open={industryModalOpen} onOpenChange={setIndustryModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {isIndustryEditMode ? 'Edit Industry' : 'Add New Industry'}
            </DialogTitle>
            <DialogDescription className="text-base text-neutral-600 dark:text-neutral-400 mt-2">
              {isIndustryEditMode
                ? 'Update the industry information below.'
                : 'Create a new industry category to organize and classify your business data.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleIndustryFormSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="industry-name"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Industry Name *
              </Label>
              <Input
                id="industry-name"
                placeholder="e.g., Healthcare, Technology, Finance, Manufacturing"
                value={industryFormData.name}
                onChange={e => handleIndustryFormChange('name', e.target.value)}
                required
                className="h-12 text-base"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Enter a descriptive name for the industry category
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="space-y-1">
                <Label
                  htmlFor="industry-active"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Active Status
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {industryFormData.active
                    ? 'Industry will be active and available for use'
                    : 'Industry will be inactive and hidden'}
                </p>
              </div>
              <Switch
                id="industry-active"
                checked={industryFormData.active}
                onCheckedChange={checked =>
                  handleIndustryFormChange('active', checked)
                }
                className="ml-4"
              />
            </div>

            <DialogFooter className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIndustryModalOpen(false)
                  setIndustryFormData({ name: '', active: true })
                  setIsIndustryEditMode(false)
                  setEditingIndustry(null)
                }}
                disabled={industrySubmitting}
                className="h-11 px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={industrySubmitting}
                className="wepro-button-gradient text-white h-11 px-6"
              >
                {industrySubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isIndustryEditMode
                      ? 'Updating Industry...'
                      : 'Creating Industry...'}
                  </>
                ) : isIndustryEditMode ? (
                  'Update Industry'
                ) : (
                  'Create Industry'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Industry Delete Confirmation Dialog */}
      <AlertDialog
        open={industryDeleteDialogOpen}
        onOpenChange={setIndustryDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Industry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{industryToDelete?.name}</strong>? This action cannot be
              undone and will permanently remove the industry and all its job
              types from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleIndustryDeleteCancel}
              disabled={industryDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleIndustryDeleteConfirm}
              disabled={industryDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {industryDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{jobTypeToDelete?.name}</strong>? This action cannot be
              undone and will permanently remove the job type from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
