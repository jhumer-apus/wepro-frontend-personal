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
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Building2,
  Eye,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Upload,
  Settings,
  TrendingUp,
  CreditCard,
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

export default function StripeAccountsDisputes() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [isSetupComplete, setIsSetupComplete] = useState(true)
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false)
  const [showCompanyInfoDialog, setShowCompanyInfoDialog] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [showDisputeEvidenceDialog, setShowDisputeEvidenceDialog] = useState(false)

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

  // Dispute data
  const disputes = [
    {
      id: 1,
      jobId: 'JOB001',
      transactionDate: '2024-01-15',
      updatedAt: '2024-01-16 10:30 AM',
      dated: '2024-01-10',
      sourceProvider: 'WePro Direct',
      customerName: 'ABC Corp',
      customerEmail: 'billing@abccorp.com',
      billingAddress: '123 Business St, Corporate City, ST 12345',
      customerPurchaseIP: '192.168.1.100',
      cardBrand: 'Visa',
      cardLast4: '4242',
      totalAmount: 125.0,
      disputeAmount: 125.0,
      netAmount: 121.38,
      totalFee: 3.62,
      payoutAt: '2024-01-16',
      disputeReason: 'Service not received',
      disputeStatus: 'under_review',
      type: 'Chargeback',
      technician: 'Mike Johnson',
      evidenceSubmitted: false,
      evidenceDeadline: '2024-01-20',
      franchiseId: 'downtown',
      franchiseName: 'Downtown Location',
    },
    {
      id: 2,
      jobId: 'JOB004',
      transactionDate: '2024-01-13',
      updatedAt: '2024-01-14 2:15 PM',
      dated: '2024-01-08',
      sourceProvider: 'Yelp',
      customerName: 'XYZ Ltd',
      customerEmail: 'finance@xyzltd.com',
      billingAddress: '456 Commerce Ave, Business Town, ST 67890',
      customerPurchaseIP: '10.0.0.50',
      cardBrand: 'Mastercard',
      cardLast4: '8888',
      totalAmount: 200.0,
      disputeAmount: 50.0,
      netAmount: 194.2,
      totalFee: 5.8,
      payoutAt: '2024-01-14',
      disputeReason: 'Duplicate charge',
      disputeStatus: 'resolved',
      type: 'Inquiry',
      technician: 'Lisa Garcia',
      evidenceSubmitted: true,
      evidenceDeadline: '2024-01-12',
      franchiseId: 'westside',
      franchiseName: 'Westside Location',
    },
    {
      id: 3,
      jobId: 'JOB005',
      transactionDate: '2024-01-12',
      updatedAt: '2024-01-13 9:45 AM',
      dated: '2024-01-07',
      sourceProvider: 'Facebook Ads',
      customerName: 'Tech Solutions Inc',
      customerEmail: 'payments@techsolutions.com',
      billingAddress: '789 Innovation Blvd, Tech City, ST 54321',
      customerPurchaseIP: '172.16.0.25',
      cardBrand: 'American Express',
      cardLast4: '1234',
      totalAmount: 450.0,
      disputeAmount: 450.0,
      netAmount: 436.65,
      totalFee: 13.35,
      payoutAt: '2024-01-13',
      disputeReason: 'Fraudulent',
      disputeStatus: 'under_review',
      type: 'Chargeback',
      technician: 'David Brown',
      evidenceSubmitted: true,
      evidenceDeadline: '2024-01-18',
      franchiseId: 'downtown',
      franchiseName: 'Downtown Location',
    },
  ]

  // Filter disputes based on selected franchise
  const filteredDisputes =
    selectedAccount === 'all'
      ? disputes
      : disputes.filter(dispute => dispute.franchiseId === selectedAccount)

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'lost':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'won':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'under_review':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'lost':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'won':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Chargeback':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'Inquiry':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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
  const disputeTotals = {
    totalDisputes: filteredDisputes.length,
    totalAmount: filteredDisputes.reduce(
      (sum, dispute) => sum + dispute.disputeAmount,
      0
    ),
    underReview: filteredDisputes.filter(
      d => d.disputeStatus === 'under_review'
    ).length,
    resolved: filteredDisputes.filter(d => d.disputeStatus === 'resolved')
      .length,
    evidenceSubmitted: filteredDisputes.filter(d => d.evidenceSubmitted).length,
  }

  return (
    <>
      <Head>
        <title>Disputes - Stripe Accounts - WePro</title>
        <meta
          name="description"
          content="Manage chargebacks and payment disputes"
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
            variant="ghost"
            onClick={() => router.push('/stripeAccounts/payouts')}
            className="flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700"
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
            variant="default"
            onClick={() => router.push('/stripeAccounts/disputes')}
            className="flex-1 flex items-center justify-center text-white"
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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Dispute Management</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Track and manage payment disputes
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

          {/* Dispute Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Active Disputes
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
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Pending Evidence
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">1</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Resolved
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      $
                      {disputes
                        .reduce((sum, d) => sum + d.disputeAmount, 0)
                        .toFixed(2)}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Total Disputed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Disputes Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Dispute Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1400px]">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-900">
                      <th className="text-left p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Transaction Date
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Updated At
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Job ID
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Source Provider
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Customer Name
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Customer Email
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Card Brand
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Card Last4
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Total Amount
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Dispute Amount
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Dispute Reason
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Dispute Status
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Type
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Technician
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {disputes.map((dispute, index) => (
                      <tr
                        key={dispute.id}
                        className={`border-b hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-neutral-950' : 'bg-neutral-50/50 dark:bg-neutral-900/50'}`}
                      >
                        <td className="p-4 text-sm">
                          {dispute.transactionDate}
                        </td>
                        <td className="p-4 text-sm">{dispute.updatedAt}</td>
                        <td className="p-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                          {dispute.jobId}
                        </td>
                        <td className="p-4 text-sm">
                          {dispute.sourceProvider}
                        </td>
                        <td className="p-3 text-sm font-medium">
                          {dispute.customerName}
                        </td>
                        <td className="p-4 text-sm">{dispute.customerEmail}</td>
                        <td className="p-4 text-sm">
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            {dispute.cardBrand}
                          </div>
                        </td>
                        <td className="p-3 text-sm font-mono">
                          ****{dispute.cardLast4}
                        </td>
                        <td className="p-3 text-sm font-medium">
                          ${dispute.totalAmount.toFixed(2)}
                        </td>
                        <td className="p-3 text-sm font-medium text-red-600 dark:text-red-400">
                          ${dispute.disputeAmount.toFixed(2)}
                        </td>
                        <td className="p-4 text-sm">{dispute.disputeReason}</td>
                        <td className="p-4 text-sm">
                          <Badge
                            variant={
                              dispute.disputeStatus === 'resolved'
                                ? 'default'
                                : dispute.disputeStatus === 'under_review'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {dispute.disputeStatus.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">{dispute.type}</td>
                        <td className="p-4 text-sm">{dispute.technician}</td>
                        <td className="p-4 text-sm">
                          <div className="flex gap-1">
                            {!dispute.evidenceSubmitted &&
                              dispute.disputeStatus === 'under_review' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedDispute(dispute)
                                    setShowDisputeEvidenceDialog(true)
                                  }}
                                >
                                  Submit Evidence
                                </Button>
                              )}
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
