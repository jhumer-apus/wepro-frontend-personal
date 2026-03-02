import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { apiService } from '@/src/services/api'
import { Loading } from '@/src/components/ui/loading'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/src/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Smartphone,
  MessageCircle,
  Eye,
  Code,
  Tag,
  AlertCircle,
  Settings,
  Play,
  FileText,
} from 'lucide-react'
import { usePermissions } from '@/src/hooks/usePermissions'
import { toast } from 'sonner'

// Interface for Invoice Template data
interface InvoiceTemplate {
  _id: string
  title: string
  templateSources: string
  sourceCodes: string[]
  status: string
  tenantId: string
  byTenantId: string
  createdBy: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  updatedAt: string
  code: string
  enabledChannels: string[]
  invoiceType: string // Additional field for invoice templates
  channels: {
    email?: {
      enabled: boolean
      fromEmail: string
      fromName: string
      replyTo: string
      subject: string
      template: string
      attachPdf: boolean
    }
    sms?: {
      enabled: boolean
      template: string
    }
    whatsapp?: {
      enabled: boolean
      template: string
    }
    weproChat?: {
      enabled: boolean
      template: string
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

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case 'email':
      return <Mail className="w-4 h-4" />
    case 'sms':
      return <MessageSquare className="w-4 h-4" />
    case 'whatsapp':
      return <MessageCircle className="w-4 h-4" />
    case 'weproChat':
      return <Settings className="w-4 h-4" />
    default:
      return <MessageSquare className="w-4 h-4" />
  }
}

const getChannelName = (channel: string) => {
  switch (channel) {
    case 'email':
      return 'Email'
    case 'sms':
      return 'SMS'
    case 'whatsapp':
      return 'WhatsApp'
    case 'weproChat':
      return 'WePro Chat'
    default:
      return channel
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Invalid Date'
  }
}

export default function InvoiceTemplatePreviewPage(): React.JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const { checkPermission, getUserType, userData } = usePermissions()
  const tenantId = userData?.tenantId

  const [template, setTemplate] = useState<InvoiceTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  )
  const [activeChannel, setActiveChannel] = useState<string>('')
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Load template data
  useEffect(() => {
    const loadTemplate = async () => {
      if (!id || typeof id !== 'string') {
        setError('Invalid template ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await apiService.get(`/v3/templates/invoices/${id}`)

        let templateData
        if (response.data.success !== undefined) {
          templateData = response.data.data
        } else {
          templateData = response.data
        }

        if (templateData) {
          setTemplate(templateData)
          // Set initial active channel
          if (
            templateData.enabledChannels &&
            templateData.enabledChannels.length > 0
          ) {
            setActiveChannel(templateData.enabledChannels[0])
          }
        } else {
          setError('Template not found')
        }
      } catch (err: any) {
        console.error('Error loading template:', err)
        setError(err.response?.data?.message || 'Failed to load template')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadTemplate()
    }
  }, [id])

  const handleBack = () => {
    router.push('/settings/templates/invoice')
  }

  const handleEdit = () => {
    if (template) {
      router.push(`/settings/templates/invoice/create?id=${template._id}`)
    }
  }

  // Function to replace variables in any text content (including HTML from React Quill)
  const replaceVariables = (text: string) => {
    if (!text) return ''

    let processedText = text

    // Replace each variable with its value or keep the original variable name if no value provided
    Object.entries(variableValues).forEach(([variable, value]) => {
      // Escape special regex characters in the variable name
      const escapedVariable = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

      // Create a regex that matches the variable even when wrapped in HTML tags
      // This handles React Quill's HTML output where variables might be in <p>, <span>, etc.
      const variablePattern = new RegExp(`\\{\\{${escapedVariable}\\}\\}`, 'g')
      processedText = processedText.replace(
        variablePattern,
        value || `{{${variable}}}`
      )
    })

    return processedText
  }

  // Function to clean HTML tags from variable names
  const cleanVariableName = (variable: string) => {
    return variable.replace(/<[^>]*>/g, '').trim()
  }

  // Extract variables from template content
  const extractVariables = (content: string) => {
    if (!content) return []
    const matches = content.match(/\{\{([^}]+)\}\}/g)
    if (!matches) return []

    const variables = matches.map(match => {
      const variable = match.replace(/\{\{|\}\}/g, '')
      return cleanVariableName(variable)
    })

    return Array.from(new Set(variables)) // Remove duplicates
  }

  // Get variables for a specific channel
  const getChannelVariables = (channel: string) => {
    if (!template) return []

    const channelData =
      template.channels[channel as keyof typeof template.channels]
    if (!channelData || !channelData.enabled) return []

    const allVariables = new Set<string>()

    // Extract variables from template content
    const templateVariables = extractVariables(channelData.template || '')
    templateVariables.forEach(variable => allVariables.add(variable))

    // For email channel, also extract variables from subject, fromName, fromEmail, replyTo
    if (channel === 'email' && 'subject' in channelData) {
      const emailFields = ['subject', 'fromName', 'fromEmail', 'replyTo']
      emailFields.forEach(field => {
        if (
          field in channelData &&
          channelData[field as keyof typeof channelData]
        ) {
          const fieldVariables = extractVariables(
            channelData[field as keyof typeof channelData] as string
          )
          fieldVariables.forEach(variable => allVariables.add(variable))
        }
      })
    }

    return Array.from(allVariables)
  }

  // Get all variables from all enabled channels (keeping for backward compatibility)
  const getAllVariables = () => {
    if (!template) return []

    const allVariables = new Set<string>()

    Object.values(template.channels).forEach(channel => {
      if (channel && channel.enabled) {
        const variables = extractVariables(channel.template || '')
        variables.forEach(variable => allVariables.add(variable))
      }
    })

    return Array.from(allVariables)
  }

  // Handle variable input changes
  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variable]: value,
    }))
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveChannel(value)
  }

  // Process subject with variables (fallback if API doesn't replace them)
  const processSubjectWithVariables = (subject: string) => {
    if (!subject) return subject

    let processedSubject = subject

    // Replace each variable with its value
    Object.entries(variableValues).forEach(([variable, value]) => {
      const variablePattern = new RegExp(`\\{\\{${variable}\\}\\}`, 'g')
      processedSubject = processedSubject.replace(
        variablePattern,
        value || `{{${variable}}}`
      )
    })

    return processedSubject
  }

  // Generate preview by calling API
  const handleGeneratePreview = async () => {
    if (!template || !id || typeof id !== 'string') return

    try {
      setPreviewLoading(true)
      setError(null)

      const response = await apiService.post(
        `/v3/templates/invoices/${id}/preview`,
        {
          channel: activeChannel,
          sampleData: variableValues,
        }
      )

      if (response.data.success) {
        setPreviewData(response.data.data)
        setIsPreviewModalOpen(true)
      } else {
        setError('Failed to generate preview')
      }
    } catch (err: any) {
      console.error('Error generating preview:', err)
      setError(err.response?.data?.message || 'Failed to generate preview')
    } finally {
      setPreviewLoading(false)
    }
  }

  if (!checkPermission('MOD036', 'view')) {
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

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Invoice Template Preview - WePro</title>
        </Head>
        <div className="p-6">
          <Loading message="Loading invoice template details..." />
        </div>
      </>
    )
  }

  if (error || !template) {
    return (
      <>
        <Head>
          <title>Error - Invoice Template Preview - WePro</title>
        </Head>
        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Invoice Templates
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {error || 'Template not found'}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {error || 'The requested invoice template could not be found.'}
              </p>
              <Button onClick={handleBack} variant="outline">
                Back to Invoice Templates
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  const allVariables = getAllVariables()

  return (
    <>
      <Head>
        <title>{template.title} - Invoice Template Preview - WePro</title>
        <meta
          name="description"
          content={`Preview invoice template: ${template.title}`}
        />
      </Head>
      <div className="p-6">
        {/* Back Button and Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
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
                Invoice Template Preview
              </h1>
            </div>
            <Button
              onClick={handleEdit}
              className="wepro-button-gradient text-white flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Edit Template
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Template Information */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {template.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusBadgeColor(template.status)}>
                      {template.status}
                    </Badge>
                    <Badge variant="outline" className="font-mono">
                      {template.code}
                    </Badge>
                    <Badge variant="outline">{template.templateSources}</Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      {template.invoiceType}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-neutral-600 dark:text-neutral-400">
                    Template Sources:
                  </span>
                  <div className="text-neutral-900 dark:text-neutral-100">
                    {template.templateSources}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-neutral-600 dark:text-neutral-400">
                    Source Codes:
                  </span>
                  <div className="text-neutral-900 dark:text-neutral-100">
                    {template.sourceCodes?.join(', ') || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-neutral-600 dark:text-neutral-400">
                    Invoice Type:
                  </span>
                  <div className="text-neutral-900 dark:text-neutral-100">
                    {template.invoiceType}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-neutral-600 dark:text-neutral-400">
                    Created:
                  </span>
                  <div className="text-neutral-900 dark:text-neutral-100">
                    {formatDate(template.createdAt)}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-neutral-600 dark:text-neutral-400">
                    Updated:
                  </span>
                  <div className="text-neutral-900 dark:text-neutral-100">
                    {formatDate(template.updatedAt)}
                  </div>
                </div>
              </div>

              {/* Channel Templates */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Channel Templates
                </h3>

                <Tabs
                  value={activeChannel}
                  onValueChange={handleTabChange}
                  defaultValue={template.enabledChannels[0] || 'email'}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-4">
                    {template.enabledChannels.map(channel => (
                      <TabsTrigger
                        key={channel}
                        value={channel}
                        className="flex items-center gap-2"
                      >
                        {getChannelIcon(channel)}
                        {getChannelName(channel)}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {template.enabledChannels.map(channel => {
                    const channelData =
                      template.channels[
                        channel as keyof typeof template.channels
                      ]
                    if (!channelData || !channelData.enabled) return null

                    return (
                      <TabsContent
                        key={channel}
                        value={channel}
                        className="mt-4"
                      >
                        <Card>
                          <CardContent className="space-y-4 pt-6">
                            {/* Variables Section for this channel */}
                            {(() => {
                              const channelVariables =
                                getChannelVariables(channel)
                              return (
                                channelVariables.length > 0 && (
                                  <div>
                                    <h4 className="text-md font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                                      <Tag className="w-4 h-4" />
                                      Template Variables
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {channelVariables.map(
                                        (variable, index) => (
                                          <div
                                            key={index}
                                            className="space-y-2"
                                          >
                                            <Label
                                              htmlFor={`${channel}-variable-${index}`}
                                              className="text-sm font-medium"
                                            >
                                              {variable}
                                            </Label>
                                            <Input
                                              id={`${channel}-variable-${index}`}
                                              type="text"
                                              placeholder={`Enter value for ${variable}`}
                                              value={
                                                variableValues[variable] || ''
                                              }
                                              onChange={e =>
                                                handleVariableChange(
                                                  variable,
                                                  e.target.value
                                                )
                                              }
                                              className="w-full"
                                            />
                                          </div>
                                        )
                                      )}
                                    </div>
                                    <div className="flex justify-end mt-4">
                                      <Button
                                        onClick={handleGeneratePreview}
                                        disabled={previewLoading}
                                        className="wepro-button-gradient text-white flex items-center gap-2"
                                      >
                                        <Play className="w-4 h-4" />
                                        {previewLoading
                                          ? 'Generating...'
                                          : 'Generate Preview'}
                                      </Button>
                                    </div>
                                  </div>
                                )
                              )
                            })()}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    )
                  })}
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Modal */}
        <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Template Preview - {template && getChannelName(activeChannel)}
              </DialogTitle>
            </DialogHeader>

            {previewData ? (
              <div className="space-y-6">
                {/* Email specific fields */}
                {activeChannel === 'email' && previewData.fromEmail && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <div>
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">
                        From:
                      </span>
                      <div className="text-neutral-900 dark:text-neutral-100">
                        {previewData.fromName} &lt;{previewData.fromEmail}&gt;
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">
                        Reply To:
                      </span>
                      <div className="text-neutral-900 dark:text-neutral-100">
                        {previewData.replyTo || 'N/A'}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">
                        Subject:
                      </span>
                      <div className="text-neutral-900 dark:text-neutral-100">
                        {processSubjectWithVariables(previewData.subject)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Template Content Preview */}
                <div>
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Template Content
                  </h4>
                  <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                    <div className="p-6">
                      {previewData.preview ? (
                        <div
                          className="prose prose-sm max-w-none text-neutral-800 dark:text-neutral-200"
                          dangerouslySetInnerHTML={{
                            __html: previewData.preview,
                          }}
                        />
                      ) : (
                        <div className="text-center py-8">
                          {getChannelIcon(activeChannel)}
                          <p className="text-neutral-500 dark:text-neutral-400 italic mt-2">
                            No preview content available
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-neutral-500 dark:text-neutral-400">
                  {previewLoading
                    ? 'Generating preview...'
                    : 'No preview data available'}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
