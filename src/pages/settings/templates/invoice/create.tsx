import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { Loading, ButtonLoading } from '@/src/components/ui/loading'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import {
  ArrowLeft,
  Save,
  Receipt,
  Shield,
  Mail,
  MessageSquare,
  Smartphone,
  MessageCircle,
  Check,
  ChevronsUpDown,
  X,
} from 'lucide-react'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Switch } from '@/src/components/ui/switch'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/src/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover'
import { Badge } from '@/src/components/ui/badge'
import { usePermissions } from '@/src/hooks/usePermissions'
import dynamic from 'next/dynamic'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface InvoiceTemplateFormData {
  title: string
  templateSources: string
  invoiceType: string
  sourceCodes: string[]
  status: 'Active' | 'Inactive'
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
      template: string
    }
    weproChat: {
      enabled: boolean
      template: string
    }
  }
}

interface Source {
  id: string
  code: string
  name: string
}

export default function CreateInvoiceTemplatePage(): React.JSX.Element {
  const router = useRouter()
  const { checkPermission, getUserType, userData } = usePermissions()
  const tenantId = userData?.tenantId
  const [submitted, setSubmitted] = useState(false)

  // Check if we're in edit mode
  const isEditMode = !!router.query.id
  const templateId = router.query.id as string

  // Add custom styles for ReactQuill
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .ql-editor {
        min-height: 200px;
        font-size: 14px;
        line-height: 1.5;
      }
      .ql-toolbar {
        border-top: 1px solid #e5e7eb;
        border-left: 1px solid #e5e7eb;
        border-right: 1px solid #e5e7eb;
        border-bottom: none;
        border-radius: 6px 6px 0 0;
      }
      .ql-container {
        border-bottom: 1px solid #e5e7eb;
        border-left: 1px solid #e5e7eb;
        border-right: 1px solid #e5e7eb;
        border-top: none;
        border-radius: 0 0 6px 6px;
      }
      .dark .ql-toolbar {
        border-color: #374151;
        background-color: #1f2937;
      }
      .dark .ql-container {
        border-color: #374151;
        background-color: #1f2937;
      }
      .dark .ql-editor {
        color: #f9fafb;
      }
      .dark .ql-editor.ql-blank::before {
        color: #9ca3af;
      }
    `
    document.head.appendChild(style)
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sources, setSources] = useState<Source[]>([])
  const [sourcesLoading, setSourcesLoading] = useState(false)
  const [sourceCodesOpen, setSourceCodesOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const [formData, setFormData] = useState<InvoiceTemplateFormData>({
    title: '',
    templateSources: 'All',
    invoiceType: 'Invoice',
    sourceCodes: [],
    status: 'Active',
    channels: {
      email: {
        enabled: false,
        fromEmail: '',
        fromName: '',
        replyTo: '',
        subject: '',
        template: '',
        attachPdf: false,
      },
      sms: {
        enabled: false,
        template: '',
      },
      whatsapp: {
        enabled: false,
        template: '',
      },
      weproChat: {
        enabled: false,
        template: '',
      },
    },
  })

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link'],
      ['clean'],
    ],
  }

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'link',
  ]

  // Function to calculate SMS segments
  const calculateSMSSegments = (text: string) => {
    if (!text) return { segments: 0, characters: 0, isUnicode: false }

    // Check if text contains Unicode characters (non-GSM 7-bit)
    const isUnicode = /[^\x00-\x7F]/.test(text)

    const characters = text.length
    let segments: number

    if (isUnicode) {
      // Unicode SMS: 70 chars per segment (single), 67 chars per segment (multi)
      if (characters <= 70) {
        segments = 1
      } else {
        segments = Math.ceil((characters - 70) / 67) + 1
      }
    } else {
      // GSM 7-bit: 160 chars per segment (single), 153 chars per segment (multi)
      if (characters <= 160) {
        segments = 1
      } else {
        segments = Math.ceil((characters - 160) / 153) + 1
      }
    }

    return { segments, characters, isUnicode }
  }

  // Validation functions
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    } else if (formData.title.length > 200) {
      errors.title = 'Title must be 200 characters or less'
    }

    // Template Sources validation
    if (!formData.templateSources) {
      errors.templateSources = 'Template source is required'
    } else if (!['All', 'Specific'].includes(formData.templateSources)) {
      errors.templateSources = 'Template source must be "All" or "Specific"'
    }

    // Source Codes validation
    if (
      formData.templateSources === 'Specific' &&
      formData.sourceCodes.length === 0
    ) {
      errors.sourceCodes =
        'At least one source code is required when using "Specific" template sources'
    }

    // Channels validation - at least one must be enabled
    const enabledChannels = Object.values(formData.channels).filter(
      channel => channel.enabled
    )
    if (enabledChannels.length === 0) {
      errors.channels = 'At least one channel must be enabled'
    }

    // Email Channel validation
    if (formData.channels.email.enabled) {
      if (!formData.channels.email.fromEmail.trim()) {
        errors.emailFromEmail =
          'From Email is required when Email channel is enabled'
      }
      if (!formData.channels.email.template.trim()) {
        errors.emailTemplate =
          'Email template is required when Email channel is enabled'
      }
    }

    // SMS Channel validation
    if (
      formData.channels.sms.enabled &&
      !formData.channels.sms.template.trim()
    ) {
      errors.smsTemplate =
        'SMS template is required when SMS channel is enabled'
    }

    // WhatsApp Channel validation
    if (
      formData.channels.whatsapp.enabled &&
      !formData.channels.whatsapp.template.trim()
    ) {
      errors.whatsappTemplate =
        'WhatsApp template is required when WhatsApp channel is enabled'
    }

    // WePro Chat Channel validation
    if (
      formData.channels.weproChat.enabled &&
      !formData.channels.weproChat.template.trim()
    ) {
      errors.weproChatTemplate =
        'WePro Chat template is required when WePro Chat channel is enabled'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const clearFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleInputChange = (
    field: keyof InvoiceTemplateFormData,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleChannelChange = (
    channel: keyof InvoiceTemplateFormData['channels'],
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: {
          ...prev.channels[channel],
          [field]: value,
        },
      },
    }))
  }

  const handleChannelToggle = (
    channel: keyof InvoiceTemplateFormData['channels'],
    enabled: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: {
          ...prev.channels[channel],
          enabled,
          // Reset fields when disabling
          ...(enabled
            ? {}
            : {
                fromEmail: '',
                fromName: '',
                replyTo: '',
                subject: '',
                template: '',
                attachPdf: false,
              }),
        },
      },
    }))
  }

  const handleSourceCodeToggle = (sourceCode: string) => {
    setFormData(prev => ({
      ...prev,
      sourceCodes: prev.sourceCodes.includes(sourceCode)
        ? prev.sourceCodes.filter(code => code !== sourceCode)
        : [...prev.sourceCodes, sourceCode],
    }))
    clearFieldError('sourceCodes')
  }

  const removeSourceCode = (sourceCode: string) => {
    setFormData(prev => ({
      ...prev,
      sourceCodes: prev.sourceCodes.filter(code => code !== sourceCode),
    }))
    clearFieldError('sourceCodes')
  }

  // Fetch sources from API
  const fetchSources = async () => {
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
  }

  // Fetch existing template data for edit mode
  const fetchTemplateData = async () => {
    if (!isEditMode || !templateId) return

    setIsLoading(true)
    try {
      const response = await apiService.get(
        `/v1/templates/invoices/${templateId}`
      )
      const templateData = response.data.data

      // Update form data with existing template data
      setFormData({
        title: templateData.title || '',
        templateSources: templateData.templateSources || 'All',
        invoiceType: templateData.invoiceType || 'Invoice',
        sourceCodes: templateData.sourceCodes || [],
        status: templateData.status || 'Active',
        channels: {
          email: {
            enabled: templateData.channels?.email?.enabled || false,
            fromEmail: templateData.channels?.email?.fromEmail || '',
            fromName: templateData.channels?.email?.fromName || '',
            replyTo: templateData.channels?.email?.replyTo || '',
            subject: templateData.channels?.email?.subject || '',
            template: templateData.channels?.email?.template || '',
            attachPdf: templateData.channels?.email?.attachPdf || false,
          },
          sms: {
            enabled: templateData.channels?.sms?.enabled || false,
            template: templateData.channels?.sms?.template || '',
          },
          whatsapp: {
            enabled: templateData.channels?.whatsapp?.enabled || false,
            template: templateData.channels?.whatsapp?.template || '',
          },
          weproChat: {
            enabled: templateData.channels?.weproChat?.enabled || false,
            template: templateData.channels?.weproChat?.template || '',
          },
        },
      })
    } catch (error: any) {
      console.error('Error fetching template data:', error)
      toast.error('Failed to load template data', {
        description:
          'Please try again or contact support if the issue persists.',
      })
      router.push('/settings/templates/invoice')
    } finally {
      setIsLoading(false)
    }
  }

  // Load sources and template data on component mount
  useEffect(() => {
    fetchSources()
    if (isEditMode) {
      fetchTemplateData()
    }
  }, [isEditMode, templateId])

  const handleInvalid = () => {
    setSubmitted(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    if (!tenantId) {
      toast.error('Tenant ID is required')
      return
    }

    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting')
      return
    }

    setIsSaving(true)

    try {
      // Prepare channels payload - only include enabled channels with their data
      const channelsPayload: any = {}

      Object.entries(formData.channels).forEach(
        ([channelName, channelData]) => {
          if (channelData.enabled) {
            channelsPayload[channelName] = channelData
          } else {
            channelsPayload[channelName] = { enabled: false }
          }
        }
      )

      const payload = {
        title: formData.title.trim(),
        templateSources: formData.templateSources,
        invoiceType: formData.invoiceType,
        sourceCodes:
          formData.templateSources === 'Specific'
            ? formData.sourceCodes
            : undefined,
        channels: channelsPayload,
        status: formData.status,
      }

      if (isEditMode) {
        // Update existing template
        await apiService.put(`/v1/templates/invoices/${templateId}`, payload)
        toast.success('Invoice template updated successfully!', {
          description: 'The template has been updated in the system.',
        })
      } else {
        // Create new template
        await apiService.post('/v1/templates/invoices', payload)
        toast.success('Invoice template created successfully!', {
          description: 'The new template has been added to the system.',
        })
      }

      // Redirect back to the templates list
      router.push('/settings/templates/invoice')
    } catch (error: any) {
      console.error(
        `Error ${isEditMode ? 'updating' : 'creating'} template:`,
        error
      )
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} template`, {
        description:
          error.response?.data?.message ||
          `An error occurred while ${isEditMode ? 'updating' : 'creating'} the template.`,
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Check permission for create/edit mode
  if (!checkPermission('MOD036', isEditMode ? 'edit' : 'create')) {
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
        <title>
          {isEditMode ? 'Edit Invoice Template' : 'Create Invoice Template'} -
          WePro
        </title>
        <meta
          name="description"
          content={
            isEditMode
              ? 'Edit existing invoice template'
              : 'Create new invoice template'
          }
        />
      </Head>

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/settings/templates/invoice')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoice Templates
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {isEditMode
                  ? 'Edit Invoice Template'
                  : 'Create New Invoice Template'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Status:
              </span>
              <Select
                value={formData.status}
                onValueChange={(value: 'Active' | 'Inactive') =>
                  handleInputChange('status', value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading State for Edit Mode */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600 mx-auto mb-4"></div>
              <p className="text-neutral-600 dark:text-neutral-400">
                Loading template data...
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        {!isLoading && (
          <form
            onSubmit={handleSubmit}
            onInvalid={handleInvalid}
            data-submitted={submitted}
            className="space-y-6"
          >
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Invoice Template Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter invoice template title"
                    value={formData.title}
                    onChange={e => {
                      handleInputChange('title', e.target.value)
                      clearFieldError('title')
                    }}
                    className={
                      submitted && validationErrors.title
                        ? 'border-red-500 focus:border-red-500 !focus-visible:ring-red-500'
                        : ''
                    }
                    required
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-red-500">
                      {validationErrors.title}
                    </p>
                  )}
                </div>

                {/* Invoice Type and Template Sources Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="invoiceType"
                      className="text-sm font-medium"
                    >
                      Invoice Type
                    </Label>
                    <Select
                      value={formData.invoiceType}
                      onValueChange={value =>
                        handleInputChange('invoiceType', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select invoice type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Invoice">Invoice</SelectItem>
                        <SelectItem value="Estimate">Estimate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="templateSources"
                      className="text-sm font-medium"
                    >
                      Template Sources
                    </Label>
                    <Select
                      value={formData.templateSources}
                      onValueChange={value => {
                        handleInputChange('templateSources', value)
                        clearFieldError('templateSources')
                      }}
                    >
                    <SelectTrigger
                      className={
                        submitted && validationErrors.templateSources
                          ? 'border-red-500 focus:border-red-500 !focus-visible:ring-red-500'
                          : ''
                      }
                    >
                        <SelectValue placeholder="Select template sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Specific">Specific</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.templateSources && (
                      <p className="text-sm text-red-500">
                        {validationErrors.templateSources}
                      </p>
                    )}
                  </div>
                </div>

                {/* Source Codes - Only show when Specific is selected */}
                {formData.templateSources === 'Specific' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Source Codes *
                    </Label>
                    <Popover
                      open={sourceCodesOpen}
                      onOpenChange={setSourceCodesOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={sourceCodesOpen}
                          className={`w-full justify-between ${
                            submitted && validationErrors.sourceCodes
                              ? 'border-red-500 !focus-visible:ring-red-500'
                              : ''
                          }`}
                        >
                          {formData.sourceCodes.length > 0
                            ? `${formData.sourceCodes.length} source(s) selected`
                            : 'Select source codes...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search source codes..." />
                          <CommandList>
                            <CommandEmpty>
                              {sourcesLoading
                                ? 'Loading sources...'
                                : 'No source codes found.'}
                            </CommandEmpty>
                            <CommandGroup>
                              {sources.map(source => (
                                <CommandItem
                                  key={source.id}
                                  value={source.code}
                                  onSelect={() =>
                                    handleSourceCodeToggle(source.code)
                                  }
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      formData.sourceCodes.includes(source.code)
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    }`}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {source.code}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {source.name}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {formData.sourceCodes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.sourceCodes.map(code => {
                          const source = sources.find(s => s.code === code)
                          return (
                            <Badge
                              key={code}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {source?.name || code}
                              <X
                                className="h-3 w-3 cursor-pointer hover:text-red-500"
                                onClick={() => {
                                  removeSourceCode(code)
                                  clearFieldError('sourceCodes')
                                }}
                              />
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                    {validationErrors.sourceCodes && (
                      <p className="text-sm text-red-500">
                        {validationErrors.sourceCodes}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Channels Validation Error */}
            {validationErrors.channels && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {validationErrors.channels}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Channel Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Channel
                  <div className="ml-auto">
                    <Switch
                      checked={formData.channels.email.enabled}
                      onCheckedChange={checked =>
                        handleChannelToggle('email', checked)
                      }
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              {formData.channels.email.enabled && (
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="fromEmail"
                        className="text-sm font-medium"
                      >
                        From Email
                      </Label>
                      <Input
                        id="fromEmail"
                        placeholder="dispatch@company.com"
                        value={formData.channels.email.fromEmail}
                        onChange={e =>
                          handleChannelChange(
                            'email',
                            'fromEmail',
                            e.target.value
                          )
                        }
                        className={
                          submitted && validationErrors.emailFromEmail
                            ? 'border-red-500 focus:border-red-500 !focus-visible:ring-red-500'
                            : ''
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fromName" className="text-sm font-medium">
                        From Name
                      </Label>
                      <Input
                        id="fromName"
                        placeholder="Dispatch Team"
                        value={formData.channels.email.fromName}
                        onChange={e =>
                          handleChannelChange(
                            'email',
                            'fromName',
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="replyTo" className="text-sm font-medium">
                      Reply To Email
                    </Label>
                    <Input
                      id="replyTo"
                      placeholder="support@company.com"
                      value={formData.channels.email.replyTo}
                      onChange={e =>
                        handleChannelChange('email', 'replyTo', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      placeholder="Invoice #{{invoiceNumber}} from {{companyName}}"
                      value={formData.channels.email.subject}
                      onChange={e =>
                        handleChannelChange('email', 'subject', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="emailTemplate"
                      className="text-sm font-medium"
                    >
                      Email Template
                    </Label>
                    <div
                      className={`${
                        submitted && validationErrors.emailTemplate
                          ? 'border border-red-500 rounded-md !focus-visible:ring-red-500 !ring-red-500 !focus-visible:ring-2'
                          : ''
                      }`}
                    >
                      <ReactQuill
                        theme="snow"
                        value={formData.channels.email.template}
                        onChange={value => {
                          handleChannelChange('email', 'template', value)
                          clearFieldError('emailTemplate')
                        }}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Enter email content. Use variables like {{invoiceNumber}}, {{customerName}}, {{total}}, etc."
                        style={{ minHeight: '200px' }}
                        className={`bg-white dark:bg-gray-800 ${
                          submitted && validationErrors.emailTemplate
                            ? 'border-red-500 !focus-visible:ring-red-500 !ring-red-500 !focus-visible:ring-2'
                            : ''
                        }`}
                      />
                    </div>
                    {validationErrors.emailTemplate && (
                      <p className="text-sm text-red-500">
                        {validationErrors.emailTemplate}
                      </p>
                    )}
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Use variables like {'{{invoiceNumber}}'},{' '}
                      {'{{customerName}}'}, {'{{total}}'}, {'{{dueDate}}'},{' '}
                      {'{{companyName}}'}, and {'{{invoiceLink}}'} that will be
                      replaced dynamically.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="attachPdf"
                      checked={formData.channels.email.attachPdf}
                      onCheckedChange={checked =>
                        handleChannelChange('email', 'attachPdf', checked)
                      }
                    />
                    <Label htmlFor="attachPdf" className="text-sm font-medium">
                      Attach PDF
                    </Label>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* SMS Channel Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  SMS Channel
                  <div className="ml-auto">
                    <Switch
                      checked={formData.channels.sms.enabled}
                      onCheckedChange={checked =>
                        handleChannelToggle('sms', checked)
                      }
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              {formData.channels.sms.enabled && (
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="smsTemplate"
                        className="text-sm font-medium"
                      >
                        SMS Template
                      </Label>
                      <div className="flex items-center gap-4 text-sm">
                        {(() => {
                          const smsInfo = calculateSMSSegments(
                            formData.channels.sms.template
                          )
                          const charCount =
                            formData.channels.sms.template.length
                          const isNearLimit = charCount > 1400
                          const isOverLimit = charCount > 1600

                          return (
                            <>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4 text-neutral-500" />
                                <span
                                  className={`font-medium text-neutral-600 dark:text-neutral-400`}
                                >
                                  {smsInfo.segments} segment
                                  {smsInfo.segments !== 1 ? 's' : ''}
                                  {smsInfo.isUnicode && ' (Unicode)'}
                                </span>
                              </div>
                              <span
                                className={`font-medium ${
                                  isOverLimit
                                    ? 'text-red-500'
                                    : isNearLimit
                                      ? 'text-yellow-600 dark:text-yellow-400'
                                      : 'text-neutral-500 dark:text-neutral-400'
                                }`}
                              >
                                {charCount}/1600 characters
                              </span>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                    <Textarea
                      id="smsTemplate"
                      placeholder="Enter SMS content. Use variables like {{invoiceNumber}}, {{customerName}}, etc."
                      value={formData.channels.sms.template}
                      onChange={e => {
                        handleChannelChange('sms', 'template', e.target.value)
                        clearFieldError('smsTemplate')
                      }}
                      className={`min-h-[120px] ${
                        submitted && validationErrors.smsTemplate
                          ? 'border-red-500 focus:border-red-500 !focus-visible:ring-red-500'
                          : ''
                      }`}
                    />
                    {validationErrors.smsTemplate && (
                      <p className="text-sm text-red-500">
                        {validationErrors.smsTemplate}
                      </p>
                    )}
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Use variables like {'{{invoiceNumber}}'},{' '}
                      {'{{customerName}}'}, {'{{total}}'}, {'{{dueDate}}'},{' '}
                      {'{{companyName}}'}, and {'{{invoiceLink}}'} that will be
                      replaced dynamically.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* WhatsApp Channel Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  WhatsApp Channel
                  <div className="ml-auto">
                    <Switch
                      checked={formData.channels.whatsapp.enabled}
                      onCheckedChange={checked =>
                        handleChannelToggle('whatsapp', checked)
                      }
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              {formData.channels.whatsapp.enabled && (
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="whatsappTemplate"
                        className="text-sm font-medium"
                      >
                        WhatsApp Template
                      </Label>
                      <div className="flex items-center gap-4 text-sm">
                        {(() => {
                          const charCount =
                            formData.channels.whatsapp.template.length
                          const isNearLimit = charCount > 3600
                          const isOverLimit = charCount > 4096

                          return (
                            <span
                              className={`font-medium ${
                                isOverLimit
                                  ? 'text-red-500'
                                  : isNearLimit
                                    ? 'text-yellow-600 dark:text-yellow-400'
                                    : 'text-neutral-500 dark:text-neutral-400'
                              }`}
                            >
                              {charCount}/4096 characters
                            </span>
                          )
                        })()}
                      </div>
                    </div>
                    <Textarea
                      id="whatsappTemplate"
                      placeholder="Enter WhatsApp content. Use variables like {{invoiceNumber}}, {{customerName}}, etc."
                      value={formData.channels.whatsapp.template}
                      onChange={e => {
                        handleChannelChange(
                          'whatsapp',
                          'template',
                          e.target.value
                        )
                        clearFieldError('whatsappTemplate')
                      }}
                      className={`min-h-[120px] ${
                        submitted && validationErrors.whatsappTemplate
                          ? 'border-red-500 focus:border-red-500 !focus-visible:ring-red-500'
                          : ''
                      }`}
                    />
                    {validationErrors.whatsappTemplate && (
                      <p className="text-sm text-red-500">
                        {validationErrors.whatsappTemplate}
                      </p>
                    )}
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Use variables like {'{{invoiceNumber}}'},{' '}
                      {'{{customerName}}'}, {'{{total}}'}, {'{{dueDate}}'},{' '}
                      {'{{companyName}}'}, and {'{{invoiceLink}}'} that will be
                      replaced dynamically.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* WePro Chat Channel Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  WePro Chat Channel
                  <div className="ml-auto">
                    <Switch
                      checked={formData.channels.weproChat.enabled}
                      onCheckedChange={checked =>
                        handleChannelToggle('weproChat', checked)
                      }
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              {formData.channels.weproChat.enabled && (
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="weproChatTemplate"
                      className="text-sm font-medium"
                    >
                      WePro Chat Template
                    </Label>
                    <div
                      className={`${
                        submitted && validationErrors.weproChatTemplate
                          ? 'border border-red-500 rounded-md !focus-visible:ring-red-500 !ring-red-500 !focus-visible:ring-2'
                          : ''
                      }`}
                    >
                      <ReactQuill
                        theme="snow"
                        value={formData.channels.weproChat.template}
                        onChange={value => {
                          handleChannelChange('weproChat', 'template', value)
                          clearFieldError('weproChatTemplate')
                        }}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Enter WePro Chat content. Use variables like {{invoiceNumber}}, {{customerName}}, {{total}}, etc."
                        style={{ minHeight: '200px' }}
                        className={`bg-white dark:bg-gray-800 ${
                          submitted && validationErrors.weproChatTemplate
                            ? 'border-red-500 !focus-visible:ring-red-500 !ring-red-500 !focus-visible:ring-2'
                            : ''
                        }`}
                      />
                    </div>
                    {validationErrors.weproChatTemplate && (
                      <p className="text-sm text-red-500">
                        {validationErrors.weproChatTemplate}
                      </p>
                    )}
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Use variables like {'{{invoiceNumber}}'},{' '}
                      {'{{customerName}}'}, {'{{total}}'}, {'{{dueDate}}'},{' '}
                      {'{{companyName}}'}, and {'{{invoiceLink}}'} that will be
                      replaced dynamically.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/settings/templates/invoice')}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isSaving || !tenantId || isLoading}
              >
                {isSaving ? (
                  <ButtonLoading
                    message={isEditMode ? 'Updating...' : 'Creating...'}
                  />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditMode ? 'Update Template' : 'Create Template'}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
