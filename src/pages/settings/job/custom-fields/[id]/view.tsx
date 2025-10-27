import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Switch } from '@/src/components/ui/switch'
import {
  ArrowLeft,
  Edit,
  Shield,
  Settings,
  FileText,
  CheckCircle,
  AlertCircle,
  Hash,
  Calendar,
  Mail,
  List,
} from 'lucide-react'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { Loading } from '@/src/components/ui/loading'
import { usePermissions } from '@/src/hooks/usePermissions'

interface CustomJobFieldDetail {
  name: string
  code: string
  field_type: string
  section: string
  placeholder?: string
  description?: string
  help_text?: string
  display_order: number
  options?: Array<{ label: string; value: string }>
  default_value?: string | number
  validation_rules?: {
    min_length?: number
    max_length?: number
    min_value?: number
    max_value?: number
    pattern?: string
    pattern_message?: string
  }
  is_required?: boolean
  required_message?: string
  is_active?: boolean
}

interface CustomJobFieldResponse {
  success: boolean
  message: CustomJobFieldDetail
  data: string
}

const getFieldTypeIcon = (fieldType: string) => {
  switch (fieldType.toLowerCase()) {
    case 'text':
      return <FileText className="w-5 h-5" />
    case 'number':
      return <Hash className="w-5 h-5" />
    case 'select':
    case 'multiselect':
      return <List className="w-5 h-5" />
    case 'date':
      return <Calendar className="w-5 h-5" />
    case 'email':
      return <Mail className="w-5 h-5" />
    case 'checkbox':
      return <CheckCircle className="w-5 h-5" />
    default:
      return <Settings className="w-5 h-5" />
  }
}

const getFieldTypeBadgeColor = (fieldType: string) => {
  switch (fieldType.toLowerCase()) {
    case 'text':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'number':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'select':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'multiselect':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
    case 'checkbox':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    case 'date':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'email':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

export default function CustomJobFieldViewPage(): React.JSX.Element {
  const router = useRouter()
  const { checkPermission } = usePermissions()

  const { id } = router.query
  const [fieldData, setFieldData] = useState<CustomJobFieldDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isActive, setIsActive] = useState<boolean>(true)
  const [switchLoading, setSwitchLoading] = useState(false)

  useEffect(() => {
    const fetchFieldData = async () => {
      if (id && typeof id === 'string') {
        setLoading(true)
        setError(null)
        try {
          const response = await apiService.get<CustomJobFieldResponse>(
            `/v1/custom-job-fields/${id}`
          )

          if (response.data.success) {
            setFieldData(response.data.message)
            setIsActive(response.data.message.is_active ?? true)
          } else {
            setError(response.data.data || 'Failed to load custom field data')
            toast.error('Failed to load custom field data', {
              description:
                response.data.data ||
                'The custom field information could not be retrieved.',
            })
          }
        } catch (error: any) {
          console.error('Error fetching custom field data:', error)
          setError(
            error.response?.data?.message ||
              'An error occurred while loading the custom field'
          )
          toast.error('Failed to load custom field data', {
            description:
              error.response?.data?.message ||
              'An error occurred while loading the custom field.',
          })
        } finally {
          setLoading(false)
        }
      }
    }

    fetchFieldData()
  }, [id])

  const handleToggleActive = async (checked: boolean) => {
    if (!fieldData?.code || switchLoading) return

    setSwitchLoading(true)
    try {
      if (checked) {
        // Activate: DELETE /v1/custom-job-fields/[code]/inactivate
        await apiService.delete(
          `/v1/custom-job-fields/${fieldData.code}/inactivate`
        )
        toast.success('Custom field activated successfully')
      } else {
        // Deactivate: POST /v1/custom-job-fields/[code]/inactivate
        await apiService.post(
          `/v1/custom-job-fields/${fieldData.code}/inactivate`
        )
        toast.success('Custom field deactivated successfully')
      }

      setIsActive(checked)
      // Update the fieldData state as well
      setFieldData(prev => (prev ? { ...prev, is_active: checked } : null))
    } catch (error: any) {
      console.error('Error toggling custom field status:', error)
      const errorMessage =
        error.response?.data?.message || 'Failed to update custom field status'
      toast.error('Failed to update custom field status', {
        description: errorMessage,
      })
      // Revert the switch state on error
      setIsActive(!checked)
    } finally {
      setSwitchLoading(false)
    }
  }

  const handleEdit = () => {
    if (id) {
      router.push(`/settings/job/custom-fields/create?id=${id}`)
    }
  }

  const handleBack = () => {
    router.push('/settings/job/custom-fields')
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Custom Field - WePro</title>
        </Head>
        <div className="p-6">
          <Loading message="Loading custom field details..." />
        </div>
      </>
    )
  }

  // Check permission to access this page
  if (
    !checkPermission('MOD025', 'view') &&
    !checkPermission('MOD026', 'view')
  ) {
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

  if (error || !fieldData) {
    return (
      <>
        <Head>
          <title>Custom Field Not Found - WePro</title>
        </Head>
        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Custom Fields
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Settings className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Custom Field Not Found
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {error ||
                  'The custom field you are looking for does not exist.'}
              </p>
              <Button onClick={handleBack} variant="outline">
                Back to Custom Fields
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
        <title>{fieldData.name} - Custom Field Details - WePro</title>
        <meta
          name="description"
          content={`View details for custom field: ${fieldData.name}`}
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
            Back to Custom Fields
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {fieldData.name}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Status:
                </span>
                {switchLoading && (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                )}
                <Switch
                  checked={isActive}
                  onCheckedChange={handleToggleActive}
                  disabled={switchLoading}
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                />
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <Button onClick={handleEdit} className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Field
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getFieldTypeIcon(fieldData.field_type)}
                Field Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Field Name
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {fieldData.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Field Code
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className="font-mono bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                    >
                      {fieldData.code}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Field Type
                  </label>
                  <div className="mt-1">
                    <Badge
                      className={getFieldTypeBadgeColor(fieldData.field_type)}
                    >
                      {fieldData.field_type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Section
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {fieldData.section}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Display Order
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {fieldData.display_order}
                  </p>
                </div>
                {fieldData.placeholder && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Placeholder
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                      {fieldData.placeholder}
                    </p>
                  </div>
                )}
                {fieldData.default_value && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Default Value
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                      {fieldData.default_value}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description and Help Text */}
          {(fieldData.description || fieldData.help_text) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Field Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fieldData.description && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Description
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {fieldData.description}
                    </p>
                  </div>
                )}
                {fieldData.help_text && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Help Text
                    </label>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {fieldData.help_text}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Options for Select/Multiselect Fields */}
          {fieldData.options && fieldData.options.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="w-5 h-5" />
                  Field Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fieldData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {option.value}
                      </Badge>
                      <span className="text-neutral-900 dark:text-neutral-100">
                        {option.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Rules */}
          {fieldData.validation_rules &&
            Object.keys(fieldData.validation_rules).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Validation Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fieldData.validation_rules.min_length && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Minimum Length
                        </label>
                        <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                          {fieldData.validation_rules.min_length}
                        </p>
                      </div>
                    )}
                    {fieldData.validation_rules.max_length && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Maximum Length
                        </label>
                        <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                          {fieldData.validation_rules.max_length}
                        </p>
                      </div>
                    )}
                    {fieldData.validation_rules.min_value && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Minimum Value
                        </label>
                        <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                          {fieldData.validation_rules.min_value}
                        </p>
                      </div>
                    )}
                    {fieldData.validation_rules.max_value && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Maximum Value
                        </label>
                        <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                          {fieldData.validation_rules.max_value}
                        </p>
                      </div>
                    )}
                    {fieldData.validation_rules.pattern && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Pattern
                        </label>
                        <p className="text-neutral-900 dark:text-neutral-100 font-mono text-sm">
                          {fieldData.validation_rules.pattern}
                        </p>
                      </div>
                    )}
                    {fieldData.validation_rules.pattern_message && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Pattern Message
                        </label>
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {fieldData.validation_rules.pattern_message}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Requirement Information */}
          {fieldData.is_required !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Requirement Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Required
                    </label>
                    <Badge
                      className={
                        fieldData.is_required
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }
                    >
                      {fieldData.is_required ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                  {fieldData.required_message && (
                    <div>
                      <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Required Message
                      </label>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {fieldData.required_message}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
