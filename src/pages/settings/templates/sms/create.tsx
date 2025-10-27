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
  MessageSquare,
  Shield,
  Smartphone,
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
import { usePermissions } from '@/src/hooks/usePermissions'
import { Textarea } from '@/src/components/ui/textarea'

interface FormData {
  title: string
  template: string
  status: string
}

interface ValidationErrors {
  title?: string
  template?: string
}

export default function CreateSMSTemplatePage(): React.JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const { checkPermission, getUserType, userData } = usePermissions()
  const tenantId = userData?.tenantId

  // Check if we're editing (id exists in URL)
  const isEditing = Boolean(id)

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState<FormData>({
    title: '',
    template: '',
    status: 'Active',
  })

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

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    // Prevent input if character limit is reached
    if (field === 'title' && typeof value === 'string' && value.length > 200) {
      return // Don't update if title exceeds 200 characters
    }

    if (
      field === 'template' &&
      typeof value === 'string' &&
      value.length > 1600
    ) {
      return // Don't update if template content exceeds 1600 characters
    }

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

  // Load template data if editing
  useEffect(() => {
    const loadData = async () => {
      if (isEditing && id && typeof id === 'string') {
        setIsLoading(true)
        try {
          const response = await apiService.get(`/v1/templates/sms/${id}`)

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
              template: templateData.template || '',
              status: templateData.status || 'Active',
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

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // Validate title
    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    } else {
      // Check character limit (200 characters)
      if (formData.title.length > 200) {
        errors.title = `Title must be 200 characters or less (currently ${formData.title.length} characters)`
      }
    }

    // Validate template content
    if (!formData.template.trim()) {
      errors.template = 'Template content is required'
    } else {
      // Check character limit (1600 characters)
      if (formData.template.length > 1600) {
        errors.template = `Template content must be 1600 characters or less (currently ${formData.template.length} characters)`
      }
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
        template: formData.template.trim(),
        status: formData.status,
      }

      if (isEditing && id) {
        // Update existing template
        await apiService.put(`/v1/templates/sms/${id}`, payload)
        toast.success('SMS template updated successfully!', {
          description: 'The template has been updated in the system.',
        })
      } else {
        // Create new template
        await apiService.post('/v1/templates/sms', payload)
        toast.success('SMS template created successfully!', {
          description: 'The new template has been added to the system.',
        })
      }

      // Redirect back to the templates list
      router.push('/settings/templates/sms')
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

  // Check permission for create mode
  if (!isEditing && !checkPermission('MOD033', 'create')) {
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
  if (isEditing && !checkPermission('MOD033', 'edit')) {
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
          {isEditing ? 'Edit SMS Template' : 'Create SMS Template'} - WePro
        </title>
        <meta
          name="description"
          content={isEditing ? 'Edit SMS template' : 'Create new SMS template'}
        />
      </Head>

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/settings/templates/sms')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to SMS Templates
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {isEditing ? 'Edit SMS Template' : 'Create New SMS Template'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Status:
              </span>
              <Select
                value={formData.status}
                onValueChange={value => handleInputChange('status', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
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
                <MessageSquare className="w-5 h-5" />
                SMS Template Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title *
                  </Label>
                  <div className="text-sm">
                    {(() => {
                      const charCount = formData.title.length
                      const isNearLimit = charCount > 160
                      const isOverLimit = charCount > 200

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
                          {charCount}/200 characters
                        </span>
                      )
                    })()}
                  </div>
                </div>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter SMS template title"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  className={validationErrors.title ? 'border-red-500' : ''}
                  maxLength={200}
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-500">
                    {validationErrors.title}
                  </p>
                )}
              </div>

              {/* Template Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="template" className="text-sm font-medium">
                    Template Content *
                  </Label>
                  <div className="flex items-center gap-4 text-sm">
                    {(() => {
                      const smsInfo = calculateSMSSegments(formData.template)
                      const charCount = formData.template.length
                      const isNearLimit = charCount > 1400
                      const isOverLimit = charCount > 1600

                      return (
                        <>
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
                  id="template"
                  placeholder="Enter SMS template content. Use variables like {{customerName}}, {{serviceType}}, etc."
                  value={formData.template}
                  onChange={e => handleInputChange('template', e.target.value)}
                  className={`min-h-[200px] ${validationErrors.template ? 'border-red-500' : ''}`}
                  maxLength={1600}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (
                      formData.template.length >= 1600 &&
                      ![
                        'Backspace',
                        'Delete',
                        'ArrowLeft',
                        'ArrowRight',
                        'ArrowUp',
                        'ArrowDown',
                        'Home',
                        'End',
                      ].includes(e.key)
                    ) {
                      e.preventDefault()
                    }
                  }}
                />
                {validationErrors.template && (
                  <p className="text-sm text-red-500">
                    {validationErrors.template}
                  </p>
                )}
                <div className="space-y-2">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Use variables like {'{{customerName}}'}, {'{{serviceType}}'}
                    , {'{{appointmentDate}}'}, {'{{appointmentTime}}'}, and{' '}
                    {'{{companyPhone}}'} that will be replaced dynamically.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/settings/templates/sms')}
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
