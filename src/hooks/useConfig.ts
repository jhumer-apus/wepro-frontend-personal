import { useMemo } from 'react'
import config, { getEnvironment } from '@/src/config'

export const useConfig = () => {
  const environment = useMemo(() => getEnvironment(), [])

  return useMemo(
    () => ({
      ...config,
      environment,
      isDevelopment: environment === 'development',
      isStaging: environment === 'staging',
      isProduction: environment === 'production',
    }),
    [environment]
  )
}

export default useConfig
