import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useDebounce } from '@/src/hooks/useDebounce'
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
import { apiService } from '@/src/services/api'
import { useAppSelector } from '@/src/store/hooks'
import { toast } from 'sonner'
import { TableLoading } from '@/src/components/ui/loading'
import { usePermissions } from '@/src/hooks/usePermissions'

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

export default function CompaniesPage(): React.JSX.Element {
  const router = useRouter()
  const { checkPermission } = usePermissions()

  // Check permission to access this page
  if (!checkPermission('MOD004', 'view')) {
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
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Pagination state
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Debounced search term (500ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const user = useAppSelector(state => state.user.data)
  const tenantId = user?.tenantId

  const fetchCompanies = useCallback(async () => {
    if (!tenantId) {
      setError('Tenant ID not available')
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      let url = `/v1/users/tenant?page=${currentPage}&limit=${entriesPerPage}&packageType=P2&tenantId=${tenantId}`
      if (debouncedSearchTerm) {
        url += `&search=${encodeURIComponent(debouncedSearchTerm)}`
      }
      const response = await apiService.get(url)
      const responseData: CompaniesResponse = response.data

      if (responseData.success) {
        setCompanies(responseData.data)
        setTotalCount(responseData.count)
        setTotalPages(responseData.pagination.pages)
        setError(null)
      } else {
        setError(responseData.message || 'Failed to fetch companies')
        setCompanies([])
        setTotalCount(0)
        setTotalPages(0)
      }
    } catch (err: any) {
      console.error('Error fetching companies:', err)
      setError(err.response?.data?.message || 'Failed to fetch companies')
      setCompanies([])
      setTotalCount(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [tenantId, currentPage, entriesPerPage, debouncedSearchTerm])

  useEffect(() => {
    if (tenantId && currentPage > 1) {
      // Skip initial page 1
      fetchCompanies()
    }
  }, [currentPage, entriesPerPage, fetchCompanies, tenantId]) // Run on pagination changes

  // Handle debounced search changes
  useEffect(() => {
    if (tenantId) {
      setCurrentPage(1) // Reset to first page when searching
      fetchCompanies()
    }
  }, [debouncedSearchTerm, fetchCompanies]) // Run on debounced search changes

  const handleEditCompany = (companyToEdit: Company) => {
    router.push(`/companies/create?id=${companyToEdit._id}`)
  }

  const handleDeleteCompany = (company: Company) => {
    setCompanyToDelete(company)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!companyToDelete || !tenantId) return

    try {
      setDeleting(true)
      // Use the correct endpoint format: /v1/users/tenant/{{user_id}}?tenantId={{p1_tenant_id}}
      await apiService.delete(
        `/v1/users/tenant/${companyToDelete._id}?tenantId=${tenantId}`
      )

      // Refresh the list by calling fetchCompanies
      await fetchCompanies()

      // Show success toast
      toast.success('Company deleted successfully!', {
        description: 'The company has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setCompanyToDelete(null)
    } catch (err: any) {
      console.error('Error deleting company:', err)
      // Show error toast
      toast.error('Failed to delete company', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the company.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setCompanyToDelete(null)
  }

  // Calculate pagination based on API response
  const currentCompanies = companies

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEntriesChange = (value: string) => {
    setEntriesPerPage(parseInt(value))
    setCurrentPage(1) // Reset to first page when changing entries per page
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setCurrentPage(1)
  }

  return (
    <>
      <Head>
        <title>Companies - WePro</title>
        <meta name="description" content="Manage WePro companies" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Companies
            </h1>
          </div>
          {checkPermission('MOD004', 'create') && (
            <Button
              className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => router.push('/companies/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          )}
        </div>

        {/* Companies Table */}
        <Card>
          <CardContent className="pt-6">
            {!tenantId ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Tenant ID Required
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Unable to load companies. Please ensure you are logged in with
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
                      placeholder="Search companies..."
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
                        <TableHead>Company Name</TableHead>
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
                          message="Loading companies..."
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
                      ) : currentCompanies.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No companies found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentCompanies.map(company => (
                          <TableRow key={company._id}>
                            <TableCell className="font-medium">
                              {company.name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getTypeBadgeColor(company.type)}
                              >
                                {company.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{company.username}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {company.packageId?.name || 'N/A'}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  {company.packageId?.type} - $
                                  {company.packageId?.price}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {company.timezoneId?.name || 'N/A'}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  {company.timezoneId?.value}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDate(company.createdAt)}
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
                                        `/companies/${company._id}/view`
                                      )
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  {checkPermission('MOD004', 'edit') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() =>
                                        router.push(
                                          `/companies/create?id=${company._id}`
                                        )
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Company
                                    </DropdownMenuItem>
                                  )}
                                  {checkPermission('MOD004', 'delete') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600"
                                      onClick={() =>
                                        handleDeleteCompany(company)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Company
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
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{companyToDelete?.name}</strong>? This action cannot be
              undone and will permanently remove the company from the system.
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
