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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import {
  CreditCard,
  Search,
  Filter,
  Download,
  RefreshCw,
  Building2,
  Eye,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Settings,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import DashboardContent from '@/src/components/stripeAccounts/DashboardContent'

interface LocalAccount {
  id: string
  name: string
  isActive: boolean
  balanceData: {
    currentBalance: number
    instantAvailable: number
    instantPayout: number
  }
  address?: string
  phone?: string
  manager?: string
}

interface Payment {
  id: string
  jobId: string
  accountId: string
  accountName: string
  clientName: string
  sourceProvider: string
  cardBrand: string
  cardLast4: string
  totalAmount: number
  netAmount: number
  totalFee: number
  processingFee: number
  applicationFee: number
  payoutAt: string
  type: string
  chargeBy: string
  status: string
  refunded: boolean
  refund: number
  dated: string
  receiptDetails: any
}

export default function StripeAccountsPayments() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [isSetupComplete, setIsSetupComplete] = useState(true)
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false)
  const [showCompanyInfoDialog, setShowCompanyInfoDialog] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showJobDialog, setShowJobDialog] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')

  // Account data
  const accounts: LocalAccount[] = [
    {
      id: 'all',
      name: 'All Locations',
      isActive: true,
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

  // Payment data
  const payments = [
    {
      id: 'JOB001',
      jobId: 'JOB001',
      accountId: 'downtown',
      accountName: 'Downtown Location',
      clientName: 'ABC Corp',
      sourceProvider: 'WePro Direct',
      cardBrand: 'Visa',
      cardLast4: '4242',
      totalAmount: 125.0,
      netAmount: 121.38,
      totalFee: 3.62,
      processingFee: 3.62,
      applicationFee: 0.0,
      payoutAt: '2024-01-16',
      type: 'Sale',
      chargeBy: 'Customer',
      refunded: false,
      refund: 0.0,
      dated: '2024-01-15',
      technician: 'Mike Johnson',
      status: 'completed',
      jobDetails: {
        address: '123 Business St, Corporate City, ST 12345',
        serviceType: 'Plumbing Repair',
        description: 'Fixed kitchen sink leak and replaced faucet',
        duration: '1.5 hours',
        customerPhone: '(555) 123-4567',
        customerEmail: 'billing@abccorp.com',
      },
      receiptDetails: {
        receiptNumber: 'RCP-001-2024',
        transactionId: 'txn_1234567890',
        cardholderName: 'Mike Johnson',
        authCode: '123456',
        merchantId: 'WEPRO_12345',
      },
    },
    {
      id: 'JOB002',
      jobId: 'JOB002',
      accountId: 'westside',
      accountName: 'Westside Location',
      clientName: 'Smith Plumbing',
      sourceProvider: 'Google Ads',
      cardBrand: 'Mastercard',
      cardLast4: '8888',
      totalAmount: 275.5,
      netAmount: 267.51,
      totalFee: 7.99,
      processingFee: 7.99,
      applicationFee: 0.0,
      payoutAt: '2024-01-16',
      type: 'Sale',
      chargeBy: 'Customer',
      refunded: false,
      refund: 0.0,
      dated: '2024-01-15',
      technician: 'Sarah Wilson',
      status: 'completed',
      jobDetails: {
        address: '456 Oak Ave, Springfield, ST 54321',
        serviceType: 'Plumbing Repair',
        description: 'Fixed kitchen sink leak and replaced faucet',
        duration: '1.5 hours',
        customerPhone: '(555) 987-6543',
        customerEmail: 'contact@smithplumbing.com',
      },
      receiptDetails: {
        receiptNumber: 'RCP-002-2024',
        transactionId: 'txn_2345678901',
        cardholderName: 'Sarah Smith',
        authCode: '234567',
        merchantId: 'WEPRO_12345',
      },
    },
    {
      id: 'JOB003',
      jobId: 'JOB003',
      accountId: 'downtown',
      accountName: 'Downtown Location',
      clientName: 'Brown Electric',
      sourceProvider: 'Facebook Ads',
      cardBrand: 'American Express',
      cardLast4: '1234',
      totalAmount: 89.99,
      netAmount: 87.38,
      totalFee: 2.61,
      processingFee: 2.61,
      applicationFee: 0.0,
      payoutAt: '2024-01-15',
      type: 'Sale',
      chargeBy: 'Customer',
      refunded: false,
      refund: 0.0,
      dated: '2024-01-14',
      technician: 'David Brown',
      status: 'completed',
      jobDetails: {
        address: '789 Pine St, Riverside, ST 67890',
        serviceType: 'Electrical Repair',
        description: 'Fixed outlet wiring and installed new switches',
        duration: '1 hour',
        customerPhone: '(555) 456-7890',
        customerEmail: 'info@brownelectric.com',
      },
      receiptDetails: {
        receiptNumber: 'RCP-003-2024',
        transactionId: 'txn_3456789012',
        cardholderName: 'David Brown',
        authCode: '345678',
        merchantId: 'WEPRO_12345',
      },
    },
    {
      id: 'JOB004',
      jobId: 'JOB004',
      accountId: 'westside',
      accountName: 'Westside Location',
      clientName: 'ABC Heating',
      sourceProvider: 'Yelp',
      cardBrand: 'Visa',
      cardLast4: '5555',
      totalAmount: 320.0,
      netAmount: 310.72,
      totalFee: 9.28,
      processingFee: 9.28,
      applicationFee: 0.0,
      payoutAt: '2024-01-14',
      type: 'Sale',
      chargeBy: 'Customer',
      refunded: true,
      refund: 50.0,
      dated: '2024-01-13',
      technician: 'Lisa Garcia',
      status: 'refunded',
      jobDetails: {
        address: '321 Maple Dr, Westfield, ST 13579',
        serviceType: 'HVAC Installation',
        description:
          'Installed new furnace and ductwork - partial refund for delayed completion',
        duration: '4 hours',
        customerPhone: '(555) 321-6547',
        customerEmail: 'service@abcheating.com',
      },
      receiptDetails: {
        receiptNumber: 'RCP-004-2024',
        transactionId: 'txn_4567890123',
        cardholderName: 'Lisa Garcia',
        authCode: '456789',
        merchantId: 'WEPRO_12345',
      },
    },
  ]

  // Filter payments based on selected franchise
  const filteredPayments =
    selectedAccount === 'all'
      ? payments
      : payments.filter(payment => payment.accountId === selectedAccount)

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'refunded':
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
      case 'refunded':
        return <RefreshCw className="w-4 h-4 text-blue-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
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
  const paymentTotals = {
    totalPayments: filteredPayments.reduce(
      (sum, payment) => sum + payment.totalAmount,
      0
    ),
    totalJobs: filteredPayments.length,
    totalNet: filteredPayments.reduce(
      (sum, payment) => sum + payment.netAmount,
      0
    ),
    totalFees: filteredPayments.reduce(
      (sum, payment) => sum + payment.totalFee,
      0
    ),
    totalRefunds: filteredPayments.reduce(
      (sum, payment) => sum + payment.refund,
      0
    ),
  }

  return (
    <>
      <Head>
        <title>Payments - Stripe Accounts - WePro</title>
        <meta
          name="description"
          content="View and manage all payment transactions"
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
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant="ghost"
            onClick={() => router.push('/stripeAccounts/overview')}
            className="flex-1 flex items-center justify-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/stripeAccounts/payouts')}
            className="flex-1 flex items-center justify-center"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Payouts
          </Button>
          <Button
            variant="default"
            onClick={() => router.push('/stripeAccounts/payments')}
            className="flex-1 flex items-center justify-center"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Payments
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/stripeAccounts/disputes')}
            className="flex-1 flex items-center justify-center"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Disputes
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/stripeAccounts/equipment')}
            className="flex-1 flex items-center justify-center"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Equipment
          </Button>
        </div>

        {/* Header */}
        <div className="space-y-6">
          {/* Search and Filter Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Enhanced Search Bar */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      placeholder="Search by job ID, client name, or transaction ID..."
                      className="pl-10 pr-20"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {
                            filteredPayments.filter(
                              p =>
                                p.jobId
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()) ||
                                p.clientName
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase())
                            ).length
                          }{' '}
                          results
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => setSearchTerm('')}
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="relative">
                    <Filter className="w-4 h-4 mr-2" />
                    Advanced Filter
                    <Badge
                      variant="secondary"
                      className="absolute -top-2 -right-2 text-xs"
                    >
                      5
                    </Badge>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsLoading(true)
                      setTimeout(() => setIsLoading(false), 1000)
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>

                {/* Filter Row */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date Range</Label>
                    <Select defaultValue="today">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Start Date</Label>
                    <Input type="date" defaultValue="2025-10-12" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">End Date</Label>
                    <Input type="date" defaultValue="2025-10-12" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Source Provider
                    </Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="wepro">WePro Direct</SelectItem>
                        <SelectItem value="google">Google Ads</SelectItem>
                        <SelectItem value="facebook">Facebook Ads</SelectItem>
                        <SelectItem value="yelp">Yelp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Technician</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Technicians</SelectItem>
                        <SelectItem value="mike">Mike Johnson</SelectItem>
                        <SelectItem value="sarah">Sarah Wilson</SelectItem>
                        <SelectItem value="david">David Brown</SelectItem>
                        <SelectItem value="lisa">Lisa Garcia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Totals */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      ${paymentTotals.totalPayments.toLocaleString()}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Total Payments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {paymentTotals.totalJobs}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Total Jobs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      ${paymentTotals.totalNet.toLocaleString()}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Total Net
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      ${paymentTotals.totalFees.toLocaleString()}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Total Fees
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Payment Transactions */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    Payment Transactions
                  </CardTitle>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {filteredPayments.length} transactions • $
                    {paymentTotals.totalPayments.toLocaleString()} total
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/50 backdrop-blur-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/50 backdrop-blur-sm"
                    onClick={() => {
                      setIsLoading(true)
                      setTimeout(() => setIsLoading(false), 1000)
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900">
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Job ID
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Location
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Client Name
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Source Provider
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Card Brand
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Card Last4
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Total Amount
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Net Amount
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Total Fee
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Processing Fee
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Application Fee
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Payout At
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Type
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Charge By
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Status
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment, index) => (
                      <tr
                        key={payment.id}
                        className={`border-b border-neutral-200 dark:border-neutral-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950 dark:hover:to-cyan-950 transition-all duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-neutral-950' : 'bg-neutral-50/30 dark:bg-neutral-900/30'}`}
                      >
                        <td className="p-4 text-sm">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment)
                              setShowJobDialog(true)
                            }}
                            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer"
                          >
                            {payment.jobId}
                          </button>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-neutral-400" />
                            {payment.accountName}
                          </div>
                        </td>
                        <td className="p-3 text-sm font-medium">
                          {payment.clientName}
                        </td>
                        <td className="p-4 text-sm">
                          {payment.sourceProvider}
                        </td>
                        <td className="p-4 text-sm">
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            {payment.cardBrand}
                          </div>
                        </td>
                        <td className="p-3 text-sm font-mono">
                          ****{payment.cardLast4}
                        </td>
                        <td className="p-3 text-sm font-medium text-green-600 dark:text-green-400">
                          ${payment.totalAmount.toFixed(2)}
                        </td>
                        <td className="p-3 text-sm font-medium">
                          ${payment.netAmount.toFixed(2)}
                        </td>
                        <td className="p-3 text-sm text-red-600 dark:text-red-400">
                          ${payment.totalFee.toFixed(2)}
                        </td>
                        <td className="p-3 text-sm text-red-600 dark:text-red-400">
                          ${payment.processingFee.toFixed(2)}
                        </td>
                        <td className="p-4 text-sm">
                          ${payment.applicationFee.toFixed(2)}
                        </td>
                        <td className="p-4 text-sm">{payment.payoutAt}</td>
                        <td className="p-4 text-sm">{payment.type}</td>
                        <td className="p-4 text-sm">{payment.chargeBy}</td>
                        <td className="p-4 text-sm">
                          <Badge
                            variant={
                              payment.status === 'completed'
                                ? 'default'
                                : payment.status === 'refunded'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPayment(payment)
                                setShowReceiptDialog(true)
                              }}
                            >
                              Receipt
                            </Button>
                            {payment.status === 'completed' &&
                              !payment.refunded && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPayment(payment)
                                    setRefundAmount(
                                      payment.totalAmount.toString()
                                    )
                                    setShowRefundDialog(true)
                                  }}
                                >
                                  Refund
                                </Button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {filteredPayments.map((payment, index) => (
                  <Card
                    key={payment.id}
                    className="hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 hover:scale-[1.02]"
                  >
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <button
                              onClick={() => {
                                setSelectedPayment(payment)
                                setShowJobDialog(true)
                              }}
                              className="font-bold text-lg text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                            >
                              {payment.jobId}
                            </button>
                            <div className="flex items-center gap-1 mt-1">
                              <Building2 className="w-3 h-3 text-neutral-400" />
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {payment.accountName}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              payment.status === 'completed'
                                ? 'default'
                                : payment.status === 'refunded'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className="shadow-sm"
                          >
                            {payment.status}
                          </Badge>
                        </div>

                        <div>
                          <p className="font-medium">{payment.clientName}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {payment.sourceProvider}
                          </p>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              ${payment.totalAmount.toFixed(2)}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Net: ${payment.netAmount.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">
                              {payment.cardBrand} ****{payment.cardLast4}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {payment.dated}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setSelectedPayment(payment)
                              setShowReceiptDialog(true)
                            }}
                          >
                            Receipt
                          </Button>
                          {payment.status === 'completed' &&
                            !payment.refunded && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  setSelectedPayment(payment)
                                  setRefundAmount(
                                    payment.totalAmount.toString()
                                  )
                                  setShowRefundDialog(true)
                                }}
                              >
                                Refund
                              </Button>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Additional Details Section */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-4">
                  Additional Transaction Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Refunded Transactions
                    </Label>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                      ${paymentTotals.totalRefunds.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Average Transaction
                    </Label>
                    <p className="text-lg font-semibold">
                      $
                      {(
                        paymentTotals.totalPayments / paymentTotals.totalJobs
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Fee Percentage
                    </Label>
                    <p className="text-lg font-semibold">
                      {(
                        (paymentTotals.totalFees /
                          paymentTotals.totalPayments) *
                        100
                      ).toFixed(2)}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
