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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import {
  ArrowLeft,
  Phone,
  Eye,
  Tag,
  AlertCircle,
  Play,
  FileText,
  Shield,
} from 'lucide-react'
import { usePermissions } from '@/src/hooks/usePermissions'
import { toast } from 'sonner'

// Interface for Voice Template data
interface VoiceTemplate {
  _id: string
  title: string
  voiceType: string
  content?: string
  audioUrl?: string
  audioFormat?: string
  audioDuration?: number
  status: string
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
  variables: string[]
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

export default function VoiceTemplatePreviewPage(): React.JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const { checkPermission, getUserType, userData } = usePermissions()
  const tenantId = userData?.tenantId

  const [template, setTemplate] = useState<VoiceTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  )
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

        const response = await apiService.get(`/v3/templates/voice/${id}`)

        let templateData
        if (response.data.success !== undefined) {
          templateData = response.data.data
        } else {
          templateData = response.data
        }

        if (templateData) {
          setTemplate(templateData)
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
    router.push('/settings/templates/voice')
  }

  const handleEdit = () => {
    if (template) {
      router.push(`/settings/templates/voice/create?id=${template._id}`)
    }
  }

  // Function to replace variables in template content
  const getProcessedTemplate = () => {
    if (!template?.content) return ''

    let processedTemplate = template.content

    // Replace each variable with its value or keep the original variable name if no value provided
    Object.entries(variableValues).forEach(([variable, value]) => {
      const variablePattern = new RegExp(`{{${variable}}}`, 'g')
      processedTemplate = processedTemplate.replace(
        variablePattern,
        value || `{{${variable}}}`
      )
    })

    return processedTemplate
  }

  // Handle variable input changes
  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variable]: value,
    }))
  }

  // Function to clean HTML tags from variable names
  const cleanVariableName = (variable: string) => {
    return variable.replace(/<[^>]*>/g, '').trim()
  }

  // Generate preview by calling API
  const handleGeneratePreview = async () => {
    if (!template || !id || typeof id !== 'string') return

    try {
      setPreviewLoading(true)
      setError(null)

      const response = await apiService.post(
        `/v3/templates/voice/text-to-speech/${id}/preview`,
        {
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

  if (!checkPermission('MOD031', 'view')) {
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
          <title>Loading Voice Template Preview - WePro</title>
        </Head>
        <div className="p-6">
          <Loading message="Loading voice template details..." />
        </div>
      </>
    )
  }

  if (error || !template) {
    return (
      <>
        <Head>
          <title>Error - Voice Template Preview - WePro</title>
        </Head>
        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Voice Templates
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                {error || 'Template not found'}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {error || 'The requested voice template could not be found.'}
              </p>
              <Button onClick={handleBack} variant="outline">
                Back to Voice Templates
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{template.title} - Voice Template Preview - WePro</title>
        <meta
          name="description"
          content={`Preview voice template: ${template.title}`}
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
            Back to Voice Templates
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Voice Template Preview
              </h1>
            </div>
            <Button
              onClick={handleEdit}
              className="wepro-button-gradient text-white flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
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
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      Voice
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
                    Template Type:
                  </span>
                  <div className="text-neutral-900 dark:text-neutral-100">
                    Voice Template
                  </div>
                </div>
                <div>
                  <span className="font-medium text-neutral-600 dark:text-neutral-400">
                    Variables:
                  </span>
                  <div className="text-neutral-900 dark:text-neutral-100">
                    {template.variables?.length || 0} variable
                    {(template.variables?.length || 0) !== 1 ? 's' : ''}
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

              {/* Template Content */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Template Content
                </h3>

                <Card>
                  <CardContent className="space-y-4 pt-6">
                    {/* Variables Section */}
                    {template.variables && template.variables.length > 0 && (
                      <div>
                        <h4 className="text-md font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Template Variables
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {template.variables.map((variable, index) => {
                            const cleanName = cleanVariableName(variable)
                            return (
                              <div key={index} className="space-y-2">
                                <Label
                                  htmlFor={`variable-${index}`}
                                  className="text-sm font-medium"
                                >
                                  {cleanName}
                                </Label>
                                <Input
                                  id={`variable-${index}`}
                                  type="text"
                                  placeholder={`Enter value for ${cleanName}`}
                                  value={variableValues[variable] || ''}
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
                          })}
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
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Modal */}
        <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Template Preview - {template?.title}
              </DialogTitle>
            </DialogHeader>

            {previewData ? (
              <div className="space-y-6">
                {/* Voice Statistics */}
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {previewData.wordCount || 0} words
                      </span>
                    </div>
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {previewData.estimatedSpeakingTime || 0}s estimated
                      speaking time
                    </div>
                  </div>
                </div>

                {/* Template Content Preview */}
                <div>
                  <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                    <div className="p-6">
                      {previewData.preview ? (
                        <div className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200 text-base leading-relaxed">
                          {previewData.preview}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Phone className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                          <p className="text-neutral-500 dark:text-neutral-400 italic">
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
