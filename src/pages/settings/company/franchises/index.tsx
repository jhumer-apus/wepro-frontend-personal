import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
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
  Building2,
  Loader2,
  MapPin,
  Phone,
  Mail,
  User,
} from 'lucide-react'
import {
  SettingsNavigation,
  CompanySettingsSubNavigation,
} from '@/src/components/job'
import { usePermissions } from '@/src/hooks/usePermissions'
import { useDebounce } from '@/src/hooks/useDebounce'
import { apiService } from '@/src/services/api'
import { useAppSelector } from '@/src/store/hooks'
import { TableLoading } from '@/src/components/ui/loading'
import { toast } from 'sonner'
import {
  Franchise,
  FranchisesResponse,
} from '@/src/constants/interface/franchise'
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

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'inactive':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const getPrimaryBadgeColor = (isPrimary: boolean) => {
  return isPrimary
    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) {
    return 'N/A'
  }
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatAddress = (franchise: Franchise) => {
  const parts = [
    franchise.address,
    franchise.addressLine2,
    franchise.city,
    franchise.state,
    franchise.zipCode,
    franchise.country,
  ].filter(Boolean)

  return parts.join(', ')
}

export default function CompanyFranchisesPage() {
  const router = useRouter()
  const { checkPermission, getUserType } = usePermissions()

  // Modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [franchiseToDelete, setFranchiseToDelete] = useState<Franchise | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)

  // Pagination state
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const [franchises, setFranchises] = useState<Franchise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pagination, setPagination] = useState({
    current: { page: 1, limit: 10 },
    total: 0,
    pages: 0,
  })

  const user = useAppSelector(state => state.user.data)
  const tenantId = user?.tenantId

  const fetchFranchises = useCallback(async () => {
    if (!tenantId) {
      setError('Tenant ID not available')
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      let url = `/v1/franchises?page=${currentPage}&limit=${entriesPerPage}&sort=-createdAt`
      if (debouncedSearchTerm) {
        url += `&search=${encodeURIComponent(debouncedSearchTerm)}`
      }

      const response = await apiService.get(url)
      const responseData: FranchisesResponse = response.data

      if (responseData.success) {
        setFranchises(responseData.data)
        setTotalCount(responseData.count)

        if (responseData.pagination) {
          setPagination(responseData.pagination)
          setTotalPages(responseData.pagination.pages)
          setCurrentPage(responseData.pagination.current.page)
          setEntriesPerPage(responseData.pagination.current.limit)
        } else {
          // Fallback calculation
          setTotalPages(Math.ceil(responseData.count / entriesPerPage))
          setPagination({
            current: { page: currentPage, limit: entriesPerPage },
            total: responseData.count,
            pages: Math.ceil(responseData.count / entriesPerPage),
          })
        }
        setError(null)
      } else {
        setError(responseData.message || 'Failed to fetch franchises')
        setFranchises([])
        setTotalCount(0)
        setTotalPages(0)
        setPagination({
          current: { page: 1, limit: 10 },
          total: 0,
          pages: 0,
        })
      }
    } catch (err: any) {
      console.error('Error fetching franchises:', err)
      setError(err.response?.data?.message || 'Failed to fetch franchises')
      setFranchises([])
      setTotalCount(0)
      setTotalPages(0)
      setPagination({
        current: { page: 1, limit: 10 },
        total: 0,
        pages: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [tenantId, currentPage, entriesPerPage, debouncedSearchTerm])

  // Fetch franchises on component mount and when dependencies change
  useEffect(() => {
    if (!checkPermission('MOD027', 'view')) {
      router.push('/settings/company/sources')
      return
    }
    if (tenantId) {
      fetchFranchises()
    }
  }, [tenantId, currentPage, entriesPerPage, debouncedSearchTerm])

  // Reset pagination when search term changes
  useEffect(() => {
    if (tenantId && debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1)
      setPagination(prev => ({
        ...prev,
        current: { ...prev.current, page: 1 },
      }))
    }
  }, [debouncedSearchTerm, tenantId, searchTerm])

  const handleDeleteFranchise = (franchise: Franchise) => {
    setFranchiseToDelete(franchise)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!franchiseToDelete || !tenantId) return

    try {
      setDeleting(true)
      await apiService.delete(`/v1/franchises/${franchiseToDelete._id}`)

      // Refresh the list
      await fetchFranchises()

      toast.success('Franchise deleted successfully!', {
        description: 'The franchise has been removed from the system.',
      })

      setDeleteDialogOpen(false)
      setFranchiseToDelete(null)
    } catch (err: any) {
      console.error('Error deleting franchise:', err)
      toast.error('Failed to delete franchise', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the franchise.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setFranchiseToDelete(null)
  }

  const handleViewFranchise = (franchise: Franchise) => {
    router.push(`/settings/company/franchises/${franchise._id}/view`)
  }

  const handleEditFranchise = (franchise: Franchise) => {
    router.push(`/settings/company/franchises/create?id=${franchise._id}`)
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

  return (
    <>
      <Head>
        <title>Company Franchises - WePro</title>
        <meta name="description" content="Manage company franchises" />
      </Head>
      <div className="space-y-6">
        {/* Main Tab Navigation */}
        <SettingsNavigation />

        {/* Sub Tab Navigation */}
        <CompanySettingsSubNavigation />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Company Franchises
            </h1>
          </div>
          <Button
            onClick={() => router.push('/settings/company/franchises/create')}
            className="flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            Add Franchise
          </Button>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="pt-6">
            {!tenantId ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Tenant ID Required
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Unable to load franchises. Please ensure you are logged in
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
                      placeholder="Search franchises..."
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
                        <TableHead>Franchise Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Primary</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableLoading
                          message="Loading franchises..."
                          colSpan={9}
                        />
                      ) : error ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center py-8 text-red-500"
                          >
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : franchises.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            No franchises found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        franchises.map(franchise => (
                          <TableRow key={franchise._id}>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-semibold">
                                  {franchise.name}
                                </div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                  @{franchise.weproUsername}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {franchise.code}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-neutral-400" />
                                <span>{franchise.ownerName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusBadgeColor(
                                  franchise.status
                                )}
                              >
                                {franchise.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getPrimaryBadgeColor(
                                  franchise.isPrimary
                                )}
                              >
                                {franchise.isPrimary ? 'Primary' : 'Secondary'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-3 h-3 text-neutral-400" />
                                  <span className="truncate max-w-[150px]">
                                    {franchise.email}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-3 h-3 text-neutral-400" />
                                  <span>{franchise.phoneNumber}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-neutral-400" />
                                <div className="text-sm">
                                  <div className="font-medium">
                                    {franchise.city}, {franchise.state}
                                  </div>
                                  <div className="text-neutral-500 dark:text-neutral-400 text-xs">
                                    {franchise.address}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDate(franchise.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
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
                                    onClick={() =>
                                      handleViewFranchise(franchise)
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() =>
                                      handleEditFranchise(franchise)
                                    }
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit Franchise
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 text-red-600"
                                    onClick={() =>
                                      handleDeleteFranchise(franchise)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Franchise
                                  </DropdownMenuItem>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Franchise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{franchiseToDelete?.name}</strong>? This action cannot be
              undone and will permanently remove the franchise from the system.
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
