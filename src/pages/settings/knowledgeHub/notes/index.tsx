import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
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
  Building2,
  Eye,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/src/components/ui/dialog'
import {
  SettingsNavigation,
  KnowledgeHubSubNavigation,
} from '@/src/components/job'
import { usePermissions } from '@/src/hooks/usePermissions'
import { useDebounce } from '@/src/hooks/useDebounce'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

// Interface for Note data
interface Note {
  _id: string
  title: string
  note: string
  sourceCodes: string[]
  status: string
  noteFor: string
  contentType: string
  tenantId: {
    _id: string
    name: string
    username: string
  }
  byTenantId: {
    _id: string
    name: string
    username: string
  }
  createdBy: {
    _id: string
    name: string
    username: string
  }
  createdAt: string
  updatedAt: string
  code: string
  isActive: boolean
  id: string
}

interface NotesResponse {
  success: boolean
  message: string
  data: {
    data: Note[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

interface Source {
  _id: string
  code: string
  name: string
}

interface CustomJobField {
  _id: string
  code: string
  name: string
}

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'inactive':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const formatDate = (dateString: string | undefined, userTimezone?: string) => {
  if (!dateString) {
    return 'N/A'
  }
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone:
        userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  } catch {
    return 'Invalid Date'
  }
}

export default function KnowledgeHubNotesPage() {
  const router = useRouter()
  const { checkPermission, getUserType, userData, isSuperAdmin } =
    usePermissions()
  const tenantId = userData?.tenantId

  // State for notes
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  // State for filters
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sourceCodeFilter, setSourceCodeFilter] = useState<string>('')
  const [noteForFilter, setNoteForFilter] = useState<string>('')

  // State for sources (for sourceCode filter)
  const [sources, setSources] = useState<Source[]>([])
  const [sourcesLoading, setSourcesLoading] = useState(false)

  // State for custom job fields (for noteFor filter)
  const [customJobFields, setCustomJobFields] = useState<CustomJobField[]>([])
  const [customJobFieldsLoading, setCustomJobFieldsLoading] = useState(false)

  // State for delete functionality
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)
  const [deleting, setDeleting] = useState(false)

  // State for view modal
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  // Fetch sources from API
  const fetchSources = useCallback(async () => {
    setSourcesLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '50',
        sort: '-createdAt',
      })

      const response = await apiService.get(
        `/v1/sources?${queryParams.toString()}`
      )
      const sourcesData =
        response.data.success !== undefined ? response.data.data : response.data
      setSources(sourcesData || [])
    } catch (error: any) {
      console.error('Error fetching sources:', error)
      toast.error('Failed to load sources', {
        description:
          'Please try again or contact support if the issue persists.',
      })
    } finally {
      setSourcesLoading(false)
    }
  }, [])

  // Fetch custom job fields from API
  const fetchCustomJobFields = useCallback(async () => {
    setCustomJobFieldsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '50',
        include_settings: 'true',
      })

      const response = await apiService.get(
        `/v1/custom-job-fields?${queryParams.toString()}`
      )
      const customJobFieldsData =
        response.data.success !== undefined ? response.data.data : response.data
      setCustomJobFields(customJobFieldsData || [])
    } catch (error: any) {
      console.error('Error fetching custom job fields:', error)
      toast.error('Failed to load custom job fields', {
        description:
          'Please try again or contact support if the issue persists.',
      })
    } finally {
      setCustomJobFieldsLoading(false)
    }
  }, [])

  // Fetch notes from API
  const fetchNotes = useCallback(async () => {
    if (!tenantId) return

    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: entriesPerPage.toString(),
      })

      // Add search term if provided and not empty
      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        queryParams.append('search', debouncedSearchTerm.trim())
      }

      // Add status filter if provided and not empty
      if (statusFilter && statusFilter.trim()) {
        queryParams.append('status', statusFilter)
      }

      // Add sourceCode filter if provided and not empty
      if (sourceCodeFilter && sourceCodeFilter.trim()) {
        queryParams.append('sourceCode', sourceCodeFilter)
      }

      // Add noteFor filter if provided and not empty
      if (noteForFilter && noteForFilter.trim()) {
        queryParams.append('noteFor', noteForFilter)
      }

      const response = await apiService.get(
        `/v1/knowledge-hub/notes?${queryParams.toString()}`
      )
      const responseData: NotesResponse = response.data

      if (responseData.success) {
        setNotes(responseData.data.data)
        setTotalCount(responseData.data.pagination.total)
        setTotalPages(responseData.data.pagination.pages)
        setPagination(responseData.data.pagination)
        setError(null)
      } else {
        setError(responseData.message || 'Failed to fetch notes')
        setNotes([])
        setTotalCount(0)
        setTotalPages(0)
        setPagination({
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        })
      }
    } catch (err: any) {
      console.error('Error fetching notes:', err)
      setError(err.response?.data?.message || 'Failed to fetch notes')
      setNotes([])
      setTotalCount(0)
      setTotalPages(0)
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [
    tenantId,
    currentPage,
    entriesPerPage,
    debouncedSearchTerm,
    statusFilter,
    sourceCodeFilter,
    noteForFilter,
  ])

  // Fetch notes on component mount and when dependencies change
  useEffect(() => {
    if (!checkPermission('MOD032', 'view')) {
      router.push('/settings/knowledgeHub/scripts')
      return
    }
    if (tenantId) {
      fetchNotes()
    }
  }, [
    tenantId,
    currentPage,
    entriesPerPage,
    fetchNotes,
    fetchSources,
    fetchCustomJobFields,
  ])

  useEffect(() => {
    if (!checkPermission('MOD032', 'view')) {
      router.push('/settings/knowledgeHub/scripts')
      return
    }
    if (tenantId) {
      fetchCustomJobFields()
      fetchSources()
    }
  }, [tenantId])

  // Reset pagination when search term changes
  useEffect(() => {
    if (tenantId) {
      setCurrentPage(1) // Reset to first page when searching
      setPagination(prev => ({
        ...prev,
        page: 1,
      }))
    }
  }, [debouncedSearchTerm, tenantId])

  // Reset pagination when filters change
  useEffect(() => {
    if (tenantId) {
      setCurrentPage(1)
      setPagination(prev => ({
        ...prev,
        page: 1,
      }))
    }
  }, [statusFilter, sourceCodeFilter, noteForFilter, tenantId])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setPagination(prev => ({
      ...prev,
      page,
    }))
  }

  const handleEntriesChange = (value: string) => {
    const newLimit = parseInt(value)
    setEntriesPerPage(newLimit)
    setCurrentPage(1)
    setPagination(prev => ({
      ...prev,
      page: 1,
      limit: newLimit,
    }))
  }

  const handleDeleteNote = (note: Note) => {
    setNoteToDelete(note)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!noteToDelete || !tenantId) return

    try {
      setDeleting(true)
      await apiService.delete(`/v1/knowledge-hub/notes/${noteToDelete._id}`)

      // Refresh the list
      await fetchNotes()

      // Show success toast
      toast.success('Note deleted successfully!', {
        description: 'The note has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setNoteToDelete(null)
    } catch (err: any) {
      console.error('Error deleting note:', err)
      toast.error('Failed to delete note', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the note.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setNoteToDelete(null)
  }

  const handleViewNote = (note: Note) => {
    setSelectedNote(note)
    setViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setViewModalOpen(false)
    setSelectedNote(null)
  }

  // Filter handlers
  const clearAllFilters = () => {
    setStatusFilter('')
    setSourceCodeFilter('')
    setNoteForFilter('')
    setSearchTerm('')
  }

  return (
    <>
      <Head>
        <title>Notes - WePro</title>
        <meta name="description" content="Manage knowledge hub notes" />
      </Head>
      <div className="space-y-6">
        {/* Main Tab Navigation */}
        <SettingsNavigation />

        {/* Sub Tab Navigation */}
        <KnowledgeHubSubNavigation />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Notes
            </h1>
          </div>
          <Button
            onClick={() => router.push('/settings/knowledgeHub/notes/create')}
            className="wepro-button-gradient text-white"
            disabled={!tenantId}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>

        {/* Filters and Search Component */}
        {tenantId && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Filters Section */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Status Filter */}
                  <div className="space-y-2 flex-1">
                    <Label className="text-sm font-medium">Status</Label>
                    <Select
                      value={statusFilter || 'all'}
                      onValueChange={value =>
                        setStatusFilter(value === 'all' ? '' : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Source Code Filter */}
                  <div className="space-y-2 flex-1">
                    <Label className="text-sm font-medium">Source Code</Label>
                    <Select
                      value={sourceCodeFilter || 'all'}
                      onValueChange={value =>
                        setSourceCodeFilter(value === 'all' ? '' : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        {sources.map(source => (
                          <SelectItem key={source._id} value={source.code}>
                            {source.code} - {source.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Note For Filter */}
                  <div className="space-y-2 flex-1">
                    <Label className="text-sm font-medium">Note For</Label>
                    <Select
                      value={noteForFilter || 'all'}
                      onValueChange={value =>
                        setNoteForFilter(value === 'all' ? '' : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Fields" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Fields</SelectItem>
                        {customJobFields.map(field => (
                          <SelectItem key={field._id} value={field.code}>
                            {field.code} - {field.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Bar */}
                  <div className="space-y-2 flex-1">
                    <Label className="text-sm font-medium">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        placeholder="Search notes..."
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
                          !statusFilter &&
                          !sourceCodeFilter &&
                          !noteForFilter &&
                          !searchTerm
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

        {/* Content Area */}
        {!tenantId ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Tenant ID Required
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Unable to load notes. Please ensure you are logged in with a
                  valid tenant account.
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
                      value={pagination.limit.toString()}
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
                        <TableHead className="w-auto">Title</TableHead>
                        <TableHead className="w-24">Code</TableHead>
                        <TableHead className="w-32">Source Codes</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead className="w-32">Note For</TableHead>
                        <TableHead className="w-32">Created By</TableHead>
                        <TableHead className="w-32">Created At</TableHead>
                        <TableHead className="w-20 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
                              Loading notes...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-8 text-red-500"
                          >
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : notes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No notes found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        notes.map(note => (
                          <TableRow key={note._id}>
                            <TableCell className="font-medium w-auto">
                              <div>
                                <div className="font-semibold">
                                  {note.title}
                                </div>
                                {note.note && (
                                  <div className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                    {note.note.replace(/<[^>]*>/g, '')}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="w-24">
                              <div className="truncate">
                                <Badge variant="outline" className="font-mono">
                                  {note.code}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="w-32">
                              <div className="flex flex-wrap gap-1">
                                {note.sourceCodes.map((code, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {code}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="w-24">
                              <div className="truncate">
                                <Badge
                                  className={getStatusBadgeColor(note.status)}
                                >
                                  {note.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="w-32">
                              <div className="truncate">
                                <Badge variant="outline" className="font-mono">
                                  {note.noteFor}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="w-32">
                              <div className="truncate">
                                {note.createdBy?.name || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="w-32">
                              <div className="truncate">
                                {formatDate(
                                  note.createdAt,
                                  userData?.timezoneId?.value
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="w-20 text-right">
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
                                    onClick={() => handleViewNote(note)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                  {checkPermission('MOD032', 'edit') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() =>
                                        router.push(
                                          `/settings/knowledgeHub/notes/create?id=${note._id}`
                                        )
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Note
                                    </DropdownMenuItem>
                                  )}
                                  {checkPermission('MOD032', 'edit') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600"
                                      onClick={() => handleDeleteNote(note)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Note
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
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{' '}
                    of {pagination.total} entries
                  </div>

                  {/* Pagination buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
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
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1
                          } else if (pagination.page >= pagination.pages - 2) {
                            pageNum = pagination.pages - 4 + i
                          } else {
                            pageNum = pagination.page - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                pagination.page === pageNum
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
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
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
                  value={pagination.limit.toString()}
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
                      <span className="text-neutral-500">Loading notes...</span>
                    </div>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-neutral-500">No notes found</span>
                  </div>
                ) : (
                  notes.map(note => (
                    <Card key={note._id} className="relative border border-neutral-200 dark:border-neutral-700">
                      <CardContent className="pt-4 pb-4">
                        <div className="space-y-3">
                          {/* Title */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Title
                            </div>
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {note.title}
                            </div>
                            {note.note && (
                              <div className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                                {note.note.replace(/<[^>]*>/g, '')}
                              </div>
                            )}
                          </div>

                          {/* Code */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Code
                            </div>
                            <Badge variant="outline" className="font-mono">
                              {note.code}
                            </Badge>
                          </div>

                          {/* Source Codes */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Source Codes
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {note.sourceCodes.slice(0, 3).map((code, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {code}
                                </Badge>
                              ))}
                              {note.sourceCodes.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{note.sourceCodes.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Status */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Status
                            </div>
                            <Badge
                              className={getStatusBadgeColor(note.status)}
                            >
                              {note.status}
                            </Badge>
                          </div>

                          {/* Note For */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Note For
                            </div>
                            <Badge variant="outline" className="font-mono">
                              {note.noteFor}
                            </Badge>
                          </div>

                          {/* Created By */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Created By
                            </div>
                            <div className="text-sm text-neutral-900 dark:text-neutral-100">
                              {note.createdBy?.name || 'N/A'}
                            </div>
                          </div>

                          {/* Created At */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Created At
                            </div>
                            <div className="text-sm text-neutral-900 dark:text-neutral-100">
                              {formatDate(
                                note.createdAt,
                                userData?.timezoneId?.value
                              )}
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
                              onClick={() => handleViewNote(note)}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            {checkPermission('MOD032', 'edit') && (
                              <DropdownMenuItem
                                className="flex items-center gap-2"
                                onClick={() =>
                                  router.push(
                                    `/settings/knowledgeHub/notes/create?id=${note._id}`
                                  )
                                }
                              >
                                <Edit className="h-4 w-4" />
                                Edit Note
                              </DropdownMenuItem>
                            )}
                            {checkPermission('MOD032', 'edit') && (
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600"
                                onClick={() => handleDeleteNote(note)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Note
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
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}{' '}
                of {pagination.total} entries
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
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
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i
                      } else {
                        pageNum = pagination.page - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pagination.page === pageNum ? 'default' : 'outline'
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
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || loading}
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
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{noteToDelete?.title}</strong>? This action cannot be
              undone and will permanently remove the note from the system.
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

      {/* View Note Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b border-neutral-200 dark:border-neutral-700">
            <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
              Note Details
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pb-6">
            <div>
              {/* Note Header Information Card */}
              <Card className="border-neutral-200 dark:border-neutral-700 mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {selectedNote?.title}
                    </CardTitle>
                    {/* Status and Code */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={`${getStatusBadgeColor(selectedNote?.status || '')} px-2 py-1 text-xs font-medium`}
                      >
                        {selectedNote?.status}
                      </Badge>
                      <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs border">
                        {selectedNote?.code}
                      </span>
                    </div>
                  </div>
                  {/* Additional Info */}
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                    <div>
                      <span className="font-medium">Note For:</span>{' '}
                      {selectedNote?.noteFor}
                    </div>
                    <div>
                      <span className="font-medium">Source Codes:</span>{' '}
                      {selectedNote?.sourceCodes?.join(', ')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Note Content */}
              <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                Note Content
              </CardTitle>
              {selectedNote?.note ? (
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <ReactQuill
                      value={selectedNote.note}
                      readOnly={true}
                      theme="snow"
                      modules={{
                        toolbar: false,
                      }}
                      className="bg-transparent [&_.ql-editor]:p-0 [&_.ql-editor]:text-neutral-800 dark:[&_.ql-editor]:text-neutral-200 [&_.ql-editor]:text-base [&_.ql-editor]:leading-relaxed [&_.ql-container]:border-0 [&_.ql-container.ql-snow]:border-0 [&_.ql-toolbar]:hidden"
                      style={{ border: 'none' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="text-neutral-400 dark:text-neutral-500 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400 italic text-lg">
                    No note content available
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
