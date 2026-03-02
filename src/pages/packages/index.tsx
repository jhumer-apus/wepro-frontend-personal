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
  Package,
  X,
  MoreVertical,
  Edit,
  Eye,
  Loader2,
  Trash2,
  Shield,
} from 'lucide-react'
import { Label } from '@/src/components/ui/label'
import { Input } from '@/src/components/ui/input'
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
import { cn } from '@/src/lib/utils'

import {
  Package as PackageType,
  PackagesResponse,
} from '@/src/constants/interface/package'
import { apiService } from '@/src/services/api'
import { useAppSelector } from '@/src/store/hooks'
import { toast } from 'sonner'
import { TableLoading } from '@/src/components/ui/loading'
import { usePermissions } from '@/src/hooks/usePermissions'

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'P2':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'P3':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'P4':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const getIntervalBadgeColor = (interval: string) => {
  switch (interval) {
    case 'Weekly':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    case 'monthly':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
    case 'Yearly':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
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

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export default function PackagePage(): React.JSX.Element {
  const router = useRouter()
  const { getUserType } = usePermissions()
  const user = useAppSelector(state => state.user.data)
  const tenantId = user?.tenantId

  // All state hooks must be declared before any conditional returns
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState<PackageType | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)

  // Pagination state
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const [packages, setPackages] = useState<PackageType[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Check if user type is P1, if not show unauthorized
  const userType = getUserType()

  // Debounce search term effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500) // 500ms debounce delay

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const fetchPackages = async () => {
      if (!tenantId) {
        setError('Tenant ID not available')
        setLoading(false)
        return
      }
      if (debouncedSearchTerm) {
        setSearching(true)
      } else {
        setLoading(true)
      }
      try {
        let url = `/v3/packages?page=${currentPage}&limit=${entriesPerPage}&tenantId=${tenantId}`
        if (debouncedSearchTerm) {
          url += `&search=${encodeURIComponent(debouncedSearchTerm)}`
        }
        const response = await apiService.get(url)
        const responseData: PackagesResponse = response.data
        setPackages(responseData.data)
        setTotalCount(responseData.count)
        setTotalPages(responseData.pagination.pages)
        setError(null)
      } catch (err) {
        setError('Failed to fetch packages')
        console.error(err)
      } finally {
        setLoading(false)
        setSearching(false)
      }
    }

    fetchPackages()
  }, [tenantId, currentPage, entriesPerPage, debouncedSearchTerm])

  const handleDeletePackage = (pkg: PackageType) => {
    setPackageToDelete(pkg)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!packageToDelete || !tenantId) return

    try {
      setDeleting(true)
      await apiService.delete(
        `/v3/packages/with-modules/${packageToDelete._id}`
      )

      // Refresh the current page data
      let url = `/v3/packages?page=${currentPage}&limit=${entriesPerPage}&tenantId=${tenantId}`
      if (debouncedSearchTerm) {
        url += `&search=${encodeURIComponent(debouncedSearchTerm)}`
      }
      const response = await apiService.get(url)
      const responseData: PackagesResponse = response.data
      setPackages(responseData.data)
      setTotalCount(responseData.count)
      setTotalPages(responseData.pagination.pages)

      // Show success toast
      toast.success('Package deleted successfully!', {
        description: 'The package has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setPackageToDelete(null)
    } catch (err: any) {
      console.error('Error deleting package:', err)
      // Show error toast
      toast.error('Failed to delete package', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the package.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setPackageToDelete(null)
  }

  // Use packages directly since pagination is handled by API
  const currentPackages = packages

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEntriesChange = (value: string) => {
    setEntriesPerPage(parseInt(value))
    setCurrentPage(1) // Reset to first page when changing entries per page
  }

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm])

  // Check if user type is P1, if not show unauthorized
  if (userType !== 'P1') {
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
            You don&apos;t have permission to view this page.
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
        <title>Packages - WePro</title>
        <meta name="description" content="Manage WePro packages and pricing" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Packages
            </h1>
          </div>
          <Button
            className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => router.push('/packages/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Package
          </Button>
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
                {searching ? (
                  <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 animate-spin" />
                ) : (
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                )}
                <Input
                  placeholder="Search packages by name, type, or modules..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Packages Table */}
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
                    <TableHead>Package Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Modules</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Interval</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Is Public</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableLoading message="Loading packages..." colSpan={8} />
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-12 text-red-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <X className="w-6 h-6 text-red-500" />
                          </div>
                          <span className="font-medium">{error}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : currentPackages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            <Package className="w-6 h-6 text-neutral-400" />
                          </div>
                          <span className="font-medium text-neutral-600 dark:text-neutral-400">
                            {debouncedSearchTerm
                              ? 'No packages found matching your search'
                              : 'No packages found'}
                          </span>
                          <p className="text-sm text-neutral-500 dark:text-neutral-500">
                            {debouncedSearchTerm
                              ? 'Try adjusting your search terms'
                              : 'Create your first package to get started'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentPackages.map(pkg => (
                      <TableRow key={pkg._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {pkg.name}
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-500">
                                ID: {pkg._id.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeBadgeColor(pkg.type)}>
                            {pkg.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5 max-w-48">
                            {pkg.modules.slice(0, 3).map(module => (
                              <Badge
                                key={module._id}
                                variant="outline"
                                className="text-xs"
                              >
                                {module.module?.name || module.moduleCode}
                              </Badge>
                            ))}
                            {pkg.modules.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{pkg.modules.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {formatPrice(pkg.price)}
                            </div>
                            <div className="text-xs text-neutral-500">
                              per {pkg.interval.toLowerCase()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getIntervalBadgeColor(pkg.interval)}
                          >
                            {pkg.interval}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(pkg.createdAt)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              pkg.isPublic
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                            }
                          >
                            {pkg.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
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
                                    router.push(`/packages/${pkg._id}/view`)
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() =>
                                    router.push(
                                      `/packages/create?id=${pkg._id}`
                                    )
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Package
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-red-600"
                                  onClick={() => handleDeletePackage(pkg)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete Package
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
                        className="w-8 h-8 p-0"
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
                  disabled={currentPage >= totalPages}
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
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <span className="font-medium text-red-600 dark:text-red-400">{error}</span>
              </div>
            </div>
          )}

          {/* Mobile Card View */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <span className="text-neutral-500">Loading packages...</span>
              </div>
            ) : currentPackages.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Package className="w-6 h-6 text-neutral-400" />
                  </div>
                  <span className="font-medium text-neutral-600 dark:text-neutral-400">
                    {debouncedSearchTerm
                      ? 'No packages found matching your search'
                      : 'No packages found'}
                  </span>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500">
                    {debouncedSearchTerm
                      ? 'Try adjusting your search terms'
                      : 'Create your first package to get started'}
                  </p>
                </div>
              </div>
            ) : (
              currentPackages.map(pkg => (
                <Card key={pkg._id} className="relative border border-neutral-200 dark:border-neutral-700">
                  <CardContent className="pt-4 pb-4">
                    <div className="space-y-3">
                      {/* Package Name */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Package Name
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {pkg.name}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-500">
                            ID: {pkg._id.slice(-6)}
                          </div>
                        </div>
                      </div>

                      {/* Type */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Type
                        </div>
                        <Badge className={getTypeBadgeColor(pkg.type)}>
                          {pkg.type}
                        </Badge>
                      </div>

                      {/* Modules */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Modules
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {pkg.modules.slice(0, 3).map(module => (
                            <Badge
                              key={module._id}
                              variant="outline"
                              className="text-xs"
                            >
                              {module.module?.name || module.moduleCode}
                            </Badge>
                          ))}
                          {pkg.modules.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{pkg.modules.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Price
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            {formatPrice(pkg.price)}
                          </div>
                          <div className="text-xs text-neutral-500">
                            per {pkg.interval.toLowerCase()}
                          </div>
                        </div>
                      </div>

                      {/* Interval */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Interval
                        </div>
                        <Badge className={getIntervalBadgeColor(pkg.interval)}>
                          {pkg.interval}
                        </Badge>
                      </div>

                      {/* Created At */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Created At
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {formatDate(pkg.createdAt)}
                        </div>
                      </div>

                      {/* Is Public */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Is Public
                        </div>
                        <Badge
                          className={
                            pkg.isPublic
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                          }
                        >
                          {pkg.isPublic ? 'Public' : 'Private'}
                        </Badge>
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
                            router.push(`/packages/${pkg._id}/view`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() =>
                            router.push(
                              `/packages/create?id=${pkg._id}`
                            )
                          }
                        >
                          <Edit className="h-4 w-4" />
                          Edit Package
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-red-600"
                          onClick={() => handleDeletePackage(pkg)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Package
                        </DropdownMenuItem>
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
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
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
            <AlertDialogTitle>Delete Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{packageToDelete?.name}</strong>? This action cannot be
              undone and will permanently remove the package from the system.
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
