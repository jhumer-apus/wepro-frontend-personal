import { useRouter } from 'next/router'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Card, CardContent } from '@/src/components/ui/card'
import { Checkbox } from '@/src/components/ui/checkbox'
import { ArrowLeft, Save, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/src/store/index'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { Loading, ButtonLoading } from '@/src/components/ui/loading'
import { usePermissions } from '@/src/hooks/usePermissions'
import { ExtendedModule } from '@/src/constants/interface/module'

interface FormModulePermission {
  id: string
  module: string
  permissions: string[]
}

interface FormData {
  name: string
  isFeatured: boolean
  modulePermissions: FormModulePermission[]
}

export default function CreateRole() {
  const router = useRouter()
  const { id } = router.query
  const { checkPermission } = usePermissions()

  // Check if we're editing (id exists in URL) and router is ready
  const isEditing = Boolean(id && router.isReady)

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Get user data from Redux
  const userData = useSelector((state: RootState) => state.user.data)

  // State for modules data
  const [availableModules, setAvailableModules] = useState<ExtendedModule[]>([])
  const [modulesLoading, setModulesLoading] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    isFeatured: false,
    modulePermissions: [],
  })

  // Function to fetch modules from API
  const fetchModules = async (tenantId: string) => {
    setModulesLoading(true)
    try {
      const response = await apiService.get(`/v3/modules/permissions`)
      setAvailableModules(response.data.data || [])
    } catch (error) {
      console.error('Error fetching modules:', error)
      toast.error('Failed to load modules')
    } finally {
      setModulesLoading(false)
    }
  }

  // Function to refetch modules
  const refetchModules = () => {
    if (userData?.tenantId) {
      fetchModules(userData.tenantId)
    }
  }

  // Fetch modules when component mounts or tenantId changes
  useEffect(() => {
    if (userData?.tenantId) {
      fetchModules(userData.tenantId)
    }
  }, [userData?.tenantId])

  // Initialize form data when modules are loaded and load role data if editing
  useEffect(() => {
    const initializeForm = async () => {
      if (availableModules.length > 0) {
        if (isEditing && id && typeof id === 'string' && router.isReady) {
          // Load role data for editing
          setIsLoading(true)
          try {
            const response = await apiService.get(`/v3/role-management/${id}`)
            const roleData = response.data.data // The actual role data is nested under response.data.data

            // Transform the API response to match our form structure
            const transformedModulePermissions = availableModules.map(
              (module: ExtendedModule) => {
                // Find if this module has permissions in the role data
                let modulePermission = roleData.permissions?.find(
                  (perm: any) => perm.module === module.code
                )

                // If not found by code, try by name
                if (!modulePermission) {
                  modulePermission = roleData.permissions?.find(
                    (perm: any) =>
                      perm.module.toLowerCase() === module.name.toLowerCase()
                  )
                }

                // If still not found, try by _id
                if (!modulePermission) {
                  modulePermission = roleData.permissions?.find(
                    (perm: any) => perm.module === module._id
                  )
                }

                return {
                  id: module._id,
                  module: module._id,
                  permissions: modulePermission?.permissions || [],
                }
              }
            )

            setFormData({
              name: roleData.name || '',
              isFeatured: roleData.isFeatured || false,
              modulePermissions: transformedModulePermissions,
            })
          } catch (error) {
            console.error('Error loading role data:', error)
            alert('Error loading role data. Please try again.')
          } finally {
            setIsLoading(false)
          }
        } else if (!isEditing) {
          // Initialize empty form for creating new role
          setFormData(prev => ({
            ...prev,
            isFeatured: false,
            modulePermissions: availableModules.map(
              (module: ExtendedModule) => ({
                id: module._id,
                module: module._id,
                permissions: [],
              })
            ),
          }))
        }
      }
    }

    initializeForm()
  }, [availableModules, id, isEditing, router.isReady])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    // Validate form data
    if (!formData.name) {
      setSubmitted(true)
      toast.error('Please fix the validation errors before submitting')
      return
    }

    if (formData.modulePermissions.length === 0) {
      setSubmitted(true)
      toast.error('Please add at least one module permission')
      return
    }

    if (!userData) {
      alert('User data not available. Please try again.')
      return
    }

    setIsSaving(true)

    try {
      // Convert modulePermissions to the format expected by the backend
      const permissions = formData.modulePermissions
        .filter(modulePerm => modulePerm.permissions.length > 0) // Only include modules with permissions
        .map(modulePerm => {
          const module = availableModules.find(m => m._id === modulePerm.module)
          return {
            module: module?.code || modulePerm.module, // Use module code instead of _id
            permissions: modulePerm.permissions,
            scope: {
              type: 'region',
              value: 'houston',
            },
          }
        })

      const roleData = {
        name: formData.name,
        isFeatured: formData.isFeatured,
        tenantId: userData.tenantId || null,
        createdBy: userData._id,
        permissions,
      }

      // Make API call to create or update the role
      if (isEditing) {
        console.log('Updating role:', { id, roleData })
        const response = await apiService.put(`/v3/role-management/${id}`, {
          name: roleData.name,
          isFeatured: roleData.isFeatured,
          permissions: roleData.permissions,
        })
        console.log('Role updated successfully:', response.data)

        // Show success toast for update
        toast.success('Role updated successfully!', {
          description:
            'The role information and permissions have been updated.',
        })
      } else {
        console.log('Creating role:', roleData)
        const response = await apiService.post('/v3/role-management', roleData)
        console.log('Role created successfully:', response.data)

        // Show success toast for creation
        toast.success('Role created successfully!', {
          description: 'The new role has been added to the system.',
        })
      }

      // Refresh modules data to ensure we have the latest data
      // This is important because role creation/update might affect module permissions
      refetchModules()

      // Redirect back to roles page after a short delay to show the toast
      setTimeout(() => {
        router.push('/team/roles')
      }, 1000)
    } catch (error: any) {
      console.error('Error saving role:', error)
      
      // Extract error response data
      const errorData = error.response?.data
      
      // Build error message from API response
      let errorTitle = 'Failed to save role'
      let errorDescription = 'An error occurred while saving the role.'
      
      if (errorData) {
        // If details array exists and has items, format all validation errors
        if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
          errorTitle = errorData.error || 'Validation failed'
          // Format all error messages from details array
          const errorMessages = errorData.details.map((detail: any) => {
            const field = detail.field ? `${detail.field.charAt(0).toUpperCase() + detail.field.slice(1)}: ` : ''
            return `${field}${detail.message || 'Invalid value'}`
          })
          errorDescription = errorMessages.join('\n')
        } 
        // If no details but error message exists, use that
        else if (errorData.error) {
          errorTitle = 'Error'
          errorDescription = errorData.error
        }
      }
      
      // Show error toast
      toast.error(errorTitle, {
        description: errorDescription,
        duration: 5000, // Show for 5 seconds to allow reading multiple errors
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateModulePermission = (
    id: string,
    field: 'module' | 'permissions',
    value: string | string[]
  ) => {
    setFormData(prev => ({
      ...prev,
      modulePermissions: prev.modulePermissions.map(perm =>
        perm.id === id ? { ...perm, [field]: value } : perm
      ),
    }))
  }

  const togglePermission = (permId: string, permissionValue: string) => {
    setFormData(prev => ({
      ...prev,
      modulePermissions: prev.modulePermissions.map(perm => {
        if (perm.id === permId) {
          const permissions = perm.permissions.includes(permissionValue)
            ? perm.permissions.filter(p => p !== permissionValue)
            : [...perm.permissions, permissionValue]
          return { ...perm, permissions }
        }
        return perm
      }),
    }))
  }

  const getSelectedModuleLabel = (moduleValue: string) => {
    const foundModule = availableModules.find(m => m._id === moduleValue)
    return foundModule ? foundModule.name : moduleValue
  }

  const getSelectedPermissionLabels = (
    permissionValues: string[],
    moduleValue: string
  ) => {
    const module = availableModules.find(m => m._id === moduleValue)
    if (!module) return permissionValues

    return permissionValues.map(value => {
      const foundPermission = module.permissions.find(p => p.key === value)
      return foundPermission ? foundPermission.key.toUpperCase() : value
    })
  }

  const handleCancel = () => {
    router.push('/team/roles')
  }

  // Check permission for create mode based on user type
  if (!isEditing) {
    const { getUserType } = usePermissions()
    const userType = getUserType()
    let hasPermission = false

    if (userType === 'P1') {
      hasPermission = checkPermission('MOD002', 'create')
    } else if (userType === 'P5') {
      hasPermission =
        checkPermission('MOD007', 'create') ||
        checkPermission('MOD002', 'create')
    } else {
      hasPermission = checkPermission('MOD007', 'create')
    }

    if (!hasPermission) {
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
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }
  }

  // Check permission for edit mode based on user type
  if (isEditing) {
    const { getUserType } = usePermissions()
    const userType = getUserType()
    let hasPermission = false

    if (userType === 'P1') {
      hasPermission = checkPermission('MOD002', 'edit')
    } else if (userType === 'P5') {
      hasPermission =
        checkPermission('MOD007', 'edit') || checkPermission('MOD002', 'edit')
    } else {
      hasPermission = checkPermission('MOD007', 'edit')
    }

    if (!hasPermission) {
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
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }
  }

  if (!router.isReady || isLoading || modulesLoading) {
    return (
      <>
        <div className="p-6">
          <Loading
            message={
              !router.isReady
                ? 'Loading...'
                : isLoading
                  ? 'Loading role details...'
                  : 'Loading modules...'
            }
          />
        </div>
      </>
    )
  }

  return (
    <>
      <div>
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Roles
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEditing ? 'Edit Role' : 'Create New Role'}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          onInvalid={() => setSubmitted(true)}
          data-submitted={submitted}
        >
          <Card className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700">
            <CardContent className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-3">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter role name (e.g., Project Manager, Admin)"
                  required
                  className={
                    submitted && !formData.name
                      ? 'border-red-500 focus:border-red-500 !focus-visible:ring-red-500'
                      : ''
                  }
                />
              </div>

              {/* Featured Role Toggle */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={checked =>
                      setFormData(prev => ({
                        ...prev,
                        isFeatured: checked as boolean,
                      }))
                    }
                  />
                  <Label
                    htmlFor="isFeatured"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Featured Role
                  </Label>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Featured roles can be filtered and displayed prominently in
                  the team members tab.
                </p>
              </div>

              {/* Permissions Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Module Permissions
                </h3>

                {/* Module Permission Cards */}
                {formData.modulePermissions.map(modulePerm => (
                  <div
                    key={modulePerm.id}
                    className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4 bg-white dark:bg-neutral-800"
                  >
                    {/* Module Header */}
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {getSelectedModuleLabel(modulePerm.module)}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded">
                        {availableModules.find(m => m._id === modulePerm.module)
                          ?.code || 'N/A'}
                      </span>
                    </div>

                    {/* Permissions Selection */}
                    <div className="flex flex-wrap gap-2">
                      {availableModules
                        .find(m => m._id === modulePerm.module)
                        ?.permissions.map(permission => (
                          <div
                            key={permission._id}
                            className="flex items-center gap-2 bg-white dark:bg-neutral-700 px-3 py-2 rounded-full border border-gray-200 dark:border-neutral-600 shadow-sm"
                          >
                            <Checkbox
                              id={`${modulePerm.id}-${permission.key}`}
                              checked={modulePerm.permissions.includes(
                                permission.key
                              )}
                              onCheckedChange={() =>
                                togglePermission(modulePerm.id, permission.key)
                              }
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {permission.key.toUpperCase()}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                  {isEditing ? 'Update Role' : 'Create Role'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
