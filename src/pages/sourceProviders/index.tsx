import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import {
  Plus,
  Search,
  Building2,
  MoreVertical,
  Edit,
  Eye,
  Loader2,
  Trash2,
  Shield,
  Check,
  ChevronsUpDown,
} from 'lucide-react'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { Company, CompaniesResponse } from '@/src/constants/interface/company'
import { Package, PackagesResponse } from '@/src/constants/interface/package'
import { apiService } from '@/src/services/api'
import { useAppSelector } from '@/src/store/hooks'
import { toast } from 'sonner'
import { TableLoading } from '@/src/components/ui/loading'
import { usePermissions } from '@/src/hooks/usePermissions'
import { useDebounce } from '@/src/hooks/useDebounce'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/src/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'Tenant':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'Customer':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'Partner':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function SourceProvidersPage(): React.JSX.Element {
  const router = useRouter()
  const { checkPermission } = usePermissions()

  // Check permission to access this page
  if (!checkPermission('MOD011', 'view')) {
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sourceProviderToDelete, setSourceProviderToDelete] =
    useState<Company | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Pagination state
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>(
    'all'
  )
  const [selectedPackageId, setSelectedPackageId] = useState('')
  const [packages, setPackages] = useState<Package[]>([])
  const [packagesLoading, setPackagesLoading] = useState(false)
  const [packageOpen, setPackageOpen] = useState(false)

  // Debounced search term (500ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const [sourceProviders, setSourceProviders] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const user = useAppSelector(state => state.user.data)
  const tenantId = user?.tenantId

  const fetchSourceProviders = useCallback(async () => {
    if (!tenantId) {
      setError('Tenant ID not available')
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      let url = `/v1/users/tenant?page=${currentPage}&limit=${entriesPerPage}&packageType=P3&tenantId=${tenantId}`
      if (debouncedSearchTerm) {
        url += `&search=${encodeURIComponent(debouncedSearchTerm)}`
      }
      if (statusFilter && statusFilter !== 'all') {
        url += `&status=${encodeURIComponent(statusFilter)}`
      }
      if (selectedPackageId) {
        url += `&packageId=${encodeURIComponent(selectedPackageId)}`
      }
      const response = await apiService.get(url)
      const responseData: CompaniesResponse = response.data

      if (responseData.success) {
        setSourceProviders(responseData.data)
        setTotalCount(responseData.count)
        setTotalPages(responseData.pagination.pages)
        setError(null)
      } else {
        setError(responseData.message || 'Failed to fetch source providers')
        setSourceProviders([])
        setTotalCount(0)
        setTotalPages(0)
      }
    } catch (err: any) {
      console.error('Error fetching source providers:', err)
      setError(
        err.response?.data?.message || 'Failed to fetch source providers'
      )
      setSourceProviders([])
      setTotalCount(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [
    tenantId,
    currentPage,
    entriesPerPage,
    debouncedSearchTerm,
    statusFilter,
    selectedPackageId,
  ])

  // Fetch source providers on component mount and when dependencies change
  useEffect(() => {
    if (tenantId) {
      fetchSourceProviders()
    }
  }, [
    tenantId,
    currentPage,
    entriesPerPage,
    debouncedSearchTerm,
    statusFilter,
    selectedPackageId,
    fetchSourceProviders,
  ])

  // Reset to first page when search term changes
  useEffect(() => {
    if (tenantId) {
      setCurrentPage(1) // Reset to first page when searching
    }
  }, [debouncedSearchTerm, statusFilter, selectedPackageId, tenantId])

  useEffect(() => {
    const fetchPackages = async () => {
      setPackagesLoading(true)
      try {
        const response = await apiService.get('/v1/packages?page=1&limit=100')
        const responseData: PackagesResponse = response.data
        if (responseData?.success) {
          setPackages(responseData.data)
        }
      } catch (err) {
        console.error('Error fetching packages:', err)
        toast.error('Failed to load packages')
      } finally {
        setPackagesLoading(false)
      }
    }

    fetchPackages()
  }, [])

  const handleDeleteSourceProvider = (sourceProvider: Company) => {
    setSourceProviderToDelete(sourceProvider)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!sourceProviderToDelete || !tenantId) return

    try {
      setDeleting(true)
      // Use the correct endpoint format: /v1/users/tenant/{{user_id}}?tenantId={{p1_tenant_id}}
      await apiService.delete(
        `/v1/users/tenant/${sourceProviderToDelete._id}?tenantId=${tenantId}`
      )

      // Refresh the list by calling fetchSourceProviders
      await fetchSourceProviders()

      // Show success toast
      toast.success('Source Provider deleted successfully!', {
        description: 'The source provider has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setSourceProviderToDelete(null)
    } catch (err: any) {
      console.error('Error deleting source provider:', err)
      // Show error toast
      toast.error('Failed to delete source provider', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the source provider.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSourceProviderToDelete(null)
  }

  // Calculate pagination based on API response
  const currentSourceProviders = sourceProviders

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEntriesChange = (value: string) => {
    setEntriesPerPage(parseInt(value))
    setCurrentPage(1) // Reset to first page when changing entries per page
  }

  return (
    <>
      <Head>
        <title>Source Providers - WePro</title>
        <meta name="description" content="Manage WePro source providers" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Source Providers
            </h1>
          </div>
          {checkPermission('MOD011', 'create') && (
            <Button
              className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => router.push('/sourceProviders/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Source Provider
            </Button>
          )}
        </div>

        {/* Search Component */}
        {tenantId && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Search
                  </Label>
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Search source providers..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Status
                  </Label>
                  <Select
                    value={statusFilter}
                    onValueChange={value =>
                      setStatusFilter(value as 'all' | 'Active' | 'Inactive')
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Package
                  </Label>
                  <Popover open={packageOpen} onOpenChange={setPackageOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={packageOpen}
                        className="w-full justify-between"
                      >
                        {selectedPackageId
                          ? packages.find(pkg => pkg._id === selectedPackageId)?.name ||
                            'Selected package'
                          : 'All packages'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search package..." />
                        <CommandList>
                          {packagesLoading ? (
                            <CommandEmpty>Loading packages...</CommandEmpty>
                          ) : (
                            <>
                              <CommandEmpty>No packages found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="all"
                                  onSelect={() => {
                                    setSelectedPackageId('')
                                    setPackageOpen(false)
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selectedPackageId === '' ? 'opacity-100' : 'opacity-0'
                                    }`}
                                  />
                                  All packages
                                </CommandItem>
                                {packages.map(pkg => (
                                  <CommandItem
                                    key={pkg._id}
                                    value={pkg.name}
                                    onSelect={() => {
                                      setSelectedPackageId(pkg._id)
                                      setPackageOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        selectedPackageId === pkg._id
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      }`}
                                    />
                                    <div className="flex flex-col">
                                      <span>{pkg.name}</span>
                                      <span className="text-xs text-neutral-500">
                                        {pkg.type} - ${pkg.price}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Source Providers Table */}
        {!tenantId ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Tenant ID Required
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Unable to load source providers. Please ensure you are logged
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
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop View */}
            <Card className="hidden md:block">
              <CardContent className="pt-6">
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
                        <TableHead>Source Provider Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Timezone</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableLoading
                          message="Loading source providers..."
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
                      ) : currentSourceProviders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No source providers found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentSourceProviders.map(sourceProvider => (
                          <TableRow key={sourceProvider._id}>
                            <TableCell className="font-medium">
                              {sourceProvider.name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getTypeBadgeColor(
                                  sourceProvider.type
                                )}
                              >
                                {sourceProvider.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{sourceProvider.username}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {typeof sourceProvider.packageId === 'object' && sourceProvider.packageId
                                    ? sourceProvider.packageId.name
                                    : 'N/A'}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  {typeof sourceProvider.packageId === 'object' && sourceProvider.packageId
                                    ? `${sourceProvider.packageId.type} - $${sourceProvider.packageId.price}`
                                    : 'N/A'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {typeof sourceProvider.timezoneId === 'object' && sourceProvider.timezoneId
                                    ? sourceProvider.timezoneId.name
                                    : 'N/A'}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  {typeof sourceProvider.timezoneId === 'object' && sourceProvider.timezoneId
                                    ? sourceProvider.timezoneId.value
                                    : 'N/A'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDate(sourceProvider.createdAt)}
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
                                      router.push(
                                        `/sourceProviders/${sourceProvider._id}/view`
                                      )
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  {checkPermission('MOD011', 'edit') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() =>
                                        router.push(
                                          `/sourceProviders/create?id=${sourceProvider._id}`
                                        )
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Source Provider
                                    </DropdownMenuItem>
                                  )}
                                  {checkPermission('MOD011', 'delete') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600"
                                      onClick={() =>
                                        handleDeleteSourceProvider(
                                          sourceProvider
                                        )
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Source Provider
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
                    <span className="text-neutral-500">Loading source providers...</span>
                  </div>
                ) : currentSourceProviders.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-neutral-500">No source providers found</span>
                  </div>
                ) : (
                  currentSourceProviders.map(sourceProvider => (
                    <Card key={sourceProvider._id} className="relative border border-neutral-200 dark:border-neutral-700">
                      <CardContent className="pt-4 pb-4">
                        <div className="space-y-3">
                          {/* Source Provider Name */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Source Provider Name
                            </div>
                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                              {sourceProvider.name}
                            </div>
                          </div>

                          {/* Type */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Type
                            </div>
                            <Badge className={getTypeBadgeColor(sourceProvider.type)}>
                              {sourceProvider.type}
                            </Badge>
                          </div>

                          {/* Username */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Username
                            </div>
                            <div className="text-sm text-neutral-900 dark:text-neutral-100">
                              {sourceProvider.username}
                            </div>
                          </div>

                          {/* Package */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Package
                            </div>
                            <div>
                              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                {typeof sourceProvider.packageId === 'object' && sourceProvider.packageId
                                  ? sourceProvider.packageId.name
                                  : 'N/A'}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {typeof sourceProvider.packageId === 'object' && sourceProvider.packageId
                                  ? `${sourceProvider.packageId.type} - $${sourceProvider.packageId.price}`
                                  : 'N/A'}
                              </div>
                            </div>
                          </div>

                          {/* Timezone */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Timezone
                            </div>
                            <div>
                              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                {typeof sourceProvider.timezoneId === 'object' && sourceProvider.timezoneId
                                  ? sourceProvider.timezoneId.name
                                  : 'N/A'}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {typeof sourceProvider.timezoneId === 'object' && sourceProvider.timezoneId
                                  ? sourceProvider.timezoneId.value
                                  : 'N/A'}
                              </div>
                            </div>
                          </div>

                          {/* Created At */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Created At
                            </div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                              {formatDate(sourceProvider.createdAt)}
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
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={() =>
                                router.push(
                                  `/sourceProviders/${sourceProvider._id}/view`
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {checkPermission('MOD011', 'edit') && (
                              <DropdownMenuItem
                                className="flex items-center gap-2"
                                onClick={() =>
                                  router.push(
                                    `/sourceProviders/create?id=${sourceProvider._id}`
                                  )
                                }
                              >
                                <Edit className="h-4 w-4" />
                                Edit Source Provider
                              </DropdownMenuItem>
                            )}
                            {checkPermission('MOD011', 'delete') && (
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600"
                                onClick={() =>
                                  handleDeleteSourceProvider(sourceProvider)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Source Provider
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
                          className="w-8 h-8 p-0"
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
                  disabled={currentPage === totalPages || loading}
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
            <AlertDialogTitle>Delete Source Provider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{sourceProviderToDelete?.name}</strong>? This action
              cannot be undone and will permanently remove the source provider
              from the system.
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
