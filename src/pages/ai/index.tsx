import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Zap } from 'lucide-react'

const aiIndex: React.FC = (): React.JSX.Element => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          AI Assistant
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Get AI-powered insights and automation for your business
        </p>
      </div>

      <Card className="wepro-card wepro-card-dark">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-brand-500" />
            AI-Powered Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-neutral-500 dark:text-neutral-400">
            <div className="text-center">
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-50 text-brand-500" />
              <p className="text-lg font-medium">AI Assistant coming soon</p>
              <p className="text-sm">
                Smart scheduling, predictive analytics, and automated workflows
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default aiIndex
