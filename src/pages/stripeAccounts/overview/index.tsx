import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useTheme } from 'next-themes'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { 
  CreditCard, 
  Settings, 
  Edit3, 
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  Building2,
  XCircle,
  MapPin,
  Filter,
  Search,
  Calendar,
  User,
  RefreshCw,
  Loader2,
  X,
  Eye,
  MoreVertical,
  Trash2,
  ExternalLink,
  BarChart3,
  Info,
  Upload,
} from 'lucide-react'
import DashboardContent from '@/src/components/stripeAccounts/DashboardContent'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { GoogleMap, Marker, StandaloneSearchBox } from '@react-google-maps/api'
import { Alert, AlertDescription } from '@/src/components/ui/alert'

// Interface for Account data
interface Account {
  _id: string
  name: string
  ownerName: string
  status: string
  weproUsername: string
  isPrimary: boolean
  email: string
  phoneNumber: string
  address: string
  addressLine2: string
  city: string
  state: string
  zipCode: string
  country: string
  addressId: string
  lat: number
  lng: number
  createdBy: {
    _id: string
    name: string
    username: string
  }
  tenantId: {
    _id: string
    name: string
    username: string
  }
  createdAt: string
  updatedAt: string
  code: string
}

interface AccountsResponse {
  success: boolean
  message: string
  count: number
  pagination: {
    current: {
      page: number
      limit: number
    }
    total: number
    pages: number
  }
  data: Account[]
}

// Interface for Stripe Account data
interface StripeAccount {
  _id: string
  ownerTenantId: string
  ownerType: string
  accountType: string
  stripeConnectAccountId: string
  accountNickname: string
  businessName: string
  isDefault: boolean
  isActive: boolean
  stripeAccountStatus: string
  chargesEnabled: boolean
  detailsSubmitted: boolean
  payoutsEnabled: boolean
  logoUrl: string
  totalVolume: number
  totalTransactions: number
  createdBy: {
    _id: string
    name: string
    username: string
  }
  lastSyncAt: string | null
  assignedToAccounts: any[]
  assignedToSources: any[]
  createdAt: string
  updatedAt: string
  accountCode: string
  displayName: string
  id: string
  creditCardProcessingFees?: {
    paidBy: string
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
  balanceData?: {
    currentBalance: number
    instantAvailable: number
    instantPayout: number
  }
}

interface StripeAccountsResponse {
  success: boolean
  message: string
  data: {
    data: StripeAccount[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export default function StripeAccountsOverview() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  const router = useRouter()
  const [isSetupComplete, setIsSetupComplete] = useState(true)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [showCompanyInfoDialog, setShowCompanyInfoDialog] = useState(false)
  const [showSignupDialog, setShowSignupDialog] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [showJobDialog, setShowJobDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [showDisputeEvidenceDialog, setShowDisputeEvidenceDialog] =
    useState(false)
  const [selectedAccount, setSelectedAccount] = useState('')
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false)
  const [showSetupWorkflowDialog, setShowSetupWorkflowDialog] = useState(false)
  const [selectedAccountForSetup, setSelectedAccountForSetup] =
    useState<Account | null>(null)
  const [setupStep, setSetupStep] = useState(1)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Accounts data state
  const [accounts, setAccounts] = useState<StripeAccount[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [accountsError, setAccountsError] = useState<string | null>(null)

  const [markerBuffer, setMarkerBuffer] = useState(false)

  // Stripe accounts table state
  const [stripeAccounts, setStripeAccounts] = useState<StripeAccount[]>([])
  const [loadingStripeAccounts, setLoadingStripeAccounts] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)

  // Edit view state
  const [editingAccount, setEditingAccount] = useState<StripeAccount | null>(
    null
  )
  const [editFormData, setEditFormData] = useState({
    accountNickname: '',
    businessName: '',
    isActive: true,
  })
  const [saving, setSaving] = useState(false)

  // Delete confirmation state
  const [deletingAccount, setDeletingAccount] = useState<StripeAccount | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Onboarding status state
  const [showOnboardingStatusDialog, setShowOnboardingStatusDialog] = useState(false)
  const [onboardingStatusData, setOnboardingStatusData] = useState<any>(null)
  const [loadingOnboardingStatus, setLoadingOnboardingStatus] = useState(false)
  
  // Company info edit state
  const [companyInfoFormData, setCompanyInfoFormData] = useState({
    companyName: '',
    address: '',
    companyPhone: '',
  })
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Accounts state
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>(
    []
  )

  // Step 1 form data
  const [step1FormData, setStep1FormData] = useState({
    companyPhone: '',
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    addressId: '',
    lat: '',
    lng: '',
  })

  // Step 2 form data
  const [step2FormData, setStep2FormData] = useState({
    accountNickname: '',
    companyName: '',
    companyEmail: '',
  })

  // Step 4 form data
  const [step4FormData, setStep4FormData] = useState({
    creditCardProcessingFees: {
      paidBy: 'Client' as 'Client' | 'Company',
    },
  })

  // Setup process loading state
  const [setupLoading, setSetupLoading] = useState(false)
  
  // Map state for Step 1
  const [mapLoaded, setMapLoaded] = useState(false)
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)

  // Fetch accounts data from API
  const fetchAccounts = async () => {
    try {
      setLoadingAccounts(true)
      setAccountsError(null)
      
      const response = await apiService.get('/v3/stripe-accounts?page=1&limit=100')
      
      if (response.data.success) {
        const accountsData = response.data.data.data
        
        // Sort accounts: move default account to first position if it exists
        const sortedAccounts = [...accountsData].sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1
          if (!a.isDefault && b.isDefault) return 1
          return 0
        })

        // const sortedAccounts: StripeAccount[] = [];
        
        setAccounts(sortedAccounts)
        
        // Set selected account to default account if it exists, otherwise use first account
        if (sortedAccounts.length > 0) {
          const defaultAccount = sortedAccounts.find(account => account.isDefault)
          if (defaultAccount) {
            setSelectedAccount(defaultAccount.id)
          } else {
            setSelectedAccount(sortedAccounts[0].id)
          }
        }
      } else {
        setAccountsError('Failed to fetch accounts data')
      }
    } catch (error: any) {
      console.error('Error fetching accounts:', error)
      setAccountsError('Failed to fetch accounts data')
    } finally {
      setLoadingAccounts(false)
    }
  }

  // Get current account data
  const currentAccount =
    accounts.find(f => f.id === selectedAccount) || accounts[0]
  const balanceData = currentAccount?.balanceData || {
    currentBalance: 0,
    instantAvailable: 0,
    instantPayout: 0,
  }

  // Fetch accounts on component mount
  useEffect(() => {
    fetchAccounts()
  }, [])

  // Debounce search term effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500) // 500ms debounce delay

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch stripe accounts data
  useEffect(() => {
    const fetchStripeAccounts = async () => {
      try {
        setLoadingStripeAccounts(true)
        setError(null)

        let url = `/v3/stripe-accounts?page=${currentPage}&limit=${entriesPerPage}`
        if (debouncedSearchTerm) {
          url += `&search=${encodeURIComponent(debouncedSearchTerm)}`
        }

        const response = await apiService.get<StripeAccountsResponse>(url)
        const responseData = response.data

        if (responseData.success) {
          setStripeAccounts(responseData.data.data)
          setTotalCount(responseData.data.pagination.total)
          setTotalPages(responseData.data.pagination.pages)
        } else {
          setError(responseData.message || 'Failed to fetch stripe accounts')
        }
      } catch (err: any) {
        console.error('Error fetching stripe accounts:', err)
        setError(
          err.response?.data?.message || 'Failed to fetch stripe accounts'
        )
        toast.error('Failed to fetch stripe accounts', {
          description:
            err.response?.data?.message ||
            'An error occurred while fetching data.',
        })
      } finally {
        setLoadingStripeAccounts(false)
      }
    }

    fetchStripeAccounts()
  }, [currentPage, entriesPerPage, debouncedSearchTerm])

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm])

  // Check for accountId query parameter for onboarding completion
  useEffect(() => {
    const { accountId } = router.query
    
    if (accountId && typeof accountId === 'string') {
      handleOnboardingComplete(accountId)
    }
  }, [router.query])

  // Fetch accounts data
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoadingStripeAccounts(true)
        const response =
          await apiService.get<AccountsResponse>('/v3/franchises')

        if (response.data.success) {
          // Filter out accounts that already have stripe accounts (assuming we can determine this)
          // For now, we'll show all accounts as available
          setAvailableAccounts(response.data.data)
        } else {
          console.error('Failed to fetch accounts:', response.data.message)
        }
      } catch (err: any) {
        console.error('Error fetching accounts:', err)
        toast.error('Failed to fetch accounts', {
          description:
            err.response?.data?.message ||
            'An error occurred while fetching account data.',
        })
      } finally {
        setLoadingStripeAccounts(false)
      }
    }

    fetchAccounts()
  }, [])

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'restricted':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getAccountTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'default':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'secondary':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEntriesChange = (value: string) => {
    setEntriesPerPage(parseInt(value))
    setCurrentPage(1) // Reset to first page when changing entries per page
  }

  // Edit handlers
  const handleEditAccount = (account: StripeAccount) => {
    setEditingAccount(account)
    setEditFormData({
      accountNickname: account.accountNickname,
      businessName: account.businessName,
      isActive: account.isActive,
    })
  }

  const handleCancelEdit = () => {
    setEditingAccount(null)
    setEditFormData({
      accountNickname: '',
      businessName: '',
      isActive: true,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingAccount) return

    try {
      setSaving(true)
      // Here you would make an API call to update the account
      // await apiService.put(`/v3/stripe-accounts/${editingAccount._id}`, editFormData)

      // For now, we'll just update the local state
      setStripeAccounts(prev =>
        prev.map(account =>
          account._id === editingAccount._id
            ? { ...account, ...editFormData }
            : account
        )
      )

      toast.success('Account updated successfully!')
      setEditingAccount(null)
    } catch (err: any) {
      console.error('Error updating account:', err)
      toast.error('Failed to update account', {
        description:
          err.response?.data?.message ||
          'An error occurred while updating the account.',
      })
    } finally {
      setSaving(false)
    }
  }

  // Delete handlers
  const handleDeleteAccount = (account: StripeAccount) => {
    setDeletingAccount(account)
    setShowDeleteDialog(true)
  }

  const handleDeleteAccountById = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId)
    if (account) {
      handleDeleteAccount(account)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingAccount) return

    try {
      setSaving(true)
      await apiService.delete(`/v3/stripe-accounts/${deletingAccount._id}`)
      
      toast.success('Account deleted successfully!')
      setShowDeleteDialog(false)
      setDeletingAccount(null)
      
      // Refresh the account list - this will update accounts state and selected account
      await fetchAccounts()
    } catch (err: any) {
      console.error('Error deleting account:', err)
      toast.error('Failed to delete account', {
        description:
          err.response?.data?.message ||
          'An error occurred while deleting the account.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteDialog(false)
    setDeletingAccount(null)
  }

  // Onboard handler
  const handleOnboardAccount = async (account: StripeAccount) => {
    try {
      setSaving(true)
      
      // Open a blank window immediately to avoid popup blocker
      const newWindow = window.open('', '_blank')
      
      // Get current URL and construct return URL
      const currentUrl = process.env.NEXT_PUBLIC_FRONTEND_URL
      const returnUrl = `${currentUrl}/stripeAccounts/overview`
      
      const response = await apiService.post(`/v3/stripe-accounts/${account._id}/onboarding-link`, {
        returnUrl: returnUrl
      })
      
      if (response.data.success && response.data.message?.accountLink?.url) {
        // Navigate the already opened window to the onboarding URL
        if (newWindow) {
          newWindow.location.href = response.data.message.accountLink.url
          toast.success('Onboarding link opened in new tab')
        } else {
          // Fallback: try direct window.open
          window.open(response.data.message.accountLink.url, '_blank')
          toast.success('Onboarding link opened in new tab')
        }
      } else {
        // Close the blank window if API failed
        if (newWindow) {
          newWindow.close()
        }
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      console.error('Error creating onboarding link:', err)
      toast.error('Failed to create onboarding link', {
        description:
          err.response?.data?.message ||
          'An error occurred while creating the onboarding link.',
      })
    } finally {
      setSaving(false)
    }
  }

  // Onboarding completion handler
  const handleOnboardingComplete = async (accountId: string) => {
    try {
      setSaving(true)
      
      const response = await apiService.post(`/v3/stripe-accounts/${accountId}/onboarding-complete`)
      
      if (response.data.success && response.data.message?.account) {
        const account = response.data.message.account
        const companyName = account.weproInvoice?.companyName || account.businessName || account.displayName || 'Account'
        
        // Update the account in local state if it exists
        setStripeAccounts(prev => 
          prev.map(acc => 
            acc._id === accountId 
              ? { ...acc, ...account, displayName: account.displayName || account.businessName }
              : acc
          )
        )
        
        toast.success(`${companyName} successfully onboarded`)
        
        // Refresh the stripe accounts list
        const fetchStripeAccounts = async () => {
          try {
            setLoadingStripeAccounts(true)
            setError(null)

            let url = `/v3/stripe-accounts?page=${currentPage}&limit=${entriesPerPage}`
            if (debouncedSearchTerm) {
              url += `&search=${encodeURIComponent(debouncedSearchTerm)}`
            }

            const response = await apiService.get<StripeAccountsResponse>(url)
            const responseData = response.data

            if (responseData.success) {
              setStripeAccounts(responseData.data.data)
              setTotalCount(responseData.data.pagination.total)
              setTotalPages(responseData.data.pagination.pages)
            } else {
              setError(responseData.message || 'Failed to fetch stripe accounts')
            }
          } catch (err: any) {
            console.error('Error fetching stripe accounts:', err)
            setError(
              err.response?.data?.message || 'Failed to fetch stripe accounts'
            )
          } finally {
            setLoadingStripeAccounts(false)
          }
        }
        
        await fetchStripeAccounts()
        
        // Trigger onboard account for the completed account
        // Create a minimal account object with the ID for the onboard function
        const accountForOnboard = { _id: accountId } as StripeAccount
        handleOnboardAccount(accountForOnboard)
        
        // Remove accountId query parameter from URL
        const url = new URL(window.location.href)
        url.searchParams.delete('accountId')
        window.history.replaceState({}, '', url.toString())
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      console.error('Error completing onboarding:', err)
      toast.error('Failed to complete onboarding', {
        description:
          err.response?.data?.message ||
          'An error occurred while completing the onboarding process.',
      })
    } finally {
      setSaving(false)
    }
  }

  // Dashboard link handler
  const handleDashboardLink = async (account: StripeAccount) => {
    try {
      setSaving(true)
      
      const response = await apiService.post(`/v3/stripe-accounts/${account._id}/dashboard-link`)
      
      if (response.data.success && response.data.message?.dashboardLink?.url) {
        // Open the dashboard URL in a new tab
        window.open(response.data.message.dashboardLink.url, '_blank')
        toast.success('Stripe dashboard opened in new tab')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      console.error('Error creating dashboard link:', err)
      toast.error('Failed to create dashboard link', {
        description:
          err.response?.data?.message ||
          'An error occurred while creating the dashboard link.',
      })
    } finally {
      setSaving(false)
    }
  }

  // Onboarding status handler
  const handleOnboardingStatus = async (account: StripeAccount) => {
    try {
      setLoadingOnboardingStatus(true)
      
      const response = await apiService.get(`/v3/stripe-accounts/${account._id}/onboarding-status`)
      
      if (response.data.success && response.data.message) {
        setOnboardingStatusData(response.data.message)
        setShowOnboardingStatusDialog(true)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      console.error('Error fetching onboarding status:', err)
      toast.error('Failed to fetch onboarding status', {
        description:
          err.response?.data?.message ||
          'An error occurred while fetching the onboarding status.',
      })
    } finally {
      setLoadingOnboardingStatus(false)
    }
  }

  const updateCreditCardProcessingFees = async (paidBy: string) => {
    if (!currentAccount) return

    try {
      setSaving(true)
      const response = await apiService.put(
        `/v3/stripe-accounts/${currentAccount._id}`,
        {
          creditCardProcessingFees: { paidBy },
        }
      )

      if (response.data.success) {
        toast.success('Account updated successfully!', {
          description: 'Credit card processing fees have been updated.',
        })
        
        // Update local state
        const updatedAccount = {
          ...currentAccount,
          creditCardProcessingFees: { paidBy },
        }

        setStripeAccounts(prev =>
          prev.map(account =>
            account._id === currentAccount._id ? updatedAccount : account
          )
        )

        // Update accounts state to reflect changes
        setAccounts(prev =>
          prev.map(account =>
            account._id === currentAccount._id ? updatedAccount : account
          )
        )
      } else {
        toast.error('Failed to update account', {
          description: response.data.error || 'An unexpected error occurred.',
        })
      }
    } catch (err: any) {
      console.error('Error updating credit card processing fees:', err)

      // Handle API error response
      if (err.response?.data?.error) {
        toast.error('Failed to update account', {
          description: err.response.data.error,
        })
      } else {
        toast.error('Failed to update account', {
          description:
            err.response?.data?.message ||
            'An error occurred while updating the account.',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  // Company info edit handlers
  const handleEditCompanyInfo = () => {
    if (currentAccount?.weproInvoice) {
      setCompanyInfoFormData({
        companyName: currentAccount.weproInvoice.companyName || '',
        address: currentAccount.weproInvoice.address || '',
        companyPhone: currentAccount.weproInvoice.companyPhone || '',
      })
    }
    setShowCompanyInfoDialog(true)
  }

  // Step 1 handlers
  const handleStep1FormChange = (field: string, value: string) => {
    setStep1FormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // Step 2 handlers
  const handleStep2FormChange = (field: string, value: string) => {
    setStep2FormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // Step 4 handlers
  const handleStep4FormChange = (field: string, value: string) => {
    if (field === 'creditCardProcessingFees') {
      const parsedValue = JSON.parse(value)
      setStep4FormData(prev => ({
        ...prev,
        creditCardProcessingFees: parsedValue,
      }))
    } else {
      setStep4FormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  // Create final combined JSON payload
  const createFinalPayload = () => {
    if (!selectedAccountForSetup) return null

    return {
      accountNickname: step2FormData.accountNickname || selectedAccountForSetup.ownerName,
      accountType: 'account',
      accountCodes: [selectedAccountForSetup.code],
      isActive: true,
      creditCardProcessingFees: step4FormData.creditCardProcessingFees,
      weproInvoice: {
        companyName: step2FormData.companyName || selectedAccountForSetup.name,
        companyEmail: step2FormData.companyEmail || selectedAccountForSetup.email,
        companyPhone: step1FormData.companyPhone || selectedAccountForSetup.phoneNumber,
        address: step1FormData.address || selectedAccountForSetup.address,
        addressLine2: step1FormData.addressLine2 || selectedAccountForSetup.addressLine2,
        city: step1FormData.city || selectedAccountForSetup.city,
        state: step1FormData.state || selectedAccountForSetup.state,
        zipCode: step1FormData.zipCode || selectedAccountForSetup.zipCode,
        country: step1FormData.country || selectedAccountForSetup.country,
        addressId: step1FormData.addressId || selectedAccountForSetup.addressId,
        lat: step1FormData.lat ? parseFloat(step1FormData.lat) : selectedAccountForSetup.lat,
        lng: step1FormData.lng ? parseFloat(step1FormData.lng) : selectedAccountForSetup.lng,
      },
    }
  }

  // Setup API calls
  const handleCompleteSetup = async () => {
    if (!selectedAccountForSetup) return

    setSetupLoading(true)
    try {
      // Step 1: Create Stripe account with just accountNickname
      const createPayload = {
        accountNickname: step2FormData.accountNickname || selectedAccountForSetup.ownerName,
      }

      const createResponse = await apiService.post('/v3/stripe-accounts', createPayload)
      
      if (createResponse.data.success) {
        const accountId = createResponse.data.message.account._id
        
        // Step 2: Update the account with full data
        const updatePayload = {
          accountType: 'franchise',
          franchiseCodes: [selectedAccountForSetup.code],
          isActive: true,
          creditCardProcessingFees: step4FormData.creditCardProcessingFees,
          weproInvoice: {
            companyName: step2FormData.companyName || selectedAccountForSetup.name,
            companyEmail: step2FormData.companyEmail || selectedAccountForSetup.email,
            companyPhone: step1FormData.companyPhone || selectedAccountForSetup.phoneNumber,
            address: step1FormData.address || selectedAccountForSetup.address,
            addressLine2: step1FormData.addressLine2 || selectedAccountForSetup.addressLine2,
            city: step1FormData.city || selectedAccountForSetup.city,
            state: step1FormData.state || selectedAccountForSetup.state,
            zipCode: step1FormData.zipCode || selectedAccountForSetup.zipCode,
            country: step1FormData.country || selectedAccountForSetup.country,
            addressId: step1FormData.addressId || selectedAccountForSetup.addressId,
            lat: step1FormData.lat ? parseFloat(step1FormData.lat) : selectedAccountForSetup.lat,
            lng: step1FormData.lng ? parseFloat(step1FormData.lng) : selectedAccountForSetup.lng,
          },
        }

        await apiService.put(`/v3/stripe-accounts/${accountId}`, updatePayload)
        
        // Success!
        toast.success('Stripe account created successfully!', {
          description: 'Your payment processing setup is complete.',
        })
        
        await fetchAccounts();

        await handleOnboardAccount({_id: accountId} as StripeAccount)
        // Close dialog and reset
        setShowSetupWorkflowDialog(false)
        setSetupStep(1)
        setSelectedAccountForSetup(null)
        
        // Refresh the accounts list
        const fetchStripeAccounts = async () => {
          try {
            setLoadingStripeAccounts(true)
            setError(null)

            let url = `/v3/stripe-accounts?page=${currentPage}&limit=${entriesPerPage}`
            if (debouncedSearchTerm) {
              url += `&search=${encodeURIComponent(debouncedSearchTerm)}`
            }

            const response = await apiService.get<StripeAccountsResponse>(url)
            const responseData = response.data

            if (responseData.success) {
              setStripeAccounts(responseData.data.data)
              setTotalCount(responseData.data.pagination.total)
              setTotalPages(responseData.data.pagination.pages)
            } else {
              setError(responseData.message || 'Failed to fetch stripe accounts')
            }
          } catch (err: any) {
            console.error('Error fetching stripe accounts:', err)
            setError(
              err.response?.data?.message || 'Failed to fetch stripe accounts'
            )
          } finally {
            setLoadingStripeAccounts(false)
          }
        }
        
        await fetchStripeAccounts();
        
        
      } else {
        throw new Error(createResponse.data.message || 'Failed to create Stripe account')
      }
    } catch (error: any) {
      console.error('Setup error:', error)
      toast.error('Failed to create Stripe account', {
        description: error.response?.data?.message || error.message || 'Please try again.',
      })
    } finally {
      setSetupLoading(false)
    }
  }

  // Map handlers for Step 1
  const onMapLoad = (map: google.maps.Map) => {
    setMapLoaded(true)
  }

  const onMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      }
      setMarkerPosition(newPosition)
      
      // Update form data with new coordinates
      setStep1FormData(prev => ({
        ...prev,
        lat: newPosition.lat.toString(),
        lng: newPosition.lng.toString(),
      }))
      
      // Reverse geocode the clicked location
      reverseGeocode(event.latLng)
    }
  }

  const onMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      }
      setMarkerPosition(newPosition)
      
      // Update form data with new coordinates
      setStep1FormData(prev => ({
        ...prev,
        lat: newPosition.lat.toString(),
        lng: newPosition.lng.toString(),
      }))
      
      // Reverse geocode the dragged location
      reverseGeocode(event.latLng)
    }
  }

  const reverseGeocode = (latLng: google.maps.LatLng) => {
    if (!window.google?.maps) return

    const geocoder = new window.google.maps.Geocoder()

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        populateAddressFields(results[0])
      }
    })
  }

  const populateAddressFields = (place: google.maps.places.PlaceResult) => {
    if (!place.address_components) return

    let addressComponents = {
      street_number: '',
      route: '',
      subpremise: '',
      locality: '',
      administrative_area_level_1: '',
      postal_code: '',
      country: '',
      place_id: '',
    }

    place.address_components.forEach(component => {
      const types = component.types
      if (types.includes('street_number')) {
        addressComponents.street_number = component.long_name
      } else if (types.includes('route')) {
        addressComponents.route = component.long_name
      } else if (types.includes('subpremise')) {
        addressComponents.subpremise = component.long_name
      } else if (types.includes('locality')) {
        addressComponents.locality = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        addressComponents.administrative_area_level_1 = component.short_name
      } else if (types.includes('postal_code')) {
        addressComponents.postal_code = component.long_name
      } else if (types.includes('country')) {
        addressComponents.country = component.long_name
      }
    })

    const address =
      `${addressComponents.street_number} ${addressComponents.route}`.trim()
    const addressLine2 = addressComponents.subpremise || ''

    setStep1FormData(prev => ({
      ...prev,
      address: address || place?.formatted_address || '',
      addressLine2: addressLine2,
      city: addressComponents.locality || '',
      state: addressComponents.administrative_area_level_1 || '',
      zipCode: addressComponents.postal_code || '',
      country: addressComponents.country || '',
      addressId: place.place_id || '',
      lat: place.geometry?.location?.lat().toString() || '',
      lng: place.geometry?.location?.lng().toString() || '',
    }))
  }

  const createStep1Payload = () => {
    if (!selectedAccountForSetup) return null

    return {
      accountType: 'account',
      accountCodes: [selectedAccountForSetup.code],
      isActive: true,
      creditCardProcessingFees: {
        paidBy: 'Client', // Default to Client (Pass-Through Processing)
      },
      weproInvoice: {
        companyName: selectedAccountForSetup.name,
        companyEmail: selectedAccountForSetup.email,
        companyPhone: step1FormData.companyPhone || selectedAccountForSetup.phoneNumber,
        address: step1FormData.address || selectedAccountForSetup.address,
        addressLine2: step1FormData.addressLine2 || selectedAccountForSetup.addressLine2,
        city: step1FormData.city || selectedAccountForSetup.city,
        state: step1FormData.state || selectedAccountForSetup.state,
        zipCode: step1FormData.zipCode || selectedAccountForSetup.zipCode,
        country: step1FormData.country || selectedAccountForSetup.country,
        addressId: step1FormData.addressId || selectedAccountForSetup.addressId,
        lat: step1FormData.lat ? parseFloat(step1FormData.lat) : selectedAccountForSetup.lat,
        lng: step1FormData.lng ? parseFloat(step1FormData.lng) : selectedAccountForSetup.lng,
      },
    }
  }

  const handleCancelCompanyInfoEdit = () => {
    setCompanyInfoFormData({
      companyName: '',
      address: '',
      companyPhone: '',
    })
    setSelectedLogoFile(null)
    setLogoPreview(null)
  }

  const handleLogoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB')
        return
      }
      
      setSelectedLogoFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveCompanyInfo = async () => {
    if (!currentAccount || selectedAccount === 'all') return

    try {
      setSaving(true)
      
      // Handle logo upload if a file is selected
      if (selectedLogoFile) {
        const formData = new FormData()
        formData.append('logo', selectedLogoFile)
        
        const logoResponse = await apiService.post(
          `/v3/stripe-accounts/${currentAccount._id}/logo`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        
        if (!logoResponse.data.success) {
          toast.error('Failed to upload logo', {
            description: logoResponse.data.error || 'An unexpected error occurred.',
          })
          return
        }
      }
      
      // Only include fields with values
      const weproInvoiceUpdate: any = {}

      if (companyInfoFormData.companyName.trim()) {
        weproInvoiceUpdate.companyName = companyInfoFormData.companyName.trim()
      }
      if (companyInfoFormData.address.trim()) {
        weproInvoiceUpdate.address = companyInfoFormData.address.trim()
      }
      if (companyInfoFormData.companyPhone.trim()) {
        weproInvoiceUpdate.companyPhone =
          companyInfoFormData.companyPhone.trim()
      }

      const response = await apiService.put(
        `/v3/stripe-accounts/${currentAccount._id}`,
        {
          weproInvoice: {
            ...weproInvoiceUpdate,
          },
        }
      )

      if (response.data.success) {
        toast.success('Company info updated successfully!', {
          description: 'Company information has been updated.',
        })
        setShowCompanyInfoDialog(false)
        setSelectedLogoFile(null)
        setLogoPreview(null)
        // Update local state
        const updatedAccount = {
          ...currentAccount,
          weproInvoice: {
            ...currentAccount.weproInvoice,
            companyName: companyInfoFormData.companyName,
            address: companyInfoFormData.address,
            companyPhone: companyInfoFormData.companyPhone,
            addressLine2: currentAccount.weproInvoice?.addressLine2 || '',
            city: currentAccount.weproInvoice?.city || '',
            state: currentAccount.weproInvoice?.state || '',
            zipCode: currentAccount.weproInvoice?.zipCode || '',
            country: currentAccount.weproInvoice?.country || '',
            addressId: currentAccount.weproInvoice?.addressId || '',
            lat: currentAccount.weproInvoice?.lat || null,
            lng: currentAccount.weproInvoice?.lng || null,
          },
        }

        setStripeAccounts(prev =>
          prev.map(account =>
            account._id === currentAccount._id ? updatedAccount : account
          )
        )

        // Update accounts state to reflect changes in Transaction Display Info
        setAccounts(prev =>
          prev.map(account =>
            account._id === currentAccount._id ? updatedAccount : account
          )
        )
      } else {
        toast.error('Failed to update company info', {
          description: response.data.error || 'An unexpected error occurred.',
        })
      }
    } catch (err: any) {
      console.error('Error updating company info:', err)

      if (err.response?.data?.error) {
        toast.error('Failed to update company info', {
          description: err.response.data.error,
        })
      } else {
        toast.error('Failed to update company info', {
          description:
            err.response?.data?.message ||
            'An error occurred while updating the company info.',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  // Set as default handler
  const handleSetAsDefault = async (accountId: string) => {
    try {
      setSaving(true)
      
      // Find the account to get the _id for the API call
      const accountToUpdate = accounts.find(account => account.id === accountId)
      if (!accountToUpdate) {
        toast.error('Account not found')
        return
      }
      
      const response = await apiService.patch(`/v3/stripe-accounts/${accountToUpdate._id}/set-default`)

      if (response.data.success) {
        toast.success('Account set as default successfully!', {
          description: 'This account is now your default payment processing account.',
        })
        
        // Update local state - set all accounts to isDefault: false, then set the selected one to true
        setStripeAccounts(prev =>
          prev.map(account => ({
            ...account,
            isDefault: account.id === accountId
          }))
        )
        
        setAccounts(prev =>
          prev.map(account => ({
            ...account,
            isDefault: account.id === accountId
          }))
        )
      } else {
        toast.error('Failed to set account as default', {
          description: response.data.error || 'An unexpected error occurred.',
        })
      }
    } catch (err: any) {
      console.error('Error setting account as default:', err)

      if (err.response?.data?.error) {
        toast.error('Failed to set account as default', {
          description: err.response.data.error,
        })
      } else {
        toast.error('Failed to set account as default', {
          description:
            err.response?.data?.message ||
            'An error occurred while setting the account as default.',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Head>
        <title>Overview - Stripe Accounts - WePro</title>
        <meta
          name="description"
          content="Stripe accounts overview and dashboard"
        />
      </Head>
      
      {/* Show empty state content when no accounts */}
      {accounts.length === 0 && !loadingAccounts && (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <Card className="w-full max-w-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                No Accounts Added Yet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                You haven't added any Stripe accounts yet. Add your first account to start processing payments.
              </p>
              <div className="flex justify-end">
                <Button
                  variant="default"
                  onClick={() => {
                    setShowAddLocationDialog(true)
                  }}
                >
                  Add Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content - only show when accounts exist */}
      {accounts.length > 0 && (
        <>
          <DashboardContent
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        accounts={accounts.length > 0 ? accounts.map(account => ({
          id: account.id,
          name: account.accountNickname || account.businessName || 'Unknown',
          isActive: account.isActive,
          isDefault: account.isDefault,
          balanceData: account.balanceData || {
            currentBalance: 0,
            instantAvailable: 0,
            instantPayout: 0,
          },
          accountNickname: account.accountNickname,
          businessName: account.businessName,
          weproInvoice: account.weproInvoice,
        })) : []}
        currentAccount={{
          id: currentAccount.id,
          name: currentAccount.accountNickname || currentAccount.businessName || 'Unknown',
          isActive: currentAccount.isActive,
          isDefault: currentAccount.isDefault,
          balanceData: currentAccount.balanceData || {
            currentBalance: 0,
            instantAvailable: 0,
            instantPayout: 0,
          },
          accountNickname: currentAccount.accountNickname,
          businessName: currentAccount.businessName,
          weproInvoice: currentAccount.weproInvoice,
        }}
        balanceData={balanceData}
        isSetupComplete={isSetupComplete}
        setShowAddLocationDialog={setShowAddLocationDialog}
        setShowCompanyInfoDialog={setShowCompanyInfoDialog}
        setShowSetupDialog={setShowSetupDialog}
        loadingAccounts={loadingAccounts}
        accountsError={accountsError}
        handleSetAsDefault={handleSetAsDefault}
        handleDeleteAccount={handleDeleteAccountById}
      />
      <div className="space-y-6 mt-4">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
          <Button
            variant="default"
            onClick={() => router.push('/stripeAccounts/overview')}
            className="flex-1 flex items-center justify-center text-white"
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
            variant="ghost"
            onClick={() => router.push('/stripeAccounts/equipment')}
            className="flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Equipment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fee Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Credit Card Processing Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  How would you like to handle processing costs?
                </Label>

                {/* Option Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Pays Option */}
                  <div
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      currentAccount?.creditCardProcessingFees?.paidBy === 'Company'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                    onClick={() => {
                      if (selectedAccount !== 'all' && currentAccount) {
                        updateCreditCardProcessingFees('Company')
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                          currentAccount?.creditCardProcessingFees?.paidBy === 'Company'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-neutral-300 dark:border-neutral-600'
                        }`}
                      >
                        {currentAccount?.creditCardProcessingFees?.paidBy === 'Company' && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
    </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">
                          Company Absorbs Fee
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          Your business pays the 2.9% processing fee
                        </p>
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <XCircle className="w-3 h-3 text-red-500" />
                            <span className="text-red-600 dark:text-red-400">
                              Reduces your profit margin
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-green-600 dark:text-green-400">
                              Simpler customer pricing
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">
                          <strong>Example:</strong> $100 service = $97.10 to
                          you
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Pays Option */}
                  <div
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      currentAccount?.creditCardProcessingFees?.paidBy === 'Client' || !currentAccount?.creditCardProcessingFees?.paidBy
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                    onClick={() => {
                      if (selectedAccount !== 'all' && currentAccount) {
                        updateCreditCardProcessingFees('Client')
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                          currentAccount?.creditCardProcessingFees?.paidBy === 'Client' || !currentAccount?.creditCardProcessingFees?.paidBy
                            ? 'border-green-500 bg-green-500'
                            : 'border-neutral-300 dark:border-neutral-600'
                        }`}
                      >
                        {(currentAccount?.creditCardProcessingFees?.paidBy === 'Client' || !currentAccount?.creditCardProcessingFees?.paidBy) && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">
                            Pass-Through Processing
                          </h3>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 text-xs"
                          >
                            Recommended
                          </Badge>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          Processing costs are handled at checkout
                        </p>
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-green-600 dark:text-green-400">
                              0% cost to your business
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-green-600 dark:text-green-400">
                              Maintains full profit margins
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">
                          <strong>Example:</strong> $100 service = You receive
                          $100
                        </div>
                      </div>
                    </div>
                    {(currentAccount?.creditCardProcessingFees?.paidBy === 'Client' || !currentAccount?.creditCardProcessingFees?.paidBy) && (
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Best Choice
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Selection Summary */}
                {selectedAccount !== 'all' && currentAccount && (
                  <div
                    className={`p-4 rounded-lg border ${
                      currentAccount?.creditCardProcessingFees?.paidBy === 'Company'
                        ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                        : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          currentAccount?.creditCardProcessingFees?.paidBy === 'Company' ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                      />
                      <span
                        className={`font-medium text-sm ${
                          currentAccount?.creditCardProcessingFees?.paidBy === 'Company'
                            ? 'text-blue-800 dark:text-blue-200'
                            : 'text-green-800 dark:text-green-200'
                        }`}
                      >
                        Current Selection:{' '}
                        {currentAccount?.creditCardProcessingFees?.paidBy === 'Company'
                          ? 'Company Absorbs Processing'
                          : 'Pass-Through Processing'}
                      </span>
                    </div>
                    <p
                      className={`text-xs ${
                        currentAccount?.creditCardProcessingFees?.paidBy === 'Company'
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-green-700 dark:text-green-300'
                      }`}
                    >
                      {currentAccount?.creditCardProcessingFees?.paidBy === 'Company'
                        ? 'Your business will absorb all processing costs on credit card transactions.'
                        : 'Processing costs are seamlessly handled at checkout, ensuring you receive your full service amount.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Company Display Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Transaction Display Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Company Name
                </Label>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {selectedAccount === 'all' 
                    ? 'Select a specific account to view details'
                    : (currentAccount?.weproInvoice?.companyName || currentAccount?.businessName || 'Not set')
                  }
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Address</Label>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {selectedAccount === 'all' 
                    ? 'Select a specific account to view details'
                    : (currentAccount?.weproInvoice?.address || 'Not set')
                  }
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Phone</Label>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {selectedAccount === 'all' 
                    ? 'Select a specific account to view details'
                    : (currentAccount?.weproInvoice?.companyPhone || 'Not set')
                  }
                </p>
              </div>
              {selectedAccount !== 'all' && currentAccount && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditCompanyInfo}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Info & Logo
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Are you sure you want to delete the account{' '}
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {deletingAccount?.displayName}
              </span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Onboarding Status Dialog */}
      <Dialog
        open={showOnboardingStatusDialog}
        onOpenChange={setShowOnboardingStatusDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-purple-500" />
              Onboarding Status
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {onboardingStatusData && (
              <>
                {/* Account Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Account Code</Label>
                      <p className="text-sm font-mono bg-neutral-100 dark:bg-neutral-800 p-2 rounded">
                        {onboardingStatusData.account?.accountCode}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Nickname</Label>
                      <p className="text-sm bg-neutral-100 dark:bg-neutral-800 p-2 rounded">
                        {onboardingStatusData.account?.nickname}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Onboarding Status */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Onboarding Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Completed</Label>
                        <Badge 
                          className={
                            onboardingStatusData.onboarding?.completed 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }
                        >
                          {onboardingStatusData.onboarding?.completed ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Charges Enabled</Label>
                        <Badge 
                          className={
                            onboardingStatusData.onboarding?.chargesEnabled 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }
                        >
                          {onboardingStatusData.onboarding?.chargesEnabled ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Payouts Enabled</Label>
                        <Badge 
                          className={
                            onboardingStatusData.onboarding?.payoutsEnabled 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }
                        >
                          {onboardingStatusData.onboarding?.payoutsEnabled ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {onboardingStatusData.onboarding?.disabledReason && (
                        <div>
                          <Label className="text-sm font-medium text-red-600 dark:text-red-400">Disabled Reason</Label>
                          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            {onboardingStatusData.onboarding.disabledReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Requirements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Currently Due</Label>
                      <div className="mt-2 space-y-1">
                        {onboardingStatusData.onboarding?.requirementsCurrentlyDue?.length > 0 ? (
                          onboardingStatusData.onboarding.requirementsCurrentlyDue.map((req: string, index: number) => (
                            <Badge key={index} variant="destructive" className="text-xs mr-1">
                              {req}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-green-600 dark:text-green-400">None</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Eventually Due</Label>
                      <div className="mt-2 space-y-1">
                        {onboardingStatusData.onboarding?.requirementsEventuallyDue?.length > 0 ? (
                          onboardingStatusData.onboarding.requirementsEventuallyDue.map((req: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs mr-1">
                              {req}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-green-600 dark:text-green-400">None</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowOnboardingStatusDialog(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </>
      )}
      {/* Add Location Dialog */}
      <Dialog
        open={showAddLocationDialog}
        onOpenChange={setShowAddLocationDialog}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-neutral-900 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Add Account Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border dark:border-blue-800/30">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Available Account Locations
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Select an account location to set up payment processing. Each
                location will have its own separate payment account and
                processing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loadingAccounts ? (
                <div className="col-span-2 flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Loading accounts...
                    </span>
                  </div>
                </div>
              ) : availableAccounts.length === 0 ? (
                <div className="col-span-2 flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-neutral-400" />
                    </div>
                    <span className="font-medium text-neutral-600 dark:text-neutral-400">
                      No accounts available
                    </span>
                    <p className="text-sm text-neutral-500 dark:text-neutral-500">
                      All accounts already have payment processing set up
                    </p>
                  </div>
                </div>
              ) : (
                availableAccounts.map((account: Account) => (
                  <Card
                    key={account._id}
                    className="cursor-pointer border-2 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group dark:bg-neutral-800"
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg dark:text-gray-100">
                                {account.name}
                              </h3>
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Owner: {account.ownerName}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              account.status === 'Active'
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                            }
                          >
                            {account.status}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <Building2 className="w-4 h-4" />
                            {account.address}
                            {account.addressLine2 &&
                              `, ${account.addressLine2}`}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <User className="w-4 h-4" />
                            {account.phoneNumber}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <Calendar className="w-4 h-4" />
                            Code: {account.code}
                          </div>
                        </div>

                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {account.city}, {account.state}{' '}
                          {account.zipCode}
                        </p>

                        <div className="pt-4 border-t dark:border-neutral-700">
                          <h4 className="font-medium mb-3 dark:text-gray-100">
                            Payment Processing Setup
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                              <span className="dark:text-gray-300">Separate payment account</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                              <span className="dark:text-gray-300">Individual balance tracking</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                              <span className="dark:text-gray-300">Location-specific reporting</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                              <span className="dark:text-gray-300">Customizable fee structure</span>
                            </div>
                          </div>
                        </div>

                         <Button
                           className="w-full mt-4 dark:bg-blue-600 dark:hover:bg-blue-700"
                            onClick={() => {
                              setSelectedAccountForSetup(account)
                              setStep1FormData({
                                companyPhone: account.phoneNumber,
                                address: account.address,
                                addressLine2: account.addressLine2,
                                city: account.city,
                                state: account.state,
                                zipCode: account.zipCode,
                                country: account.country,
                                addressId: account.addressId,
                                lat: account.lat?.toString() || '',
                                lng: account.lng?.toString() || '',
                              })
                              setStep2FormData({
                                accountNickname: account.ownerName,
                                companyName: account.name,
                                companyEmail: account.email,
                              })
                              // Set marker position if coordinates exist
                              if (account.lat && account.lng) {
                                setMarkerPosition({
                                  lat: account.lat,
                                  lng: account.lng,
                                })
                              }
                              setShowAddLocationDialog(false)
                              setSetupStep(1)
                              setShowSetupWorkflowDialog(true)
                              setTimeout(() => {
                                setMarkerBuffer(true)
                              }, 300)
                            }}
                         >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Set Up Payment Processing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg border dark:border-neutral-700">
              <h4 className="font-medium mb-2 dark:text-gray-100">Setup Process</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                    1
                  </div>
                  <span className="dark:text-gray-300">Select Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                    2
                  </div>
                  <span className="dark:text-gray-300">Account Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                    3
                  </div>
                  <span className="dark:text-gray-300">Payment Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                    4
                  </div>
                  <span className="dark:text-gray-300">Start Processing</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t dark:border-neutral-700">
              <Button
                variant="outline"
                onClick={() => setShowAddLocationDialog(false)}
                className="flex-1 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Setup Workflow Dialog */}
      <Dialog
        open={showSetupWorkflowDialog}
        onOpenChange={setShowSetupWorkflowDialog}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Payment Processing Setup - {selectedAccountForSetup?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedAccountForSetup && (
            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5].map(step => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= setupStep
                          ? 'bg-blue-600 text-white'
                          : step === setupStep + 1
                            ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                            : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      {step < setupStep ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        step
                      )}
                    </div>
                    {step < 5 && (
                      <div
                        className={`w-16 h-1 mx-2 ${
                          step < setupStep ? 'bg-blue-600' : 'bg-neutral-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Labels */}
              <div className="grid grid-cols-5 gap-4 text-center text-sm">
                <div
                  className={
                    setupStep >= 1
                      ? 'text-blue-600 font-medium'
                      : 'text-neutral-500'
                  }
                >
                  Location Details
                </div>
                <div
                  className={
                    setupStep >= 2
                      ? 'text-blue-600 font-medium'
                      : 'text-neutral-500'
                  }
                >
                  Business Info
                </div>
                <div
                  className={
                    setupStep >= 3
                      ? 'text-blue-600 font-medium'
                      : 'text-neutral-500'
                  }
                >
                  Bank Account
                </div>
                <div
                  className={
                    setupStep >= 4
                      ? 'text-blue-600 font-medium'
                      : 'text-neutral-500'
                  }
                >
                  Payment Settings
                </div>
                <div
                  className={
                    setupStep >= 5
                      ? 'text-blue-600 font-medium'
                      : 'text-neutral-500'
                  }
                >
                  Verification
                </div>
              </div>

              {/* Step Content */}
              <div className="min-h-[400px]">
                {/* Step 1: Location Details */}
                {setupStep === 1 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Step 1: Confirm Location Details
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Please verify the account location information below.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Top Row: Company Phone (Left) + Map Selector (Right) */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Company Phone */}
                        <div className="space-y-2">
                          <Label htmlFor="company-phone">
                            Company Phone *
                          </Label>
                          <Input
                            id="company-phone"
                            value={step1FormData.companyPhone}
                            onChange={e =>
                              handleStep1FormChange(
                                'companyPhone',
                                e.target.value
                              )
                            }
                            placeholder={selectedAccountForSetup.phoneNumber}
                          />
                          {/* Map Selector */}
                            <div className="flex flex-col">
                            <div className="flex-1 flex-col flex">
                                {/* Search Box */}
                                <StandaloneSearchBox
                                    onPlacesChanged={() => {
                                        // Handle search box changes
                                    }}
                                >
                                <input
                                    type="text"
                                    placeholder="Search for a location..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                                />
                                </StandaloneSearchBox>
                                <div className="w-full h-64">
                                <GoogleMap
                                    mapContainerStyle={{
                                        width: '100%',
                                        height: '100%',
                                    }}
                                    center={{
                                        lat: selectedAccountForSetup.lat || 40.7128,
                                        lng: selectedAccountForSetup.lng || -74.006,
                                    }}
                                    zoom={15}
                                    onLoad={onMapLoad}
                                    onClick={onMapClick}
                                    options={{
                                    mapTypeId: 'roadmap',
                                    styles: mounted && resolvedTheme === 'dark' ? [
                                        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                                        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                                        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                                        {
                                            featureType: 'administrative.locality',
                                            elementType: 'labels.text.fill',
                                            stylers: [{ color: '#d59563' }]
                                        },
                                        {
                                            featureType: 'poi',
                                            elementType: 'labels.text.fill',
                                            stylers: [{ color: '#d59563' }]
                                        },
                                        {
                                            featureType: 'poi.park',
                                            elementType: 'geometry',
                                            stylers: [{ color: '#263c3f' }]
                                        },
                                        {
                                            featureType: 'poi.park',
                                            elementType: 'labels.text.fill',
                                            stylers: [{ color: '#6b9a76' }]
                                        },
                                        {
                                            featureType: 'road',
                                            elementType: 'geometry',
                                            stylers: [{ color: '#38414e' }]
                                        },
                                        {
                                            featureType: 'road',
                                            elementType: 'geometry.stroke',
                                            stylers: [{ color: '#212a37' }]
                                        },
                                        {
                                            featureType: 'road',
                                            elementType: 'labels.text.fill',
                                            stylers: [{ color: '#9ca5b3' }]
                                        },
                                        {
                                            featureType: 'road.highway',
                                            elementType: 'geometry',
                                            stylers: [{ color: '#746855' }]
                                        },
                                        {
                                            featureType: 'road.highway',
                                            elementType: 'geometry.stroke',
                                            stylers: [{ color: '#1f2835' }]
                                        },
                                        {
                                            featureType: 'road.highway',
                                            elementType: 'labels.text.fill',
                                            stylers: [{ color: '#f3d19c' }]
                                        },
                                        {
                                            featureType: 'transit',
                                            elementType: 'geometry',
                                            stylers: [{ color: '#2f3948' }]
                                        },
                                        {
                                            featureType: 'transit.station',
                                            elementType: 'labels.text.fill',
                                            stylers: [{ color: '#d59563' }]
                                        },
                                        {
                                            featureType: 'water',
                                            elementType: 'geometry',
                                            stylers: [{ color: '#17263c' }]
                                        },
                                        {
                                            featureType: 'water',
                                            elementType: 'labels.text.fill',
                                            stylers: [{ color: '#515c6d' }]
                                        },
                                        {
                                            featureType: 'water',
                                            elementType: 'labels.text.stroke',
                                            stylers: [{ color: '#17263c' }]
                                        },
                                        {
                                            featureType: 'poi',
                                            elementType: 'labels',
                                            stylers: [{ visibility: 'off' }],
                                        },
                                    ] : [
                                        {
                                            featureType: 'poi',
                                            elementType: 'labels',
                                            stylers: [{ visibility: 'off' }],
                                        },
                                    ],
                                    }}
                                >
                                    {/* Marker */}
                                    {(markerPosition && markerBuffer) && (
                                        <Marker
                                            position={markerPosition}
                                            draggable={true}
                                            onDragEnd={onMarkerDragEnd}
                                            title="Drag to set location"
                                            animation={google.maps.Animation.DROP}
                                        />
                                    )}
                                </GoogleMap>
                                </div>

                                {!mapLoaded && (
                                <div className="flex items-center justify-center w-full h-64 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
                                    <div className="text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400 dark:text-neutral-500" />
                                    <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
                                    </div>
                                </div>
                                )}
                            </div>
                            </div>
                        </div>
                        
                        {/* Bottom Row: Location Details */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Location Details *
                            </span>
                            </div>

                            <div className="rounded-lg p-4 space-y-3 text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                    Address:
                                </span>
                                <span className="text-gray-900 dark:text-gray-100">
                                    {step1FormData.address || '--'}
                                </span>
                                </div>

                                <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                    Address Line 2:
                                </span>
                                <span className="text-gray-900 dark:text-gray-100">
                                    {step1FormData.addressLine2 || '--'}
                                </span>
                                </div>

                                <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                    City:
                                </span>
                                <span className="text-gray-900 dark:text-gray-100">
                                    {step1FormData.city || '--'}
                                </span>
                                </div>

                                <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                    State:
                                </span>
                                <span className="text-gray-900 dark:text-gray-100">
                                    {step1FormData.state || '--'}
                                </span>
                                </div>

                                <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                    ZIP:
                                </span>
                                <span className="text-gray-900 dark:text-gray-100">
                                    {step1FormData.zipCode || '--'}
                                </span>
                                </div>

                                <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                    Country:
                                </span>
                                <span className="text-gray-900 dark:text-gray-100">
                                    {step1FormData.country || '--'}
                                </span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-blue-200 dark:border-blue-800/30">
                                <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                    Coordinates:
                                </span>
                                <span className="text-gray-900 dark:text-gray-100">
                                    {step1FormData.lat && step1FormData.lng
                                    ? `${parseFloat(step1FormData.lat).toFixed(4)}, ${parseFloat(step1FormData.lng).toFixed(4)}`
                                    : '--'}
                                </span>
                                </div>
                            </div>
                            </div>
                        </div>
                        
                      </div>

                      
                    </div>
                  </div>
                )}

                {/* Step 2: Account Information */}
                {setupStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Step 2: Account Information
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Configure the account details and billing information for this location.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Account Nickname */}
                      <div className="space-y-2">
                        <Label htmlFor="account-nickname">
                          Account Nickname *
                        </Label>
                        <Input
                          id="account-nickname"
                          value={step2FormData.accountNickname}
                          onChange={e =>
                            handleStep2FormChange(
                              'accountNickname',
                              e.target.value
                            )
                          }
                          placeholder={selectedAccountForSetup.ownerName}
                        />
                      </div>

                      {/* Company Name */}
                      <div className="space-y-2">
                        <Label htmlFor="company-name">
                          Company Name *
                        </Label>
                        <Input
                          id="company-name"
                          value={step2FormData.companyName}
                          onChange={e =>
                            handleStep2FormChange(
                              'companyName',
                              e.target.value
                            )
                          }
                          placeholder={selectedAccountForSetup.name}
                        />
                      </div>

                      {/* Company Email */}
                      <div className="space-y-2">
                        <Label htmlFor="company-email">
                          Company Email *
                        </Label>
                        <Input
                          id="company-email"
                          type="email"
                          value={step2FormData.companyEmail}
                          onChange={e =>
                            handleStep2FormChange(
                              'companyEmail',
                              e.target.value
                            )
                          }
                          placeholder={selectedAccountForSetup.email}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Bank Account */}
                {setupStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Step 3: Bank Account Setup
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Connect your bank account for payouts. All funds will be
                        deposited here.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="bank-name">Bank Name *</Label>
                          <Input id="bank-name" placeholder="Your Bank Name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="account-holder">
                            Account Holder Name *
                          </Label>
                          <Input
                            id="account-holder"
                            placeholder="Must match business name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="account-type">Account Type *</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="checking">
                                Business Checking
                              </SelectItem>
                              <SelectItem value="savings">
                                Business Savings
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="routing-number">
                            Routing Number *
                          </Label>
                          <Input id="routing-number" placeholder="123456789" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="account-number">
                            Account Number *
                          </Label>
                          <Input
                            id="account-number"
                            placeholder="Account number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-account">
                            Confirm Account Number *
                          </Label>
                          <Input
                            id="confirm-account"
                            placeholder="Re-enter account number"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Bank Verification
                        </p>
                      </div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        We'll make small test deposits (under $1) to verify your
                        account. This may take 1-2 business days.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 4: Payment Settings */}
                {setupStep === 4 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Step 4: Payment Settings
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Configure how credit card processing fees will be handled for this location.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Credit Card Processing Fees
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-4">
                            <Label className="text-base font-medium">
                              Who pays the credit card processing fees?
                            </Label>

                            {/* Option Cards */}
                            <div className="grid grid-cols-1 gap-4">
                              {/* Client Pays Option - Default Selected */}
                              <div className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                step4FormData.creditCardProcessingFees.paidBy === 'Client' 
                                  ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                                  : 'border-neutral-200 dark:border-neutral-700 hover:border-green-300'
                              }`}
                              onClick={() => handleStep4FormChange('creditCardProcessingFees', JSON.stringify({ paidBy: 'Client' }))}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                    step4FormData.creditCardProcessingFees.paidBy === 'Client'
                                      ? 'border-green-500 bg-green-500'
                                      : 'border-neutral-300 dark:border-neutral-600'
                                  }`}>
                                    {step4FormData.creditCardProcessingFees.paidBy === 'Client' && (
                                      <div className="w-2 h-2 bg-white rounded-full" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-medium text-sm">
                                        Pass-Through Processing
                                      </h3>
                                      <Badge
                                        variant="secondary"
                                        className="bg-green-100 text-green-700 text-xs"
                                      >
                                        Recommended
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                      Client pays processing fees at checkout
                                    </p>
                                    <div className="mt-3 space-y-1">
                                      <div className="flex items-center gap-2 text-xs">
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                        <span className="text-green-600 dark:text-green-400">
                                          0% cost to your business
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs">
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                        <span className="text-green-600 dark:text-green-400">
                                          Maintains full profit margins
                                        </span>
                                      </div>
                                    </div>
                                    <div className="mt-3 p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">
                                      <strong>Example:</strong> $100 service = You receive $100
                                    </div>
                                  </div>
                                </div>
                                {step4FormData.creditCardProcessingFees.paidBy === 'Client' && (
                                  <div className="absolute -top-2 -right-2">
                                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                      Selected
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Company Pays Option */}
                              <div className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                step4FormData.creditCardProcessingFees.paidBy === 'Company' 
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                                  : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-300'
                              }`}
                              onClick={() => handleStep4FormChange('creditCardProcessingFees', JSON.stringify({ paidBy: 'Company' }))}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                    step4FormData.creditCardProcessingFees.paidBy === 'Company'
                                      ? 'border-blue-500 bg-blue-500'
                                      : 'border-neutral-300 dark:border-neutral-600'
                                  }`}>
                                    {step4FormData.creditCardProcessingFees.paidBy === 'Company' && (
                                      <div className="w-2 h-2 bg-white rounded-full" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium text-sm">
                                      Company Absorbs Processing
                                    </h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                      Your business covers all processing costs
                                    </p>
                                    <div className="mt-3 space-y-1">
                                      <div className="flex items-center gap-2 text-xs">
                                        <XCircle className="w-3 h-3 text-red-500" />
                                        <span className="text-red-600 dark:text-red-400">
                                          Reduces profit margins
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs">
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                        <span className="text-green-600 dark:text-green-400">
                                          Simpler customer experience
                                        </span>
                                      </div>
                                    </div>
                                    <div className="mt-3 p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">
                                      <strong>Example:</strong> $100 service = You receive ~$97 (after fees)
                                    </div>
                                  </div>
                                </div>
                                {step4FormData.creditCardProcessingFees.paidBy === 'Company' && (
                                  <div className="absolute -top-2 -right-2">
                                    <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                      Selected
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Current Selection Summary */}
                            <div className={`p-4 rounded-lg border ${
                              step4FormData.creditCardProcessingFees.paidBy === 'Client'
                                ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                                : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  step4FormData.creditCardProcessingFees.paidBy === 'Client' ? 'bg-green-500' : 'bg-blue-500'
                                }`} />
                                <span className={`font-medium text-sm ${
                                  step4FormData.creditCardProcessingFees.paidBy === 'Client'
                                    ? 'text-green-800 dark:text-green-200'
                                    : 'text-blue-800 dark:text-blue-200'
                                }`}>
                                  Selected: {step4FormData.creditCardProcessingFees.paidBy === 'Client' ? 'Pass-Through Processing' : 'Company Absorbs Processing'}
                                </span>
                              </div>
                              <p className={`text-xs ${
                                step4FormData.creditCardProcessingFees.paidBy === 'Client'
                                  ? 'text-green-700 dark:text-green-300'
                                  : 'text-blue-700 dark:text-blue-300'
                              }`}>
                                {step4FormData.creditCardProcessingFees.paidBy === 'Client'
                                  ? 'Processing costs are seamlessly handled at checkout, ensuring you receive your full service amount.'
                                  : 'Your business will absorb all processing costs, providing a simpler experience for customers but reducing your profit margins.'
                                }
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Step 5: Verification */}
                {setupStep === 5 && (
                  <div className="space-y-6">
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                        Step 5: Setup Complete!
                      </h4>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Your payment processing setup is complete. Here's what
                        happens next:
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">Account Verification</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            1-2 business days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">
                            Bank Account Verification
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Small test deposits within 1-2 days
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">
                            Payment Processing Activation
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Ready to accept payments once verified
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Next Steps
                      </h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>
                          • You'll receive email updates on verification
                          progress
                        </li>
                        <li>• Order card readers from the Equipment tab</li>
                        <li>
                          • Set up your team with payment processing training
                        </li>
                        <li>
                          • Start accepting payments once verification is
                          complete
                        </li>
                      </ul>
                    </div>

                    {/* Final JSON Preview */}
                    {/* <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                      <h4 className="font-medium mb-3">
                        Final JSON Payload Preview
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        This is the complete JSON that will be sent to create the Stripe account:
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const payload = createFinalPayload()
                          console.log('Final Payload:', payload)
                          toast.success('Final payload logged to console', {
                            description: 'Check the browser console to see the complete JSON payload.',
                          })
                        }}
                        className="mb-3"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Preview Final JSON Payload
                      </Button>
                      <pre className="text-xs bg-white dark:bg-neutral-800 p-3 rounded border overflow-x-auto">
                        {JSON.stringify(createFinalPayload(), null, 2)}
                      </pre>
                    </div> */}
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() =>
                    setupStep > 1
                      ? setSetupStep(setupStep - 1)
                      : setShowSetupWorkflowDialog(false)
                  }
                >
                  {setupStep > 1 ? 'Previous' : 'Cancel'}
                </Button>
                <Button
                  onClick={() => {
                    if (setupStep < 5) {
                      setSetupStep(setupStep + 1)
                    } else {
                      handleCompleteSetup()
                    }
                  }}
                  disabled={setupLoading}
                >
                  {setupLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    setupStep < 5 ? 'Next Step' : 'Complete Setup'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Company Info Edit Dialog */}
      <Dialog open={showCompanyInfoDialog} onOpenChange={setShowCompanyInfoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Company Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input 
                id="company-name" 
                value={companyInfoFormData.companyName}
                onChange={e =>
                  setCompanyInfoFormData(prev => ({
                    ...prev,
                    companyName: e.target.value,
                  }))
                }
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address">Address</Label>
              <Textarea 
                id="company-address" 
                value={companyInfoFormData.address}
                onChange={e =>
                  setCompanyInfoFormData(prev => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="Enter address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Phone Number</Label>
              <Input 
                id="company-phone" 
                value={companyInfoFormData.companyPhone}
                onChange={e =>
                  setCompanyInfoFormData(prev => ({
                    ...prev,
                    companyPhone: e.target.value,
                  }))
                }
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="logo-upload"
                />
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
                  {logoPreview ? (
                    <div className="space-y-2">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-20 h-20 mx-auto object-cover rounded-lg"
                      />
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Logo selected: {selectedLogoFile?.name}
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLogoFile(null)
                            setLogoPreview(null)
                          }}
                          className="text-xs"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                      <p className="text-xs text-neutral-400">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-neutral-400">PNG, JPG up to 2MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1" 
                onClick={handleSaveCompanyInfo}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {selectedLogoFile ? 'Uploading logo...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCompanyInfoDialog(false)
                  handleCancelCompanyInfoEdit()
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
