import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { apiService } from '@/src/services/api'
import { sourcesService } from '@/src/services/sourcesService'
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
  Briefcase,
  Shield,
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
import { Badge } from '@/src/components/ui/badge'
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
import { usePermissions } from '@/src/hooks/usePermissions'
import dynamic from 'next/dynamic'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface ExternalJobTemplateFormData {
  title: string
  templateSources: 'All' | 'Specific'
  sourceCodes: string[]
  template: string
  status: 'Active' | 'Inactive'
}

interface Source {
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
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

export default function CreateExternalJobTemplatePage(): React.JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const { checkPermission, getUserType, userData } = usePermissions()
  const tenantId = userData?.tenantId

  // Check if we're editing (id exists in URL)
  const isEditing = Boolean(id)

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

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [sources, setSources] = useState<Source[]>([])
  const [sourcesLoading, setSourcesLoading] = useState(false)
  const [sourceCodesOpen, setSourceCodesOpen] = useState(false)
  const [formData, setFormData] = useState<ExternalJobTemplateFormData>({
    title: '',
    templateSources: 'All',
    sourceCodes: [],
    template: '',
    status: 'Active',
  })

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    title?: string
    template?: string
  }>({})

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

  const handleInputChange = (
    field: keyof ExternalJobTemplateFormData,
    value: string | string[]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear validation error when user starts typing
    if (field === 'title' || field === 'template') {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleTemplateChange = (value: string) => {
    handleInputChange('template', value)
  }

  // Fetch sources from API
  useEffect(() => {
    const fetchSources = async () => {
      setSourcesLoading(true)
      try {
        const response = await sourcesService.getSources({ limit: 1000 })
        setSources(response.data || [])
      } catch (error) {
        console.error('Error fetching sources:', error)
        toast.error('Failed to load sources')
      } finally {
        setSourcesLoading(false)
      }
    }

    fetchSources()
  }, [])

  // Load template data if editing
  useEffect(() => {
    const loadData = async () => {
      if (isEditing && id && typeof id === 'string') {
        setIsLoading(true)
        try {
          const response = await apiService.get(
            `/v1/templates/external-jobs/${id}`
          )

          let templateData
          if (response.data.success !== undefined) {
            templateData = response.data.data
          } else {
            templateData = response.data
          }

          if (templateData) {
            console.log('Loading template data:', templateData)

            const formDataToSet = {
              title: templateData.title || '',
              templateSources: templateData.templateSources || 'All',
              sourceCodes: templateData.sourceCodes || [],
              template: templateData.template || '',
              status:
                templateData.status === 'Active' ||
                templateData.status === 'Inactive'
                  ? templateData.status
                  : 'Active',
            }

            console.log('Setting form data:', formDataToSet)
            setFormData(formDataToSet)
          }
        } catch (error: any) {
          console.error('Error loading template data:', error)
          toast.error('Failed to load template data', {
            description:
              'Please try again or contact support if the issue persists.',
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadData()
  }, [id, isEditing])

  const validateForm = () => {
    const errors: { title?: string; template?: string } = {}

    // Validate title
    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    } else if (formData.title.length > 200) {
      errors.title = 'Title must be 200 characters or less'
    }

    // Validate template
    if (!formData.template.trim()) {
      errors.template = 'Template content is required'
    } else if (formData.template.length > 50000) {
      errors.template = 'Template must be 50,000 characters or less'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tenantId) {
      toast.error('Tenant ID is required')
      return
    }

    // Validate form
    if (!validateForm()) {
      return
    }

    if (
      formData.templateSources === 'Specific' &&
      formData.sourceCodes.length === 0
    ) {
      toast.error(
        'Please select at least one source when using Specific template sources'
      )
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        title: formData.title.trim(),
        templateSources: formData.templateSources,
        sourceCodes:
          formData.templateSources === 'All' ? [] : formData.sourceCodes,
        template: formData.template.trim(),
        status: formData.status,
      }

      if (isEditing && id) {
        // Update existing template
        await apiService.put(`/v1/templates/external-jobs/${id}`, payload)
        toast.success('External job template updated successfully!', {
          description: 'The template has been updated in the system.',
        })
      } else {
        // Create new template
        await apiService.post('/v1/templates/external-jobs', payload)
        toast.success('External job template created successfully!', {
          description: 'The new template has been added to the system.',
        })
      }

      // Redirect back to the templates list
      router.push('/settings/templates/external-jobs')
    } catch (error: any) {
      console.error('Error saving template:', error)
      toast.error(
        isEditing ? 'Failed to update template' : 'Failed to create template',
        {
          description:
            error.response?.data?.message ||
            'An error occurred while saving the template.',
        }
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleSourceCodeToggle = (sourceCode: string) => {
    setFormData(prev => ({
      ...prev,
      sourceCodes: prev.sourceCodes.includes(sourceCode)
        ? prev.sourceCodes.filter(code => code !== sourceCode)
        : [...prev.sourceCodes, sourceCode],
    }))
  }

  const removeSourceCode = (sourceCode: string) => {
    setFormData(prev => ({
      ...prev,
      sourceCodes: prev.sourceCodes.filter(code => code !== sourceCode),
    }))
  }

  // Check permission for create mode
  if (!isEditing && !checkPermission('MOD038', 'create')) {
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

  // Check permission for edit mode
  if (isEditing && !checkPermission('MOD038', 'edit')) {
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

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <Head>
        <title>
          {isEditing
            ? 'Edit External Job Template'
            : 'Create External Job Template'}{' '}
          - WePro
        </title>
        <meta
          name="description"
          content={
            isEditing
              ? 'Edit external job template'
              : 'Create new external job template'
          }
        />
      </Head>

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/settings/templates/external-jobs')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to External Job Templates
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {isEditing
                  ? 'Edit External Job Template'
                  : 'Create New External Job Template'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                External Job Template Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title *
                  </Label>
                  <span
                    className={`text-xs ${formData.title.length > 200 ? 'text-red-500' : 'text-neutral-500 dark:text-neutral-400'}`}
                  >
                    {formData.title.length}/200
                  </span>
                </div>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter template title"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  required
                  className={
                    validationErrors.title
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-500">
                    {validationErrors.title}
                  </p>
                )}
              </div>

              {/* Template Sources */}
              <div className="space-y-2">
                <Label
                  htmlFor="templateSources"
                  className="text-sm font-medium"
                >
                  Template Sources
                </Label>
                <Select
                  value={formData.templateSources}
                  onValueChange={(value: 'All' | 'Specific') => {
                    handleInputChange('templateSources', value)
                    if (value === 'All') {
                      handleInputChange('sourceCodes', [])
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Sources</SelectItem>
                    <SelectItem value="Specific">Specific Sources</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Source Codes - Only show when Specific is selected */}
              {formData.templateSources === 'Specific' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Source Codes *</Label>
                  <Popover
                    open={sourceCodesOpen}
                    onOpenChange={setSourceCodesOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={sourceCodesOpen}
                        className="w-full justify-between"
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
                                key={source._id}
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
                              onClick={() => removeSourceCode(code)}
                            />
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Template Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="template" className="text-sm font-medium">
                    Template Content *
                  </Label>
                  <span
                    className={`text-xs ${formData.template.length > 50000 ? 'text-red-500' : 'text-neutral-500 dark:text-neutral-400'}`}
                  >
                    {formData.template.length.toLocaleString()}/50,000
                  </span>
                </div>
                <div>
                  <ReactQuill
                    theme="snow"
                    value={formData.template}
                    onChange={handleTemplateChange}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Enter template content. Use variables like {{sourceName}}, {{sourceJobId}}, {{customerName}}, etc."
                    style={{ minHeight: '200px' }}
                    className={`bg-white dark:bg-gray-800 ${validationErrors.template ? 'border-red-500' : ''}`}
                  />
                </div>
                {validationErrors.template && (
                  <p className="text-sm text-red-500">
                    {validationErrors.template}
                  </p>
                )}
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Use variables like {'{{sourceName}}'}, {'{{sourceJobId}}'},{' '}
                  {'{{customerName}}'}, {'{{customerPhone}}'},{' '}
                  {'{{customerAddress}}'}, {'{{serviceType}}'},{' '}
                  {'{{jobDescription}}'}, {'{{requestedDate}}'},{' '}
                  {'{{requestedTime}}'}, {'{{estimatedValue}}'}, and{' '}
                  {'{{sourceUrl}}'} that will be replaced dynamically.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/settings/templates/external-jobs')}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isSaving || !tenantId}
            >
              {isSaving ? (
                <ButtonLoading
                  message={isEditing ? 'Updating...' : 'Creating...'}
                />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Template' : 'Create Template'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
