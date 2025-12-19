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
  Package,
  X,
  MoreVertical,
  Edit,
  Eye,
  Loader2,
  Trash2,
  Shield,
  Calculator,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { cn } from '@/src/lib/utils'

import {
  ServicePackage,
  ServicePackagesResponse,
} from '@/src/constants/interface/servicePackage'
import { apiService } from '@/src/services/api'
import { useAppSelector } from '@/src/store/hooks'
import { toast } from 'sonner'
import { TableLoading } from '@/src/components/ui/loading'
import { usePermissions } from '@/src/hooks/usePermissions'

const getChargeModelBadgeColor = (chargeModel: string) => {
  switch (chargeModel) {
    case 'call':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'minute':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'monthly':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

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

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export default function ServicePackagesPage(): React.JSX.Element {
  const router = useRouter()
  const { getUserType, checkPermission } = usePermissions()
  const user = useAppSelector(state => state.user.data)
  const tenantId = user?.tenantId

  // All state hooks must be declared before any conditional returns
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState<ServicePackage | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)

  // Pricing calculation modal state
  const [pricingModalOpen, setPricingModalOpen] = useState(false)
  const [packageForPricing, setPackageForPricing] =
    useState<ServicePackage | null>(null)
  const [durationSeconds, setDurationSeconds] = useState('')
  const [pricingResult, setPricingResult] = useState<any>(null)
  const [calculating, setCalculating] = useState(false)

  // Pagination state
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Check if user type is P1, if not show unauthorized
  const userType = getUserType()

  useEffect(() => {
    const fetchServicePackages = async () => {
      if (!tenantId) {
        setError('Tenant ID not available')
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const url = `/v1/answering-services/packages?page=${currentPage}&limit=${entriesPerPage}&tenantId=${tenantId}`
        const response = await apiService.get(url)
        const responseData: ServicePackagesResponse = response.data
        setPackages(responseData.data.data)
        setTotalCount(responseData.data.pagination.total)
        setTotalPages(responseData.data.pagination.pages)
        setError(null)
      } catch (err) {
        setError('Failed to fetch service packages')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchServicePackages()
  }, [tenantId, currentPage, entriesPerPage])

  const handleDeletePackage = (pkg: ServicePackage) => {
    setPackageToDelete(pkg)
    setDeleteDialogOpen(true)
  }

  const handleCalculatePricing = (pkg: ServicePackage) => {
    setPackageForPricing(pkg)
    setDurationSeconds('')
    setPricingResult(null)
    setPricingModalOpen(true)
  }

  const handlePricingCalculation = async () => {
    if (!packageForPricing || !durationSeconds.trim()) {
      toast.error('Please enter a valid duration in seconds')
      return
    }

    const seconds = parseInt(durationSeconds)
    if (isNaN(seconds) || seconds < 0) {
      toast.error('Please enter a valid positive number for duration')
      return
    }

    setCalculating(true)
    try {
      const response = await apiService.post(
        `/v1/answering-services/packages/${packageForPricing._id}/calculate-pricing`,
        { durationSeconds: seconds }
      )

      if (response.data.success) {
        setPricingResult(response.data.message)
        toast.success('Pricing calculated successfully!')
      }
    } catch (error: any) {
      console.error('Error calculating pricing:', error)
      toast.error('Failed to calculate pricing', {
        description:
          error.response?.data?.message ||
          'An error occurred while calculating pricing.',
      })
    } finally {
      setCalculating(false)
    }
  }

  const closePricingModal = () => {
    setPricingModalOpen(false)
    setPackageForPricing(null)
    setDurationSeconds('')
    setPricingResult(null)
  }

  const handleDeleteConfirm = async () => {
    if (!packageToDelete || !tenantId) return

    try {
      setDeleting(true)
      await apiService.delete(
        `/v1/answering-services/packages/${packageToDelete._id}`
      )

      // Refresh the current page data
      const url = `/v1/answering-services/packages?page=${currentPage}&limit=${entriesPerPage}&tenantId=${tenantId}`
      const response = await apiService.get(url)
      const responseData: ServicePackagesResponse = response.data
      setPackages(responseData.data.data)
      setTotalCount(responseData.data.pagination.total)
      setTotalPages(responseData.data.pagination.pages)

      // Show success toast
      toast.success('Service package deleted successfully!', {
        description: 'The service package has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setPackageToDelete(null)
    } catch (err: any) {
      console.error('Error deleting service package:', err)
      // Show error toast
      toast.error('Failed to delete service package', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the service package.',
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

  // Check if user type is P1, if not show unauthorized
  if (!checkPermission('MOD043', 'view')) {
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
        <title>Service Packages - WePro</title>
        <meta
          name="description"
          content="Manage WePro service packages and pricing"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Service Packages
            </h1>
          </div>
          <Button
            className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => router.push('/servicePackages/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service Package
          </Button>
        </div>

        {/* Service Packages Table - Desktop View */}
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
                    <TableHead>Package Title</TableHead>
                    <TableHead>Package Code</TableHead>
                    <TableHead>Charge Model</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Is Public</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableLoading
                      message="Loading service packages..."
                      colSpan={9}
                    />
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
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
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            <Package className="w-6 h-6 text-neutral-400" />
                          </div>
                          <span className="font-medium text-neutral-600 dark:text-neutral-400">
                            No service packages found
                          </span>
                          <p className="text-sm text-neutral-500 dark:text-neutral-500">
                            Create your first service package to get started
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
                                {pkg.title}
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-500 max-w-xs truncate">
                                {pkg.description}
                              </div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-500">
                                ID: {pkg._id.slice(-6)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {pkg.packageCode}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getChargeModelBadgeColor(
                              pkg.chargeModel
                            )}
                          >
                            {pkg.chargeModel.charAt(0).toUpperCase() +
                              pkg.chargeModel.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {formatPrice(pkg.chargeAmount)}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {pkg.formattedPricing.description}
                            </div>
                            {pkg.minimumMonthlySpend > 0 && (
                              <div className="text-xs text-neutral-500">
                                Min: {formatPrice(pkg.minimumMonthlySpend)}
                                /month
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5 max-w-48">
                            {pkg.features.slice(0, 3).map((feature, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {feature}
                              </Badge>
                            ))}
                            {pkg.features.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{pkg.features.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(pkg.isActive)}>
                            {pkg.isActive ? 'Active' : 'Inactive'}
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
                                    router.push(
                                      `/servicePackages/${pkg._id}/view`
                                    )
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() =>
                                    router.push(
                                      `/servicePackages/create?id=${pkg._id}`
                                    )
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Package
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => handleCalculatePricing(pkg)}
                                >
                                  <Calculator className="h-4 w-4" />
                                  Calculate Pricing
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
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-neutral-500">Loading service packages...</span>
                </div>
              </div>
            ) : currentPackages.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Package className="w-6 h-6 text-neutral-400" />
                  </div>
                  <span className="font-medium text-neutral-600 dark:text-neutral-400">
                    No service packages found
                  </span>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500">
                    Create your first service package to get started
                  </p>
                </div>
              </div>
            ) : (
              currentPackages.map(pkg => (
                <Card key={pkg._id} className="relative border border-neutral-200 dark:border-neutral-700">
                  <CardContent className="pt-4 pb-4">
                    <div className="space-y-3">
                      {/* Package Title */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Package Title
                        </div>
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {pkg.title}
                        </div>
                        {pkg.description && (
                          <div className="text-sm text-neutral-500 dark:text-neutral-500 mt-1 line-clamp-2">
                            {pkg.description}
                          </div>
                        )}
                        <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                          ID: {pkg._id.slice(-6)}
                        </div>
                      </div>

                      {/* Package Code */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Package Code
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          {pkg.packageCode}
                        </Badge>
                      </div>

                      {/* Charge Model */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Charge Model
                        </div>
                        <Badge
                          className={getChargeModelBadgeColor(pkg.chargeModel)}
                        >
                          {pkg.chargeModel.charAt(0).toUpperCase() +
                            pkg.chargeModel.slice(1)}
                        </Badge>
                      </div>

                      {/* Pricing */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Pricing
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            {formatPrice(pkg.chargeAmount)}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {pkg.formattedPricing.description}
                          </div>
                          {pkg.minimumMonthlySpend > 0 && (
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              Min: {formatPrice(pkg.minimumMonthlySpend)}/month
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Features
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {pkg.features.slice(0, 3).map((feature, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                          {pkg.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{pkg.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Status
                        </div>
                        <Badge className={getStatusBadgeColor(pkg.isActive)}>
                          {pkg.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {/* Created At */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Created At
                        </div>
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
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
                            router.push(`/servicePackages/${pkg._id}/view`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() =>
                            router.push(`/servicePackages/create?id=${pkg._id}`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                          Edit Package
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => handleCalculatePricing(pkg)}
                        >
                          <Calculator className="h-4 w-4" />
                          Calculate Pricing
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
            <AlertDialogTitle>Delete Service Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{packageToDelete?.title}</strong>? This action cannot be
              undone and will permanently remove the service package from the
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

      {/* Pricing Calculation Modal */}
      <Dialog open={pricingModalOpen} onOpenChange={setPricingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Calculate Pricing
            </DialogTitle>
            <DialogDescription>
              Calculate the cost for <strong>{packageForPricing?.title}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Package Info */}
            {packageForPricing && (
              <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-md">
                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {packageForPricing.title}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  {packageForPricing.formattedPricing.description}
                </div>
              </div>
            )}

            {/* Duration Input */}
            <div className="space-y-2">
              <Label htmlFor="durationSeconds">Duration (seconds)</Label>
              <Input
                id="durationSeconds"
                type="number"
                min="0"
                value={durationSeconds}
                onChange={e => setDurationSeconds(e.target.value)}
                placeholder="Enter duration in seconds"
                disabled={calculating}
              />
            </div>

            {/* Calculation Result */}
            {pricingResult && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-md">
                <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                  Calculation Result
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">
                      Duration:
                    </span>
                    <span className="font-medium text-green-800 dark:text-green-200">
                      {pricingResult.calculation.durationSeconds} seconds
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">
                      Calculated Charge:
                    </span>
                    <span className="font-medium text-green-800 dark:text-green-200">
                      {pricingResult.calculation.formattedCharge}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={closePricingModal}
              disabled={calculating}
            >
              Close
            </Button>
            <Button
              onClick={handlePricingCalculation}
              disabled={calculating || !durationSeconds.trim()}
              className="wepro-button-gradient text-white"
            >
              {calculating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
