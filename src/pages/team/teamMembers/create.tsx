import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import {
  ArrowLeft,
  User,
  Check,
  ChevronsUpDown,
  Save,
  Shield,
} from 'lucide-react'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
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
import { cn } from '@/src/lib/utils'
import { useAppSelector } from '@/src/store/hooks'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { ButtonLoading } from '@/src/components/ui/loading'
import { usePermissions } from '@/src/hooks/usePermissions'
import { Role } from '@/src/constants/interface/role'
import { Timezone } from '@/src/constants/interface/timezone'

// Type definitions
interface FormData {
  name: string
  username: string
  password: string
  roleId: string
  timezoneId: string
  status: string
}

// Status options for dropdown
const statusOptions = ['Pending', 'Active', 'Inactive', 'Suspended', 'Deleted']

export default function CreateTeamMemberPage(): React.JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const user = useAppSelector(state => state.user.data)
  const { checkPermission, getUserType } = usePermissions()

  // Check if we're editing (id exists in URL)
  const isEditing = Boolean(id)

  const [isSaving, setIsSaving] = useState(false)
  const [rolesLoading, setRolesLoading] = useState(false)
  const [timezonesLoading, setTimezonesLoading] = useState(false)
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [availableTimezones, setAvailableTimezones] = useState<Timezone[]>([])
  const [formData, setFormData] = useState<FormData>({
    name: '',
    username: '',
    password: '',
    roleId: '',
    timezoneId: '',
    status: 'Pending',
  })

  // Dropdown states
  const [roleOpen, setRoleOpen] = useState(false)
  const [timezoneOpen, setTimezoneOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      if (user?.tenantId) {
        try {
          setRolesLoading(true)
          const response = await apiService.get(
            `/v1/role-management?tenantId=${user.tenantId}`
          )
          setAvailableRoles(response.data.data)
        } catch (error) {
          console.error('Error fetching roles:', error)
        } finally {
          setRolesLoading(false)
        }
      }
    }

    fetchRoles()
  }, [user?.tenantId])

  // Fetch timezones from API
  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        setTimezonesLoading(true)
        const response = await apiService.get('/v1/timezones?page=1&limit=10')
        setAvailableTimezones(response.data.data)
      } catch (error) {
        console.error('Error fetching timezones:', error)
      } finally {
        setTimezonesLoading(false)
      }
    }

    fetchTimezones()
  }, [])

  // Load team member data if editing
  useEffect(() => {
    if (isEditing && id) {
      const fetchTeamMember = async () => {
        try {
          const response = await apiService.get(`/v1/users/${id}`)
          const teamMemberData = response.data.data

          // Map the API response to form data
          setFormData({
            name: teamMemberData.name,
            username: teamMemberData.username,
            password: '', // Don't populate password for security
            roleId: teamMemberData.roleId._id,
            timezoneId: teamMemberData.timezoneId._id,
            status: teamMemberData.status || 'Pending',
          })
        } catch (error) {
          console.error('Error fetching team member:', error)
          toast.error('Error loading team member data', {
            description: 'Please try again.',
          })
        }
      }
      fetchTeamMember()
    }
  }, [id, isEditing])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form data - password is only required for creating new team members
    const requiredFields = [
      'name',
      'username',
      'roleId',
      'timezoneId',
      'status',
    ]
    if (isEditing) {
      // For editing, password is optional
      if (
        !formData.name ||
        !formData.username ||
        !formData.roleId ||
        !formData.timezoneId ||
        !formData.status
      ) {
        toast.error('Validation Error', {
          description: 'Please fill in all required fields',
        })
        return
      }
    } else {
      // For creating, password is required
      if (
        !formData.name ||
        !formData.username ||
        !formData.password ||
        !formData.roleId ||
        !formData.timezoneId ||
        !formData.status
      ) {
        toast.error('Validation Error', {
          description: 'Please fill in all required fields',
        })
        return
      }
    }

    setIsSaving(true)

    try {
      // Prepare payload according to the API schema
      const payload: any = {
        name: formData.name,
        type: 'P5', // Always set type to P5
        username: formData.username,
        roleId: formData.roleId,
        timezoneId: formData.timezoneId,
        status: formData.status,
        tenantId: user?.tenantId,
      }

      // Only include password if it's provided (for editing) or required (for creating)
      if (!isEditing || formData.password) {
        payload.password = formData.password
      }

      if (isEditing) {
        // Make actual API call to update team member
        const response = await apiService.put(`/v1/users/${id}`, payload)

        // Show success toast for update
        toast.success('Team member updated successfully!', {
          description: 'The team member information has been updated.',
        })
      } else {
        // Make actual API call to create team member
        const response = await apiService.post('/v1/users', payload)

        // Show success toast for creation
        toast.success('Team member created successfully!', {
          description: 'The new team member has been added to the system.',
        })
      }

      // Redirect back to team members page after a short delay to show the toast
      setTimeout(() => {
        router.push('/team/teamMembers')
      }, 1000)
    } catch (error: any) {
      console.error('Error saving team member:', error)
      // Show error toast
      toast.error('Failed to save team member', {
        description:
          error.response?.data?.details?.[0]?.message ||
          error.response?.data?.error ||
          'An error occurred while saving the team member.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/team/teamMembers')
  }

  // Helper functions to get display values
  const getSelectedRoleName = () => {
    const selectedRole = availableRoles.find(r => r._id === formData.roleId)
    return selectedRole ? selectedRole.name : ''
  }

  const getSelectedTimezoneName = () => {
    const selectedTimezone = availableTimezones.find(
      t => t._id === formData.timezoneId
    )
    return selectedTimezone ? selectedTimezone.name : ''
  }

  // Check permission for create mode based on user type
  if (!isEditing) {
    const userType = getUserType()
    let hasPermission = false

    if (userType === 'P1') {
      hasPermission = checkPermission('MOD003', 'create')
    } else if (userType === 'P5') {
      hasPermission =
        checkPermission('MOD006', 'create') ||
        checkPermission('MOD003', 'create')
    } else {
      hasPermission = checkPermission('MOD006', 'create')
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
              You don&apos;t have permission to view this page.
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
    const userType = getUserType()
    let hasPermission = false

    if (userType === 'P1') {
      hasPermission = checkPermission('MOD003', 'edit')
    } else if (userType === 'P5') {
      hasPermission =
        checkPermission('MOD006', 'edit') || checkPermission('MOD003', 'edit')
    } else {
      hasPermission = checkPermission('MOD006', 'edit')
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
              You don&apos;t have permission to view this page.
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

  return (
    <>
      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Team Members
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEditing ? 'Edit Team Member' : 'Create New Team Member'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                  autoComplete="off"
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={e => handleInputChange('username', e.target.value)}
                  placeholder="Enter username"
                  required
                  autoComplete="off"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password{' '}
                  {isEditing ? '(Leave empty to keep current password)' : '*'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  placeholder={
                    isEditing
                      ? 'Enter new password (optional)'
                      : 'Enter password'
                  }
                  required={!isEditing}
                  autoComplete="new-password"
                />
              </div>

              {/* Role Dropdown */}
              <div className="space-y-2">
                <Label>Role *</Label>
                <Popover open={roleOpen} onOpenChange={setRoleOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={roleOpen}
                      className="w-full justify-between"
                      disabled={rolesLoading}
                    >
                      {rolesLoading
                        ? 'Loading roles...'
                        : formData.roleId
                          ? getSelectedRoleName()
                          : 'Select role...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search roles..."
                        className="focus:ring-0 focus:outline-none focus:border-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-0"
                      />
                      <CommandList>
                        <CommandEmpty>
                          {rolesLoading ? 'Loading roles...' : 'No role found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {availableRoles?.map(role => (
                            <CommandItem
                              key={role._id}
                              onSelect={() => {
                                handleInputChange('roleId', role._id)
                                setRoleOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  formData.roleId === role._id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {role.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Timezone Dropdown */}
              <div className="space-y-2">
                <Label>Timezone *</Label>
                <Popover open={timezoneOpen} onOpenChange={setTimezoneOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={timezoneOpen}
                      className="w-full justify-between"
                      disabled={timezonesLoading}
                    >
                      {timezonesLoading
                        ? 'Loading timezones...'
                        : formData.timezoneId
                          ? getSelectedTimezoneName()
                          : 'Select timezone...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search timezones..."
                        className="focus:ring-0 focus:outline-none focus:border-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-0"
                      />
                      <CommandList>
                        <CommandEmpty>
                          {timezonesLoading
                            ? 'Loading timezones...'
                            : 'No timezone found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {availableTimezones.map(timezone => (
                            <CommandItem
                              key={timezone._id}
                              onSelect={() => {
                                handleInputChange('timezoneId', timezone._id)
                                setTimezoneOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  formData.timezoneId === timezone._id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {timezone.name} ({timezone.location})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Status Dropdown */}
              <div className="space-y-2">
                <Label>Status *</Label>
                <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={statusOpen}
                      className="w-full justify-between"
                    >
                      {formData.status || 'Select status...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search status..."
                        className="focus:ring-0 focus:outline-none focus:border-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-0"
                      />
                      <CommandList>
                        <CommandEmpty>No status found.</CommandEmpty>
                        <CommandGroup>
                          {statusOptions.map(status => (
                            <CommandItem
                              key={status}
                              onSelect={() => {
                                handleInputChange('status', status)
                                setStatusOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  formData.status === status
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {status}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                  {isEditing ? (
                    <Save className="w-4 h-4 mr-2" />
                  ) : (
                    <User className="w-4 h-4 mr-2" />
                  )}
                  {isEditing ? 'Update Team Member' : 'Create Team Member'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
