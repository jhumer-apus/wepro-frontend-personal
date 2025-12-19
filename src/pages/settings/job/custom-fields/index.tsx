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
  SettingsNavigation,
  JobSettingsSubNavigation,
} from '@/src/components/job'
import { usePermissions } from '@/src/hooks/usePermissions'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'

// Interface for custom job fields
interface CustomJobField {
  _id: string
  name: string
  field_type: string
  placeholder: string
  display_order: number
  section: string
  isP1: boolean
  tenant_id: {
    _id: string
    name: string
    username: string
  }
  createdBy: {
    _id: string
    name: string
    username: string
  }
  description: string
  help_text: string
  createdAt: string
  updatedAt: string
  code: string
  options: any[]
  id: string
  requirement: {
    is_required: boolean
    required_message: string
    required_conditions: any
    is_custom_requirement: boolean
  }
  validation_rules: {
    min_length?: number
    max_length?: number
    pattern?: string
    pattern_message?: string
  }
}

interface CustomJobFieldsResponse {
  success: boolean
  message: string
  count: number
  pagination: {
    current?: {
      page: number
      limit: number
    }
    page?: number
    limit?: number
    total: number
    pages: number
  }
  data: CustomJobField[]
}

const getFieldTypeBadgeColor = (fieldType: string) => {
  switch (fieldType.toLowerCase()) {
    case 'text':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'number':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'select':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'checkbox':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    case 'date':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const getP1BadgeColor = (isP1: boolean) => {
  if (isP1 === false) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
  }
  return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
}

const getRequirementBadgeColor = (isRequired: boolean) => {
  return isRequired
    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
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

export default function JobCustomFieldsPage() {
  const router = useRouter()
  const { checkPermission, getUserType, userData, isSuperAdmin } =
    usePermissions()
  const tenantId = userData?.tenantId

  // State for custom job fields
  const [customFields, setCustomFields] = useState<CustomJobField[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pagination, setPagination] = useState({
    current: { page: 1, limit: 20 },
    total: 0,
    pages: 0,
    next: { page: 2, limit: 20 },
  })

  // State for delete functionality
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customFieldToDelete, setCustomFieldToDelete] =
    useState<CustomJobField | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch custom job fields from API
  const fetchCustomFields = useCallback(async () => {
    if (!tenantId) return

    try {
      setLoading(true)
      setError(null)

      // Determine API endpoint based on user permissions
      const isP1User = getUserType() === 'P1'
      const hasP1Permission = checkPermission('MOD025', 'view')

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: entriesPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
      })

      // Add include_settings for non-P1 users
      if (!isP1User && !hasP1Permission) {
        queryParams.append('include_settings', 'true')
      }

      const apiEndpoint =
        isP1User || hasP1Permission
          ? `/v1/custom-job-fields/p1?${queryParams.toString()}`
          : `/v1/custom-job-fields?${queryParams.toString()}`

      const response = await apiService.get(apiEndpoint)

      const responseData: CustomJobFieldsResponse = response.data

      if (responseData.success) {
        setCustomFields(responseData.data)
        setTotalCount(responseData.count)

        // Handle different pagination structure for P1 endpoint
        const paginationData = responseData.pagination
        const limit =
          paginationData.limit ||
          paginationData.current?.limit ||
          entriesPerPage
        const pages =
          paginationData.pages || Math.ceil(paginationData.total / limit)
        const currentPageData = {
          page:
            paginationData.page || paginationData.current?.page || currentPage,
          limit: limit,
        }

        setTotalPages(pages)
        setPagination({
          current: currentPageData,
          total: paginationData.total,
          pages: pages,
          next: {
            page: currentPageData.page + 1,
            limit: currentPageData.limit,
          },
        })
        setError(null)
      } else {
        setError(responseData.message || 'Failed to fetch custom fields')
        setCustomFields([])
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
      console.error('Error fetching custom fields:', err)
      setError(err.response?.data?.message || 'Failed to fetch custom fields')
      setCustomFields([])
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
    searchTerm,
    getUserType,
    checkPermission,
  ])

  // Fetch custom fields on component mount and when dependencies change
  useEffect(() => {
    if (
      !checkPermission('MOD025', 'view') &&
      !checkPermission('MOD026', 'view')
    ) {
      router.push('/settings/notifications')
      return
    }
  }, [tenantId, currentPage, entriesPerPage])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (tenantId) {
        setCurrentPage(1) // Reset to first page when searching
        setPagination(prev => ({
          ...prev,
          current: { ...prev.current, page: 1 },
        }))
        fetchCustomFields() // Fetch data with new search term
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, tenantId, fetchCustomFields])

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

  const handleDeleteCustomField = (customField: CustomJobField) => {
    setCustomFieldToDelete(customField)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!customFieldToDelete || !tenantId) return

    try {
      setDeleting(true)
      await apiService.delete(
        `/v1/custom-job-fields/${customFieldToDelete._id}`
      )

      // Refresh the list
      await fetchCustomFields()

      // Show success toast
      toast.success('Custom field deleted successfully!', {
        description: 'The custom field has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setCustomFieldToDelete(null)
    } catch (err: any) {
      console.error('Error deleting custom field:', err)
      toast.error('Failed to delete custom field', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the custom field.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setCustomFieldToDelete(null)
  }

  return (
    <>
      <Head>
        <title>Custom Fields - WePro</title>
        <meta name="description" content="Manage job custom fields" />
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
              Custom Fields
            </h1>
          </div>
          {(getUserType() === 'P1' ||
            checkPermission('MOD025', 'create') ||
            checkPermission('MOD026', 'create')) && (
            <Button
              onClick={() => router.push('/settings/job/custom-fields/create')}
              className="wepro-button-gradient text-white"
              disabled={!tenantId}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Field
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
                    placeholder="Search custom fields..."
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
                  Unable to load custom fields. Please ensure you are logged in
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
                        <TableHead>Field Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Required</TableHead>
                        {getUserType() !== 'P1' &&
                          !checkPermission('MOD025', 'view') && (
                            <TableHead>Type</TableHead>
                          )}
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell
                            colSpan={
                              getUserType() !== 'P1' &&
                              !checkPermission('MOD025', 'view')
                                ? 8
                                : 7
                            }
                            className="text-center py-8"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
                              Loading custom fields...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell
                            colSpan={
                              getUserType() !== 'P1' &&
                              !checkPermission('MOD025', 'view')
                                ? 8
                                : 7
                            }
                            className="text-center py-8 text-red-500"
                          >
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : customFields.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={
                              getUserType() !== 'P1' &&
                              !checkPermission('MOD025', 'view')
                                ? 8
                                : 7
                            }
                            className="text-center py-8"
                          >
                            No custom fields found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        customFields.map(customField => (
                          <TableRow key={customField._id}>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-semibold">
                                  {customField.name}
                                </div>
                                {customField.description && (
                                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {customField.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {customField.code}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getFieldTypeBadgeColor(
                                  customField.field_type
                                )}
                              >
                                {customField.field_type}
                              </Badge>
                            </TableCell>
                            <TableCell>{customField.section}</TableCell>
                            <TableCell>
                              <Badge
                                className={getRequirementBadgeColor(
                                  customField.requirement?.is_required || false
                                )}
                              >
                                {customField.requirement?.is_required
                                  ? 'Required'
                                  : 'Optional'}
                              </Badge>
                            </TableCell>
                            {getUserType() !== 'P1' &&
                              !checkPermission('MOD025', 'view') && (
                                <TableCell>
                                  <Badge
                                    variant={
                                      customField.isP1 ? 'default' : 'secondary'
                                    }
                                  >
                                    {customField.isP1 ? 'Default' : 'Custom'}
                                  </Badge>
                                </TableCell>
                              )}
                            <TableCell>
                              {formatDate(customField.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={
                                      (customField.isP1 &&
                                        !isSuperAdmin('MOD025')) ||
                                      (!checkPermission('MOD025', 'view') &&
                                        !checkPermission('MOD025', 'edit') &&
                                        !checkPermission('MOD025', 'delete') &&
                                        !checkPermission('MOD026', 'view') &&
                                        !checkPermission('MOD026', 'edit') &&
                                        !checkPermission('MOD026', 'delete'))
                                    }
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() =>
                                      router.push(
                                        `/settings/job/custom-fields/${customField._id}/view`
                                      )
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  {(getUserType() === 'P1' ||
                                    checkPermission('MOD025', 'edit') ||
                                    checkPermission('MOD026', 'edit')) && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() =>
                                        router.push(
                                          `/settings/job/custom-fields/create?id=${customField._id}`
                                        )
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Field
                                    </DropdownMenuItem>
                                  )}
                                  {(getUserType() === 'P1' ||
                                    checkPermission('MOD025', 'delete') ||
                                    checkPermission('MOD026', 'delete')) && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600"
                                      onClick={() =>
                                        handleDeleteCustomField(customField)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Field
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
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
                      <span className="text-neutral-500">Loading custom fields...</span>
                    </div>
                  </div>
                ) : customFields.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-neutral-500">No custom fields found</span>
                  </div>
                ) : (
                  customFields.map(customField => (
                    <Card key={customField._id} className="relative border border-neutral-200 dark:border-neutral-700">
                      <CardContent className="pt-4 pb-4">
                        <div className="space-y-3">
                          {/* Field Name */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Field Name
                            </div>
                            <div>
                              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {customField.name}
                              </div>
                              {customField.description && (
                                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                  {customField.description}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Code */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Code
                            </div>
                            <Badge variant="outline" className="font-mono">
                              {customField.code}
                            </Badge>
                          </div>

                          {/* Type */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Type
                            </div>
                            <Badge
                              className={getFieldTypeBadgeColor(
                                customField.field_type
                              )}
                            >
                              {customField.field_type}
                            </Badge>
                          </div>

                          {/* Section */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Section
                            </div>
                            <div className="text-sm text-neutral-900 dark:text-neutral-100">
                              {customField.section}
                            </div>
                          </div>

                          {/* Required */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Required
                            </div>
                            <Badge
                              className={getRequirementBadgeColor(
                                customField.requirement?.is_required || false
                              )}
                            >
                              {customField.requirement?.is_required
                                ? 'Required'
                                : 'Optional'}
                            </Badge>
                          </div>

                          {/* Type (conditional) */}
                          {getUserType() !== 'P1' &&
                            !checkPermission('MOD025', 'view') && (
                              <div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                  Type
                                </div>
                                <Badge
                                  variant={
                                    customField.isP1 ? 'default' : 'secondary'
                                  }
                                >
                                  {customField.isP1 ? 'Default' : 'Custom'}
                                </Badge>
                              </div>
                            )}

                          {/* Created At */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Created At
                            </div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                              {formatDate(customField.createdAt)}
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
                                (customField.isP1 &&
                                  !isSuperAdmin('MOD025')) ||
                                (!checkPermission('MOD025', 'view') &&
                                  !checkPermission('MOD025', 'edit') &&
                                  !checkPermission('MOD025', 'delete') &&
                                  !checkPermission('MOD026', 'view') &&
                                  !checkPermission('MOD026', 'edit') &&
                                  !checkPermission('MOD026', 'delete'))
                              }
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={() =>
                                router.push(
                                  `/settings/job/custom-fields/${customField._id}/view`
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {(getUserType() === 'P1' ||
                              checkPermission('MOD025', 'edit') ||
                              checkPermission('MOD026', 'edit')) && (
                              <DropdownMenuItem
                                className="flex items-center gap-2"
                                onClick={() =>
                                  router.push(
                                    `/settings/job/custom-fields/create?id=${customField._id}`
                                  )
                                }
                              >
                                <Edit className="h-4 w-4" />
                                Edit Field
                              </DropdownMenuItem>
                            )}
                            {(getUserType() === 'P1' ||
                              checkPermission('MOD025', 'delete') ||
                              checkPermission('MOD026', 'delete')) && (
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600"
                                onClick={() =>
                                  handleDeleteCustomField(customField)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Field
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Field</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{customFieldToDelete?.name}</strong>? This action cannot
              be undone and will permanently remove the custom field from the
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
    </>
  )
}
