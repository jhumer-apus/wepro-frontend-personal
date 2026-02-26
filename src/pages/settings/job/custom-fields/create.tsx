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
import { ArrowLeft, Save, Database, Shield } from 'lucide-react'
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

interface FormData {
  name: string
  field_type: string
  section: string
  placeholder: string
  description: string
  help_text: string
  display_order: number
  validation_rules: {
    min_length: string
    max_length: string
    pattern: string
    pattern_message: string
    min_value: string
    max_value: string
  }
  options: Array<{
    label: string
    value: string
  }>
  default_value: string
  is_required: boolean
  required_message: string
  is_active: boolean
  code: string
}

interface ValidationErrors {
  name?: string
  field_type?: string
  section?: string
  display_order?: string
  description?: string
  help_text?: string
  required_message?: string
}

export default function CreateCustomFieldPage(): React.JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const { checkPermission, getUserType } = usePermissions()

  // Check if we're editing (id exists in URL)
  const isEditing = Boolean(id)

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState<FormData>({
    name: '',
    field_type: 'text',
    section: '',
    placeholder: '',
    description: '',
    help_text: '',
    display_order: 0,
    validation_rules: {
      min_length: '',
      max_length: '',
      pattern: '',
      pattern_message: '',
      min_value: '',
      max_value: '',
    },
    options: [],
    default_value: '',
    is_required: false,
    required_message: '',
    is_active: true,
    code: '',
  })

  const handleInputChange = (
    field: keyof FormData,
    value: string | number | boolean
  ) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      }

      // Handle field type changes
      if (field === 'field_type') {
        const fieldType = value as string

        // Clear validation rules and options when switching field types
        newData.validation_rules = {
          min_length: '',
          max_length: '',
          pattern: '',
          pattern_message: '',
          min_value: '',
          max_value: '',
        }
        newData.options = []
        newData.default_value = ''

        // Initialize empty options for select and multiselect
        if (fieldType === 'select' || fieldType === 'multiselect') {
          newData.options = []
        }
      }

      return newData
    })

    // Clear validation error when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleValidationRuleChange = (
    field: keyof FormData['validation_rules'],
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      validation_rules: {
        ...prev.validation_rules,
        [field]: value,
      },
    }))
  }

  const handleOptionChange = (
    index: number,
    field: 'label' | 'value',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, [field]: value } : option
      ),
    }))
  }

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { label: '', value: '' }],
    }))
  }

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }))
  }

  // Load custom field data if editing
  // Expected API response structure varies by field_type:
  // - text: includes validation_rules (min_length, max_length, pattern, pattern_message)
  // - select/multiselect: includes options array and default_value
  // - number: includes validation_rules (min_value, max_value) and default_value
  // - date/email: basic fields only
  useEffect(() => {
    const loadCustomFieldData = async () => {
      if (isEditing && id && typeof id === 'string') {
        setIsLoading(true)
        try {
          // Fetch custom field data from API
          const response = await apiService.get(`/v3/custom-job-fields/${id}`)

          // Handle different API response structures
          let customFieldData
          if (response.data.success !== undefined) {
            // Response with 'success' field
            customFieldData = response.data.message
          } else if (response.data.status !== undefined) {
            // Response with 'status' field
            customFieldData = response.data.message
          } else {
            // Fallback to direct data
            customFieldData = response.data
          }

          if (customFieldData) {
            console.log('Loading custom field data:', customFieldData)

            const formDataToSet = {
              name: customFieldData.name || '',
              field_type: customFieldData.field_type || 'text',
              section: customFieldData.section || 'General Information',
              placeholder: customFieldData.placeholder || '',
              description: customFieldData.description || '',
              help_text: customFieldData.help_text || '',
              display_order: customFieldData.display_order || 0,
              validation_rules: {
                min_length:
                  customFieldData.validation_rules?.min_length?.toString() ||
                  '',
                max_length:
                  customFieldData.validation_rules?.max_length?.toString() ||
                  '',
                pattern: customFieldData.validation_rules?.pattern || '',
                pattern_message:
                  customFieldData.validation_rules?.pattern_message || '',
                min_value:
                  customFieldData.validation_rules?.min_value?.toString() || '',
                max_value:
                  customFieldData.validation_rules?.max_value?.toString() || '',
              },
              options: customFieldData.options || [],
              default_value: customFieldData.default_value || '',
              is_required: customFieldData.is_required || false,
              required_message: customFieldData.required_message || '',
              is_active:
                customFieldData.is_active !== undefined
                  ? customFieldData.is_active
                  : true,
              code: customFieldData.code || '',
            }

            console.log('Setting form data:', formDataToSet)
            setFormData(formDataToSet)
          }
        } catch (error: any) {
          console.error('Error loading custom field data:', error)
          if (error.response) {
            console.log('API Response:', error.response.data)
          }
          toast.error('Failed to load custom field data', {
            description:
              'Please try again or contact support if the issue persists.',
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadCustomFieldData()
  }, [id, isEditing])

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // Validate field name
    if (!formData.name.trim()) {
      errors.name = 'Field name is required'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Field name must be at least 2 characters'
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Field name must not exceed 100 characters'
    }

    // Validate field type
    if (!formData.field_type.trim()) {
      errors.field_type = 'Field type is required'
    }

    // Validate section
    if (formData.section.length > 100) {
      errors.section = 'Section must not exceed 100 characters'
    }

    // Validate display order
    if (formData.display_order < 0) {
      errors.display_order = 'Display order must be at least 0'
    }

    // Validate description
    if (formData.description.length > 500) {
      errors.description = 'Description must not exceed 500 characters'
    }

    // Validate help text
    if (formData.help_text.length > 200) {
      errors.help_text = 'Help text must not exceed 200 characters'
    }

    // Validate required message
    if (formData.required_message.length > 200) {
      errors.required_message =
        'Required message must not exceed 200 characters'
    }

    // Validate text, textarea, email, phone, and url field pattern and pattern message consistency
    if (
      formData.field_type === 'text' ||
      formData.field_type === 'textarea' ||
      formData.field_type === 'email' ||
      formData.field_type === 'phone' ||
      formData.field_type === 'url'
    ) {
      if (
        formData.validation_rules.pattern &&
        !formData.validation_rules.pattern_message
      ) {
        errors.field_type =
          'Pattern message is required when validation pattern is provided'
      }
      if (
        !formData.validation_rules.pattern &&
        formData.validation_rules.pattern_message
      ) {
        errors.field_type =
          'Validation pattern is required when pattern message is provided'
      }
    }

    // Validate options for select and multiselect fields
    if (
      (formData.field_type === 'select' ||
        formData.field_type === 'multiselect') &&
      formData.options.length === 0
    ) {
      errors.field_type =
        'At least one option is required for select and multiselect fields'
    }

    // Validate that options have both label and value
    if (
      formData.field_type === 'select' ||
      formData.field_type === 'multiselect'
    ) {
      const hasInvalidOptions = formData.options.some(
        option => !option.label.trim() || !option.value.trim()
      )
      if (hasInvalidOptions) {
        errors.field_type = 'All options must have both label and value'
      }

      // Validate default value is one of the available options (for select fields)
      if (
        formData.field_type === 'select' &&
        formData.default_value &&
        formData.options.length > 0
      ) {
        const validValues = formData.options.map(option => option.value)
        if (!validValues.includes(formData.default_value)) {
          errors.field_type =
            'Default value must be one of the available options'
        }
      }
    }

    // Validate default value for number fields falls within min/max range
    if (formData.field_type === 'number' && formData.default_value) {
      const defaultValue = parseInt(formData.default_value)
      if (
        formData.validation_rules.min_value &&
        defaultValue < parseInt(formData.validation_rules.min_value)
      ) {
        errors.field_type =
          'Default value must be greater than or equal to minimum value'
      }
      if (
        formData.validation_rules.max_value &&
        defaultValue > parseInt(formData.validation_rules.max_value)
      ) {
        errors.field_type =
          'Default value must be less than or equal to maximum value'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    // Validate form data
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting')
      return
    }

    setIsSaving(true)

    try {
      // Prepare the payload
      const payload: any = {
        name: formData.name.trim(),
        field_type: formData.field_type,
        section: formData.section.trim(),
        placeholder: formData.placeholder.trim(),
        description: formData.description.trim(),
        help_text: formData.help_text.trim(),
        display_order: formData.display_order,
        is_required: formData.is_required,
        required_message: formData.required_message.trim(),
        is_active: formData.is_active,
      }

      // Add field-specific properties based on field type
      if (
        formData.field_type === 'text' ||
        formData.field_type === 'textarea' ||
        formData.field_type === 'email' ||
        formData.field_type === 'phone' ||
        formData.field_type === 'url'
      ) {
        const textRules: any = {}
        if (formData.validation_rules.min_length) {
          textRules.min_length = parseInt(formData.validation_rules.min_length)
        }
        if (formData.validation_rules.max_length) {
          textRules.max_length = parseInt(formData.validation_rules.max_length)
        }
        if (formData.validation_rules.pattern) {
          textRules.pattern = formData.validation_rules.pattern
        }
        if (formData.validation_rules.pattern_message) {
          textRules.pattern_message = formData.validation_rules.pattern_message
        }
        if (Object.keys(textRules).length > 0) {
          payload.validation_rules = textRules
        }
      }

      if (formData.field_type === 'number') {
        const numberRules: any = {}
        if (formData.validation_rules.min_value) {
          numberRules.min_value = parseInt(formData.validation_rules.min_value)
        }
        if (formData.validation_rules.max_value) {
          numberRules.max_value = parseInt(formData.validation_rules.max_value)
        }
        if (Object.keys(numberRules).length > 0) {
          payload.validation_rules = numberRules
        }
        if (formData.default_value) {
          payload.default_value = parseInt(formData.default_value)
        }
      }

      if (
        formData.field_type === 'select' ||
        formData.field_type === 'multiselect'
      ) {
        payload.options = formData.options
        if (formData.default_value) {
          payload.default_value = formData.default_value
        }
      }

      console.log('Creating custom field:', payload)

      // Determine the API endpoint based on user type and permissions
      const isP1User = getUserType() === 'P1'
      const hasP1Permission = checkPermission('MOD025', 'create')
      const baseEndpoint =
        isP1User || hasP1Permission
          ? '/v3/custom-job-fields/p1'
          : '/v3/custom-job-fields'

      let response
      if (isEditing && id) {
        // Edit mode - PUT request
        const editEndpoint = `/v3/custom-job-fields/${id}`

        response = await apiService.put(editEndpoint, payload)
        console.log('Custom field updated successfully:', response.data)
      } else {
        // Create mode - POST request
        response = await apiService.post(baseEndpoint, payload)
        console.log('Custom field created successfully:', response.data)
      }

      // Show success toast
      const action = isEditing ? 'updated' : 'created'
      toast.success(`Custom field ${action} successfully!`, {
        description: `The custom field has been ${action} in the system.`,
      })

      // Redirect back to custom fields page after a short delay to show the toast
      setTimeout(() => {
        router.push('/settings/job/custom-fields')
      }, 1000)
    } catch (error: any) {
      console.error('Error creating custom field:', error)
      // Show error toast
      toast.error('Failed to create custom field', {
        description:
          error.response?.data?.message ||
          'An error occurred while creating the custom field.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/settings/job/custom-fields')
  }

  const handleActiveToggle = async (checked: boolean) => {
    // Only allow toggling if we're editing
    if (!isEditing) {
      // For new fields, just update the local state
      handleInputChange('is_active', checked)
      return
    }

    try {
      if (checked) {
        // Toggle to active - call DELETE API using code instead of id
        await apiService.delete(
          `/v3/custom-job-fields/${formData.code}/inactivate`
        )
        toast.success('Field activated successfully')
      } else {
        // Toggle to inactive - call POST API using code instead of id
        await apiService.post(
          `/v3/custom-job-fields/${formData.code}/inactivate`
        )
        toast.success('Field deactivated successfully')
      }

      // Update local state after successful API call
      handleInputChange('is_active', checked)
    } catch (error: any) {
      console.error('Error toggling field status:', error)
      toast.error('Failed to update field status', {
        description:
          error.response?.data?.message ||
          'An error occurred while updating the field status.',
      })
      // Revert the switch to its previous state
      handleInputChange('is_active', !checked)
    }
  }

  // Check permission for create mode
  if (
    !isEditing &&
    !checkPermission('MOD025', 'create') &&
    !checkPermission('MOD026', 'create')
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

  // Check permission for edit mode
  if (
    isEditing &&
    !checkPermission('MOD025', 'edit') &&
    !checkPermission('MOD026', 'edit')
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

  if (isLoading) {
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

  return (
    <>
      <Head>
        <title>
          {isEditing ? 'Edit Custom Field' : 'Create Custom Field'} - WePro
        </title>
        <meta
          name="description"
          content={
            isEditing
              ? 'Edit custom job field'
              : 'Create a new custom job field'
          }
        />
      </Head>

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
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
                {isEditing ? 'Edit Custom Field' : 'Create New Custom Field'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Status:
              </span>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={handleActiveToggle}
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
              />
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {formData.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          onInvalid={() => setSubmitted(true)}
          className="space-y-6"
          autoComplete="off"
          data-submitted={submitted}
        >
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Field Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Field Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => {
                    const value = e.target.value
                    if (value.length <= 100) {
                      handleInputChange('name', value)
                    }
                  }}
                  placeholder="e.g., Customer Reference Number"
                  required
                  maxLength={100}
                  className={
                    validationErrors.name
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                  autoComplete="off"
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500">
                    {validationErrors.name}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formData.name.length}/100 characters
                </p>
              </div>

              {/* Field Type */}
              <div className="space-y-2">
                <Label htmlFor="field_type">Field Type *</Label>
                <Select
                  value={formData.field_type}
                  onValueChange={value =>
                    handleInputChange('field_type', value)
                  }
                >
                  <SelectTrigger
                    className={
                      submitted && !formData.field_type
                        ? 'border-red-500 focus:border-red-500 !focus-visible:ring-red-500'
                        : ''
                    }
                  >
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="datetime">DateTime</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="multiselect">Multiselect</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.field_type && (
                  <p className="text-sm text-red-500">
                    {validationErrors.field_type}
                  </p>
                )}
              </div>

              {/* Section */}
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Input
                  id="section"
                  value={formData.section}
                  onChange={e => {
                    const value = e.target.value
                    if (value.length <= 100) {
                      handleInputChange('section', value)
                    }
                  }}
                  placeholder="e.g., General Information"
                  maxLength={100}
                  className={
                    validationErrors.section
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                  autoComplete="off"
                />
                {validationErrors.section && (
                  <p className="text-sm text-red-500">
                    {validationErrors.section}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formData.section.length}/100 characters
                </p>
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={e =>
                    handleInputChange(
                      'display_order',
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                  className={
                    submitted && formData.display_order < 0
                      ? 'border-red-500 focus:border-red-500 !focus-visible:ring-red-500'
                      : ''
                  }
                  autoComplete="off"
                />
                {validationErrors.display_order && (
                  <p className="text-sm text-red-500">
                    {validationErrors.display_order}
                  </p>
                )}
              </div>

              {/* Placeholder */}
              <div className="space-y-2">
                <Label htmlFor="placeholder">Placeholder</Label>
                <Input
                  id="placeholder"
                  value={formData.placeholder}
                  onChange={e => {
                    const value = e.target.value
                    if (value.length <= 200) {
                      handleInputChange('placeholder', value)
                    }
                  }}
                  placeholder="e.g., Enter customer reference"
                  maxLength={200}
                  autoComplete="off"
                />
                <p className="text-sm text-muted-foreground">
                  {formData.placeholder.length}/200 characters
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => {
                    const value = e.target.value
                    if (value.length <= 500) {
                      handleInputChange('description', value)
                    }
                  }}
                  placeholder="Brief description of this field"
                  rows={3}
                  maxLength={500}
                  className={
                    validationErrors.description
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                  autoComplete="off"
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-500">
                    {validationErrors.description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Help Text */}
              <div className="space-y-2">
                <Label htmlFor="help_text">Help Text</Label>
                <Textarea
                  id="help_text"
                  value={formData.help_text}
                  onChange={e => {
                    const value = e.target.value
                    if (value.length <= 200) {
                      handleInputChange('help_text', value)
                    }
                  }}
                  placeholder="Additional guidance for users"
                  rows={3}
                  maxLength={200}
                  className={
                    validationErrors.help_text
                      ? 'border-red-500 focus:border-red-500'
                      : ''
                  }
                  autoComplete="off"
                />
                {validationErrors.help_text && (
                  <p className="text-sm text-red-500">
                    {validationErrors.help_text}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {formData.help_text.length}/200 characters
                </p>
              </div>

              {/* Default Value */}
              <div className="space-y-2">
                <Label htmlFor="default_value">Default Value</Label>
                <Input
                  id="default_value"
                  type={formData.field_type === 'number' ? 'number' : 'text'}
                  value={formData.default_value}
                  onChange={e =>
                    handleInputChange('default_value', e.target.value)
                  }
                  placeholder={
                    formData.field_type === 'number'
                      ? 'e.g., 1'
                      : formData.field_type === 'email'
                        ? 'e.g., user@example.com'
                        : formData.field_type === 'url'
                          ? 'e.g., https://example.com'
                          : formData.field_type === 'phone'
                            ? 'e.g., (555) 123-4567'
                            : 'e.g., normal'
                  }
                  autoComplete="off"
                />
              </div>

              {/* Required Field */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_required"
                    checked={formData.is_required}
                    onCheckedChange={checked =>
                      handleInputChange('is_required', checked)
                    }
                  />
                  <Label
                    htmlFor="is_required"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    This field is required
                  </Label>
                </div>
                {formData.is_required && (
                  <div className="space-y-2">
                    <Label htmlFor="required_message">
                      Required Field Message
                    </Label>
                    <Input
                      id="required_message"
                      value={formData.required_message}
                      onChange={e => {
                        const value = e.target.value
                        if (value.length <= 200) {
                          handleInputChange('required_message', value)
                        }
                      }}
                      placeholder="e.g., This field is required"
                      maxLength={200}
                      className={
                        validationErrors.required_message
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }
                      autoComplete="off"
                    />
                    {validationErrors.required_message && (
                      <p className="text-sm text-red-500">
                        {validationErrors.required_message}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {formData.required_message.length}/200 characters
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Field Configuration Card */}
          {(formData.field_type === 'text' ||
            formData.field_type === 'textarea' ||
            formData.field_type === 'email' ||
            formData.field_type === 'phone' ||
            formData.field_type === 'url' ||
            formData.field_type === 'select' ||
            formData.field_type === 'number' ||
            formData.field_type === 'multiselect' ||
            formData.field_type === 'date') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Field Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Text, Textarea, Email, Phone, and URL Field Configuration */}
                {(formData.field_type === 'text' ||
                  formData.field_type === 'textarea' ||
                  formData.field_type === 'email' ||
                  formData.field_type === 'phone' ||
                  formData.field_type === 'url') && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="min_length">Minimum Length</Label>
                        <Input
                          id="min_length"
                          type="number"
                          min="0"
                          value={formData.validation_rules.min_length}
                          onChange={e =>
                            handleValidationRuleChange(
                              'min_length',
                              e.target.value
                            )
                          }
                          placeholder="e.g., 3"
                          autoComplete="off"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_length">Maximum Length</Label>
                        <Input
                          id="max_length"
                          type="number"
                          min="1"
                          value={formData.validation_rules.max_length}
                          onChange={e =>
                            handleValidationRuleChange(
                              'max_length',
                              e.target.value
                            )
                          }
                          placeholder="e.g., 50"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pattern">Validation Pattern</Label>
                      <Input
                        id="pattern"
                        value={formData.validation_rules.pattern}
                        onChange={e =>
                          handleValidationRuleChange('pattern', e.target.value)
                        }
                        placeholder="e.g., ^[A-Z0-9-]+$"
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pattern_message">Pattern Message</Label>
                      <Input
                        id="pattern_message"
                        value={formData.validation_rules.pattern_message}
                        onChange={e =>
                          handleValidationRuleChange(
                            'pattern_message',
                            e.target.value
                          )
                        }
                        placeholder="e.g., Only uppercase letters, numbers, and hyphens allowed"
                        autoComplete="off"
                      />
                    </div>
                  </>
                )}

                {/* Select Field Configuration */}
                {formData.field_type === 'select' && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        <Button
                          type="button"
                          onClick={addOption}
                          variant="outline"
                          size="sm"
                        >
                          Add Option
                        </Button>
                      </div>
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex gap-2 items-end">
                          <div className="flex-1 space-y-2">
                            <Label>Label</Label>
                            <Input
                              value={option.label}
                              onChange={e =>
                                handleOptionChange(
                                  index,
                                  'label',
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Low"
                              autoComplete="off"
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label>Value</Label>
                            <Input
                              value={option.value}
                              onChange={e =>
                                handleOptionChange(
                                  index,
                                  'value',
                                  e.target.value
                                )
                              }
                              placeholder="e.g., low"
                              autoComplete="off"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeOption(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Number Field Configuration */}
                {formData.field_type === 'number' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="min_value">Minimum Value</Label>
                        <Input
                          id="min_value"
                          type="number"
                          value={formData.validation_rules.min_value}
                          onChange={e =>
                            handleValidationRuleChange(
                              'min_value',
                              e.target.value
                            )
                          }
                          placeholder="e.g., 1"
                          autoComplete="off"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_value">Maximum Value</Label>
                        <Input
                          id="max_value"
                          type="number"
                          value={formData.validation_rules.max_value}
                          onChange={e =>
                            handleValidationRuleChange(
                              'max_value',
                              e.target.value
                            )
                          }
                          placeholder="e.g., 100"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Multiselect Field Configuration */}
                {formData.field_type === 'multiselect' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Options</Label>
                      <Button
                        type="button"
                        onClick={addOption}
                        variant="outline"
                        size="sm"
                      >
                        Add Option
                      </Button>
                    </div>
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          <Label>Label</Label>
                          <Input
                            value={option.label}
                            onChange={e =>
                              handleOptionChange(index, 'label', e.target.value)
                            }
                            placeholder="e.g., Hard Hat"
                            autoComplete="off"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>Value</Label>
                          <Input
                            value={option.value}
                            onChange={e =>
                              handleOptionChange(index, 'value', e.target.value)
                            }
                            placeholder="e.g., hard_hat"
                            autoComplete="off"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeOption(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Date fields don't need additional configuration beyond the basic fields */}
                {formData.field_type === 'date' && (
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    No additional configuration needed for date fields.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isSaving}
            >
              {isSaving ? (
                <ButtonLoading
                  message={isEditing ? 'Updating...' : 'Creating...'}
                />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Custom Field' : 'Create Custom Field'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
