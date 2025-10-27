import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useDebounce } from '@/src/hooks/useDebounce'
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
  Building2,
  Eye,
  Phone,
  EyeIcon,
  AlertCircle,
  Play,
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
  TemplatesSubNavigation,
} from '@/src/components/job'
import { usePermissions } from '@/src/hooks/usePermissions'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { SoundPlayerModal } from '@/src/components/ui/sound-player-modal'

// Interface for Voice Template data
interface VoiceTemplate {
  _id: string
  title: string
  code: string
  voiceType: string
  content?: string
  audioUrl?: string
  audioFormat?: string
  audioDuration?: number
  status: string
}

interface VoiceTemplatesResponse {
  success: boolean
  message: string
  data: {
    data: VoiceTemplate[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
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

const getVoiceTypeBadgeColor = (voiceType: string) => {
  switch (voiceType) {
    case 'Text-to-Speech':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'Audio File':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'Record Voice':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const formatDuration = (seconds: number | undefined) => {
  if (!seconds) return 'N/A'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function VoiceTemplatesPage() {
  const router = useRouter()
  const { checkPermission, getUserType, userData, isSuperAdmin } =
    usePermissions()
  const tenantId = userData?.tenantId

  // State for Voice templates
  const [templates, setTemplates] = useState<VoiceTemplate[]>([])
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
    limit: 25,
    total: 0,
    pages: 0,
  })

  // State for filters
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [voiceTypeFilter, setVoiceTypeFilter] = useState<string>('')

  // State for delete functionality
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] =
    useState<VoiceTemplate | null>(null)
  const [deleting, setDeleting] = useState(false)

  // State for view modal
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<VoiceTemplate | null>(null)

  // State for sound player modal
  const [soundPlayerOpen, setSoundPlayerOpen] = useState(false)
  const [audioTemplate, setAudioTemplate] = useState<VoiceTemplate | null>(null)

  // Fetch Voice templates from API
  const fetchTemplates = useCallback(async () => {
    if (!tenantId) return

    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: entriesPerPage.toString(),
      })

      // Add search term if provided
      if (debouncedSearchTerm.trim()) {
        queryParams.append('search', debouncedSearchTerm.trim())
      }

      // Add status filter if provided
      if (statusFilter) {
        queryParams.append('status', statusFilter)
      }

      // Add voiceType filter if provided
      if (voiceTypeFilter) {
        queryParams.append('voiceType', voiceTypeFilter)
      }

      const response = await apiService.get(
        `/v1/templates/voice?${queryParams.toString()}`
      )
      const responseData: VoiceTemplatesResponse = response.data

      if (responseData.success) {
        setTemplates(responseData.data.data)
        setTotalCount(responseData.data.pagination.total)
        setTotalPages(responseData.data.pagination.pages)
        setPagination(responseData.data.pagination)
        setError(null)
      } else {
        setError(responseData.message || 'Failed to fetch Voice templates')
        setTemplates([])
        setTotalCount(0)
        setTotalPages(0)
        setPagination({
          page: 1,
          limit: 25,
          total: 0,
          pages: 0,
        })
      }
    } catch (err: any) {
      console.error('Error fetching Voice templates:', err)
      setError(err.response?.data?.message || 'Failed to fetch Voice templates')
      setTemplates([])
      setTotalCount(0)
      setTotalPages(0)
      setPagination({
        page: 1,
        limit: 25,
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
    voiceTypeFilter,
  ])

  // Fetch templates on component mount and when dependencies change
  useEffect(() => {
    if (!checkPermission('MOD034', 'view')) {
      router.push('/settings/templates/email')
      return
    }
    if (tenantId) {
      fetchTemplates()
    }
  }, [tenantId, currentPage, entriesPerPage, fetchTemplates])

  // Reset pagination when search term changes
  useEffect(() => {
    if (tenantId && debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1)
      setPagination(prev => ({
        ...prev,
        page: 1,
      }))
    }
  }, [debouncedSearchTerm, tenantId, searchTerm])

  // Reset pagination when filters change
  useEffect(() => {
    if (tenantId) {
      setCurrentPage(1)
      setPagination(prev => ({
        ...prev,
        page: 1,
      }))
    }
  }, [statusFilter, voiceTypeFilter, tenantId])

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

  const handleDeleteTemplate = (template: VoiceTemplate) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!templateToDelete || !tenantId) return

    try {
      setDeleting(true)
      await apiService.delete(`/v1/templates/voice/${templateToDelete._id}`)

      // Refresh the list
      await fetchTemplates()

      // Show success toast
      toast.success('Voice template deleted successfully!', {
        description: 'The template has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
    } catch (err: any) {
      console.error('Error deleting Voice template:', err)
      toast.error('Failed to delete Voice template', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the template.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setTemplateToDelete(null)
  }

  const handleViewTemplate = (template: VoiceTemplate) => {
    setSelectedTemplate(template)
    setViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setViewModalOpen(false)
    setSelectedTemplate(null)
  }

  const handlePreviewTemplate = (template: VoiceTemplate) => {
    router.push(`/settings/templates/voice/${template._id}/preview`)
  }

  const handlePlayAudio = (template: VoiceTemplate) => {
    if (template.audioUrl) {
      setAudioTemplate(template)
      setSoundPlayerOpen(true)
    }
  }

  const handleCloseSoundPlayer = () => {
    setSoundPlayerOpen(false)
    setAudioTemplate(null)
  }

  // Filter handlers
  const clearAllFilters = () => {
    setStatusFilter('')
    setVoiceTypeFilter('')
    setSearchTerm('')
  }

  return (
    <>
      <Head>
        <title>Voice Templates - WePro</title>
        <meta name="description" content="Manage voice templates" />
      </Head>
      <div className="space-y-6">
        {/* Main Tab Navigation */}
        <SettingsNavigation />

        {/* Sub Tab Navigation */}
        <TemplatesSubNavigation />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Voice Templates
            </h1>
          </div>
          <Button
            onClick={() => router.push('/settings/templates/voice/create')}
            className="wepro-button-gradient text-white"
            disabled={!tenantId}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Voice Template
          </Button>
        </div>

        {/* Content Area */}
        <Card>
          <CardContent className="pt-6">
            {!tenantId ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Tenant ID Required
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Unable to load Voice templates. Please ensure you are logged
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
            ) : (
              <>
                {/* Filters and Search in Single Row */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  {/* Filters Section */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
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

                    {/* Voice Type Filter */}
                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-medium">Voice Type</Label>
                      <Select
                        value={voiceTypeFilter || 'all'}
                        onValueChange={value =>
                          setVoiceTypeFilter(value === 'all' ? '' : value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Voice Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Voice Types</SelectItem>
                          <SelectItem value="Text-to-Speech">
                            Text-to-Speech
                          </SelectItem>
                          <SelectItem value="Audio File">Audio File</SelectItem>
                          <SelectItem value="Record Voice">
                            Record Voice
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Search Bar */}
                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-medium">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          placeholder="Search voice templates..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="space-y-2 flex-1">
                      <Label className="text-sm font-medium">&nbsp;</Label>
                      <div className="space-y-2 flex justify-end">
                        <Button
                          variant="outline"
                          onClick={clearAllFilters}
                          disabled={
                            !statusFilter && !voiceTypeFilter && !searchTerm
                          }
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

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
                        <SelectItem value="25">25</SelectItem>
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
                        <TableHead className="w-32">Voice Type</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead className="w-32">Duration</TableHead>
                        <TableHead className="w-20 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
                              Loading Voice templates...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-red-500"
                          >
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : templates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No Voice templates found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        templates.map(template => (
                          <TableRow key={template._id}>
                            <TableCell className="font-medium w-auto">
                              <div>
                                <div className="font-semibold">
                                  {template.title}
                                </div>
                                {template.content && (
                                  <div className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                    {template.content}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="w-24">
                              <div className="truncate">
                                <Badge variant="outline" className="font-mono">
                                  {template.code}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="w-32">
                              <div className="truncate">
                                <Badge
                                  className={getVoiceTypeBadgeColor(
                                    template.voiceType
                                  )}
                                >
                                  {template.voiceType}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="w-24">
                              <div className="truncate">
                                <Badge
                                  className={getStatusBadgeColor(
                                    template.status
                                  )}
                                >
                                  {template.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="w-32">
                              <div className="truncate">
                                {template.audioDuration
                                  ? formatDuration(template.audioDuration)
                                  : 'N/A'}
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
                                    onClick={() => handleViewTemplate(template)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                  {(template.voiceType === 'Text-to-Speech' ||
                                    (template.voiceType === 'Record Voice' &&
                                      template.audioUrl) ||
                                    (template.voiceType === 'Audio File' &&
                                      template.audioUrl)) && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() => {
                                        if (
                                          template.voiceType ===
                                          'Text-to-Speech'
                                        ) {
                                          router.push(
                                            `/settings/templates/voice/${template._id}/preview`
                                          )
                                        } else {
                                          handlePlayAudio(template)
                                        }
                                      }}
                                    >
                                      {template.voiceType ===
                                      'Text-to-Speech' ? (
                                        <>
                                          <Play className="h-4 w-4" />
                                          Generate Preview
                                        </>
                                      ) : (
                                        <>
                                          <Play className="h-4 w-4" />
                                          Play Audio
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                  )}
                                  {checkPermission('MOD034', 'edit') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() =>
                                        router.push(
                                          `/settings/templates/voice/create?id=${template._id}`
                                        )
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Template
                                    </DropdownMenuItem>
                                  )}
                                  {checkPermission('MOD034', 'delete') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-red-600"
                                      onClick={() =>
                                        handleDeleteTemplate(template)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Template
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
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
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
            <AlertDialogTitle>Delete Voice Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{templateToDelete?.title}</strong>? This action cannot be
              undone and will permanently remove the template from the system.
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

      {/* View Template Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                Voice Template Details
              </DialogTitle>
              {(selectedTemplate?.voiceType === 'Text-to-Speech' ||
                (selectedTemplate?.voiceType === 'Record Voice' &&
                  selectedTemplate?.audioUrl) ||
                (selectedTemplate?.voiceType === 'Audio File' &&
                  selectedTemplate?.audioUrl)) && (
                <Button
                  onClick={() => {
                    if (selectedTemplate?.voiceType === 'Text-to-Speech') {
                      handlePreviewTemplate(selectedTemplate)
                    } else {
                      handlePlayAudio(selectedTemplate)
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Generate Preview
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pb-6">
            <div>
              {/* Template Header Information Card */}
              <Card className="border-neutral-200 dark:border-neutral-700 mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {selectedTemplate?.title}
                    </CardTitle>
                    {/* Status and Code */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={`${getStatusBadgeColor(selectedTemplate?.status || '')} px-2 py-1 text-xs font-medium`}
                      >
                        {selectedTemplate?.status}
                      </Badge>
                      <Badge
                        className={`${getVoiceTypeBadgeColor(selectedTemplate?.voiceType || '')} px-2 py-1 text-xs font-medium`}
                      >
                        {selectedTemplate?.voiceType}
                      </Badge>
                      <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs border">
                        {selectedTemplate?.code}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Template Content */}
              <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                Template Content
              </CardTitle>
              {selectedTemplate?.content ? (
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 text-base leading-relaxed">
                      {selectedTemplate.content}
                    </div>
                  </div>
                </div>
              ) : selectedTemplate?.audioUrl ? (
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <Phone className="w-8 h-8 text-neutral-500" />
                      <div>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                          Audio File:{' '}
                          {selectedTemplate.audioFormat?.toUpperCase()}
                        </p>
                        {selectedTemplate.audioDuration && (
                          <p className="text-neutral-500 dark:text-neutral-500 text-xs">
                            Duration:{' '}
                            {formatDuration(selectedTemplate.audioDuration)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="text-neutral-400 dark:text-neutral-500 mb-2">
                    <Phone className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400 italic text-lg">
                    No content available
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sound Player Modal */}
      <SoundPlayerModal
        isOpen={soundPlayerOpen}
        onClose={handleCloseSoundPlayer}
        audioUrl={audioTemplate?.audioUrl || ''}
        title={audioTemplate?.title || 'Audio Player'}
        duration={audioTemplate?.audioDuration}
      />
    </>
  )
}
