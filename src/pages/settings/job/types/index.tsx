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
  Industry,
  IndustriesResponse,
} from '@/src/constants/interface/industry'
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

const getStatusBadgeColor = (active: boolean) => {
  return active
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

const getP1BadgeColor = (isP1: boolean) => {
  return isP1
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function JobTypesPage() {
  const router = useRouter()
  const { checkPermission, getUserType, isSuperAdmin } = usePermissions()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobTypeToDelete, setJobTypeToDelete] = useState<Industry | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Pagination state
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const [industries, setIndustries] = useState<Industry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [paginationInfo, setPaginationInfo] = useState<any>(null)

  const user = useAppSelector(state => state.user.data)
  const tenantId = user?.tenantId

  const fetchIndustries = useCallback(async () => {
    if (!tenantId) {
      setError('Tenant ID not available')
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const userType = getUserType()
      let url = `/v1/job-types`

      // If user type is P1, append it to the URL
      if (
        userType === 'P1' ||
        (userType === 'P5' && checkPermission('MOD014', 'view'))
      ) {
        url += `/P1`
      }

      url += `?sort=-createdAt&page=${currentPage}&limit=${entriesPerPage}`
      if (debouncedSearchTerm) {
        url += `&search=${encodeURIComponent(debouncedSearchTerm)}`
      }
      const response = await apiService.get(url)
      const responseData: IndustriesResponse = response.data

      if (responseData.success) {
        setIndustries(responseData.data)
        setTotalCount(responseData.count)
        // Use pagination info from API response
        if (responseData.pagination) {
          setPaginationInfo(responseData.pagination)
          setTotalPages(responseData.pagination.pages)
          // Ensure current page is valid
          if (currentPage > responseData.pagination.pages) {
            setCurrentPage(1)
          }
        } else {
          // Fallback: Calculate total pages based on count and limit
          setTotalPages(Math.ceil(responseData.count / entriesPerPage))
          // Ensure current page is valid
          if (currentPage > Math.ceil(responseData.count / entriesPerPage)) {
            setCurrentPage(1)
          }
        }
        setError(null)
      } else {
        setError(responseData.message || 'Failed to fetch job types')
        setIndustries([])
        setTotalCount(0)
        setTotalPages(0)
      }
    } catch (err: any) {
      console.error('Error fetching job types:', err)
      setError(err.response?.data?.message || 'Failed to fetch job types')
      setIndustries([])
      setTotalCount(0)
      setTotalPages(0)
      setPaginationInfo(null)
    } finally {
      setLoading(false)
    }
  }, [
    tenantId,
    currentPage,
    entriesPerPage,
    debouncedSearchTerm,
    checkPermission,
    getUserType,
  ])

  // Fetch job types on component mount and when dependencies change
  useEffect(() => {
    if (
      !checkPermission('MOD014', 'view') &&
      !checkPermission('MOD015', 'view')
    ) {
      router.push('/settings/job/categories-types')
      return
    }
    if (tenantId) {
      fetchIndustries()
    }
  }, [tenantId, currentPage, entriesPerPage, debouncedSearchTerm])

  // Reset pagination when search term changes
  useEffect(() => {
    if (tenantId && debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1) // Reset to first page when searching
      setPaginationInfo(null) // Reset pagination info when searching
    }
  }, [debouncedSearchTerm, tenantId, searchTerm])

  const handleDeleteJobType = (jobType: Industry) => {
    setJobTypeToDelete(jobType)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!jobTypeToDelete || !tenantId) return

    try {
      setDeleting(true)
      // Use the correct endpoint format for job types based on user type
      const userType = getUserType()
      let deleteUrl = `/v1/job-types`

      deleteUrl += `/${jobTypeToDelete._id}`
      await apiService.delete(deleteUrl)

      // Refresh the list by calling fetchIndustries
      await fetchIndustries()

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

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setJobTypeToDelete(null)
  }

  const handleEditIndustry = (industry: Industry) => {
    router.push(`/settings/job/types/create?id=${industry._id}`)
  }

  // Calculate pagination based on API response
  const currentIndustries = industries

  const handlePageChange = (page: number) => {
    // Ensure page is within valid range
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Scroll to top of the table for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleEntriesChange = (value: string) => {
    setEntriesPerPage(parseInt(value))
    setCurrentPage(1) // Reset to first page when changing entries per page
    setPaginationInfo(null) // Reset pagination info when changing entries per page
  }

  // Check permission to access this page
  if (
    !checkPermission('MOD014', 'view') &&
    !checkPermission('MOD015', 'view')
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

  return (
    <>
      <Head>
        <title>Job Types - Settings - WePro</title>
        <meta
          name="description"
          content="Manage job type categories and classifications"
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
              Job Types Management
            </h1>
          </div>
          {((checkPermission('MOD014', 'create') && getUserType() === 'P1') ||
            checkPermission('MOD015', 'create')) && (
            <div className="flex items-center space-x-3">
              <Button onClick={() => router.push('/settings/job/types/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Job Type
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        {/* Job Types Table */}
        <Card>
          <CardContent className="pt-6">
            {!tenantId ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Tenant ID Required
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Unable to load job types. Please ensure you are logged in with
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
                      value={entriesPerPage.toString()}
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
                      placeholder="Search job types..."
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
                        <TableHead>Job Type Name</TableHead>
                        <TableHead>Job Type Code</TableHead>
                        <TableHead>Parent Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        {!(getUserType() === 'P1') &&
                          !checkPermission('MOD014', 'view') && (
                            <TableHead>Type</TableHead>
                          )}
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableLoading
                          message="Loading job types..."
                          colSpan={
                            !(getUserType() === 'P1') &&
                            !checkPermission('MOD014', 'view')
                              ? 9
                              : 8
                          }
                        />
                      ) : error ? (
                        <TableRow>
                          <TableCell
                            colSpan={
                              !(getUserType() === 'P1') &&
                              !checkPermission('MOD014', 'view')
                                ? 9
                                : 8
                            }
                            className="text-center py-8 text-red-500"
                          >
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : currentIndustries.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={
                              !(getUserType() === 'P1') &&
                              !checkPermission('MOD014', 'view')
                                ? 9
                                : 8
                            }
                            className="text-center py-8"
                          >
                            No job types found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentIndustries.map(jobType => (
                          <TableRow key={jobType._id}>
                            <TableCell className="font-medium">
                              {jobType.name}
                            </TableCell>
                            <TableCell>{jobType.code}</TableCell>
                            <TableCell>
                              {jobType.parent_code || 'JT001'}
                            </TableCell>
                            <TableCell
                              className="max-w-[200px] truncate"
                              title={jobType.description || 'No description'}
                            >
                              {jobType.description || 'No description'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusBadgeColor(jobType.active)}
                              >
                                {jobType.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            {!(getUserType() === 'P1') &&
                              !checkPermission('MOD014', 'view') && (
                                <TableCell>
                                  <Badge
                                    variant={
                                      jobType.isP1 ? 'default' : 'secondary'
                                    }
                                  >
                                    {jobType.isP1 ? 'Default' : 'Custom'}
                                  </Badge>
                                </TableCell>
                              )}
                            <TableCell>
                              {formatDate(jobType.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    // disabled={
                                    //   (industry.isP1 && !isSuperAdmin('MOD014')) ||
                                    //   (!checkPermission('MOD014', 'edit') && !checkPermission('MOD014', 'delete') && !checkPermission('MOD015', 'edit') && !checkPermission('MOD015', 'delete') && !checkPermission('MOD014', 'view') && !checkPermission('MOD015', 'view'))
                                    // }
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() =>
                                      router.push(
                                        `/settings/job/types/${jobType._id}/view`
                                      )
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Job Type
                                  </DropdownMenuItem>
                                  {(checkPermission('MOD014', 'edit') ||
                                    (checkPermission('MOD015', 'edit') &&
                                      jobType.isP1 === false)) && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() =>
                                        handleEditIndustry(jobType)
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Job Type
                                    </DropdownMenuItem>
                                  )}
                                  {(checkPermission('MOD014', 'delete') ||
                                    (checkPermission('MOD015', 'delete') &&
                                      jobType.isP1 === false)) && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600"
                                      onClick={() =>
                                        handleDeleteJobType(jobType)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Job Type
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
                {totalCount > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    {/* Showing entries info */}
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Showing {(currentPage - 1) * entriesPerPage + 1} to{' '}
                      {Math.min(currentPage * entriesPerPage, totalCount)} of{' '}
                      {totalCount} entries
                    </div>

                    {/* Pagination buttons - Right aligned */}
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum
                            if (totalPages <= 5) {
                              pageNum = i + 1
                            } else if (currentPage <= 3) {
                              pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i
                            } else {
                              pageNum = currentPage - 2 + i
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  currentPage === pageNum
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
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={
                          currentPage === totalPages || !paginationInfo?.next
                        }
                      >
                        Next
                      </Button>
                    </div>

                    {/* Additional pagination info */}
                    {paginationInfo && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        Page {paginationInfo.current?.page || currentPage} of{' '}
                        {paginationInfo.pages || totalPages}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

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
