import React from 'react'
import { useRouter } from 'next/router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { CreditCard, Phone } from 'lucide-react'

const billingIndex: React.FC = (): React.JSX.Element => {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <Button
          variant="default"
          onClick={() => router.push('/billing/wepro')}
          className="flex-1 flex items-center justify-center"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          WePro
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push('/billing/answering-services')}
          className="flex-1 flex items-center justify-center"
        >
          <Phone className="w-4 h-4 mr-2" />
          Answering Services
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Billing
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Manage invoices, payments, and billing
        </p>
      </div>

      <Card className="wepro-card wepro-card-dark">
        <CardHeader>
          <CardTitle>Billing Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-neutral-500 dark:text-neutral-400">
            <div className="text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Billing system coming soon</p>
              <p className="text-sm">
                Create invoices, track payments, and manage billing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default billingIndex
