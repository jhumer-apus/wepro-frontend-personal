import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  Copy,
  EyeOff,
  Globe,
} from 'lucide-react'
import {
  SettingsNavigation,
  JobSettingsSubNavigation,
} from '@/src/components/job'
import { usePermissions } from '@/src/hooks/usePermissions'
import { useAppSelector } from '@/src/store/hooks'
import { useDebounce } from '@/src/hooks/useDebounce'
import { TableLoading } from '@/src/components/ui/loading'
import { toast } from 'sonner'
import {
  JobTagNote,
  JobTagNotesResponse,
} from '@/src/constants/interface/jobTagNotes'
import { JobTag } from '@/src/constants/interface/jobTags'
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
import { Switch } from '@/src/components/ui/switch'
import { Textarea } from '@/src/components/ui/textarea'
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
import { Check, ChevronsUpDown } from 'lucide-react'

const getStatusBadgeColor = (isP1: boolean) => {
  return isP1
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
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

const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export default function JobTagNotesPage() {
  const router = useRouter()
  const { checkPermission, getUserType, userData, isSuperAdmin } =
    usePermissions()
  const tenantId = userData?.tenantId

  // Store permission functions in refs to prevent unnecessary re-renders
  const checkPermissionRef = useRef(checkPermission)
  const getUserTypeRef = useRef(getUserType)

  // Update refs when functions change
  useEffect(() => {
    checkPermissionRef.current = checkPermission
    getUserTypeRef.current = getUserType
  }, [checkPermission, getUserType])

  // State for job tag notes
  const [jobTagNotes, setJobTagNotes] = useState<JobTagNote[]>([])
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
  })

  // State for modal and form
  const [jobTagNoteModalOpen, setJobTagNoteModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingJobTagNote, setEditingJobTagNote] = useState<JobTagNote | null>(
    null
  )
  const [formData, setFormData] = useState({
    title: '',
    job_tag_code: '',
    display_order: 1,
    content: '',
  })

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobTagNoteToDelete, setJobTagNoteToDelete] =
    useState<JobTagNote | null>(null)
  const [deleting, setDeleting] = useState(false)

  // State for form submission
  const [submitting, setSubmitting] = useState(false)

  // State for job tags dropdown
  const [jobTags, setJobTags] = useState<JobTag[]>([])
  const [jobTagsLoading, setJobTagsLoading] = useState(false)
  const [jobTagDropdownOpen, setJobTagDropdownOpen] = useState(false)

  // Fetch job tag notes from API
  const fetchJobTagNotes = useCallback(async () => {
    if (!tenantId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: entriesPerPage.toString(),
        tenantId: tenantId,
      })

      // Determine endpoint based on user permissions
      const isP1User = getUserTypeRef.current() === 'P1'
      const hasP1Permission = checkPermissionRef.current('MOD023', 'view')
      const endpoint =
        isP1User || hasP1Permission
          ? `/v1/job-tag-notes/p1?${params}`
          : `/v1/job-tag-notes?${params}`

      const response = await apiService.get<JobTagNotesResponse>(endpoint)

      if (response.data.success) {
        setJobTagNotes(response.data.data)
        setTotalCount(response.data.count)
        setTotalPages(response.data.pagination.pages)
        setPagination(response.data.pagination)
        setError(null)
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch job tag notes'
        )
      }
    } catch (err: any) {
      console.error('Error fetching job tag notes:', err)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch job tag notes'
      setError(errorMessage)
      setJobTagNotes([])
      setTotalCount(0)
      setTotalPages(0)
      setPagination({
        current: { page: 1, limit: 20 },
        total: 0,
        pages: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, entriesPerPage, debouncedSearchTerm, tenantId])

  // Fetch job tag notes on component mount and when dependencies change
  useEffect(() => {
    if (
      !checkPermission('MOD023', 'view') &&
      !checkPermission('MOD024', 'view')
    ) {
      router.push('/settings/job/custom-fields')
      return
    }
    fetchJobTagNotes()
  }, [fetchJobTagNotes])

  // Fetch job tags for dropdown
  const fetchJobTags = useCallback(async () => {
    if (!tenantId) return

    try {
      setJobTagsLoading(true)

      // Determine endpoint based on user permissions
      const isP1User = getUserTypeRef.current() === 'P1'
      const hasP1Permission = checkPermissionRef.current('MOD021', 'view')
      const endpoint =
        isP1User || hasP1Permission
          ? `/v1/job-tags/p1?page=1&limit=100&tenantId=${tenantId}`
          : `/v1/job-tags?page=1&limit=100&tenantId=${tenantId}`

      const response = await apiService.get(endpoint)

      if (response.data.success) {
        setJobTags(response.data.data)
      }
    } catch (err: any) {
      console.error('Error fetching job tags:', err)
    } finally {
      setJobTagsLoading(false)
    }
  }, [tenantId])

  // Debounced search effect
  useEffect(() => {
    setCurrentPage(1) // Reset to first page when searching
    setPagination(prev => ({
      ...prev,
      current: { ...prev.current, page: 1 },
    }))
  }, [debouncedSearchTerm])

  const handleDeleteJobTagNote = (jobTagNote: JobTagNote) => {
    setJobTagNoteToDelete(jobTagNote)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!jobTagNoteToDelete) return

    try {
      setDeleting(true)

      // Implement actual delete API call
      // Determine endpoint based on user permissions
      const isP1User = getUserType() === 'P1'
      const hasP1Permission = checkPermission('MOD023', 'delete')
      const endpoint =
        isP1User || hasP1Permission
          ? `/v1/job-tag-notes/p1/${jobTagNoteToDelete._id}`
          : `/v1/job-tag-notes/${jobTagNoteToDelete._id}`

      const response = await apiService.delete(endpoint)
      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to delete job tag note'
        )
      }

      // Refresh the list
      await fetchJobTagNotes()

      // Show success toast
      toast.success('Job tag note deleted successfully!', {
        description: 'The job tag note has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setJobTagNoteToDelete(null)
    } catch (err: any) {
      console.error('Error deleting job tag note:', err)
      toast.error('Failed to delete job tag note', {
        description: 'An error occurred while deleting the job tag note.',
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
    setJobTagNoteToDelete(null)
  }

  const handleAddJobTagNote = () => {
    setIsEditMode(false)
    setEditingJobTagNote(null)
    setFormData({
      title: '',
      job_tag_code: '',
      display_order: 1,
      content: '',
    })
    setJobTagNoteModalOpen(true)
    fetchJobTags()
  }

  const handleEditJobTagNote = (jobTagNote: JobTagNote) => {
    setIsEditMode(true)
    setEditingJobTagNote(jobTagNote)
    setFormData({
      title: jobTagNote.title,
      job_tag_code: jobTagNote.job_tag_code,
      display_order: jobTagNote.display_order,
      content: jobTagNote.content,
    })
    setJobTagNoteModalOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Title is required', {
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

      // Implement actual create/update API calls
      if (isEditMode && editingJobTagNote) {
        // Determine endpoint based on user permissions
        const isP1User = getUserType() === 'P1'
        const hasP1Permission = checkPermission('MOD023', 'update')
        const endpoint =
          isP1User || hasP1Permission
            ? `/v1/job-tag-notes/p1/${editingJobTagNote._id}`
            : `/v1/job-tag-notes/${editingJobTagNote._id}`

        const response = await apiService.put(endpoint, formData)
        if (!response.data.success) {
          throw new Error(
            response.data.message || 'Failed to update job tag note'
          )
        }
      } else {
        // Determine endpoint based on user permissions
        const isP1User = getUserType() === 'P1'
        const hasP1Permission = checkPermission('MOD023', 'create')
        const endpoint =
          isP1User || hasP1Permission
            ? '/v1/job-tag-notes/p1'
            : '/v1/job-tag-notes'

        const response = await apiService.post(endpoint, formData)
        if (!response.data.success) {
          throw new Error(
            response.data.message || 'Failed to create job tag note'
          )
        }
      }

      if (isEditMode && editingJobTagNote) {
        // Edit mode - update existing note
        toast.success('Job tag note updated successfully!', {
          description: 'The job tag note has been updated in the system.',
        })
      } else {
        // Create mode - add new note
        toast.success('Job tag note created successfully!', {
          description: 'The job tag note has been created in the system.',
        })
      }

      // Close modal and reset form
      setJobTagNoteModalOpen(false)
      setFormData({
        title: '',
        job_tag_code: '',
        display_order: 1,
        content: '',
      })
      setIsEditMode(false)
      setEditingJobTagNote(null)

      // Refresh the job tag notes list
      await fetchJobTagNotes()
    } catch (err: any) {
      const action = isEditMode ? 'updating' : 'creating'
      console.error(`Error ${action} job tag note:`, err)
      toast.error(`Failed to ${action} job tag note`, {
        description: `An error occurred while ${action} the job tag note.`,
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

  const handleFormChange = (field: string, value: string | number) => {
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
    }))
  }

  const handleEntriesChange = (value: string) => {
    const newLimit = parseInt(value)
    setEntriesPerPage(newLimit)
    setCurrentPage(1)
    setPagination(prev => ({
      ...prev,
      current: { page: 1, limit: newLimit },
    }))
  }

  const getSelectedJobTagName = () => {
    const selectedJobTag = jobTags.find(
      tag => tag.code === formData.job_tag_code
    )
    return selectedJobTag
      ? `${selectedJobTag.name} (${selectedJobTag.code})`
      : ''
  }

  return (
    <>
      <Head>
        <title>Job Tag Notes - WePro</title>
        <meta name="description" content="Manage job tag notes and scripts" />
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
              Job Tag Notes
            </h1>
          </div>
          {(getUserType() === 'P1' ||
            checkPermission('MOD023', 'create') ||
            checkPermission('MOD024', 'create')) && (
            <Button
              onClick={handleAddJobTagNote}
              className="wepro-button-gradient text-white"
              disabled={!tenantId}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Note
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
                  Unable to load job tag notes. Please ensure you are logged in
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
                      placeholder="Search notes, scripts, templates..."
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
                        <TableHead>Title</TableHead>
                        <TableHead>Job Tag Code</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Display Order</TableHead>
                        {checkPermission('MOD024', 'view') && (
                          <TableHead>Type</TableHead>
                        )}
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableLoading
                          message="Loading job tag notes..."
                          colSpan={checkPermission('MOD024', 'view') ? 7 : 6}
                        />
                      ) : error ? (
                        <TableRow>
                          <TableCell
                            colSpan={checkPermission('MOD024', 'view') ? 7 : 6}
                            className="text-center py-8 text-red-500"
                          >
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : jobTagNotes.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={checkPermission('MOD024', 'view') ? 7 : 6}
                            className="text-center py-8"
                          >
                            No job tag notes found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        jobTagNotes.map(jobTagNote => (
                          <TableRow key={jobTagNote._id}>
                            <TableCell className="font-medium max-w-xs">
                              <div className="flex flex-col">
                                <span className="truncate">
                                  {jobTagNote.title}
                                </span>
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                  Code: {jobTagNote.code}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {jobTagNote.job_tag_code}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-md">
                              <div className="max-w-full">
                                <span className="block truncate text-sm">
                                  {truncateText(jobTagNote.content, 80)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {jobTagNote.display_order}
                              </Badge>
                            </TableCell>
                            {checkPermission('MOD024', 'view') && (
                              <TableCell>
                                <Badge
                                  variant={
                                    jobTagNote.isP1 ? 'default' : 'secondary'
                                  }
                                >
                                  {jobTagNote.isP1 ? 'Default' : 'Custom'}
                                </Badge>
                              </TableCell>
                            )}
                            <TableCell>
                              {formatDate(jobTagNote.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={
                                      (jobTagNote.isP1 &&
                                        !isSuperAdmin('MOD023')) ||
                                      (!checkPermission('MOD023', 'edit') &&
                                        !checkPermission('MOD023', 'delete') &&
                                        !checkPermission('MOD024', 'edit') &&
                                        !checkPermission('MOD024', 'delete'))
                                    }
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {(getUserType() === 'P1' ||
                                    checkPermission('MOD023', 'edit') ||
                                    checkPermission('MOD024', 'edit')) && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() =>
                                        handleEditJobTagNote(jobTagNote)
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Note
                                    </DropdownMenuItem>
                                  )}
                                  {(getUserType() === 'P1' ||
                                    checkPermission('MOD023', 'delete') ||
                                    checkPermission('MOD024', 'delete')) && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600"
                                      onClick={() =>
                                        handleDeleteJobTagNote(jobTagNote)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Note
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

      {/* Job Tag Note Modal - Create/Edit */}
      <Dialog open={jobTagNoteModalOpen} onOpenChange={setJobTagNoteModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {isEditMode ? 'Edit Job Tag Note' : 'Add New Job Tag Note'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Installation Guidelines, Safety Protocol"
                  value={formData.title}
                  onChange={e => handleFormChange('title', e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="job_tag_code"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Job Tag Code *
                </Label>
                <Popover
                  open={jobTagDropdownOpen}
                  onOpenChange={setJobTagDropdownOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={jobTagDropdownOpen}
                      className="w-full justify-between h-12 text-base"
                      disabled={jobTagsLoading}
                    >
                      {jobTagsLoading
                        ? 'Loading job tags...'
                        : formData.job_tag_code
                          ? getSelectedJobTagName()
                          : 'Select job tag...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search job tags..."
                        className="focus:ring-0 focus:outline-none focus:border-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-0"
                      />
                      <CommandList>
                        <CommandEmpty>
                          {jobTagsLoading
                            ? 'Loading job tags...'
                            : 'No job tag found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {jobTags.map(tag => (
                            <CommandItem
                              key={tag._id}
                              onSelect={() => {
                                handleFormChange('job_tag_code', tag.code)
                                setJobTagDropdownOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  formData.job_tag_code === tag.code
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {tag.name}
                              <span className="text-sm text-neutral-500 ml-2">
                                ({tag.code})
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="display_order"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Display Order
              </Label>
              <Input
                id="display_order"
                type="number"
                min="1"
                placeholder="1"
                value={formData.display_order}
                onChange={e =>
                  handleFormChange(
                    'display_order',
                    parseInt(e.target.value) || 1
                  )
                }
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="content"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Content *
              </Label>
              <Textarea
                id="content"
                placeholder="Enter the note content, script, or template..."
                value={formData.content}
                onChange={e => handleFormChange('content', e.target.value)}
                required
                className="min-h-[120px] text-base"
              />
            </div>

            <DialogFooter className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setJobTagNoteModalOpen(false)
                  setIsEditMode(false)
                  setEditingJobTagNote(null)
                  setFormData({
                    title: '',
                    job_tag_code: '',
                    display_order: 1,
                    content: '',
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
                    {isEditMode ? 'Updating Note...' : 'Creating Note...'}
                  </>
                ) : isEditMode ? (
                  'Update Note'
                ) : (
                  'Create Note'
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
            <AlertDialogTitle>Delete Job Tag Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{jobTagNoteToDelete?.title}</strong>? This action cannot
              be undone and will permanently remove the job tag note from the
              system.
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
