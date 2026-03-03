import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/src/store/index'
import {
  setLoading,
  setModules,
  setError,
  forceRefresh as forceRefreshModulesAction,
} from '@/src/store/slices/modulesSlice'
import { apiService } from '@/src/services/api'

interface ModulePermission {
  _id: string
  moduleCode: string
  key: string
  description: string
  createdAt: string
  updatedAt: string
}

interface Module {
  _id: string
  name: string
  isP1Module: boolean
  active: boolean
  createdAt: string
  updatedAt: string
  code: string
  permissions: ModulePermission[]
}

export const useModules = (tenantId?: string | null) => {
  const dispatch = useDispatch()
  const {
    data: modules,
    loading,
    error,
    lastFetched,
  } = useSelector((state: RootState) => state.modules)

  const fetchModules = async (force = false) => {
    // Check if we have cached data and it's less than 1 hour old
    const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds
    if (
      !force &&
      modules.length > 0 &&
      lastFetched &&
      Date.now() - lastFetched < oneHour
    ) {
      return // Use cached data
    }

    if (!tenantId) {
      dispatch(setError('No tenantId available'))
      return
    }

    try {
      dispatch(setLoading(true))
      const response = await apiService.get(
        `/v1/modules/${tenantId}/permissions`
      )
      // Handle different possible response structures
      let modulesData: Module[] = []
      if (Array.isArray(response.data)) {
        modulesData = response.data
      } else if (response.data && Array.isArray(response.data.modules)) {
        modulesData = response.data.modules
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        modulesData = response.data.data
      } else {
        dispatch(setError('Unexpected API response structure'))
        return
      }

      dispatch(setModules(modulesData))
    } catch (error) {
      console.error('Error fetching modules:', error)
      dispatch(setError('Error fetching modules'))
    }
  }

  const refetch = async () => {
    await fetchModules(true) // Force refresh
  }

  const forceRefresh = () => {
    dispatch(forceRefreshModulesAction()) // Clear cache timestamp
  }

  useEffect(() => {
    fetchModules()
  }, [tenantId])

  return {
    modules,
    loading,
    error,
    refetch,
    forceRefresh,
  }
}
