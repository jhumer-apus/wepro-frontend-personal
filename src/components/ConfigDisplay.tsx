import React from 'react'
import { useConfig } from '@/src/hooks/useConfig'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'

export const ConfigDisplay: React.FC = () => {
  const config = useConfig()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Configuration
          <Badge
            variant={
              config.isDevelopment
                ? 'default'
                : config.isStaging
                  ? 'secondary'
                  : 'destructive'
            }
          >
            {config.environment}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-medium text-sm text-gray-600">API Base URL</h4>
          <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-1 break-all">
            {config.api.baseUrl}
          </p>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-600">Timeout</h4>
          <p className="text-sm">{config.api.timeout}ms</p>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-600">Features</h4>
          <div className="flex gap-2 mt-1">
            <Badge
              variant={config.features.enableAnalytics ? 'default' : 'outline'}
            >
              Analytics {config.features.enableAnalytics ? 'ON' : 'OFF'}
            </Badge>
            <Badge
              variant={config.features.enableDebugMode ? 'default' : 'outline'}
            >
              Debug {config.features.enableDebugMode ? 'ON' : 'OFF'}
            </Badge>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-600">App Info</h4>
          <p className="text-sm">Version: {config.app.version}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ConfigDisplay
