import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import { ArrowLeft, Edit, Shield, Info, Key } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiService } from '@/src/services/api'
import { usePermissions } from '@/src/hooks/usePermissions'
import { Role } from '@/src/constants/interface/role'
import { Module } from '@/src/constants/interface/module'

export default function ViewRole() {
  const router = useRouter()
  const { checkPermission, getUserType } = usePermissions()

  // Check permission to access this page based on user type
  const userType = getUserType()

  if (userType === 'P1') {
    // P1 users need MOD002 permission
    if (!checkPermission('MOD002', 'view')) {
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
  } else if (userType === 'P5') {
    // P5 users need either MOD007 OR MOD002 permission
    if (
      !checkPermission('MOD007', 'view') &&
      !checkPermission('MOD002', 'view')
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
  } else {
    // Other user types need MOD007 permission
    if (!checkPermission('MOD007', 'view')) {
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

  const { id } = router.query

  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Available modules for display
  const availableModules: Module[] = [
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
          const response = await apiService.get(`/v1/role-management/${id}`)
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
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !role) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            {error || 'Role Not Found'}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
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

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/team/roles')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Roles
          </button>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {role.name}
            </h1>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Role Name
                  </label>
                  <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {role.name}
                  </div>
                </div>

                {role.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Created
                    </label>
                    <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                      {formatDate(role.createdAt)}
                    </div>
                  </div>
                )}

                {role.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Last Updated
                    </label>
                    <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                      {formatDate(role.updatedAt)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Module Permissions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Module Permissions
              </h2>
              <div className="space-y-4">
                <div className="space-y-3">
                  {role.permissions.map((permission, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900 text-sm">
                        {getModuleLabel(permission.module)}
                      </span>
                      <div className="flex gap-1">
                        {permission.permissions.map((perm, permIndex) => (
                          <span
                            key={permIndex}
                            className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md"
                          >
                            {perm.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => router.push(`/team/roles/create?id=${role._id}`)}
              className="wepro-button-gradient text-white"
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
