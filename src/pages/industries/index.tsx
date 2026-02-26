import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Card, CardContent, CardTitle } from '@/src/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Switch } from '@/src/components/ui/switch'
import {
  Industry,
  IndustriesResponse,
} from '@/src/constants/interface/industry'
import { apiService } from '@/src/services/api'
import { useAppSelector } from '@/src/store/hooks'
import { toast } from 'sonner'
import { TableLoading } from '@/src/components/ui/loading'
import { usePermissions } from '@/src/hooks/usePermissions'

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

export default function IndustriesPage(): React.JSX.Element {
  const router = useRouter()
  const { checkPermission, getUserType } = usePermissions()

  // Modal state
  const [industryModalOpen, setIndustryModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    active: true,
  })
  const [submitting, setSubmitting] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [industryToDelete, setIndustryToDelete] = useState<Industry | null>(
    null
  )
  const [deleting, setDeleting] = useState(false)

  // Pagination state
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const [industries, setIndustries] = useState<Industry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

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
      let url = `/v3/industries`

      // If user type is P1, append it to the URL
      if (
        userType === 'P1' ||
        (userType === 'P5' && checkPermission('MOD012', 'view'))
      ) {
        url += `/P1`
      }

      url += `?sort=-createdAt&page=${currentPage}&limit=${entriesPerPage}`
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`
      }
      const response = await apiService.get(url)
      const responseData: IndustriesResponse = response.data

      if (responseData.success) {
        setIndustries(responseData.data)
        setTotalCount(responseData.count)
        // Calculate total pages based on count and limit
        setTotalPages(Math.ceil(responseData.count / entriesPerPage))
        setError(null)
      } else {
        setError(responseData.message || 'Failed to fetch industries')
        setIndustries([])
        setTotalCount(0)
        setTotalPages(0)
      }
    } catch (err: any) {
      console.error('Error fetching industries:', err)
      setError(err.response?.data?.message || 'Failed to fetch industries')
      setIndustries([])
      setTotalCount(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [tenantId, currentPage, entriesPerPage, searchTerm])

  // Fetch industries on component mount and when dependencies change
  useEffect(() => {
    if (tenantId) {
      fetchIndustries()
    }
  }, [tenantId, currentPage, entriesPerPage, searchTerm])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (tenantId) {
        setCurrentPage(1) // Reset to first page when searching
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, tenantId])

  const handleDeleteIndustry = (industry: Industry) => {
    setIndustryToDelete(industry)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!industryToDelete || !tenantId) return

    try {
      setDeleting(true)
      // Use the correct endpoint format for industries based on user type
      const userType = getUserType()
      let deleteUrl = `/v3/industries`

      deleteUrl += `/${industryToDelete._id}`
      await apiService.delete(deleteUrl)

      // Refresh the list by calling fetchIndustries
      await fetchIndustries()

      // Show success toast
      toast.success('Industry deleted successfully!', {
        description: 'The industry has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setIndustryToDelete(null)
    } catch (err: any) {
      console.error('Error deleting industry:', err)
      // Show error toast
      toast.error('Failed to delete industry', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the industry.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setIndustryToDelete(null)
  }

  const handleAddIndustry = () => {
    setIsEditMode(false)
    setEditingIndustry(null)
    setFormData({ name: '', active: true })
    setIndustryModalOpen(true)
  }

  const handleEditIndustry = (industry: Industry) => {
    setIsEditMode(true)
    setEditingIndustry(industry)
    setFormData({
      name: industry.name,
      active: industry.active,
    })
    setIndustryModalOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Industry name is required')
      return
    }

    try {
      setSubmitting(true)
      const userType = getUserType()
      let url = `/v3/industries`

      let response
      if (isEditMode && editingIndustry) {
        // Edit mode - PUT request
        response = await apiService.put(`${url}/${editingIndustry._id}`, {
          name: formData.name.trim(),
          active: formData.active,
        })
      } else {
        if (userType === 'P1') {
          url += `/P1`
        }
        // Create mode - POST request
        response = await apiService.post(url, {
          name: formData.name.trim(),
          active: formData.active,
        })
      }

      if (response.data.success) {
        const action = isEditMode ? 'updated' : 'created'
        toast.success(`Industry ${action} successfully!`, {
          description: `The industry has been ${action} in the system.`,
        })

        // Close modal and reset form
        setIndustryModalOpen(false)
        setFormData({ name: '', active: true })
        setIsEditMode(false)
        setEditingIndustry(null)

        // Refresh the industries list
        await fetchIndustries()
      } else {
        const action = isEditMode ? 'update' : 'create'
        toast.error(`Failed to ${action} industry`, {
          description:
            response.data.message ||
            `An error occurred while ${action}ing the industry.`,
        })
      }
    } catch (err: any) {
      const action = isEditMode ? 'updating' : 'creating'
      console.error(`Error ${action} industry:`, err)
      toast.error(`Failed to ${action} industry`, {
        description:
          err.response?.data?.message ||
          `An error occurred while ${action} the industry.`,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // Calculate pagination based on API response
  const currentIndustries = industries

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEntriesChange = (value: string) => {
    setEntriesPerPage(parseInt(value))
    setCurrentPage(1) // Reset to first page when changing entries per page
  }

  // Check permission to access this page
  if (
    !checkPermission('MOD012', 'view') &&
    !checkPermission('MOD013', 'view')
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
        <title>Industries - WePro</title>
        <meta name="description" content="Manage WePro industries" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Industries
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Manage your industry categories and classifications
            </p>
          </div>
          {((checkPermission('MOD012', 'create') && getUserType() === 'P1') ||
            checkPermission('MOD013', 'create')) && (
            <Button
              className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handleAddIndustry}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Industry
            </Button>
          )}
        </div>

        {/* Industries Table */}
        <Card>
          <CardContent className="pt-6">
            {!tenantId ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Tenant ID Required
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Unable to load industries. Please ensure you are logged in
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
                      placeholder="Search industries..."
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
                        <TableHead>Industry Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>P1 Status</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableLoading
                          message="Loading industries..."
                          colSpan={6}
                        />
                      ) : error ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-red-500"
                          >
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : currentIndustries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No industries found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentIndustries.map(industry => (
                          <TableRow key={industry._id}>
                            <TableCell className="font-medium">
                              {industry.name}
                            </TableCell>
                            <TableCell>{industry.code}</TableCell>
                            <TableCell>
                              <Badge className={getP1BadgeColor(industry.isP1)}>
                                {industry.isP1 ? 'P1' : 'Non-P1'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusBadgeColor(industry.active)}
                              >
                                {industry.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatDate(industry.createdAt)}
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
                                        `/industries/${industry._id}/view`
                                      )
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  {(checkPermission('MOD012', 'edit') ||
                                    checkPermission('MOD013', 'edit')) && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() =>
                                        handleEditIndustry(industry)
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Industry
                                    </DropdownMenuItem>
                                  )}
                                  {(checkPermission('MOD012', 'delete') ||
                                    checkPermission('MOD013', 'delete')) && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600"
                                      onClick={() =>
                                        handleDeleteIndustry(industry)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Industry
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

      {/* Industry Modal - Create/Edit */}
      <Dialog open={industryModalOpen} onOpenChange={setIndustryModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {isEditMode ? 'Edit Industry' : 'Add New Industry'}
            </DialogTitle>
            <DialogDescription className="text-base text-neutral-600 dark:text-neutral-400 mt-2">
              {isEditMode
                ? 'Update the industry information below.'
                : 'Create a new industry category to organize and classify your business data.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Industry Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., Healthcare, Technology, Finance, Manufacturing"
                value={formData.name}
                onChange={e => handleFormChange('name', e.target.value)}
                required
                className="h-12 text-base"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Enter a descriptive name for the industry category
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="space-y-1">
                <Label
                  htmlFor="active"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Active Status
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formData.active
                    ? 'Industry will be active and available for use'
                    : 'Industry will be inactive and hidden'}
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={checked => handleFormChange('active', checked)}
                className="ml-4"
              />
            </div>

            <DialogFooter className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIndustryModalOpen(false)
                  setIsEditMode(false)
                  setEditingIndustry(null)
                  setFormData({ name: '', active: true })
                }}
                disabled={submitting}
                className="h-11 px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="wepro-button-gradient text-white h-11 px-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditMode
                      ? 'Updating Industry...'
                      : 'Creating Industry...'}
                  </>
                ) : isEditMode ? (
                  'Update Industry'
                ) : (
                  'Create Industry'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Industry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{industryToDelete?.name}</strong>? This action cannot be
              undone and will permanently remove the industry from the system.
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
