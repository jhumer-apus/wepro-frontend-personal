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
  Mail,
  ExternalLink,
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
import { useDebounce } from '@/src/hooks/useDebounce'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion'

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

// Interface for Invoice Template data
interface InvoiceTemplate {
  _id: string
  title: string
  invoiceType: string
  templateSources: string
  sourceCodes: string[]
  status: string
  tenantId: string
  byTenantId: string
  createdBy: {
    _id: string
  }
  createdAt: string
  updatedAt: string
  code: string
  enabledChannels: string[]
  channels: {
    email: {
      enabled: boolean
      fromEmail: string
      fromName: string
      replyTo: string
      subject: string
      template: string
      attachPdf: boolean
    }
    sms: {
      enabled: boolean
      template: string
    }
    whatsapp: {
      enabled: boolean
    }
    weproChat: {
      enabled: boolean
    }
  }
  id: string
}

interface InvoiceTemplatesResponse {
  success: boolean
  data: InvoiceTemplate[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface Source {
  id: string
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

const getInvoiceTypeBadgeColor = (invoiceType: string) => {
  switch (invoiceType.toLowerCase()) {
    case 'invoice':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'estimate':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const getChannelBadgeColor = (channel: string) => {
  switch (channel.toLowerCase()) {
    case 'email':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'sms':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'whatsapp':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'weprochat':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) {
    return 'N/A'
  }
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid Date'
  }
}

export default function InvoiceTemplatesPage() {
  const router = useRouter()
  const { checkPermission, getUserType, userData, isSuperAdmin } =
    usePermissions()
  const tenantId = userData?.tenantId

  // State for Invoice templates
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Debug: Track search term changes
  useEffect(() => {
    console.log(
      'Search term changed:',
      searchTerm,
      'Debounced:',
      debouncedSearchTerm
    )
  }, [searchTerm, debouncedSearchTerm])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  // State for filters
  const [statusFilter, setStatusFilter] = useState<string>('Active')
  const [channelFilter, setChannelFilter] = useState<string>('')
  const [sourceCodeFilter, setSourceCodeFilter] = useState<string>('')
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<string>('')

  // State for sources (for sourceCode filter)
  const [sources, setSources] = useState<Source[]>([])
  const [sourcesLoading, setSourcesLoading] = useState(false)

  // State for delete functionality
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] =
    useState<InvoiceTemplate | null>(null)
  const [deleting, setDeleting] = useState(false)

  // State for view modal
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<InvoiceTemplate | null>(null)

  // Fetch sources from API
  const fetchSources = useCallback(async () => {
    setSourcesLoading(true)
    try {
      const response = await apiService.get(
        '/v1/sources?page=1&limit=50&sort=-createdAt'
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

  // Fetch Invoice templates from API
  const fetchTemplates = useCallback(async () => {
    if (!tenantId) return

    try {
      setLoading(true)
      setError(null)
      console.log('API call triggered with search term:', debouncedSearchTerm)

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

      // Add channel filter if provided
      if (channelFilter) {
        queryParams.append('channel', channelFilter)
      }

      // Add sourceCode filter if provided
      if (sourceCodeFilter) {
        queryParams.append('sourceCode', sourceCodeFilter)
      }

      // Add invoiceType filter if provided
      if (invoiceTypeFilter) {
        queryParams.append('invoiceType', invoiceTypeFilter)
      }

      const response = await apiService.get(
        `/v1/templates/invoices?${queryParams.toString()}`
      )
      const responseData: InvoiceTemplatesResponse = response.data

      if (responseData.success) {
        setTemplates(responseData.data)
        setTotalCount(responseData.pagination.total)
        setTotalPages(responseData.pagination.pages)
        setPagination(responseData.pagination)
        setError(null)
      } else {
        setError('Failed to fetch Invoice templates')
        setTemplates([])
        setTotalCount(0)
        setTotalPages(0)
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        })
      }
    } catch (err: any) {
      console.error('Error fetching Invoice templates:', err)
      setError(
        err.response?.data?.message || 'Failed to fetch Invoice templates'
      )
      setTemplates([])
      setTotalCount(0)
      setTotalPages(0)
      setPagination({
        page: 1,
        limit: 10,
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
    channelFilter,
    sourceCodeFilter,
    invoiceTypeFilter,
  ])

  // Fetch templates on component mount and when dependencies change
  useEffect(() => {
    if (!checkPermission('MOD036', 'view')) {
      router.push('/settings/templates/external-jobs')
      return
    }
    if (tenantId) {
      fetchTemplates()
    }
  }, [
    tenantId,
    currentPage,
    entriesPerPage,
    debouncedSearchTerm,
    statusFilter,
    channelFilter,
    sourceCodeFilter,
    invoiceTypeFilter,
    fetchSources,
  ])

  useEffect(() => {
    if (!checkPermission('MOD036', 'view')) {
      router.push('/settings/templates/external-jobs')
      return
    }
    if (tenantId) {
      fetchSources()
    }
  }, [tenantId])

  // Reset pagination when search term changes (but not when page changes)
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
  }, [
    statusFilter,
    channelFilter,
    sourceCodeFilter,
    invoiceTypeFilter,
    tenantId,
  ])

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

  const handleDeleteTemplate = (template: InvoiceTemplate) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!templateToDelete || !tenantId) return

    try {
      setDeleting(true)
      await apiService.delete(`/v1/templates/invoices/${templateToDelete._id}`)

      // Refresh the list
      await fetchTemplates()

      // Show success toast
      toast.success('Invoice template deleted successfully!', {
        description: 'The template has been removed from the system.',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
    } catch (err: any) {
      console.error('Error deleting Invoice template:', err)
      toast.error('Failed to delete Invoice template', {
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

  const handleViewTemplate = (template: InvoiceTemplate) => {
    setSelectedTemplate(template)
    setViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setViewModalOpen(false)
    setSelectedTemplate(null)
  }

  const handlePreviewTemplate = (template: InvoiceTemplate) => {
    router.push(`/settings/templates/invoice/${template._id}/preview`)
  }

  // Filter handlers
  const clearAllFilters = () => {
    setStatusFilter('Active')
    setChannelFilter('')
    setSourceCodeFilter('')
    setInvoiceTypeFilter('')
    setSearchTerm('')
  }

  return (
    <>
      <Head>
        <title>Invoice Templates - WePro</title>
        <meta name="description" content="Manage invoice templates" />
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
              Invoice Templates
            </h1>
          </div>
          <Button
            onClick={() => router.push('/settings/templates/invoice/create')}
            className="wepro-button-gradient text-white"
            disabled={!tenantId}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Invoice Template
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
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Channel Filter */}
                  <div className="space-y-2 flex-1">
                    <Label className="text-sm font-medium">Channel</Label>
                    <Select
                      value={channelFilter || 'all'}
                      onValueChange={value =>
                        setChannelFilter(value === 'all' ? '' : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Channels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Channels</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="weproChat">WePro Chat</SelectItem>
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
                          <SelectItem key={source.id} value={source.code}>
                            {source.code} - {source.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Invoice Type Filter */}
                  <div className="space-y-2 flex-1">
                    <Label className="text-sm font-medium">
                      Invoice Type
                    </Label>
                    <Select
                      value={invoiceTypeFilter || 'all'}
                      onValueChange={value =>
                        setInvoiceTypeFilter(value === 'all' ? '' : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Invoice">Invoice</SelectItem>
                        <SelectItem value="Estimate">Estimate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Bar */}
                  <div className="space-y-2 flex-1">
                    <Label className="text-sm font-medium">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        placeholder="Search invoice templates..."
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
                          !channelFilter &&
                          !sourceCodeFilter &&
                          !invoiceTypeFilter &&
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
                  Unable to load Invoice templates. Please ensure you are logged
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
                        <TableHead className="w-24">Invoice Type</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead className="w-32">Channels</TableHead>
                        <TableHead className="w-32">Source Codes</TableHead>
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
                              Loading Invoice templates...
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
                      ) : templates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No Invoice templates found.
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
                                <div className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">
                                  {template.templateSources === 'All'
                                    ? 'All Sources'
                                    : `Specific: ${template.sourceCodes.join(', ')}`}
                                </div>
                                <div className="text-xs text-neutral-400 dark:text-neutral-500">
                                  {template.channels.email.enabled &&
                                    `Email: ${template.channels.email.subject}`}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="w-24">
                              <div className="truncate">
                                <Badge variant="outline" className="font-mono">
                                  {template.code}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="w-24">
                              <div className="truncate">
                                <Badge
                                  className={getInvoiceTypeBadgeColor(
                                    template.invoiceType
                                  )}
                                >
                                  {template.invoiceType}
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
                                {template.enabledChannels &&
                                template.enabledChannels.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {template.enabledChannels
                                      .slice(0, 2)
                                      .map((channel, index) => (
                                        <Badge
                                          key={index}
                                          className={`${getChannelBadgeColor(channel)} text-xs`}
                                        >
                                          {channel}
                                        </Badge>
                                      ))}
                                    {template.enabledChannels.length > 2 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        +{template.enabledChannels.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-neutral-400">
                                    No channels
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="w-32">
                              <div className="truncate">
                                {template.sourceCodes &&
                                template.sourceCodes.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {template.sourceCodes
                                      .slice(0, 2)
                                      .map((sourceCode, index) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {sourceCode}
                                        </Badge>
                                      ))}
                                    {template.sourceCodes.length > 2 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        +{template.sourceCodes.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-neutral-400">
                                    All Sources
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="w-32">
                              <div className="truncate">
                                {formatDate(template.createdAt)}
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
                                  <DropdownMenuItem
                                    className="flex items-center gap-2"
                                    onClick={() =>
                                      handlePreviewTemplate(template)
                                    }
                                  >
                                    <Play className="h-4 w-4" />
                                    Generate Preview
                                  </DropdownMenuItem>
                                  {checkPermission('MOD036', 'edit') && (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2"
                                      onClick={() =>
                                        router.push(
                                          `/settings/templates/invoice/create?id=${template._id}`
                                        )
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Template
                                    </DropdownMenuItem>
                                  )}
                                  {checkPermission('MOD036', 'delete') && (
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
                    <SelectItem value="25">25</SelectItem>
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
                      <span className="text-neutral-500">Loading Invoice templates...</span>
                    </div>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-neutral-500">No Invoice templates found</span>
                  </div>
                ) : (
                  templates.map(template => (
                    <Card key={template._id} className="relative border border-neutral-200 dark:border-neutral-700">
                      <CardContent className="pt-4 pb-4">
                        <div className="space-y-3">
                          {/* Title */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Title
                            </div>
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {template.title}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-1">
                              {template.templateSources === 'All'
                                ? 'All Sources'
                                : `Specific: ${template.sourceCodes.join(', ')}`}
                            </div>
                            {template.channels.email.enabled && (
                              <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                                Email: {template.channels.email.subject}
                              </div>
                            )}
                          </div>

                          {/* Code */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Code
                            </div>
                            <Badge variant="outline" className="font-mono">
                              {template.code}
                            </Badge>
                          </div>

                          {/* Invoice Type */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Invoice Type
                            </div>
                            <Badge
                              className={getInvoiceTypeBadgeColor(template.invoiceType)}
                            >
                              {template.invoiceType}
                            </Badge>
                          </div>

                          {/* Status */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Status
                            </div>
                            <Badge
                              className={getStatusBadgeColor(template.status)}
                            >
                              {template.status}
                            </Badge>
                          </div>

                          {/* Channels */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Channels
                            </div>
                            {template.enabledChannels &&
                            template.enabledChannels.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {template.enabledChannels
                                  .slice(0, 3)
                                  .map((channel, index) => (
                                    <Badge
                                      key={index}
                                      className={`${getChannelBadgeColor(channel)} text-xs`}
                                    >
                                      {channel}
                                    </Badge>
                                  ))}
                                {template.enabledChannels.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{template.enabledChannels.length - 3}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-neutral-400">
                                No channels
                              </span>
                            )}
                          </div>

                          {/* Source Codes */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Source Codes
                            </div>
                            {template.sourceCodes && template.sourceCodes.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {template.sourceCodes
                                  .slice(0, 3)
                                  .map((sourceCode, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {sourceCode}
                                    </Badge>
                                  ))}
                                {template.sourceCodes.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{template.sourceCodes.length - 3}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-neutral-400">
                                All Sources
                              </span>
                            )}
                          </div>

                          {/* Created At */}
                          <div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                              Created At
                            </div>
                            <div className="text-sm text-neutral-900 dark:text-neutral-100">
                              {formatDate(template.createdAt)}
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
                              onClick={() => handleViewTemplate(template)}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={() => handlePreviewTemplate(template)}
                            >
                              <Play className="h-4 w-4" />
                              Generate Preview
                            </DropdownMenuItem>
                            {checkPermission('MOD036', 'edit') && (
                              <DropdownMenuItem
                                className="flex items-center gap-2"
                                onClick={() =>
                                  router.push(
                                    `/settings/templates/invoice/create?id=${template._id}`
                                  )
                                }
                              >
                                <Edit className="h-4 w-4" />
                                Edit Template
                              </DropdownMenuItem>
                            )}
                            {checkPermission('MOD036', 'delete') && (
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600"
                                onClick={() => handleDeleteTemplate(template)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Template
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
            <AlertDialogTitle>Delete Invoice Template</AlertDialogTitle>
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
                Invoice Template Details
              </DialogTitle>
              <Button
                onClick={() =>
                  selectedTemplate && handlePreviewTemplate(selectedTemplate)
                }
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Generate Preview
              </Button>
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
                    {/* Status, Invoice Type and Code */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={`${getStatusBadgeColor(selectedTemplate?.status || '')} px-2 py-1 text-xs font-medium`}
                      >
                        {selectedTemplate?.status}
                      </Badge>
                      <Badge
                        className={`${getInvoiceTypeBadgeColor(selectedTemplate?.invoiceType || '')} px-2 py-1 text-xs font-medium`}
                      >
                        {selectedTemplate?.invoiceType}
                      </Badge>
                      <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs border">
                        {selectedTemplate?.code}
                      </span>
                    </div>
                  </div>

                  {/* Template Details */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">
                        Template Sources:
                      </span>
                      <div className="text-neutral-900 dark:text-neutral-100">
                        {selectedTemplate?.templateSources || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">
                        Source Codes:
                      </span>
                      <div className="text-neutral-900 dark:text-neutral-100">
                        {selectedTemplate?.sourceCodes &&
                        selectedTemplate.sourceCodes.length > 0
                          ? selectedTemplate.sourceCodes.join(', ')
                          : 'All Sources'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">
                        Enabled Channels:
                      </span>
                      <div className="text-neutral-900 dark:text-neutral-100">
                        {selectedTemplate?.enabledChannels &&
                        selectedTemplate.enabledChannels.length > 0
                          ? selectedTemplate.enabledChannels.join(', ')
                          : 'None'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">
                        Created At:
                      </span>
                      <div className="text-neutral-900 dark:text-neutral-100">
                        {formatDate(selectedTemplate?.createdAt)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Channels Configuration */}
              {selectedTemplate?.channels && (
                <div className="mt-6">
                  <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Channel Configuration
                  </CardTitle>
                  <Accordion type="multiple" className="w-full">
                    {Object.entries(selectedTemplate.channels).map(
                      ([channelName, channelConfig]) => (
                        <AccordionItem
                          key={channelName}
                          value={channelName}
                          className="border border-neutral-200 dark:border-neutral-700 rounded-lg mb-2"
                        >
                          {channelConfig?.enabled ? (
                            <>
                              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                <div className="flex items-center justify-between w-full mr-4">
                                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                                    {channelName}
                                  </h4>
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                    Enabled
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="space-y-2 text-sm">
                                  {channelName === 'email' &&
                                    'fromEmail' in channelConfig && (
                                      <>
                                        {channelConfig.fromEmail && (
                                          <div>
                                            <span className="font-medium text-neutral-600 dark:text-neutral-400">
                                              From Email:
                                            </span>
                                            <div className="text-neutral-900 dark:text-neutral-100">
                                              {channelConfig.fromEmail}
                                            </div>
                                          </div>
                                        )}
                                        {channelConfig.fromName && (
                                          <div>
                                            <span className="font-medium text-neutral-600 dark:text-neutral-400">
                                              From Name:
                                            </span>
                                            <div className="text-neutral-900 dark:text-neutral-100">
                                              {channelConfig.fromName}
                                            </div>
                                          </div>
                                        )}
                                        {channelConfig.subject && (
                                          <div>
                                            <span className="font-medium text-neutral-600 dark:text-neutral-400">
                                              Subject:
                                            </span>
                                            <div className="text-neutral-900 dark:text-neutral-100">
                                              {channelConfig.subject}
                                            </div>
                                          </div>
                                        )}
                                        {channelConfig.replyTo && (
                                          <div>
                                            <span className="font-medium text-neutral-600 dark:text-neutral-400">
                                              Reply To:
                                            </span>
                                            <div className="text-neutral-900 dark:text-neutral-100">
                                              {channelConfig.replyTo}
                                            </div>
                                          </div>
                                        )}
                                        {channelConfig.attachPdf !==
                                          undefined && (
                                          <div>
                                            <span className="font-medium text-neutral-600 dark:text-neutral-400">
                                              Attach PDF:
                                            </span>
                                            <div className="text-neutral-900 dark:text-neutral-100">
                                              {channelConfig.attachPdf
                                                ? 'Yes'
                                                : 'No'}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}

                                  {'template' in channelConfig &&
                                    channelConfig.template && (
                                      <div>
                                        <span className="font-medium text-neutral-600 dark:text-neutral-400 mb-2 block">
                                          Template:
                                        </span>
                                        {channelName === 'email' ||
                                        channelName === 'weproChat' ? (
                                          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                                            <div className="p-6">
                                              <div
                                                className="prose prose-sm max-w-none text-neutral-800 dark:text-neutral-200"
                                                dangerouslySetInnerHTML={{
                                                  __html:
                                                    channelConfig.template,
                                                }}
                                              />
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                                            <div className="p-6">
                                              <div className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 text-base leading-relaxed">
                                                {channelConfig.template}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                </div>
                              </AccordionContent>
                            </>
                          ) : (
                            <div className="px-4 py-3 flex items-center justify-between">
                              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                                {channelName}
                              </h4>
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                Disabled
                              </Badge>
                            </div>
                          )}
                        </AccordionItem>
                      )
                    )}
                  </Accordion>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
