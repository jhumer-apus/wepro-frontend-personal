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
  FileText,
  Check,
  ChevronsUpDown,
  X,
  Shield,
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

interface FormData {
  title: string
  sourceCodes: string[]
  script: string
  scriptType: string
  status: string
  isActive: boolean
}

interface Source {
  id: string
  code: string
  name: string
}

interface ValidationErrors {
  title?: string
  sourceCodes?: string
  script?: string
  scriptType?: string
}

export default function CreateScriptPage(): React.JSX.Element {
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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [sources, setSources] = useState<Source[]>([])
  const [sourcesLoading, setSourcesLoading] = useState(false)
  const [sourceCodesOpen, setSourceCodesOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    sourceCodes: [],
    script: '',
    scriptType: 'Call',
    status: 'Active',
    isActive: true,
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

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | string[]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear validation error when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined,
      }))
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

  // Fetch sources from API
  const fetchSources = async () => {
    setSourcesLoading(true)
    try {
      const response = await apiService.get(
        '/v3/sources?page=1&limit=50&sort=-createdAt'
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

  // Load sources and script data
  useEffect(() => {
    const loadData = async () => {
      // Always fetch sources
      await fetchSources()

      // Load script data if editing
      if (isEditing && id && typeof id === 'string') {
        setIsLoading(true)
        try {
          const response = await apiService.get(
            `/v3/knowledge-hub/scripts/${id}`
          )

          let scriptData
          if (response.data.success !== undefined) {
            scriptData = response.data.data
          } else {
            scriptData = response.data
          }

          if (scriptData) {
            console.log('Loading script data:', scriptData)

            const formDataToSet = {
              title: scriptData.title || '',
              sourceCodes: scriptData.sourceCodes || [],
              script: scriptData.script || '',
              scriptType: scriptData.scriptType || 'Call',
              status: scriptData.status || 'Active',
              isActive:
                scriptData.status === 'Active' || scriptData.isActive === true,
            }

            console.log('Setting form data:', formDataToSet)
            setFormData(formDataToSet)
          }
        } catch (error: any) {
          console.error('Error loading script data:', error)
          toast.error('Failed to load script data', {
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

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // Validate title
    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }

    // Validate source codes
    if (formData.sourceCodes.length === 0) {
      errors.sourceCodes = 'At least one source code is required'
    }

    // Validate script content
    if (!formData.script.trim()) {
      errors.script = 'Script content is required'
    }

    // Validate script type
    if (!formData.scriptType.trim()) {
      errors.scriptType = 'Script type is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting')
      return
    }

    if (!tenantId) {
      toast.error('Tenant ID is required')
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        title: formData.title.trim(),
        sourceCodes: formData.sourceCodes,
        script: formData.script.trim(),
        status: formData.isActive ? 'Active' : 'Inactive',
        scriptType: formData.scriptType,
      }

      if (isEditing && id) {
        // Update existing script
        await apiService.put(`/v3/knowledge-hub/scripts/${id}`, payload)
        toast.success('Script updated successfully!', {
          description: 'The script has been updated in the system.',
        })
      } else {
        // Create new script
        await apiService.post('/v3/knowledge-hub/scripts', payload)
        toast.success('Script created successfully!', {
          description: 'The new script has been added to the system.',
        })
      }

      // Redirect back to the scripts list
      router.push('/settings/knowledgeHub/scripts')
    } catch (error: any) {
      console.error('Error saving script:', error)
      toast.error(
        isEditing ? 'Failed to update script' : 'Failed to create script',
        {
          description:
            error.response?.data?.message ||
            'An error occurred while saving the script.',
        }
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Check permission for create mode
  if (!isEditing && !checkPermission('MOD031', 'create')) {
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
  if (isEditing && !checkPermission('MOD031', 'edit')) {
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
        <title>{isEditing ? 'Edit Script' : 'Create Script'} - WePro</title>
        <meta
          name="description"
          content={
            isEditing
              ? 'Edit knowledge hub script'
              : 'Create new knowledge hub script'
          }
        />
      </Head>

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/settings/knowledgeHub/scripts')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Scripts
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {isEditing ? 'Edit Script' : 'Create New Script'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Status:
              </span>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={checked =>
                  handleInputChange('isActive', checked)
                }
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
              />
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {formData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Script Information
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
                  placeholder="Enter script title"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  className={validationErrors.title ? 'border-red-500' : ''}
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-500">
                    {validationErrors.title}
                  </p>
                )}
              </div>

              {/* Source Codes */}
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
                      className={`w-full justify-between ${validationErrors.sourceCodes ? 'border-red-500' : ''}`}
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
                            onClick={() => removeSourceCode(code)}
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

              {/* Script Type */}
              <div className="space-y-2">
                <Label htmlFor="scriptType" className="text-sm font-medium">
                  Script Type *
                </Label>
                <Select
                  value={formData.scriptType}
                  onValueChange={value =>
                    handleInputChange('scriptType', value)
                  }
                >
                  <SelectTrigger
                    className={
                      validationErrors.scriptType ? 'border-red-500' : ''
                    }
                  >
                    <SelectValue placeholder="Select script type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="Chat">Chat</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.scriptType && (
                  <p className="text-sm text-red-500">
                    {validationErrors.scriptType}
                  </p>
                )}
              </div>

              {/* Script Content */}
              <div className="space-y-2">
                <Label htmlFor="script" className="text-sm font-medium">
                  Script Content *
                </Label>
                <div
                  className={`${validationErrors.script ? 'border-red-500' : ''}`}
                >
                  <ReactQuill
                    theme="snow"
                    value={formData.script}
                    onChange={(value: string) =>
                      handleInputChange('script', value)
                    }
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Enter script content. Use the toolbar to format your text."
                    style={{ minHeight: '200px' }}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
                {validationErrors.script && (
                  <p className="text-sm text-red-500">
                    {validationErrors.script}
                  </p>
                )}
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Use the toolbar to format your script. Variables like{' '}
                  {'{{company_name}}'} and {'{{agent_name}}'} will be replaced
                  dynamically.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/settings/knowledgeHub/scripts')}
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
                  {isEditing ? 'Update Script' : 'Create Script'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
