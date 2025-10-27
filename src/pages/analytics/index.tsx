import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { BarChart3 } from 'lucide-react'

const analyticsIndex: React.FC = (): React.JSX.Element => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Analytics
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Track your business performance and insights
        </p>
      </div>

      <Card className="wepro-card wepro-card-dark">
        <CardHeader>
          <CardTitle>Business Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-neutral-500 dark:text-neutral-400">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">
                Analytics dashboard coming soon
              </p>
              <p className="text-sm">
                Detailed reports, charts, and business insights will be
                available here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default analyticsIndex
