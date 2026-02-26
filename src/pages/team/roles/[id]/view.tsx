import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { ArrowLeft, Edit, Shield, Info, Key } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiService } from '@/src/services/api'
import { usePermissions } from '@/src/hooks/usePermissions'
import { Role } from '@/src/constants/interface/role'

export default function ViewRole() {
  const router = useRouter()
  const { checkPermission, getUserType } = usePermissions()

  // Check permission to access this page based on user type
  const userType = getUserType()

  if (userType === 'P1') {
    // P1 users need MOD002 permission
    if (!checkPermission('MOD002', 'view')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
          <div className="text-center max-w-md w-full">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Access Denied
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-6">
              You don't have permission to view this page.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }
  } else if (userType === 'P5') {
    // P5 users need either MOD007 OR MOD002 permission
    if (
      !checkPermission('MOD007', 'view') &&
      !checkPermission('MOD002', 'view')
    ) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
          <div className="text-center max-w-md w-full">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Access Denied
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-6">
              You don't have permission to view this page.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }
  } else {
    // Other user types need MOD007 permission
    if (!checkPermission('MOD007', 'view')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
          <div className="text-center max-w-md w-full">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Access Denied
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-6">
              You don't have permission to view this page.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }
  }

  const { id } = router.query

  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Available modules for display
  const availableModules: Array<{ _id: string; name: string; code: string }> = [
    { _id: 'M1', name: 'Module 1 - Core Features', code: 'M1' },
    { _id: 'M2', name: 'Module 2 - Advanced Analytics', code: 'M2' },
    { _id: 'M3', name: 'Module 3 - Admin Team', code: 'M3' },
    { _id: 'M4', name: 'Module 4 - API Access', code: 'M4' },
    { _id: 'M5', name: 'Module 5 - White Label', code: 'M5' },
    { _id: 'M6', name: 'Module 6 - Custom Integrations', code: 'M6' },
    { _id: 'M7', name: 'Module 7 - Advanced Reporting', code: 'M7' },
    { _id: 'M8', name: 'Module 8 - Enterprise Features', code: 'M8' },
    { _id: 'M9', name: 'Module 9 - Priority Support', code: 'M9' },
    { _id: 'M10', name: 'Module 10 - Dedicated Manager', code: 'M10' },
  ]

  useEffect(() => {
    const fetchRole = async () => {
      if (id && typeof id === 'string' && router.isReady) {
        setLoading(true)
        setError(null)

        try {
          const response = await apiService.get(`/v3/role-management/${id}`)
          const roleData = response.data.data // The actual role data is nested under response.data.data
          setRole(roleData)
        } catch (error) {
          console.error('Error fetching role:', error)
          setError('Failed to load role data')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchRole()
  }, [id, router.isReady])

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getModuleLabel = (moduleCode: string) => {
    return availableModules.find(m => m.code === moduleCode)?.name || moduleCode
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !role) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            {error || 'Role Not Found'}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-6">
            {error || "The role you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.push('/team/roles')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{role.name} - View Role - Admin Team - WePro</title>
        <meta
          name="description"
          content={`View details for ${role.name} role`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="p-4 sm:p-6">
        {/* Back Button - Top Left */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.push('/team/roles')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Roles</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 break-words">
              {role.name}
            </h1>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 shrink-0" />
                <span>Basic Information</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                    Role Name
                  </label>
                  <div className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 break-words">
                    {role.name}
                  </div>
                </div>

                {role.createdAt && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                      Created
                    </label>
                    <div className="text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
                      {formatDate(role.createdAt)}
                    </div>
                  </div>
                )}

                {role.updatedAt && (
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
                      Last Updated
                    </label>
                    <div className="text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
                      {formatDate(role.updatedAt)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Module Permissions */}
            <div className="bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 shrink-0" />
                <span>Module Permissions</span>
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {role.permissions.length === 0 ? (
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                    No permissions assigned
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {role.permissions.map((permission, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-600"
                      >
                        <span className="font-medium text-neutral-900 dark:text-neutral-100 text-sm sm:text-base break-words">
                          {getModuleLabel(permission.module)}
                        </span>
                        <div className="flex flex-wrap gap-1.5 sm:gap-1">
                          {permission.permissions.map((perm, permIndex) => (
                            <span
                              key={permIndex}
                              className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md whitespace-nowrap"
                            >
                              {perm.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button
              onClick={() => router.push(`/team/roles/create?id=${role._id}`)}
              className="wepro-button-gradient text-white w-full sm:w-auto"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Role
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
