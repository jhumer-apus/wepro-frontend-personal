export interface Config {
  api: {
    baseUrl: string
    rootUrl?: string
    timeout: number
    apiKey?: string
  }
  app: {
    name: string
    version: string
    environment: string
  }
  features: {
    enableAnalytics: boolean
    enableDebugMode: boolean
  }
}

const getEnvironment = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: check for environment variable or default to development
    return process.env.NEXT_PUBLIC_ENV || 'development'
  }
  // Server-side: check for environment variable or default to development
  return process.env.NODE_ENV || 'development'
}

const configs: Record<string, Config> = {
  development: {
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      rootUrl: process.env.NEXT_PUBLIC_URL,
      apiKey: process.env.NEXT_PUBLIC_API_KEY,
      timeout: 10000,
    },
    app: {
      name: 'WePro',
      version: '0.1.0',
      environment: 'development',
    },
    features: {
      enableAnalytics: false,
      enableDebugMode: true,
    },
  },
  staging: {
    api: {
      baseUrl:
      process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.wepro.ai/api',
      rootUrl: process.env.NEXT_PUBLIC_URL,
      apiKey: process.env.NEXT_PUBLIC_API_KEY,
      timeout: 15000,
    },
    app: {
      name: 'WePro',
      version: '0.1.0',
      environment: 'staging',
    },
    features: {
      enableAnalytics: true,
      enableDebugMode: true,
    },
  },
  production: {
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.wepro.ai/api',
      apiKey: process.env.NEXT_PUBLIC_API_KEY,
      rootUrl: process.env.NEXT_PUBLIC_URL,
      timeout: 20000,
    },
    app: {
      name: 'WePro',
      version: '0.1.0',
      environment: 'production',
    },
    features: {
      enableAnalytics: true,
      enableDebugMode: false,
    },
  },
}

const currentEnv = getEnvironment()
const config = configs[currentEnv] || configs.development

export default config
export { getEnvironment }
