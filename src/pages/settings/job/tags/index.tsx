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
import { Badge } from '@/src/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  MoreVertical,
  Eye,
  Shield,
  Loader2,
  Building2,
} from 'lucide-react'
import {
  SettingsNavigation,
  JobSettingsSubNavigation,
} from '@/src/components/job'
import { usePermissions } from '@/src/hooks/usePermissions'
import { useDebounce } from '@/src/hooks/useDebounce'
import { useAppSelector } from '@/src/store/hooks'
import { TableLoading } from '@/src/components/ui/loading'
import { toast } from 'sonner'
import { JobTag, JobTagsResponse } from '@/src/constants/interface/jobTags'
import { apiService } from '@/src/services/api'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'

const formatDate = (dateString: string | undefined) => {
  if (!dateString) {
    return 'N/A'
  }
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid Date'
  }
}

export default function JobTagsPage() {
  const router = useRouter()
  const { checkPermission, getUserType, userData, isSuperAdmin } =
    usePermissions()
  const tenantId = userData?.tenantId

  // State for job tags
  const [jobTags, setJobTags] = useState<JobTag[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pagination, setPagination] = useState({
    current: { page: 1, limit: 20 },
    total: 0,
    pages: 0,
    next: { page: 2, limit: 20 },
  })

  // State for modal and form
  const [jobTagModalOpen, setJobTagModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingJobTag, setEditingJobTag] = useState<JobTag | null>(null)
  const [jobTagSubmitted, setJobTagSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    background_color: '#3B82F6',
    text_color: '#FFFFFF',
  })

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobTagToDelete, setJobTagToDelete] = useState<JobTag | null>(null)
  const [deleting, setDeleting] = useState(false)

  // State for form submission
  const [submitting, setSubmitting] = useState(false)

  // Fetch job tags from API
  const fetchJobTags = useCallback(async () => {
    if (!tenantId) return

    try {
      setLoading(true)
      setError(null)

      // Determine which endpoint to use based on user permissions
      const isP1User =
        getUserType() === 'P1' || checkPermission('MOD023', 'view')

      // Use P1 endpoint if user has P1 permissions
      const baseUrl = isP1User ? '/v3/job-tags/p1' : '/v3/job-tags'
      let url = `${baseUrl}?page=${currentPage}&limit=${entriesPerPage}&tenantId=${tenantId}`

      if (debouncedSearchTerm.trim()) {
        url += `&search=${encodeURIComponent(debouncedSearchTerm.trim())}`
      }

      const response = await apiService.get<JobTagsResponse>(url)

      setJobTags(response.data.data)
      setTotalCount(response.data.count)
      setTotalPages(response.data.pagination.pages)
      setPagination({
        current: response.data.pagination.current,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
        next: { page: currentPage + 1, limit: entriesPerPage },
      })
      setError(null)
    } catch (err: any) {
      console.error('Error fetching job tags:', err)
      setError('Failed to fetch job tags')
      setJobTags([])
      setTotalCount(0)
      setTotalPages(0)
      setPagination({
        current: { page: 1, limit: 20 },
        total: 0,
        pages: 0,
        next: { page: 2, limit: 20 },
      })
    } finally {
      setLoading(false)
    }
  }, [
    currentPage,
    entriesPerPage,
    debouncedSearchTerm,
    tenantId,
    getUserType,
    checkPermission,
  ])

  // Fetch job tags on component mount and when dependencies change
  useEffect(() => {
    if (
      !checkPermission('MOD021', 'view') &&
      !checkPermission('MOD022', 'view')
    ) {
      router.push('/settings/job/tag-notes')
      return
    }
    fetchJobTags()
  }, [currentPage, entriesPerPage, debouncedSearchTerm])

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1)
    setPagination(prev => ({
      ...prev,
      current: { ...prev.current, page: 1 },
    }))
  }, [debouncedSearchTerm])

  const handleDeleteJobTag = (jobTag: JobTag) => {
    setJobTagToDelete(jobTag)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!jobTagToDelete) return

    try {
      setDeleting(true)

      // Call API to delete job tag
      // Determine endpoint based on user permissions
      const isP1User = getUserType() === 'P1'
      const hasP1Permission = checkPermission('MOD021', 'delete')
      const endpoint =
        isP1User || hasP1Permission
          ? `/v3/job-tags/p1/${jobTagToDelete._id}`
          : `/v3/job-tags/${jobTagToDelete._id}`

      await apiService.delete(endpoint)

      // Refresh the list
      await fetchJobTags()

      // Show success toast
      toast.success('Job tag deleted successfully!', {
        description: 'The job tag has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setJobTagToDelete(null)
    } catch (err: any) {
      console.error('Error deleting job tag:', err)
      toast.error('Failed to delete job tag', {
        description: 'An error occurred while deleting the job tag.',
        style: {
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: '1px solid #f87171',
        },
        className: 'text-white',
        descriptionClassName: 'text-white',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setJobTagToDelete(null)
  }

  const handleAddJobTag = () => {
    setIsEditMode(false)
    setEditingJobTag(null)
    setFormData({
      name: '',
      description: '',
      background_color: '#3B82F6',
      text_color: '#FFFFFF',
    })
    setJobTagSubmitted(false)
    setJobTagModalOpen(true)
  }

  const handleEditJobTag = (jobTag: JobTag) => {
    setIsEditMode(true)
    setEditingJobTag(jobTag)
    setFormData({
      name: jobTag.name,
      description: jobTag.description || '',
      background_color: jobTag.background_color ?? jobTag.color ?? '',
      text_color: jobTag.text_color ?? '',
    })
    setJobTagSubmitted(false)
    setJobTagModalOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setJobTagSubmitted(true)

    if (!formData.name.trim()) {
      toast.error('Job tag name is required', {
        style: {
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: '1px solid #f87171',
        },
        className: 'text-white',
        descriptionClassName: 'text-white',
      })
      return
    }

    if (!formData.background_color || !formData.text_color) {
      toast.error('Both background color and text color are required', {
        style: {
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: '1px solid #f87171',
        },
        className: 'text-white',
        descriptionClassName: 'text-white',
      })
      return
    }

    try {
      setSubmitting(true)

      if (isEditMode && editingJobTag) {
        // Edit mode - update existing tag
        // Determine endpoint based on user permissions
        const isP1User = getUserType() === 'P1'
        const hasP1Permission = checkPermission('MOD021', 'update')
        const endpoint =
          isP1User || hasP1Permission
            ? `/v3/job-tags/p1/${editingJobTag._id}`
            : `/v3/job-tags/${editingJobTag._id}`

        const updateResponse = await apiService.put<{
          success: boolean
          data: JobTag
          message: string
        }>(endpoint, {
          name: formData.name,
          description: formData.description,
          background_color: formData.background_color,
          text_color: formData.text_color,
        })
        toast.success('Job tag updated successfully!', {
          description: 'The job tag has been updated in the system.',
        })
      } else {
        // Create mode - add new tag
        // Determine endpoint based on user permissions
        const isP1User = getUserType() === 'P1'
        const hasP1Permission = checkPermission('MOD021', 'create')
        const endpoint =
          isP1User || hasP1Permission ? '/v3/job-tags/p1' : '/v3/job-tags'

        const createResponse = await apiService.post<{
          success: boolean
          data: JobTag
          message: string
        }>(endpoint, {
          name: formData.name,
          description: formData.description,
          background_color: formData.background_color,
          text_color: formData.text_color,
        })

        const newJobTag = createResponse.data.data
        console.log('Created job tag:', newJobTag)
        toast.success('Job tag created successfully!', {
          description: `The job tag "${formData.name}" has been created in the system.`,
        })
      }

      // Close modal and reset form
      setJobTagModalOpen(false)
      setFormData({
        name: '',
        description: '',
        background_color: '#3B82F6',
        text_color: '#FFFFFF',
      })
      setIsEditMode(false)
      setEditingJobTag(null)

      // Refresh the job tags list
      await fetchJobTags()
    } catch (err: any) {
      const action = isEditMode ? 'updating' : 'creating'
      console.error(`Error ${action} job tag:`, err)

      // Extract error message from API response if available
      let errorMessage = `An error occurred while ${action} the job tag.`
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      toast.error(`Failed to ${action} job tag`, {
        description: err.response?.data?.details?.[0]?.message ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        'An error occurred while saving the changes.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormChange = (
    field: string,
    value: string | boolean | number | object
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setPagination(prev => ({
      ...prev,
      current: { ...prev.current, page },
      next: { page: page + 1, limit: prev.current.limit },
    }))
  }

  const handleEntriesChange = (value: string) => {
    const newLimit = parseInt(value)
    setEntriesPerPage(newLimit)
    setCurrentPage(1)
    setPagination(prev => ({
      ...prev,
      current: { page: 1, limit: newLimit },
      next: { page: 2, limit: newLimit },
    }))
  }

  return (
    <>
      <Head>
        <title>Job Tags - WePro</title>
        <meta name="description" content="Manage job tags" />
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
              Job Tags
            </h1>
          </div>
          {(getUserType() === 'P1' ||
            checkPermission('MOD021', 'create') ||
            checkPermission('MOD022', 'create')) && (
            <Button
              onClick={handleAddJobTag}
              className="wepro-button-gradient text-white"
              disabled={!tenantId}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Job Tag
            </Button>
          )}
        </div>

        {/* Search Component */}
        {tenantId && (
          <Card>
            <CardContent className="pt-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Search
                  </span>
                </div>
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search job tags..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Area */}
        {!tenantId ? (
          <Card className="pt-6">
            <CardContent>
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Tenant ID Required
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Unable to load job tags. Please ensure you are logged in with
                  a valid tenant account.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 mx-auto"
                >
                  <div className="h-4 w-4 rotate-45 border-2 border-current border-t-transparent border-r-transparent" />
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop View */}
            <Card className="hidden md:block pt-6">
              <CardContent>
                {/* Table Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  {/* Show Entries Dropdown */}
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="entries"
                      className="text-sm text-neutral-600 dark:text-neutral-400"
                    >
                      Show
                    </Label>
                    <Select
                      value={pagination.current.limit.toString()}
                      onValueChange={handleEntriesChange}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="40">40</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <Label className="text-sm text-neutral-600 dark:text-neutral-400">
                      entries
                    </Label>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tag Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status Code</TableHead>
                        {checkPermission('MOD022', 'view') && (
                          <TableHead>Type</TableHead>
                        )}
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableLoading
                          message="Loading job tags..."
                          colSpan={checkPermission('MOD022', 'view') ? 6 : 5}
                        />
                      ) : error ? (
                        <TableRow>
                          <TableCell
                            colSpan={checkPermission('MOD022', 'view') ? 6 : 5}
                            className="text-center py-8 text-red-500"
                          >
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : jobTags.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={checkPermission('MOD022', 'view') ? 6 : 5}
                            className="text-center py-8"
                          >
                            No job tags found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        jobTags.map(jobTag => (
                          <TableRow key={jobTag._id}>
                            <TableCell className="font-medium">
                              <Badge
                                className="px-3 py-1 text-sm font-medium"
                                style={{
                                  backgroundColor: jobTag.background_color,
                                  color: jobTag.text_color,
                                }}
                              >
                                {jobTag.name}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {jobTag.description || 'No description'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {jobTag.code || 'N/A'}
                              </Badge>
                            </TableCell>
                            {checkPermission('MOD022', 'view') && (
                              <TableCell>
                                <Badge
                                  variant={
                                    jobTag.isP1 ? 'default' : 'secondary'
                                  }
                                >
                                  {jobTag.isP1 ? 'Default' : 'Custom'}
                                </Badge>
                              </TableCell>
                            )}
                            <TableCell>
                              {formatDate(jobTag.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={
                                      (jobTag.isP1 &&
                                        !isSuperAdmin('MOD021')) ||
                                      (!checkPermission('MOD021', 'edit') &&
                                        !checkPermission('MOD021', 'delete') &&
                                        !checkPermission('MOD022', 'edit') &&
                                        !checkPermission('MOD022', 'delete'))
                                    }
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {(getUserType() === 'P1' ||
                                    checkPermission('MOD021', 'edit') ||
                                    checkPermission('MOD022', 'edit')) && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() => handleEditJobTag(jobTag)}
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Job Tag
                                    </DropdownMenuItem>
                                  )}
                                  {(getUserType() === 'P1' ||
                                    checkPermission('MOD021', 'delete') ||
                                    checkPermission('MOD022', 'delete')) && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600"
                                      onClick={() => handleDeleteJobTag(jobTag)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Job Tag
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  {/* Showing entries info */}
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Showing{' '}
                    {(pagination.current.page - 1) * pagination.current.limit +
                      1}{' '}
                    to{' '}
                    {Math.min(
                      pagination.current.page * pagination.current.limit,
                      pagination.total
                    )}{' '}
                    of {pagination.total} entries
                  </div>

                  {/* Pagination buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.current.page - 1)
                      }
                      disabled={pagination.current.page === 1}
                    >
                      Previous
                    </Button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.pages) },
                        (_, i) => {
                          let pageNum
                          if (pagination.pages <= 5) {
                            pageNum = i + 1
                          } else if (pagination.current.page <= 3) {
                            pageNum = i + 1
                          } else if (
                            pagination.current.page >=
                            pagination.pages - 2
                          ) {
                            pageNum = pagination.pages - 4 + i
                          } else {
                            pageNum = pagination.current.page - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                pagination.current.page === pageNum
                                  ? 'default'
                                  : 'outline'
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8 p-0 text-white"
                            >
                              {pageNum}
                            </Button>
                          )
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.current.page + 1)
                      }
                      disabled={pagination.current.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile View */}
            <div className="block md:hidden space-y-4">
              {/* Show Entries Dropdown */}
              <div className="flex items-center gap-2 justify-end">
                <Label
                  htmlFor="entries"
                  className="text-sm text-neutral-600 dark:text-neutral-400"
                >
                  Show
                </Label>
                <Select
                  value={pagination.current.limit.toString()}
                  onValueChange={handleEntriesChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="40">40</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Mobile Card View */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <span className="text-neutral-500">Loading job tags...</span>
                  </div>
                ) : jobTags.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-neutral-500">No job tags found</span>
                  </div>
                ) : (
                  jobTags.map(jobTag => (
                    <Card key={jobTag._id} className="relative border border-neutral-200 dark:border-neutral-700">
                      <CardContent className="pt-4 pb-4">
                        <div className="space-y-3">
                          {/* Tag Name */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Tag Name
                            </div>
                            <Badge
                              className="px-3 py-1 text-sm font-medium"
                              style={{
                                backgroundColor: jobTag.background_color,
                                color: jobTag.text_color,
                              }}
                            >
                              {jobTag.name}
                            </Badge>
                          </div>

                          {/* Description */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Description
                            </div>
                            <div className="text-sm text-neutral-900 dark:text-neutral-100">
                              {jobTag.description || 'No description'}
                            </div>
                          </div>

                          {/* Status Code */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Status Code
                            </div>
                            <Badge variant="outline" className="font-mono">
                              {jobTag.code || 'N/A'}
                            </Badge>
                          </div>

                          {/* Type - Conditional */}
                          {checkPermission('MOD022', 'view') && (
                            <div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                Type
                              </div>
                              <Badge
                                variant={
                                  jobTag.isP1 ? 'default' : 'secondary'
                                }
                              >
                                {jobTag.isP1 ? 'Default' : 'Custom'}
                              </Badge>
                            </div>
                          )}

                          {/* Created At */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Created At
                            </div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                              {formatDate(jobTag.createdAt)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      {/* Action Button - Outside Card */}
                      <div className="absolute top-4 right-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={
                                (jobTag.isP1 && !isSuperAdmin('MOD021')) ||
                                (!checkPermission('MOD021', 'edit') &&
                                  !checkPermission('MOD021', 'delete') &&
                                  !checkPermission('MOD022', 'edit') &&
                                  !checkPermission('MOD022', 'delete'))
                              }
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(getUserType() === 'P1' ||
                              checkPermission('MOD021', 'edit') ||
                              checkPermission('MOD022', 'edit')) && (
                              <DropdownMenuItem
                                className="flex items-center gap-2"
                                onClick={() => handleEditJobTag(jobTag)}
                              >
                                <Edit className="h-4 w-4" />
                                Edit Job Tag
                              </DropdownMenuItem>
                            )}
                            {(getUserType() === 'P1' ||
                              checkPermission('MOD021', 'delete') ||
                              checkPermission('MOD022', 'delete')) && (
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600"
                                onClick={() => handleDeleteJobTag(jobTag)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Job Tag
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Showing entries info */}
              <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                Showing{' '}
                {(pagination.current.page - 1) * pagination.current.limit + 1}{' '}
                to{' '}
                {Math.min(
                  pagination.current.page * pagination.current.limit,
                  pagination.total
                )}{' '}
                of {pagination.total} entries
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange(pagination.current.page - 1)
                  }
                  disabled={pagination.current.page === 1 || loading}
                >
                  Previous
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.pages) },
                    (_, i) => {
                      let pageNum
                      if (pagination.pages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.current.page <= 3) {
                        pageNum = i + 1
                      } else if (
                        pagination.current.page >=
                        pagination.pages - 2
                      ) {
                        pageNum = pagination.pages - 4 + i
                      } else {
                        pageNum = pagination.current.page - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pagination.current.page === pageNum
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0 text-white"
                          disabled={loading}
                        >
                          {pageNum}+9       
                        </Button>
                      )
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange(pagination.current.page + 1)
                  }
                  disabled={
                    pagination.current.page === pagination.pages || loading
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Job Tag Modal - Create/Edit */}
      <Dialog open={jobTagModalOpen} onOpenChange={setJobTagModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {isEditMode ? 'Edit Job Tag' : 'Add New Job Tag'}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleFormSubmit}
            onInvalid={() => setJobTagSubmitted(true)}
            className="space-y-6"
            data-submitted={jobTagSubmitted}
          >
            <div className="space-y-3">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Tag Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., Urgent, Follow Up, New Customer"
                value={formData.name}
                onChange={e => handleFormChange('name', e.target.value)}
                required
                className={
                  jobTagSubmitted && !formData.name.trim()
                    ? 'h-12 text-base border-red-500 focus:border-red-500 !focus-visible:ring-red-500'
                    : 'h-12 text-base'
                }
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Description
              </Label>
              <Input
                id="description"
                placeholder="Brief description of this tag"
                value={formData.description}
                onChange={e => handleFormChange('description', e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="background_color"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Background Color
                </Label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-neutral-200 dark:border-neutral-700 shadow-sm cursor-pointer overflow-hidden"
                    style={{ backgroundColor: formData.background_color }}
                    onClick={() =>
                      document.getElementById('background_color')?.click()
                    }
                  >
                    <input
                      id="background_color"
                      type="color"
                      value={formData.background_color}
                      onChange={e =>
                        handleFormChange('background_color', e.target.value)
                      }
                      className="opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                    {formData.background_color}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="text_color"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Text Color
                </Label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-neutral-200 dark:border-neutral-700 shadow-sm cursor-pointer overflow-hidden"
                    style={{ backgroundColor: formData.text_color }}
                    onClick={() =>
                      document.getElementById('text_color')?.click()
                    }
                  >
                    <input
                      id="text_color"
                      type="color"
                      value={formData.text_color}
                      onChange={e =>
                        handleFormChange('text_color', e.target.value)
                      }
                      className="opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                    {formData.text_color}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setJobTagModalOpen(false)
                  setIsEditMode(false)
                  setEditingJobTag(null)
                  setFormData({
                    name: '',
                    description: '',
                    background_color: '#3B82F6',
                    text_color: '#FFFFFF',
                  })
                  setJobTagSubmitted(false)
                }}
                disabled={submitting}
                className="h-11 px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="wepro-button-gradient text-white h-11 px-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditMode ? 'Updating Job Tag...' : 'Creating Job Tag...'}
                  </>
                ) : isEditMode ? (
                  'Update Job Tag'
                ) : (
                  'Create Job Tag'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{jobTagToDelete?.name}</strong>? This action cannot be
              undone and will permanently remove the job tag from the system.
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
