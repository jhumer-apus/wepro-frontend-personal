import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
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
  Users,
  Shield,
  Plus,
  MoreVertical,
  Edit,
  Eye,
  Search,
  Trash2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { useAppSelector } from '@/src/store/hooks'
import { Role } from '@/src/constants/interface/role'
import { Permission } from '@/src/constants/interface/permission'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import {
  Loading,
  ButtonLoading,
  TableLoading,
} from '@/src/components/ui/loading'
import { usePermissions } from '@/src/hooks/usePermissions'

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Helper function to convert permissions to compact format
const getCompactPermissions = (permissions: string[]) => {
  const permissionMap: { [key: string]: string } = {
    create: 'C',
    read: 'V',
    view: 'V',
    write: 'E',
    edit: 'E',
    delete: 'D',
  }

  return permissions
    .map(perm => permissionMap[perm.toLowerCase()] || perm)
    .join(' ')
}

// Helper function to get combined module permissions
const getModulePermissions = (rolePermissions: Permission[]) => {
  return rolePermissions.map(perm => {
    const compactPerms = getCompactPermissions(perm.permissions)
    return {
      module: perm.module,
      permissions: compactPerms,
      fullText: `${perm.module} - ${compactPerms}`,
    }
  })
}

export default function RolesPage() {
  const router = useRouter()

  const user = useAppSelector(state => state.user.data)

  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Server-side pagination state
  const [pagination, setPagination] = useState({
    current: { page: 1, limit: 25 },
    total: 0,
    pages: 1,
  })
  const [totalCount, setTotalCount] = useState(0)
  const { checkPermission, getUserType } = usePermissions()

  // Check permission to access this page
  if (
    !checkPermission('MOD002', 'view') &&
    !checkPermission('MOD007', 'view')
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

  // Fetch roles from API
  const fetchRoles = async (page: number, limit: number, search?: string) => {
    try {
      setLoading(true)
      setError(null)

      if (!user?.tenantId) {
        setError('Tenant ID not found. Please log in again.')
        setLoading(false)
        return
      }

      let url = `/v1/role-management?tenantId=${user.tenantId}&page=${page}&limit=${limit}`

      if (search && search.trim() !== '') {
        url += `&search=${encodeURIComponent(search.trim())}`
      }

      const response = await apiService.get(url)
      if (response.data.success) {
        setRoles(response.data.data)
        setPagination(response.data.pagination)
        setTotalCount(response.data.count)
      } else {
        throw new Error(response.data.message || 'Failed to fetch roles')
      }
    } catch (err) {
      console.error('Error fetching roles:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }

  // Fetch roles when user, page, or entries per page changes
  useEffect(() => {
    if (!loading && user?.tenantId) {
      fetchRoles(currentPage, entriesPerPage, searchTerm)
    }
  }, [user?.tenantId, currentPage, entriesPerPage])

  // Debounced search - trigger API call with search parameter
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user?.tenantId) {
        setCurrentPage(1) // Reset to first page when searching
        fetchRoles(1, entriesPerPage, searchTerm)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, user?.tenantId, entriesPerPage])

  // Use server-side pagination data
  const totalPages = pagination.pages
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = Math.min(startIndex + entriesPerPage, totalCount)
  const currentRoles = roles

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEntriesChange = (value: string) => {
    setEntriesPerPage(parseInt(value))
    setCurrentPage(1) // Reset to first page when changing entries per page
  }

  // Delete handlers
  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return

    try {
      setDeleting(true)
      await apiService.delete(`/v1/role-management/${roleToDelete._id}`)

      // Refresh the current page data
      await fetchRoles(currentPage, entriesPerPage, searchTerm)

      // Show success toast
      toast.success('Role deleted successfully!', {
        description: 'The role has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setRoleToDelete(null)
    } catch (error: any) {
      console.error('Error deleting role:', error)
      // Show error toast
      toast.error('Failed to delete role', {
        description:
          error.response?.data?.message ||
          'An error occurred while deleting the role.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setRoleToDelete(null)
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Error Loading Roles
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Roles - WePro</title>
        <meta
          name="description"
          content="Manage WePro user roles and permissions"
        />
      </Head>
      <div className="space-y-6">
        {/* Tab Navigation */}
        {(checkPermission('MOD002', 'view') &&
          checkPermission('MOD003', 'view')) ||
        (checkPermission('MOD007', 'view') &&
          checkPermission('MOD006', 'view')) ? (
          <div className="flex space-x-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
            <Button
              variant="ghost"
              onClick={() => router.push('/team/teamMembers')}
              className="flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Team Members
            </Button>
            <Button
              variant="default"
              onClick={() => router.push('/team/roles')}
              className="flex-1 flex items-center justify-center text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Roles
            </Button>
          </div>
        ) : null}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {(checkPermission('MOD002', 'view') &&
                checkPermission('MOD003', 'view')) ||
              (checkPermission('MOD007', 'view') &&
                checkPermission('MOD006', 'view'))
                ? getUserType() === 'P1'
                  ? 'Admin Roles'
                  : 'Team'
                : 'Roles'}
            </h1>
          </div>
          {(checkPermission('MOD002', 'create') ||
            checkPermission('MOD007', 'create')) && (
            <div className="flex items-center space-x-3">
              <Button
                className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => router.push('/team/roles/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Role
              </Button>
            </div>
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
                  placeholder="Search roles..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles List */}
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
                    <SelectItem value="25">25</SelectItem>
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
                    <TableHead>Role Name</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableLoading message="Loading roles..." colSpan={7} />
                  ) : currentRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <span className="text-neutral-500">No roles found</span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentRoles.map(role => (
                      <TableRow key={role._id}>
                        <TableCell className="font-medium">
                          {role.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {getModulePermissions(role.permissions).map(
                              (modulePerm, index) => (
                                <div
                                  key={index}
                                  className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 text-xs font-medium shadow-sm"
                                >
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    {modulePerm.module}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {role.createdAt ? formatDate(role.createdAt) : 'N/A'}
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
                                  router.push(`/team/roles/${role._id}/view`)
                                }
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {(checkPermission('MOD002', 'edit') ||
                                checkPermission('MOD007', 'edit')) && (
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() =>
                                    router.push(
                                      `/team/roles/create?id=${role._id}`
                                    )
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Role
                                </DropdownMenuItem>
                              )}
                              {(checkPermission('MOD002', 'delete') ||
                                checkPermission('MOD007', 'delete')) && (
                                <DropdownMenuItem
                                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteClick(role)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
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
                Showing {startIndex + 1} to {endIndex} of {totalCount} entries
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

                {/* Page numbers - show up to 5 pages */}
                {(() => {
                  const maxVisiblePages = 5
                  const startPage = Math.max(
                    1,
                    currentPage - Math.floor(maxVisiblePages / 2)
                  )
                  const endPage = Math.min(
                    totalPages,
                    startPage + maxVisiblePages - 1
                  )

                  const pages = []
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i)
                  }

                  return pages.map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))
                })()}

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
                <SelectItem value="25">25</SelectItem>
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
                <span className="text-neutral-500">Loading roles...</span>
              </div>
            ) : currentRoles.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-neutral-500">No roles found</span>
              </div>
            ) : (
              currentRoles.map(role => (
                <Card key={role._id} className="relative border border-neutral-200 dark:border-neutral-700">
                  <CardContent className="pt-4 pb-4">
                    <div className="space-y-3">
                      {/* Role Name */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Role Name
                        </div>
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {role.name}
                        </div>
                      </div>

                      {/* Module */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Module
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getModulePermissions(role.permissions).map(
                            (modulePerm, index) => (
                              <div
                                key={index}
                                className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 text-xs font-medium shadow-sm"
                              >
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                  {modulePerm.module}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Created At */}
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          Created At
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {role.createdAt ? formatDate(role.createdAt) : 'N/A'}
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
                            router.push(`/team/roles/${role._id}/view`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {(checkPermission('MOD002', 'edit') ||
                          checkPermission('MOD007', 'edit')) && (
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            onClick={() =>
                              router.push(
                                `/team/roles/create?id=${role._id}`
                              )
                            }
                          >
                            <Edit className="h-4 w-4" />
                            Edit Role
                          </DropdownMenuItem>
                        )}
                        {(checkPermission('MOD002', 'delete') ||
                          checkPermission('MOD007', 'delete')) && (
                          <DropdownMenuItem
                            className="flex items-center gap-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteClick(role)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
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
            Showing {startIndex + 1} to {endIndex} of {totalCount} entries
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

            {/* Page numbers - show up to 5 pages */}
            {(() => {
              const maxVisiblePages = 5
              const startPage = Math.max(
                1,
                currentPage - Math.floor(maxVisiblePages / 2)
              )
              const endPage = Math.min(
                totalPages,
                startPage + maxVisiblePages - 1
              )

              const pages = []
              for (let i = startPage; i <= endPage; i++) {
                pages.push(i)
              }

              return pages.map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8 h-8 p-0"
                  disabled={loading}
                >
                  {page}
                </Button>
              ))
            })()}

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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Role</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{' '}
                <strong>{roleToDelete?.name}</strong>? This action cannot be
                undone and will permanently remove the role from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={handleDeleteCancel}
                disabled={deleting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <>
                    <ButtonLoading message="Deleting..." />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
