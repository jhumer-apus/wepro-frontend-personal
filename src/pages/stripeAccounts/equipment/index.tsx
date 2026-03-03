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
  ShoppingCart,
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
  CreditCard,
  Smartphone,
  Monitor,
  Wifi,
  Battery,
  Settings,
  TrendingUp,
  AlertTriangle,
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

export default function StripeAccountsEquipment() {
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

  // Equipment data
  const equipment = [
    {
      id: 'EQ001',
      name: 'Clover Flex Terminal',
      type: 'Mobile Terminal',
      model: 'Clover Flex',
      serialNumber: 'CF-2024-001',
      status: 'active',
      location: 'Downtown Location',
      accountId: 'downtown',
      accountName: 'Downtown Location',
      assignedTo: 'Mike Johnson',
      lastSync: '2024-01-16 10:30 AM',
      batteryLevel: 85,
      wifiSignal: 'Strong',
      firmwareVersion: 'v2.1.3',
      purchaseDate: '2024-01-01',
      warrantyExpiry: '2025-01-01',
      cost: 299.99,
      monthlyFee: 29.99,
    },
    {
      id: 'EQ002',
      name: 'Square Reader',
      type: 'Card Reader',
      model: 'Square Reader (2nd Gen)',
      serialNumber: 'SQ-2024-002',
      status: 'active',
      location: 'Westside Location',
      accountId: 'westside',
      accountName: 'Westside Location',
      assignedTo: 'Sarah Wilson',
      lastSync: '2024-01-16 09:15 AM',
      batteryLevel: 92,
      wifiSignal: 'Good',
      firmwareVersion: 'v1.8.2',
      purchaseDate: '2024-01-05',
      warrantyExpiry: '2025-01-05',
      cost: 49.99,
      monthlyFee: 0.0,
    },
    {
      id: 'EQ003',
      name: 'Clover Station Pro',
      type: 'Counter Terminal',
      model: 'Clover Station Pro',
      serialNumber: 'CSP-2024-003',
      status: 'maintenance',
      location: 'Downtown Location',
      accountId: 'downtown',
      accountName: 'Downtown Location',
      assignedTo: 'David Brown',
      lastSync: '2024-01-15 14:20 PM',
      batteryLevel: 100,
      wifiSignal: 'Excellent',
      firmwareVersion: 'v3.0.1',
      purchaseDate: '2023-12-15',
      warrantyExpiry: '2024-12-15',
      cost: 1299.99,
      monthlyFee: 89.99,
    },
    {
      id: 'EQ004',
      name: 'Square Terminal',
      type: 'All-in-One Terminal',
      model: 'Square Terminal',
      serialNumber: 'ST-2024-004',
      status: 'inactive',
      location: 'Westside Location',
      accountId: 'westside',
      accountName: 'Westside Location',
      assignedTo: 'Lisa Garcia',
      lastSync: '2024-01-10 16:45 PM',
      batteryLevel: 15,
      wifiSignal: 'Weak',
      firmwareVersion: 'v2.5.0',
      purchaseDate: '2023-11-20',
      warrantyExpiry: '2024-11-20',
      cost: 799.99,
      monthlyFee: 49.99,
    },
  ]

  // Filter equipment based on selected franchise
  const filteredEquipment =
    selectedAccount === 'all'
      ? equipment
      : equipment.filter(item => item.accountId === selectedAccount)

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-500" />
      case 'maintenance':
        return <Settings className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-500'
    if (level > 20) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getWifiColor = (signal: string) => {
    switch (signal) {
      case 'Excellent':
      case 'Strong':
        return 'text-green-500'
      case 'Good':
        return 'text-yellow-500'
      case 'Weak':
        return 'text-red-500'
      default:
        return 'text-gray-500'
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
  const equipmentTotals = {
    totalEquipment: filteredEquipment.length,
    activeEquipment: filteredEquipment.filter(e => e.status === 'active')
      .length,
    maintenanceEquipment: filteredEquipment.filter(
      e => e.status === 'maintenance'
    ).length,
    inactiveEquipment: filteredEquipment.filter(e => e.status === 'inactive')
      .length,
    totalCost: filteredEquipment.reduce((sum, item) => sum + item.cost, 0),
    totalMonthlyFees: filteredEquipment.reduce(
      (sum, item) => sum + item.monthlyFee,
      0
    ),
  }

  return (
    <>
      <Head>
        <title>Equipment - Stripe Accounts - WePro</title>
        <meta
          name="description"
          content="Manage payment processing equipment and devices"
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
            variant="ghost"
            onClick={() => router.push('/stripeAccounts/disputes')}
            className="flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Disputes
          </Button>
          <Button
            variant="default"
            onClick={() => router.push('/stripeAccounts/equipment')}
            className="flex-1 flex items-center justify-center text-white"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Equipment
          </Button>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Card Reader Equipment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="w-full h-32 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Mobile Card Reader</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Portable chip & tap reader
                    </p>
                    <p className="text-lg font-bold mt-2">$49.99</p>
                  </div>
                  <Button className="w-full" size="sm">
                    Order Now
                  </Button>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="w-full h-32 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Countertop Terminal</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Full-featured POS terminal
                    </p>
                    <p className="text-lg font-bold mt-2">$199.99</p>
                  </div>
                  <Button className="w-full" size="sm">
                    Order Now
                  </Button>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="w-full h-32 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Virtual Terminal</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Process payments online
                    </p>
                    <p className="text-lg font-bold mt-2">Free</p>
                  </div>
                  <Button className="w-full" size="sm" variant="outline">
                    Setup Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
