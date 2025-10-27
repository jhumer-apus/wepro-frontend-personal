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
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Building2,
  Eye,
  Mail,
  ArrowUpDown,
  Play,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/src/components/ui/dialog'
import {
  SettingsNavigation,
  TemplatesSubNavigation,
} from '@/src/components/job'
import { usePermissions } from '@/src/hooks/usePermissions'
import { useDebounce } from '@/src/hooks/useDebounce'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'

// Interface for Email Template data
interface EmailTemplate {
  _id: string
  title: string
  fromEmail: string
  fromName: string
  subject: string
  body: string
  bodyType: string
  emailType: string
  replyTo: string
  priority: string
  status: string
  tenantId: {
    _id: string
    name: string
    username: string
  }
  byTenantId: {
    _id: string
    name: string
    username: string
  }
  createdBy: {
    _id: string
    name: string
    username: string
  }
  createdAt: string
  updatedAt: string
  code: string
  variables: string[]
  emailSize: number
}

interface EmailTemplatesResponse {
  success: boolean
  message: string
  data: {
    data: EmailTemplate[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'inactive':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const getPriorityBadgeColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'normal':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'low':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const getEmailTypeBadgeColor = (emailType: string) => {
  switch (emailType.toLowerCase()) {
    case 'confirmation':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'reminder':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'follow-up':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    case 'invoice':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
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

export default function EmailTemplatesPage() {
  const router = useRouter()
  const { checkPermission, getUserType, userData, isSuperAdmin } =
    usePermissions()
  const tenantId = userData?.tenantId

  // State for Email templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0,
  })

  // State for filters
  const [emailTypeFilter, setEmailTypeFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('Active')
  const [bodyTypeFilter, setBodyTypeFilter] = useState<string>('')

  // State for sorting
  const [sortOrder, setSortOrder] = useState<string>('-createdAt')

  // Initialize sort order from URL parameters
  useEffect(() => {
    const { sort } = router.query
    if (
      sort &&
      typeof sort === 'string' &&
      (sort === '-createdAt' || sort === 'createdAt')
    ) {
      setSortOrder(sort)
    }
  }, [router.query])

  // State for delete functionality
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] =
    useState<EmailTemplate | null>(null)
  const [deleting, setDeleting] = useState(false)

  // State for view modal
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null)

  // Fetch Email templates from API
  const fetchTemplates = useCallback(async () => {
    if (!tenantId) return

    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: entriesPerPage.toString(),
        sort: sortOrder,
      })

      // Add search term if provided
      if (debouncedSearchTerm.trim()) {
        queryParams.append('search', debouncedSearchTerm.trim())
      }

      // Add email type filter if provided
      if (emailTypeFilter) {
        queryParams.append('emailType', emailTypeFilter)
      }

      // Add priority filter if provided
      if (priorityFilter) {
        queryParams.append('priority', priorityFilter)
      }

      // Add status filter if provided
      if (statusFilter) {
        queryParams.append('status', statusFilter)
      }

      // Add body type filter if provided
      if (bodyTypeFilter) {
        queryParams.append('bodyType', bodyTypeFilter)
      }

      const response = await apiService.get(
        `/v1/templates/email?${queryParams.toString()}`
      )
      const responseData: EmailTemplatesResponse = response.data

      if (responseData.success) {
        setTemplates(responseData.data.data)
        setTotalCount(responseData.data.pagination.total)
        setTotalPages(responseData.data.pagination.pages)
        setPagination(responseData.data.pagination)
        setError(null)
      } else {
        setError(responseData.message || 'Failed to fetch Email templates')
        setTemplates([])
        setTotalCount(0)
        setTotalPages(0)
        setPagination({
          page: 1,
          limit: 25,
          total: 0,
          pages: 0,
        })
      }
    } catch (err: any) {
      console.error('Error fetching Email templates:', err)
      setError(err.response?.data?.message || 'Failed to fetch Email templates')
      setTemplates([])
      setTotalCount(0)
      setTotalPages(0)
      setPagination({
        page: 1,
        limit: 25,
        total: 0,
        pages: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [
    tenantId,
    currentPage,
    entriesPerPage,
    debouncedSearchTerm,
    emailTypeFilter,
    priorityFilter,
    statusFilter,
    bodyTypeFilter,
    sortOrder,
  ])

  // Fetch templates on component mount and when dependencies change
  useEffect(() => {
    if (!checkPermission('MOD035', 'view')) {
      router.push('/settings/templates/jobs')
      return
    }
    if (tenantId) {
      fetchTemplates()
    }
  }, [tenantId, currentPage, entriesPerPage, fetchTemplates])

  // Reset to first page when search term changes
  useEffect(() => {
    if (tenantId && debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1)
      setPagination(prev => ({
        ...prev,
        page: 1,
      }))
    }
  }, [debouncedSearchTerm, tenantId])

  // Reset pagination when filters change
  useEffect(() => {
    if (tenantId) {
      setCurrentPage(1)
      setPagination(prev => ({
        ...prev,
        page: 1,
      }))
    }
  }, [emailTypeFilter, priorityFilter, statusFilter, bodyTypeFilter, tenantId])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setPagination(prev => ({
      ...prev,
      page,
    }))
  }

  const handleEntriesChange = (value: string) => {
    const newLimit = parseInt(value)
    setEntriesPerPage(newLimit)
    setCurrentPage(1)
    setPagination(prev => ({
      ...prev,
      page: 1,
      limit: newLimit,
    }))
  }

  const handleDeleteTemplate = (template: EmailTemplate) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!templateToDelete || !tenantId) return

    try {
      setDeleting(true)
      await apiService.delete(`/v1/templates/email/${templateToDelete._id}`)

      // Refresh the list
      await fetchTemplates()

      // Show success toast
      toast.success('Email template deleted successfully!', {
        description: 'The template has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
    } catch (err: any) {
      console.error('Error deleting Email template:', err)
      toast.error('Failed to delete Email template', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the template.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setTemplateToDelete(null)
  }

  const handleViewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setViewModalOpen(false)
    setSelectedTemplate(null)
  }

  const handlePreviewTemplate = (template: EmailTemplate) => {
    router.push(`/settings/templates/email/${template._id}/preview`)
  }

  // Filter handlers
  const clearAllFilters = () => {
    setEmailTypeFilter('')
    setPriorityFilter('')
    setStatusFilter('Active')
    setBodyTypeFilter('')
    setSearchTerm('')
  }

  // Sort handler
  const handleSortToggle = () => {
    const newSortOrder = sortOrder === '-createdAt' ? 'createdAt' : '-createdAt'
    setSortOrder(newSortOrder)
    setCurrentPage(1) // Reset to first page when sorting

    // Update URL with new sort parameter
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          sort: newSortOrder,
        },
      },
      undefined,
      { shallow: true }
    )
  }

  return (
    <>
      <Head>
        <title>Email Templates - WePro</title>
        <meta name="description" content="Manage email templates" />
      </Head>
      <div className="space-y-6">
        {/* Main Tab Navigation */}
        <SettingsNavigation />

        {/* Sub Tab Navigation */}
        <TemplatesSubNavigation />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Email Templates
            </h1>
          </div>
          <Button
            onClick={() => router.push('/settings/templates/email/create')}
            className="wepro-button-gradient text-white"
            disabled={!tenantId}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Email Template
          </Button>
        </div>

        {/* Content Area */}
        <Card>
          <CardContent className="pt-6">
            {!tenantId ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Tenant ID Required
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Unable to load Email templates. Please ensure you are logged
                  in with a valid tenant account.
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
                {/* Filters and Search in Single Row */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  {/* Filters Section */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    {/* Email Type Filter */}
                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-medium">Email Type</Label>
                      <Select
                        value={emailTypeFilter || 'all'}
                        onValueChange={value =>
                          setEmailTypeFilter(value === 'all' ? '' : value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Email Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Email Types</SelectItem>
                          <SelectItem value="Confirmation">
                            Confirmation
                          </SelectItem>
                          <SelectItem value="Reminder">Reminder</SelectItem>
                          <SelectItem value="Follow-up">Follow-up</SelectItem>
                          <SelectItem value="Invoice">Invoice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority Filter */}
                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-medium">Priority</Label>
                      <Select
                        value={priorityFilter || 'all'}
                        onValueChange={value =>
                          setPriorityFilter(value === 'all' ? '' : value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-medium">Status</Label>
                      <Select
                        value={statusFilter || 'all'}
                        onValueChange={value =>
                          setStatusFilter(value === 'all' ? '' : value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Body Type Filter */}
                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-medium">Body Type</Label>
                      <Select
                        value={bodyTypeFilter || 'all'}
                        onValueChange={value =>
                          setBodyTypeFilter(value === 'all' ? '' : value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Body Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Body Types</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="plain">Plain Text</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Search Bar */}
                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-medium">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          placeholder="Search email templates..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Sort and Clear Filters Buttons */}
                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-medium">&nbsp;</Label>
                      <div className="flex justify-end gap-2 items-center">
                        <Button
                          variant="outline"
                          onClick={handleSortToggle}
                          className="flex items-center gap-2"
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={clearAllFilters}
                          disabled={
                            !emailTypeFilter &&
                            !priorityFilter &&
                            !statusFilter &&
                            !bodyTypeFilter &&
                            !searchTerm
                          }
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

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
                      value={pagination.limit.toString()}
                      onValueChange={handleEntriesChange}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
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
                        <TableHead className="w-auto">Title</TableHead>
                        <TableHead className="w-24">Code</TableHead>
                        <TableHead className="w-24">Email Type</TableHead>
                        <TableHead className="w-20">Priority</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead className="w-32">Variables</TableHead>
                        <TableHead className="w-32">Created By</TableHead>
                        <TableHead className="w-20 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
                              Loading Email templates...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-8 text-red-500"
                          >
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : templates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No Email templates found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        templates.map(template => (
                          <TableRow key={template._id}>
                            <TableCell className="font-medium w-auto">
                              <div>
                                <div className="font-semibold">
                                  {template.title}
                                </div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">
                                  {template.subject}
                                </div>
                                <div className="text-xs text-neutral-400 dark:text-neutral-500">
                                  From: {template.fromName} &lt;
                                  {template.fromEmail}&gt;
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="w-24">
                              <div className="truncate">
                                <Badge variant="outline" className="font-mono">
                                  {template.code}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="w-24">
                              <div className="truncate">
                                <Badge
                                  className={getEmailTypeBadgeColor(
                                    template.emailType
                                  )}
                                >
                                  {template.emailType}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="w-20">
                              <div className="truncate">
                                <Badge
                                  className={getPriorityBadgeColor(
                                    template.priority
                                  )}
                                >
                                  {template.priority}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="w-24">
                              <div className="truncate">
                                <Badge
                                  className={getStatusBadgeColor(
                                    template.status
                                  )}
                                >
                                  {template.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="w-32">
                              <div className="truncate">
                                {template.variables &&
                                template.variables.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {template.variables
                                      .slice(0, 2)
                                      .map((variable, index) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {variable}
                                        </Badge>
                                      ))}
                                    {template.variables.length > 2 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        +{template.variables.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-neutral-400">
                                    No variables
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="w-32">
                              <div className="truncate">
                                {template.createdBy?.name || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="w-20 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() => handleViewTemplate(template)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() =>
                                      handlePreviewTemplate(template)
                                    }
                                  >
                                    <Play className="h-4 w-4" />
                                    Generate Preview
                                  </DropdownMenuItem>
                                  {checkPermission('MOD035', 'edit') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() =>
                                        router.push(
                                          `/settings/templates/email/create?id=${template._id}`
                                        )
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Template
                                    </DropdownMenuItem>
                                  )}
                                  {checkPermission('MOD035', 'delete') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600"
                                      onClick={() =>
                                        handleDeleteTemplate(template)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Template
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
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{' '}
                    of {pagination.total} entries
                  </div>

                  {/* Pagination buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
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
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1
                          } else if (pagination.page >= pagination.pages - 2) {
                            pageNum = pagination.pages - 4 + i
                          } else {
                            pageNum = pagination.page - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                pagination.page === pageNum
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
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{templateToDelete?.title}</strong>? This action cannot be
              undone and will permanently remove the template from the system.
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
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600 mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Template Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                Email Template Details
              </DialogTitle>
              <Button
                onClick={() =>
                  selectedTemplate && handlePreviewTemplate(selectedTemplate)
                }
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pb-6">
            <div>
              {/* Template Header Information Card */}
              <Card className="border-neutral-200 dark:border-neutral-700 mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {selectedTemplate?.title}
                    </CardTitle>
                    {/* Status, Priority, Email Type and Code */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={`${getStatusBadgeColor(selectedTemplate?.status || '')} px-2 py-1 text-xs font-medium`}
                      >
                        {selectedTemplate?.status}
                      </Badge>
                      <Badge
                        className={`${getPriorityBadgeColor(selectedTemplate?.priority || '')} px-2 py-1 text-xs font-medium`}
                      >
                        {selectedTemplate?.priority}
                      </Badge>
                      <Badge
                        className={`${getEmailTypeBadgeColor(selectedTemplate?.emailType || '')} px-2 py-1 text-xs font-medium`}
                      >
                        {selectedTemplate?.emailType}
                      </Badge>
                      <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs border">
                        {selectedTemplate?.code}
                      </span>
                    </div>
                  </div>

                  {/* Email Details */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">
                        From:
                      </span>
                      <div className="text-neutral-900 dark:text-neutral-100">
                        {selectedTemplate?.fromName} &lt;
                        {selectedTemplate?.fromEmail}&gt;
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">
                        Reply To:
                      </span>
                      <div className="text-neutral-900 dark:text-neutral-100">
                        {selectedTemplate?.replyTo}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">
                        Body Type:
                      </span>
                      <div className="text-neutral-900 dark:text-neutral-100">
                        {selectedTemplate?.bodyType || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">
                        Subject:
                      </span>
                      <div className="text-neutral-900 dark:text-neutral-100">
                        {selectedTemplate?.subject}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Variables Section */}
              {selectedTemplate?.variables &&
                selectedTemplate.variables.length > 0 && (
                  <>
                    <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 mt-6">
                      Template Variables
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.variables.map((variable, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-3 py-1"
                        >
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}

              {/* Template Content */}
              <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 mt-6">
                Template Content
              </CardTitle>
              {selectedTemplate?.body ? (
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                  <div className="p-6">
                    {selectedTemplate.bodyType === 'html' ? (
                      <div
                        className="prose prose-sm max-w-none text-neutral-800 dark:text-neutral-200"
                        dangerouslySetInnerHTML={{
                          __html: selectedTemplate.body,
                        }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 text-base leading-relaxed">
                        {selectedTemplate.body}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="text-neutral-400 dark:text-neutral-500 mb-2">
                    <Mail className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400 italic text-lg">
                    No template content available
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
