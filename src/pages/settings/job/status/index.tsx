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
import { apiService } from '@/src/services/api'
import { useAppSelector } from '@/src/store/hooks'
import { TableLoading } from '@/src/components/ui/loading'
import { toast } from 'sonner'
import {
  JobStatus,
  JobStatusesResponse,
} from '@/src/constants/interface/jobStatus'
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
import { Switch } from '@/src/components/ui/switch'

const getStatusBadgeColor = (active: boolean) => {
  return active
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

const getP1BadgeColor = (isP1: boolean) => {
  if (isP1 === false) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
  }
  return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
}

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

const getLevelBadgeColor = (level: number) => {
  switch (level) {
    case 1:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 2:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 3:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

export default function JobStatusPage() {
  const router = useRouter()
  const { checkPermission, getUserType, userData, isSuperAdmin } =
    usePermissions()
  const tenantId = userData?.tenantId

  // State for job statuses
  const [jobStatuses, setJobStatuses] = useState<JobStatus[]>([])
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
  const [jobStatusModalOpen, setJobStatusModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingJobStatus, setEditingJobStatus] = useState<JobStatus | null>(
    null
  )
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    background_color: '#3B82F6',
    text_color: '#FFFFFF',
  })

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobStatusToDelete, setJobStatusToDelete] = useState<JobStatus | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)

  // State for form submission
  const [submitting, setSubmitting] = useState(false)

  // Fetch job statuses from API
  const fetchJobStatuses = useCallback(async () => {
    if (!tenantId) return

    try {
      setLoading(true)
      setError(null)

      // Determine API endpoint based on user type and permissions
      const userType = getUserType()
      let apiEndpoint: string

      if (
        userType === 'P1' ||
        (userType === 'P5' && checkPermission('MOD019', 'view'))
      ) {
        apiEndpoint = `/v1/job-statuses/p1?page=${currentPage}&limit=${entriesPerPage}&sort=order,name${debouncedSearchTerm ? `&search=${encodeURIComponent(debouncedSearchTerm)}` : ''}`
      } else {
        apiEndpoint = `/v1/job-statuses?page=${currentPage}&limit=${entriesPerPage}&sort=order,name&include_visibility=true${debouncedSearchTerm ? `&search=${encodeURIComponent(debouncedSearchTerm)}` : ''}`
      }

      const response = await apiService.get(apiEndpoint)

      const responseData: JobStatusesResponse = response.data

      if (responseData.success) {
        setJobStatuses(responseData.data)
        setTotalCount(responseData.count)
        setTotalPages(responseData.pagination.pages)
        setPagination({
          current: responseData.pagination.current,
          total: responseData.pagination.total,
          pages: responseData.pagination.pages,
          next: {
            page: responseData.pagination.current.page + 1,
            limit: responseData.pagination.current.limit,
          },
        })
        setError(null)
      } else {
        setError(responseData.message || 'Failed to fetch job statuses')
        setJobStatuses([])
        setTotalCount(0)
        setTotalPages(0)
        setPagination({
          current: { page: 1, limit: 20 },
          total: 0,
          pages: 0,
          next: { page: 2, limit: 20 },
        })
      }
    } catch (err: any) {
      console.error('Error fetching job statuses:', err)
      setError(err.response?.data?.message || 'Failed to fetch job statuses')
      setJobStatuses([])
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
    tenantId,
    currentPage,
    entriesPerPage,
    debouncedSearchTerm,
    getUserType,
    checkPermission,
  ])

  // Fetch job statuses on component mount and when dependencies change
  useEffect(() => {
    if (
      !checkPermission('MOD019', 'view') &&
      !checkPermission('MOD020', 'view')
    ) {
      router.push('/settings/job/tags')
      return
    }
    if (tenantId) {
      fetchJobStatuses()
    }
  }, [tenantId, currentPage, entriesPerPage, debouncedSearchTerm])

  // Reset to first page when search term changes
  useEffect(() => {
    if (tenantId) {
      setCurrentPage(1) // Reset to first page when searching
      // Also reset pagination state
      setPagination(prev => ({
        ...prev,
        current: { ...prev.current, page: 1 },
      }))
    }
  }, [debouncedSearchTerm, tenantId])

  const handleDeleteJobStatus = (jobStatus: JobStatus) => {
    setJobStatusToDelete(jobStatus)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!jobStatusToDelete || !tenantId) return

    try {
      setDeleting(true)
      // Use the correct endpoint format for job statuses
      await apiService.delete(`/v1/job-statuses/${jobStatusToDelete._id}`)

      // Refresh the list by calling fetchJobStatuses
      await fetchJobStatuses()

      // Show success toast
      toast.success('Job status deleted successfully!', {
        description: 'The job status has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setJobStatusToDelete(null)
    } catch (err: any) {
      console.error('Error deleting job status:', err)
      // Show error toast
      toast.error('Failed to delete job status', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the job status.',
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
    setJobStatusToDelete(null)
  }

  const handleAddJobStatus = () => {
    setIsEditMode(false)
    setEditingJobStatus(null)
    setFormData({
      name: '',
      description: '',
      background_color: '#3B82F6',
      text_color: '#FFFFFF',
    })
    setJobStatusModalOpen(true)
  }

  const handleEditJobStatus = (jobStatus: JobStatus) => {
    setIsEditMode(true)
    setEditingJobStatus(jobStatus)
    setFormData({
      name: jobStatus.name,
      description: jobStatus.description,
      background_color: jobStatus.background_color,
      text_color: jobStatus.text_color,
    })
    setJobStatusModalOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Job status name is required', {
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
      const userType = getUserType()

      let response
      if (isEditMode && editingJobStatus) {
        // Edit mode - PUT request
        response = await apiService.put(
          `/v1/job-statuses/${editingJobStatus._id}`,
          {
            name: formData.name.trim(),
            description: formData.description.trim(),
            background_color: formData.background_color,
            text_color: formData.text_color,
          }
        )
      } else {
        // Create mode - POST request to P1 endpoint
        let url = ``
        if (userType === 'P1' || checkPermission('MOD019', 'create')) {
          url = `/v1/job-statuses/p1`
        } else {
          url = `/v1/job-statuses`
        }
        response = await apiService.post(url, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          background_color: formData.background_color,
          text_color: formData.text_color,
        })
      }

      if (response.data.success) {
        const action = isEditMode ? 'updated' : 'created'
        toast.success(`Job status ${action} successfully!`, {
          description: `The job status has been ${action} in the system.`,
        })

        // Close modal and reset form
        setJobStatusModalOpen(false)
        setFormData({
          name: '',
          description: '',
          background_color: '#3B82F6',
          text_color: '#FFFFFF',
        })
        setIsEditMode(false)
        setEditingJobStatus(null)

        // Refresh the job statuses list
        await fetchJobStatuses()
      } else {
        const action = isEditMode ? 'update' : 'create'
        const errorMessage =
          response.data.error ||
          response.data.message ||
          `An error occurred while ${action}ing the job status.`
        toast.error(`Failed to ${action} job status`, {
          description: errorMessage,
          style: {
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: '1px solid #f87171',
          },
          className: 'text-white',
          descriptionClassName: 'text-white',
        })
      }
    } catch (err: any) {
      const action = isEditMode ? 'updating' : 'creating'
      console.error(`Error ${action} job status:`, err)
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        `An error occurred while ${action} the job status.`
      toast.error(`Failed to ${action} job status`, {
        description: errorMessage,
        style: {
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: '1px solid #f87171',
        },
        className: 'text-white',
        descriptionClassName: 'text-white',
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

  // Calculate pagination based on API response
  const currentJobStatuses = jobStatuses

  // Determine if visibility column should be shown based on user type and permissions
  const shouldShowVisibilityColumn = () => {
    const userType = getUserType()
    return !(
      userType === 'P1' ||
      (userType === 'P5' && checkPermission('MOD019', 'view'))
    )
  }

  // Determine if type column should be shown based on user type and permissions
  const shouldShowTypeColumn = () => {
    const userType = getUserType()
    return !(userType === 'P1') && !checkPermission('MOD019', 'view')
  }

  // Calculate total number of columns for table
  const getTotalColumns = () => {
    let columns = 6 // Status Name, Code, Level, Parent Code, Created At, Actions
    if (shouldShowVisibilityColumn()) columns++
    if (shouldShowTypeColumn()) columns++
    return columns
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Update pagination state
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
    // Update pagination state
    setPagination(prev => ({
      ...prev,
      current: { page: 1, limit: newLimit },
      next: { page: 2, limit: newLimit },
    }))
  }

  return (
    <>
      <Head>
        <title>Job Status - WePro</title>
        <meta name="description" content="Manage job statuses" />
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
              Job Status
            </h1>
          </div>
          {(getUserType() === 'P1' ||
            checkPermission('MOD019', 'create') ||
            checkPermission('MOD020', 'create')) && (
            <Button
              onClick={handleAddJobStatus}
              className="wepro-button-gradient text-white"
              disabled={!tenantId}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Job Status
            </Button>
          )}
        </div>

        {/* Content Area */}
        <Card className="pt-6">
          <CardContent>
            {!tenantId ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Tenant ID Required
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Unable to load job statuses. Please ensure you are logged in
                  with a valid tenant account.
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
            ) : (
              <>
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

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Search job statuses..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Parent Code</TableHead>
                        {shouldShowVisibilityColumn() && (
                          <TableHead>Visibility</TableHead>
                        )}
                        {shouldShowTypeColumn() && <TableHead>Type</TableHead>}
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableLoading
                          message="Loading job statuses..."
                          colSpan={getTotalColumns()}
                        />
                      ) : error ? (
                        <TableRow>
                          <TableCell
                            colSpan={getTotalColumns()}
                            className="text-center py-8 text-red-500"
                          >
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : currentJobStatuses.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={getTotalColumns()}
                            className="text-center py-8"
                          >
                            No job statuses found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentJobStatuses.map(jobStatus => (
                          <TableRow key={jobStatus._id}>
                            <TableCell className="font-medium">
                              <Badge
                                className="px-3 py-1 text-sm font-medium"
                                style={{
                                  backgroundColor: jobStatus.background_color,
                                  color: jobStatus.text_color,
                                }}
                              >
                                {jobStatus.name}
                              </Badge>
                            </TableCell>
                            <TableCell>{jobStatus.code}</TableCell>
                            <TableCell>
                              <Badge
                                className={getLevelBadgeColor(jobStatus.level)}
                              >
                                Level {jobStatus.level}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {jobStatus.parent_code || 'None'}
                            </TableCell>

                            {shouldShowVisibilityColumn() && (
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge
                                    variant={
                                      jobStatus.visibility?.show_technicians
                                        ? 'default'
                                        : 'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {jobStatus.visibility?.show_technicians
                                      ? 'Tech'
                                      : 'No Tech'}
                                  </Badge>
                                  <Badge
                                    variant={
                                      jobStatus.visibility?.show_dispatch
                                        ? 'default'
                                        : 'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {jobStatus.visibility?.show_dispatch
                                      ? 'Dispatch'
                                      : 'No Dispatch'}
                                  </Badge>
                                </div>
                              </TableCell>
                            )}

                            {shouldShowTypeColumn() && (
                              <TableCell>
                                <Badge
                                  variant={
                                    jobStatus.isP1 ? 'default' : 'secondary'
                                  }
                                >
                                  {jobStatus.isP1 ? 'Default' : 'Custom'}
                                </Badge>
                              </TableCell>
                            )}

                            <TableCell>
                              {formatDate(jobStatus.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={
                                      (jobStatus.isP1 &&
                                        !isSuperAdmin('MOD019')) ||
                                      (!checkPermission('MOD019', 'edit') &&
                                        !checkPermission('MOD019', 'delete') &&
                                        !checkPermission('MOD020', 'edit') &&
                                        !checkPermission('MOD020', 'delete'))
                                    }
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {(getUserType() === 'P1' ||
                                    checkPermission('MOD019', 'edit') ||
                                    checkPermission('MOD020', 'edit')) && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() =>
                                        handleEditJobStatus(jobStatus)
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Job Status
                                    </DropdownMenuItem>
                                  )}
                                  {(getUserType() === 'P1' ||
                                    checkPermission('MOD019', 'delete') ||
                                    checkPermission('MOD020', 'delete')) && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600"
                                      onClick={() =>
                                        handleDeleteJobStatus(jobStatus)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Job Status
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
                              className="w-8 h-8 p-0"
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
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Job Status Modal - Create/Edit */}
      <Dialog open={jobStatusModalOpen} onOpenChange={setJobStatusModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {isEditMode ? 'Edit Job Status' : 'Add New Job Status'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Status Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., Pending, In Progress, Completed"
                value={formData.name}
                onChange={e => handleFormChange('name', e.target.value)}
                required
                className="h-12 text-base"
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
                placeholder="Brief description of this status"
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
                  setJobStatusModalOpen(false)
                  setIsEditMode(false)
                  setEditingJobStatus(null)
                  setFormData({
                    name: '',
                    description: '',
                    background_color: '#3B82F6',
                    text_color: '#FFFFFF',
                  })
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
                    {isEditMode
                      ? 'Updating Job Status...'
                      : 'Creating Job Status...'}
                  </>
                ) : isEditMode ? (
                  'Update Job Status'
                ) : (
                  'Create Job Status'
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
            <AlertDialogTitle>Delete Job Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{jobStatusToDelete?.name}</strong>? This action cannot be
              undone and will permanently remove the job status from the system.
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
