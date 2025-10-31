import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
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
  DollarSign,
  Building2,
  Settings,
  Plus,
  AlertTriangle,
  TrendingUp,
  Zap,
  Trash2,
} from 'lucide-react'

interface StripeAccount {
  _id: string
  id: string
  accountNickname: string
  businessName: string
  isActive: boolean
  balanceData?: {
    currentBalance: number
    instantAvailable: number
    instantPayout: number
  }
  weproInvoice?: {
    companyName: string
    address: string
    companyPhone: string
    addressLine2: string
    city: string
    state: string
    zipCode: string
    country: string
    addressId: string
    lat: number | null
    lng: number | null
  }
}

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
  accountNickname?: string
  businessName?: string
  weproInvoice?: {
    address?: string
    companyPhone?: string
  }
}

interface DashboardContentProps {
  selectedAccount: string
  setSelectedAccount: (value: string) => void
  accounts: LocalAccount[]
  currentAccount: LocalAccount
  balanceData: {
    currentBalance: number
    instantAvailable: number
    instantPayout: number
  }
  isSetupComplete: boolean
  setShowAddLocationDialog: (value: boolean) => void
  setShowCompanyInfoDialog: (value: boolean) => void
  setShowSetupDialog: (value: boolean) => void
  loadingAccounts: boolean
  accountsError: string | null
  handleSetAsDefault?: (accountId: string) => void
  handleDeleteAccount?: (accountId: string) => void
}

export default function DashboardContent({
  selectedAccount,
  setSelectedAccount,
  accounts,
  currentAccount,
  balanceData,
  isSetupComplete,
  setShowAddLocationDialog,
  setShowCompanyInfoDialog,
  setShowSetupDialog,
  loadingAccounts,
  accountsError,
  handleSetAsDefault,
  handleDeleteAccount,
}: DashboardContentProps) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Get Paid with WePro
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Complete payment processing solution for your business
          </p>
          {selectedAccount && (
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                <Building2 className="w-3 h-3 mr-1" />
                {currentAccount.accountNickname || currentAccount.name}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {selectedAccount && currentAccount && !currentAccount.isDefault && handleSetAsDefault && (
            <Button
              variant="outline"
              onClick={() => handleSetAsDefault(currentAccount.id)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Set as default
            </Button>
          )}
          <div className="flex items-center gap-2">
            {selectedAccount && currentAccount && currentAccount.isDefault && (
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                Default
              </Badge>
            )}
            <Select
              value={selectedAccount}
              onValueChange={setSelectedAccount}
              disabled={loadingAccounts}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={loadingAccounts ? "Loading..." : "Select Account"} />
              </SelectTrigger>
              <SelectContent>
                {accountsError ? (
                  <SelectItem value="error" disabled>
                    <div className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="w-4 h-4" />
                      Error loading accounts
                    </div>
                  </SelectItem>
                ) : (
                  accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {account.accountNickname}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAddLocationDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
          {selectedAccount && handleDeleteAccount && accounts.length > 1 && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDeleteAccount(selectedAccount)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          {!isSetupComplete && (
            <Button onClick={() => setShowSetupDialog(true)}>
              <CreditCard className="w-4 h-4 mr-2" />
              Complete Setup
            </Button>
          )}
        </div>
      </div>

      {/* Setup Status */}
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-semibold text-green-800 dark:text-green-200">
                  Payment Processing Active
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Your account is set up and ready to accept payments
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Balance Overview */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -mr-16 -mt-16"></div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-500" />
                Account Balance
              </CardTitle>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {selectedAccount === 'all'
                  ? 'All Locations Combined'
                  : currentAccount.accountNickname || currentAccount.name}
              </p>
            </div>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Current Balance
                </Label>
              </div>
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                ${balanceData.currentBalance.toLocaleString()}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Available for payout
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Instant Available
                </Label>
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${balanceData.instantAvailable.toLocaleString()}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Ready for instant payout
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Quick Actions
                </Label>
              </div>
              <div className="space-y-2">
                <Button className="w-full" size="sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Instant Payout (1.5% fee)
                </Button>
                <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
                  Get funds in your account within minutes
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      {selectedAccount !== 'all' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Account Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Account Name
                </Label>
                <p className="text-sm font-medium">{currentAccount.accountNickname || currentAccount.name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Business Name
                </Label>
                <p className="text-sm">{currentAccount.businessName || currentAccount.name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Address
                </Label>
                <p className="text-sm">
                  {currentAccount.weproInvoice?.address || currentAccount.address || 'Not set'}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Phone
                </Label>
                <p className="text-sm">
                  {currentAccount.weproInvoice?.companyPhone || currentAccount.phone || 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 dark:text-green-400">
                Payment processing active
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
