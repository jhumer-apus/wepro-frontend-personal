import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/src/store/index'
import { apiService } from '@/src/services/api'

interface PackageModule {
  _id: string
  name: string
  isP1Module: boolean
  active: boolean
  createdAt: string
  updatedAt: string
  code: string
}

interface PackageModulesResponse {
  success: boolean
  message: string
  count: number
  pagination: {
    current: {
      page: number
      limit: number
    }
  }
  data: PackageModule[]
}

export const usePackageModules = () => {
  const [modules, setModules] = useState<PackageModule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get user data from Redux
  const userData = useSelector((state: RootState) => state.user.data)

  const fetchModules = async () => {
    if (!userData?.tenantId) {
      setError('No tenantId available')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await apiService.get<PackageModulesResponse>(
        `/v3/package-modules/tenant-modules?page=1&limit=50`
      )

      if (response.data.success) {
        setModules(response.data.data)
      } else {
        setError(response.data.message || 'Failed to fetch modules')
      }
    } catch (error) {
      console.error('Error fetching package modules:', error)
      setError('Error fetching package modules')
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    await fetchModules()
  }

  useEffect(() => {
    fetchModules()
  }, [userData?.tenantId])

  return {
    modules,
    loading,
    error,
    refetch,
  }
}
