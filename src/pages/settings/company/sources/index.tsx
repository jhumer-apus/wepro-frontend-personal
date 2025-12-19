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
  Eye,
  Globe,
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
  CompanySettingsSubNavigation,
} from '@/src/components/job'
import { usePermissions } from '@/src/hooks/usePermissions'
import { useDebounce } from '@/src/hooks/useDebounce'
import { Source } from '@/src/constants/interface/source'
import { apiService } from '@/src/services/api'
import { sourcesService } from '@/src/services/sourcesService'
import { toast } from 'sonner'

const getStatusBadgeColor = (isActive: boolean) => {
  return isActive
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function CompanySourcesPage() {
  const router = useRouter()
  const { checkPermission } = usePermissions()

  // State for sources
  const [sources, setSources] = useState<Source[]>([])
  const [filteredSources, setFilteredSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // State for delete functionality
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sourceToDelete, setSourceToDelete] = useState<Source | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Load sources data from API
  const loadSources = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      queryParams.append('page', currentPage.toString())
      queryParams.append('limit', entriesPerPage.toString())
      queryParams.append('sort', '-createdAt')
      if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm)

      const url = `/v1/sources?${queryParams.toString()}`
      const response = await apiService.get(url)

      setSources(response.data.data)
      setFilteredSources(response.data.data)
      setTotalCount(response.data.count)
      setTotalPages(response.data.pagination.pages)
    } catch (err: any) {
      console.error('Failed to load sources:', err)
      setError('Failed to load sources. Please try again.')
      toast.error('Failed to load sources', {
        description: 'An error occurred while loading the sources.',
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, entriesPerPage, debouncedSearchTerm])

  useEffect(() => {
    if (!checkPermission('MOD008', 'view')) {
      router.push('/settings/job/industry')
      return
    }
    loadSources()
  }, [loadSources])

  // Handle search with debouncing - reset to first page when search term changes
  useEffect(() => {
    if (!checkPermission('MOD008', 'view')) {
      router.push('/settings/job/industry')
      return
    }
    setCurrentPage(1) // Reset to first page when search term changes
  }, [debouncedSearchTerm])

  // Use sources directly since pagination is handled server-side
  const currentSources = sources

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEntriesChange = (value: string) => {
    const newLimit = parseInt(value)
    setEntriesPerPage(newLimit)
    setCurrentPage(1)
  }

  const handleDeleteSource = (source: Source) => {
    setSourceToDelete(source)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!sourceToDelete) return

    try {
      setDeleting(true)

      await sourcesService.deleteSource(sourceToDelete._id)

      // Reload sources after deletion
      await loadSources()

      toast.success('Source deleted successfully!', {
        description: 'The source has been removed from the system.',
      })

      setDeleteDialogOpen(false)
      setSourceToDelete(null)
    } catch (err: any) {
      console.error('Failed to delete source:', err)
      toast.error('Failed to delete source', {
        description: 'An error occurred while deleting the source.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSourceToDelete(null)
  }

  return (
    <>
      <Head>
        <title>Company Sources - WePro</title>
        <meta name="description" content="Manage company sources" />
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
              Company Sources
            </h1>
          </div>
          {checkPermission('MOD008', 'create') && (
            <Button
              onClick={() => router.push('/settings/company/sources/create')}
              className="wepro-button-gradient text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Source
            </Button>
          )}
        </div>

        {/* Search Component */}
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
                  placeholder="Search sources..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        {/* Desktop View */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Lead Sources
            </CardTitle>
          </CardHeader>
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
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
                          Loading sources...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-red-500"
                      >
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : currentSources.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No sources found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentSources.map(source => (
                      <TableRow key={source._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-semibold">{source.name}</div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                {source.weproUsername}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusBadgeColor(
                              source.status === 'Active'
                            )}
                          >
                            {source.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{source.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{source.phoneNumber}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>
                              {source.city}, {source.state}
                            </div>
                            <div className="text-neutral-500 dark:text-neutral-400">
                              {source.zipCode}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(source.createdAt)}</TableCell>
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
                              {checkPermission('MOD008', 'view') && (
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() =>
                                    router.push(
                                      `/settings/company/sources/${source._id}/view`
                                    )
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                              )}
                              {checkPermission('MOD008', 'edit') && (
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() =>
                                    router.push(
                                      `/settings/company/sources/create?id=${source._id}`
                                    )
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Source
                                </DropdownMenuItem>
                              )}
                              {checkPermission('MOD008', 'delete') && (
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-red-600"
                                  onClick={() => handleDeleteSource(source)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete Source
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
                Showing {(currentPage - 1) * entriesPerPage + 1} to{' '}
                {Math.min(currentPage * entriesPerPage, totalCount)} of{' '}
                {totalCount} entries
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-2">
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
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                          currentPage === pageNum ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0 text-white"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
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
                  <span className="text-neutral-500">Loading sources...</span>
                </div>
              </div>
            ) : currentSources.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-neutral-500">No sources found</span>
              </div>
            ) : (
              currentSources.map(source => (
                <Card key={source._id} className="relative border border-neutral-200 dark:border-neutral-700">
                  <CardContent className="pt-4 pb-4">
                    <div className="space-y-3">
                      {/* Source Name */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Source Name
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {source.name}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {source.weproUsername}
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Status
                        </div>
                        <Badge
                          className={getStatusBadgeColor(
                            source.status === 'Active'
                          )}
                        >
                          {source.status}
                        </Badge>
                      </div>

                      {/* Email */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Email
                        </div>
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {source.email}
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Phone
                        </div>
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {source.phoneNumber}
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Location
                        </div>
                        <div className="text-sm">
                          <div className="text-neutral-900 dark:text-neutral-100">
                            {source.city}, {source.state}
                          </div>
                          <div className="text-neutral-500 dark:text-neutral-400">
                            {source.zipCode}
                          </div>
                        </div>
                      </div>

                      {/* Created At */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Created At
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {formatDate(source.createdAt)}
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
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {checkPermission('MOD008', 'view') && (
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            onClick={() =>
                              router.push(
                                `/settings/company/sources/${source._id}/view`
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {checkPermission('MOD008', 'edit') && (
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            onClick={() =>
                              router.push(
                                `/settings/company/sources/create?id=${source._id}`
                              )
                            }
                          >
                            <Edit className="h-4 w-4" />
                            Edit Source
                          </DropdownMenuItem>
                        )}
                        {checkPermission('MOD008', 'delete') && (
                          <DropdownMenuItem
                            className="flex items-center gap-2 text-red-600"
                            onClick={() => handleDeleteSource(source)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Source
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
            Showing {(currentPage - 1) * entriesPerPage + 1} to{' '}
            {Math.min(currentPage * entriesPerPage, totalCount)} of{' '}
            {totalCount} entries
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0 text-white"
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{sourceToDelete?.name}</strong>? This action cannot be
              undone and will permanently remove the source from the system.
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
