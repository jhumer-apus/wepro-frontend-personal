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
  Building2,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  MoreVertical,
  Eye,
  Loader2,
  X,
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
  MetroArea,
  MetroAreasResponse,
} from '@/src/constants/interface/metroArea'
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function JobMetroAreaPage() {
  const router = useRouter()
  const { checkPermission, getUserType } = usePermissions()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [metroAreaToDelete, setMetroAreaToDelete] = useState<MetroArea | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)

  // Pagination state
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Search filters state
  const [latitudeFilter, setLatitudeFilter] = useState('')
  const [longitudeFilter, setLongitudeFilter] = useState('')

  // Debounced search values
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const debouncedLatitudeFilter = useDebounce(latitudeFilter, 500)
  const debouncedLongitudeFilter = useDebounce(longitudeFilter, 500)

  const [metroAreas, setMetroAreas] = useState<MetroArea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [paginationInfo, setPaginationInfo] = useState<any>(null)

  const user = useAppSelector(state => state.user.data)
  const tenantId = user?.tenantId

  const fetchMetroAreas = useCallback(async () => {
    if (!tenantId) {
      setError('Tenant ID not available')
      setLoading(false)
      return
    }

    if (
      (debouncedLatitudeFilter && !debouncedLongitudeFilter) ||
      (!debouncedLatitudeFilter && debouncedLongitudeFilter)
    ) {
      return
    }

    setLoading(true)

    try {
      let url = `/v3/metro-areas?page=${currentPage}&limit=${entriesPerPage}&sortBy=createdAt&sortOrder=desc`

      if (debouncedLatitudeFilter && debouncedLongitudeFilter) {
        url = `/v3/metro-areas/search?lat=${encodeURIComponent(debouncedLatitudeFilter)}&lng=${encodeURIComponent(debouncedLongitudeFilter)}`
        if (debouncedSearchTerm) {
          url += `&search=${encodeURIComponent(debouncedSearchTerm)}`
        }
      } else {
        if (debouncedSearchTerm) {
          url += `&search=${encodeURIComponent(debouncedSearchTerm)}`
        }
        if (debouncedLatitudeFilter) {
          url += `&lat=${encodeURIComponent(debouncedLatitudeFilter)}`
        }
        if (debouncedLongitudeFilter) {
          url += `&lng=${encodeURIComponent(debouncedLongitudeFilter)}`
        }
      }

      const response = await apiService.get(url)
      const responseData: MetroAreasResponse = response.data

      if (debouncedLatitudeFilter && debouncedLongitudeFilter) {
        // For search endpoint, the response structure might be different
        setMetroAreas(responseData.data || [])
        return
      }
      if (responseData.success) {
        setMetroAreas(responseData.data)
        setTotalCount(responseData.count)
        // Use pagination info from API response
        if (responseData.pagination) {
          setPaginationInfo(responseData.pagination)
          setTotalPages(responseData.pagination.totalPages)
          // Ensure current page is valid
          if (currentPage > responseData.pagination.totalPages) {
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
        setError(responseData.message || 'Failed to fetch metro areas')
        setMetroAreas([])
        setTotalCount(0)
        setTotalPages(0)
      }
    } catch (err: any) {
      console.error('Error fetching metro areas:', err)
      setError(err.response?.data?.message || 'Failed to fetch metro areas')
      setMetroAreas([])
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
    debouncedLatitudeFilter,
    debouncedLongitudeFilter,
  ])

  // Fetch metro areas on component mount and when dependencies change
  useEffect(() => {
    if (tenantId) {
      fetchMetroAreas()
    }
  }, [
    tenantId,
    currentPage,
    entriesPerPage,
    debouncedSearchTerm,
    fetchMetroAreas,
  ])

  // Refetch when both latitude and longitude are provided
  useEffect(() => {
    if (tenantId && debouncedLatitudeFilter && debouncedLongitudeFilter) {
      fetchMetroAreas()
    }
  }, [
    tenantId,
    debouncedLatitudeFilter,
    debouncedLongitudeFilter,
    fetchMetroAreas,
  ])

  // Reset pagination when debounced values change
  useEffect(() => {
    if (tenantId) {
      setCurrentPage(1) // Reset to first page when searching
      setPaginationInfo(null) // Reset pagination info when searching
    }
  }, [
    debouncedSearchTerm,
    debouncedLatitudeFilter,
    debouncedLongitudeFilter,
    tenantId,
  ])

  const handleDeleteMetroArea = (metroArea: MetroArea) => {
    setMetroAreaToDelete(metroArea)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!metroAreaToDelete) return

    setDeleting(true)
    try {
      await apiService.delete(`/v3/metro-areas/${metroAreaToDelete._id}`)
      toast.success('Metro area deleted successfully')
      setDeleteDialogOpen(false)
      setMetroAreaToDelete(null)
      // Refresh the list
      fetchMetroAreas()
    } catch (err: any) {
      console.error('Error deleting metro area:', err)
      toast.error(err.response?.data?.message || 'Failed to delete metro area')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setMetroAreaToDelete(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEntriesChange = (value: string) => {
    setEntriesPerPage(parseInt(value))
    setCurrentPage(1) // Reset to first page when changing entries per page
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setLatitudeFilter('')
    setLongitudeFilter('')
    setCurrentPage(1)
  }

  return (
    <>
      <Head>
        <title>Job Metro Area - WePro</title>
        <meta name="description" content="Manage job metro areas" />
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
              Job Metro Area
            </h1>
          </div>
          {checkPermission('MOD029', 'create') && (
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => router.push('/settings/job/metro-area/create')}
                className="text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Metro Area
              </Button>
            </div>
          )}
        </div>

        {/* Filters and Search Component */}
        {tenantId && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Filters Section */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Latitude Filter */}
                  <div className="space-y-2 flex-1">
                    <Label className="text-sm font-medium">Latitude</Label>
                    <Input
                      placeholder="e.g., 40.7128"
                      value={latitudeFilter}
                      onChange={e => setLatitudeFilter(e.target.value)}
                      type="number"
                      step="any"
                    />
                  </div>

                  {/* Longitude Filter */}
                  <div className="space-y-2 flex-1">
                    <Label className="text-sm font-medium">Longitude</Label>
                    <Input
                      placeholder="e.g., -74.0060"
                      value={longitudeFilter}
                      onChange={e => setLongitudeFilter(e.target.value)}
                      type="number"
                      step="any"
                    />
                  </div>

                  {/* Search Bar */}
                  <div className="space-y-2 flex-1">
                    <Label className="text-sm font-medium">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        placeholder="Search metro areas..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="space-y-2 flex-1">
                    <Label className="text-sm font-medium">&nbsp;</Label>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={clearAllFilters}
                        disabled={
                          !searchTerm && !latitudeFilter && !longitudeFilter
                        }
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {/* Metro Areas Table */}
        {!tenantId ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Tenant ID Required
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Unable to load metro areas. Please ensure you are logged in
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
            <Card className="hidden md:block">
              <CardContent className="pt-6">
                {/* Table Controls */}
                {!(debouncedLatitudeFilter && debouncedLongitudeFilter) && (
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
                )}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Zipcode</TableHead>
                        <TableHead>Radius</TableHead>
                        <TableHead>Location</TableHead>

                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableLoading
                          message="Loading metro areas..."
                          colSpan={7}
                        />
                      ) : error ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-red-500"
                          >
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : metroAreas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No metro areas found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        metroAreas.map(metroArea => (
                          <TableRow key={metroArea._id}>
                            <TableCell className="font-medium">
                              {metroArea.name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                style={{
                                  backgroundColor: metroArea.background_color,
                                  color: metroArea.text_color,
                                }}
                                className="font-mono"
                              >
                                {metroArea.code}
                              </Badge>
                            </TableCell>
                            <TableCell>{metroArea.zipcode}</TableCell>
                            <TableCell>
                              {metroArea.is_advance_area_select
                                ? '--'
                                : `${metroArea.radius} ${metroArea.radius_unit}`}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-neutral-500" />
                                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                  {metroArea.latitude.toFixed(4)}°,{' '}
                                  {metroArea.longitude.toFixed(4)}°
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              {formatDate(metroArea.createdAt)}
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
                                  {checkPermission('MOD029', 'view') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() =>
                                        router.push(
                                          `/settings/job/metro-area/${metroArea._id}/view`
                                        )
                                      }
                                    >
                                      <Eye className="h-4 w-4" />
                                      View Metro Area
                                    </DropdownMenuItem>
                                  )}
                                  {checkPermission('MOD029', 'edit') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() =>
                                        router.push(
                                          `/settings/job/metro-area/create?id=${metroArea._id}`
                                        )
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Metro Area
                                    </DropdownMenuItem>
                                  )}
                                  {checkPermission('MOD029', 'delete') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600"
                                      onClick={() =>
                                        handleDeleteMetroArea(metroArea)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Metro Area
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
                {totalCount > 0 &&
                  !(debouncedLatitudeFilter && debouncedLongitudeFilter) && (
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
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={
                            currentPage === totalPages ||
                            !paginationInfo?.hasNextPage
                          }
                        >
                          Next
                        </Button>
                      </div>

                      {/* Additional pagination info */}
                      {paginationInfo && (
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          Page {paginationInfo.currentPage || currentPage} of{' '}
                          {paginationInfo.totalPages || totalPages}
                        </div>
                      )}
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Mobile View */}
            <div className="block md:hidden space-y-4">
              {/* Show Entries Dropdown */}
              {!(debouncedLatitudeFilter && debouncedLongitudeFilter) && (
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
              )}

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
                    <span className="text-neutral-500">Loading metro areas...</span>
                  </div>
                ) : metroAreas.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-neutral-500">No metro areas found</span>
                  </div>
                ) : (
                  metroAreas.map(metroArea => (
                    <Card key={metroArea._id} className="relative border border-neutral-200 dark:border-neutral-700">
                      <CardContent className="pt-4 pb-4">
                        <div className="space-y-3">
                          {/* Name */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Name
                            </div>
                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                              {metroArea.name}
                            </div>
                          </div>

                          {/* Code */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Code
                            </div>
                            <Badge
                              style={{
                                backgroundColor: metroArea.background_color,
                                color: metroArea.text_color,
                              }}
                              className="font-mono"
                            >
                              {metroArea.code}
                            </Badge>
                          </div>

                          {/* Zipcode */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Zipcode
                            </div>
                            <div className="text-sm text-neutral-900 dark:text-neutral-100">
                              {metroArea.zipcode}
                            </div>
                          </div>

                          {/* Radius */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Radius
                            </div>
                            <div className="text-sm text-neutral-900 dark:text-neutral-100">
                              {metroArea.is_advance_area_select
                                ? '--'
                                : `${metroArea.radius} ${metroArea.radius_unit}`}
                            </div>
                          </div>

                          {/* Location */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Location
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-neutral-500" />
                              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {metroArea.latitude.toFixed(4)}°,{' '}
                                {metroArea.longitude.toFixed(4)}°
                              </div>
                            </div>
                          </div>

                          {/* Created At */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Created At
                            </div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                              {formatDate(metroArea.createdAt)}
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
                            {checkPermission('MOD029', 'view') && (
                              <DropdownMenuItem
                                className="flex items-center gap-2"
                                onClick={() =>
                                  router.push(
                                    `/settings/job/metro-area/${metroArea._id}/view`
                                  )
                                }
                              >
                                <Eye className="h-4 w-4" />
                                View Metro Area
                              </DropdownMenuItem>
                            )}
                            {checkPermission('MOD029', 'edit') && (
                              <DropdownMenuItem
                                className="flex items-center gap-2"
                                onClick={() =>
                                  router.push(
                                    `/settings/job/metro-area/create?id=${metroArea._id}`
                                  )
                                }
                              >
                                <Edit className="h-4 w-4" />
                                Edit Metro Area
                              </DropdownMenuItem>
                            )}
                            {checkPermission('MOD029', 'delete') && (
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600"
                                onClick={() =>
                                  handleDeleteMetroArea(metroArea)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Metro Area
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
              {totalCount > 0 &&
                !(debouncedLatitudeFilter && debouncedLongitudeFilter) && (
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                    Showing {(currentPage - 1) * entriesPerPage + 1} to{' '}
                    {Math.min(currentPage * entriesPerPage, totalCount)} of{' '}
                    {totalCount} entries
                  </div>
                )}

              {/* Pagination Controls */}
              {totalCount > 0 &&
                !(debouncedLatitudeFilter && debouncedLongitudeFilter) && (
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
                                currentPage === pageNum ? 'default' : 'outline'
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
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage === totalPages ||
                        !paginationInfo?.hasNextPage ||
                        loading
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Metro Area</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{metroAreaToDelete?.name}</strong>? This action cannot be
              undone and will permanently remove the metro area from the system.
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
