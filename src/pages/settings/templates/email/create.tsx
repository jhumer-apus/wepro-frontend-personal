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
import { ArrowLeft, Save, Mail, Shield } from 'lucide-react'
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
import { usePermissions } from '@/src/hooks/usePermissions'
import dynamic from 'next/dynamic'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface EmailTemplateFormData {
  title: string
  fromEmail: string
  fromName: string
  subject: string
  body: string
  bodyType: 'html' | 'plain'
  emailType: string
  replyTo: string
  priority: string
  status: 'Active' | 'Inactive' | 'Draft'
}

export default function CreateEmailTemplatePage(): React.JSX.Element {
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
  const [formData, setFormData] = useState<EmailTemplateFormData>({
    title: '',
    fromEmail: '',
    fromName: '',
    subject: '',
    body: '',
    bodyType: 'plain',
    emailType: '',
    replyTo: '',
    priority: 'normal',
    status: 'Active',
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
    field: keyof EmailTemplateFormData,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleBodyChange = (value: string) => {
    handleInputChange('body', value)
  }

  // Load template data if editing
  useEffect(() => {
    const loadData = async () => {
      if (isEditing && id && typeof id === 'string') {
        setIsLoading(true)
        try {
          const response = await apiService.get(`/v1/templates/email/${id}`)

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
              fromEmail: templateData.fromEmail || '',
              fromName: templateData.fromName || '',
              subject: templateData.subject || '',
              body: templateData.body || '',
              bodyType: templateData.bodyType || 'plain',
              emailType: templateData.emailType || '',
              replyTo: templateData.replyTo || '',
              priority: templateData.priority || 'normal',
              status:
                templateData.status === 'Active' ||
                templateData.status === 'Inactive' ||
                templateData.status === 'Draft'
                  ? templateData.status
                  : 'Draft',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tenantId) {
      toast.error('Tenant ID is required')
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        title: formData.title.trim(),
        fromEmail: formData.fromEmail.trim(),
        fromName: formData.fromName.trim(),
        subject: formData.subject.trim(),
        body: formData.body.trim(),
        bodyType: formData.bodyType,
        emailType: formData.emailType,
        replyTo: formData.replyTo.trim(),
        priority: formData.priority,
        status: formData.status,
      }

      if (isEditing && id) {
        // Update existing template
        await apiService.put(`/v1/templates/email/${id}`, payload)
        toast.success('Email template updated successfully!', {
          description: 'The template has been updated in the system.',
        })
      } else {
        // Create new template
        await apiService.post('/v1/templates/email', payload)
        toast.success('Email template created successfully!', {
          description: 'The new template has been added to the system.',
        })
      }

      // Redirect back to the templates list
      router.push('/settings/templates/email')
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
  if (!isEditing && !checkPermission('MOD035', 'create')) {
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
  if (isEditing && !checkPermission('MOD035', 'edit')) {
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
          {isEditing ? 'Edit Email Template' : 'Create Email Template'} - WePro
        </title>
        <meta
          name="description"
          content={
            isEditing ? 'Edit email template' : 'Create new email template'
          }
        />
      </Head>

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/settings/templates/email')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Email Templates
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {isEditing
                  ? 'Edit Email Template'
                  : 'Create New Email Template'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Status:
              </span>
              <Select
                value={formData.status}
                onValueChange={(value: 'Active' | 'Inactive' | 'Draft') =>
                  handleInputChange('status', value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
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
                <Mail className="w-5 h-5" />
                Email Template Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter email template title"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                />
              </div>

              {/* Email Type and Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailType" className="text-sm font-medium">
                    Email Type
                  </Label>
                  <Select
                    value={formData.emailType}
                    onValueChange={value =>
                      handleInputChange('emailType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select email type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Confirmation">Confirmation</SelectItem>
                      <SelectItem value="Reminder">Reminder</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Invoice">Invoice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={value =>
                      handleInputChange('priority', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* From Email and From Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail" className="text-sm font-medium">
                    From Email
                  </Label>
                  <Input
                    id="fromEmail"
                    placeholder="noreply@company.com"
                    value={formData.fromEmail}
                    onChange={e =>
                      handleInputChange('fromEmail', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromName" className="text-sm font-medium">
                    From Name
                  </Label>
                  <Input
                    id="fromName"
                    type="text"
                    placeholder="Company Name"
                    value={formData.fromName}
                    onChange={e =>
                      handleInputChange('fromName', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Reply To Email */}
              <div className="space-y-2">
                <Label htmlFor="replyTo" className="text-sm font-medium">
                  Reply To Email
                </Label>
                <Input
                  id="replyTo"
                  placeholder="support@company.com"
                  value={formData.replyTo}
                  onChange={e => handleInputChange('replyTo', e.target.value)}
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Enter email subject"
                  value={formData.subject}
                  onChange={e => handleInputChange('subject', e.target.value)}
                />
              </div>

              {/* Body Type Selector */}
              <div className="space-y-2">
                <Label htmlFor="bodyType" className="text-sm font-medium">
                  Body Type
                </Label>
                <Select
                  value={formData.bodyType}
                  onValueChange={(value: 'html' | 'plain') =>
                    handleInputChange('bodyType', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select body type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plain">Plain Text</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email Body */}
              <div className="space-y-2">
                <Label htmlFor="body" className="text-sm font-medium">
                  Email Body
                </Label>
                {formData.bodyType === 'html' ? (
                  <div>
                    <ReactQuill
                      theme="snow"
                      value={formData.body}
                      onChange={handleBodyChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Enter email content. Use variables like {{customerName}}, {{serviceType}}, etc."
                      style={{ minHeight: '200px' }}
                      className="bg-white dark:bg-gray-800"
                    />
                  </div>
                ) : (
                  <Textarea
                    id="body"
                    placeholder="Enter email content. Use variables like {{customerName}}, {{serviceType}}, etc."
                    value={formData.body}
                    onChange={e => handleInputChange('body', e.target.value)}
                    className="min-h-[200px]"
                  />
                )}
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Use variables like {'{{customerName}}'}, {'{{serviceType}}'},{' '}
                  {'{{appointmentDate}}'}, {'{{appointmentTime}}'},{' '}
                  {'{{companyName}}'}, and {'{{companyPhone}}'} that will be
                  replaced dynamically.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/settings/templates/email')}
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
