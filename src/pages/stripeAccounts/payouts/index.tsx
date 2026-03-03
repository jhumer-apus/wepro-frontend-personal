import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  TrendingUp,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Building2,
  Filter,
  Search,
  RefreshCw,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  CreditCard,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react'
import DashboardContent from '@/src/components/stripeAccounts/DashboardContent'

interface LocalAccount {
  id: string
  name: string
  isActive: boolean
  isDefault: boolean
  balanceData: {
    currentBalance: number
    instantAvailable: number
    instantPayout: number
  }
  address?: string
  phone?: string
  manager?: string
}

const recentPayouts = [
  {
    id: 1,
    amount: 2450.0,
    date: '2024-01-15',
    status: 'completed',
    method: 'Bank Transfer',
  },
  {
    id: 2,
    amount: 1890.5,
    date: '2024-01-12',
    status: 'completed',
    method: 'Instant Payout',
  },
  {
    id: 3,
    amount: 3200.75,
    date: '2024-01-10',
    status: 'pending',
    method: 'Bank Transfer',
  },
]

export default function StripeAccountsPayouts() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [isSetupComplete, setIsSetupComplete] = useState(true)
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false)
  const [showCompanyInfoDialog, setShowCompanyInfoDialog] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)

  // Account data
  const accounts: LocalAccount[] = [
    {
      id: 'all',
      name: 'All Locations',
      isActive: true,
      isDefault: false,
      balanceData: {
        currentBalance: 10697.18,
        instantAvailable: 10697.18,
        instantPayout: 10697.18,
      },
    },
    {
      id: 'downtown',
      name: 'Downtown Location',
      address: '123 Main St, Downtown, ST 12345',
      phone: '(555) 123-4567',
      manager: 'John Smith',
      isActive: true,
      isDefault: true,
      balanceData: {
        currentBalance: 6420.5,
        instantAvailable: 6420.5,
        instantPayout: 6420.5,
      },
    },
    {
      id: 'westside',
      name: 'Westside Location',
      address: '456 Oak Ave, Westside, ST 67890',
      phone: '(555) 987-6543',
      manager: 'Sarah Johnson',
      isActive: true,
      isDefault: false,
      balanceData: {
        currentBalance: 4276.68,
        instantAvailable: 4276.68,
        instantPayout: 4276.68,
      },
    },
  ]

  // Get current account data
  const currentAccount =
    accounts.find(f => f.id === selectedAccount) || accounts[0]
  const balanceData = currentAccount.balanceData

  // Payout data
  const payouts = [
    {
      id: 'po_001',
      amount: 6420.5,
      status: 'completed',
      method: 'Bank Transfer',
      account: '****1234',
      scheduledDate: '2024-01-16',
      completedDate: '2024-01-16',
      franchiseId: 'downtown',
      franchiseName: 'Downtown Location',
      fee: 0.0,
      netAmount: 6420.5,
      description: 'Weekly payout',
    },
    {
      id: 'po_002',
      amount: 4276.68,
      status: 'pending',
      method: 'Bank Transfer',
      account: '****5678',
      scheduledDate: '2024-01-17',
      completedDate: null,
      franchiseId: 'westside',
      franchiseName: 'Westside Location',
      fee: 0.0,
      netAmount: 4276.68,
      description: 'Weekly payout',
    },
    {
      id: 'po_003',
      amount: 1500.0,
      status: 'processing',
      method: 'Instant Payout',
      account: '****9012',
      scheduledDate: '2024-01-15',
      completedDate: null,
      franchiseId: 'downtown',
      franchiseName: 'Downtown Location',
      fee: 22.5,
      netAmount: 1477.5,
      description: 'Emergency payout',
    },
  ]

  // Filter payouts based on selected franchise
  const filteredPayouts =
    selectedAccount === 'all'
      ? payouts
      : payouts.filter(payout => payout.franchiseId === selectedAccount)

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Calculate totals
  const payoutTotals = {
    totalAmount: filteredPayouts.reduce(
      (sum, payout) => sum + payout.amount,
      0
    ),
    totalFees: filteredPayouts.reduce((sum, payout) => sum + payout.fee, 0),
    totalNet: filteredPayouts.reduce(
      (sum, payout) => sum + payout.netAmount,
      0
    ),
    completedCount: filteredPayouts.filter(p => p.status === 'completed')
      .length,
    pendingCount: filteredPayouts.filter(p => p.status === 'pending').length,
  }

  return (
    <>
      <Head>
        <title>Payouts - Stripe Accounts - WePro</title>
        <meta
          name="description"
          content="Manage payment transfers and payout history"
        />
      </Head>
      <DashboardContent
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        accounts={accounts}
        currentAccount={currentAccount}
        balanceData={balanceData}
        isSetupComplete={isSetupComplete}
        setShowAddLocationDialog={setShowAddLocationDialog}
        setShowCompanyInfoDialog={setShowCompanyInfoDialog}
        setShowSetupDialog={setShowSetupDialog}
        loadingAccounts={false}
        accountsError={null}
      />
      <div className="space-y-6 mt-4">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
          <Button
            variant="ghost"
            onClick={() => router.push('/stripeAccounts/overview')}
            className="flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant="default"
            onClick={() => router.push('/stripeAccounts/payouts')}
            className="flex-1 flex items-center justify-center text-white"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Payouts
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/stripeAccounts/payments')}
            className="flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Payments
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/stripeAccounts/disputes')}
            className="flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Disputes
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/stripeAccounts/equipment')}
            className="flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Equipment
          </Button>
        </div>

        {/* Header */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Payout Management</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Track and manage all your payouts
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">$8,540.68</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Completed Payouts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">$3,200.75</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Pending Payouts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">$1,890.50</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Instant Payouts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Payouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayouts.map(payout => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        {payout.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">
                          ${payout.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {payout.method} • {payout.date}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        payout.status === 'completed' ? 'default' : 'secondary'
                      }
                    >
                      {payout.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
