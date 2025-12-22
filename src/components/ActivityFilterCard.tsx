import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/src/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover'
import { Filter, Check, ChevronsUpDown } from 'lucide-react'
import { apiService } from '@/src/services/api'
import { usePermissions } from '@/src/hooks/usePermissions'

export interface FilterState {
  dateRangeFilter: string
  customStartDate: string
  customEndDate: string
  filterUserId: string
  filterTenantId: string
}

export interface ActivityFilterCardProps {
  onFilterChange: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
  showTitle?: boolean
  className?: string
}

const ActivityFilterCard: React.FC<ActivityFilterCardProps> = ({
  onFilterChange,
  initialFilters = {},
  showTitle = true,
  className = '',
}) => {
  const { getUserType } = usePermissions()

  // State for date filters
  const [dateRangeFilter, setDateRangeFilter] = useState<string>(
    initialFilters.dateRangeFilter || 'All'
  )
  const [customStartDate, setCustomStartDate] = useState<string>(
    initialFilters.customStartDate || ''
  )
  const [customEndDate, setCustomEndDate] = useState<string>(
    initialFilters.customEndDate || ''
  )

  // State for userId filter
  const [filterUserId, setFilterUserId] = useState<string>(
    initialFilters.filterUserId || 'all'
  )
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')

  // State for tenantId filter
  const [filterTenantId, setFilterTenantId] = useState<string>(
    initialFilters.filterTenantId || 'all'
  )
  const [tenants, setTenants] = useState<any[]>([])
  const [loadingTenants, setLoadingTenants] = useState(false)
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false)
  const [tenantSearchTerm, setTenantSearchTerm] = useState('')

  // Fetch users for userId filter
  const fetchUsers = async (searchTerm: string = '') => {
    try {
      setLoadingUsers(true)
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
        status: 'Active',
        type: 'P5',
      })

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      const response = await apiService.get(`/v1/users?${params}`)
      if (response.data.success) {
        setUsers(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Get selected user name for display
  const getSelectedUserName = () => {
    if (filterUserId === 'all') return 'All Users'
    const user = users.find(u => u._id === filterUserId)
    return user ? `${user.name} (${user.username})` : 'Select user...'
  }

  // Handle dropdown close
  const handleUserDropdownClose = (open: boolean) => {
    setUserDropdownOpen(open)
    if (!open) {
      // Only clear search term and fetch all users when dropdown is actually closed
      // Don't clear immediately to prevent list from disappearing
      setTimeout(() => {
        setUserSearchTerm('')
        fetchUsers('')
      }, 100)
    }
  }

  // Fetch tenants for tenantId filter
  const fetchTenants = async (searchTerm: string = '') => {
    try {
      setLoadingTenants(true)
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
      })

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      // Fetch from all three package types
      const response = await apiService.get(`/v1/users/tenants/all?${params}`)

      // Combine results from all three APIs
      const allTenants = []

      if (response.data.success && response.data.data) {
        allTenants.push(...response.data.data)
      }

      setTenants(allTenants)
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setLoadingTenants(false)
    }
  }

  // Get selected tenant name for display
  const getSelectedTenantName = () => {
    if (filterTenantId === 'all') return 'All Tenants'
    const tenant = tenants.find(t => t._id === filterTenantId)
    return tenant ? `${tenant.name} (${tenant.username})` : 'Select tenant...'
  }

  // Handle tenant dropdown close
  const handleTenantDropdownClose = (open: boolean) => {
    setTenantDropdownOpen(open)
    if (!open) {
      // Only clear search term and fetch all tenants when dropdown is actually closed
      // Don't clear immediately to prevent list from disappearing
      setTimeout(() => {
        setTenantSearchTerm('')
        fetchTenants('')
      }, 100)
    }
  }

  // Memoize the filter change handler to prevent unnecessary re-renders
  const handleFilterChange = useCallback(() => {
    onFilterChange({
      dateRangeFilter,
      customStartDate,
      customEndDate,
      filterUserId,
      filterTenantId,
    })
  }, [
    dateRangeFilter,
    customStartDate,
    customEndDate,
    filterUserId,
    filterTenantId,
    onFilterChange,
  ])

  // Notify parent component of filter changes
  useEffect(() => {
    handleFilterChange()
  }, [handleFilterChange])

  // Clear tenant value when a specific user is selected
  useEffect(() => {
    if (filterUserId !== 'all') {
      setFilterTenantId('all')
    }
  }, [filterUserId])

  // Clear user value when a specific tenant is selected
  useEffect(() => {
    if (filterTenantId !== 'all') {
      setFilterUserId('all')
    }
  }, [filterTenantId])

  // Fetch users and tenants on component mount
  useEffect(() => {
    fetchUsers('')
    // Only fetch tenants for P1 users
    if (getUserType() === 'P1') {
      fetchTenants('')
    }
  }, [getUserType])

  // Debounced search effect for users
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        if (userDropdownOpen) {
          fetchUsers(userSearchTerm)
        }
      },
      userSearchTerm ? 300 : 0
    ) // No delay for empty search, 300ms debounce for search

    return () => clearTimeout(timeoutId)
  }, [userSearchTerm, userDropdownOpen])

  // Debounced search effect for tenants
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        if (tenantDropdownOpen) {
          fetchTenants(tenantSearchTerm)
        }
      },
      tenantSearchTerm ? 300 : 0
    ) // No delay for empty search, 300ms debounce for search

    return () => clearTimeout(timeoutId)
  }, [tenantSearchTerm, tenantDropdownOpen])

  return (
    <Card
      className={`border-0 shadow-lg bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 ${className}`}
    >
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        <div className="">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            {/* User ID Filter - Searchable Dropdown - Hide when tenant is selected */}
            {filterTenantId === 'all' && (
              <div className="space-y-2 w-full sm:min-w-0 sm:flex-1 sm:max-w-xs">
                <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  User
                </Label>
                <Popover
                  open={userDropdownOpen}
                  onOpenChange={handleUserDropdownClose}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={userDropdownOpen}
                      className="w-full justify-between text-left"
                    >
                      <span className="truncate flex-1 mr-2">
                        {getSelectedUserName()}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0 max-w-[calc(100vw-2rem)] sm:max-w-none"
                    align="start"
                  >
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onValueChange={setUserSearchTerm}
                        className="h-9"
                      />
                      <CommandList className="max-h-[300px] sm:max-h-[400px]">
                        {loadingUsers ? (
                          <CommandEmpty>Loading users...</CommandEmpty>
                        ) : users.length === 0 ? (
                          <CommandEmpty>No users found.</CommandEmpty>
                        ) : (
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => {
                                setFilterUserId('all')
                                setUserDropdownOpen(false)
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  filterUserId === 'all'
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                }`}
                              />
                              All Users
                            </CommandItem>
                            {users.map(user => (
                              <CommandItem
                                key={user._id}
                                value={user._id}
                                onSelect={() => {
                                  setFilterUserId(user._id)
                                  setFilterTenantId('all') // Clear tenant when user is selected
                                  setUserDropdownOpen(false)
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    filterUserId === user._id
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  }`}
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="font-medium truncate">
                                    {user.name}
                                  </span>
                                  <span className="text-sm text-muted-foreground truncate">
                                    {user.username}{' '}
                                    {user.email && `• ${user.email}`}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Tenant ID Filter - Searchable Dropdown - Only show for P1 users and when no specific user is selected */}
            {getUserType() === 'P1' && filterUserId === 'all' && (
              <div className="space-y-2 w-full sm:min-w-0 sm:flex-1 sm:max-w-xs">
                <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Tenant
                </Label>
                <Popover
                  open={tenantDropdownOpen}
                  onOpenChange={handleTenantDropdownClose}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={tenantDropdownOpen}
                      className="w-full justify-between text-left"
                    >
                      <span className="truncate flex-1 mr-2">
                        {getSelectedTenantName()}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0 max-w-[calc(100vw-2rem)] sm:max-w-none"
                    align="start"
                  >
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search tenants..."
                        value={tenantSearchTerm}
                        onValueChange={setTenantSearchTerm}
                        className="h-9"
                      />
                      <CommandList className="max-h-[300px] sm:max-h-[400px]">
                        {loadingTenants ? (
                          <CommandEmpty>Loading tenants...</CommandEmpty>
                        ) : tenants.length === 0 ? (
                          <CommandEmpty>No tenants found.</CommandEmpty>
                        ) : (
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => {
                                setFilterTenantId('all')
                                setTenantDropdownOpen(false)
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  filterTenantId === 'all'
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                }`}
                              />
                              All Tenants
                            </CommandItem>
                            {tenants
                              .filter(tenant => {
                                if (!tenantSearchTerm) return true
                                const searchLower =
                                  tenantSearchTerm.toLowerCase()
                                return (
                                  tenant.name
                                    ?.toLowerCase()
                                    .includes(searchLower) ||
                                  tenant.username
                                    ?.toLowerCase()
                                    .includes(searchLower) ||
                                  tenant.email
                                    ?.toLowerCase()
                                    .includes(searchLower)
                                )
                              })
                              .map(tenant => (
                                <CommandItem
                                  key={tenant._id}
                                  value={tenant._id}
                                  onSelect={() => {
                                    setFilterTenantId(tenant._id)
                                    setFilterUserId('all') // Clear user when tenant is selected
                                    setTenantDropdownOpen(false)
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      filterTenantId === tenant._id
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    }`}
                                  />
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-medium truncate">
                                      {tenant.name}
                                    </span>
                                    <span className="text-sm text-muted-foreground truncate">
                                      {tenant.username}{' '}
                                      {tenant.email && `• ${tenant.email}`}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Date Range Filter */}
            <div className="space-y-2 w-full sm:min-w-0 sm:flex-1 sm:max-w-xs">
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Date Range
              </Label>
              <Select
                value={dateRangeFilter}
                onValueChange={setDateRangeFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] sm:max-h-none">
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                  <SelectItem value="Today">Today</SelectItem>
                  <SelectItem value="Yesterday">Yesterday</SelectItem>
                  <SelectItem value="This Week Sun">This Week Sun</SelectItem>
                  <SelectItem value="This Week Mon">This Week Mon</SelectItem>
                  <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                  <SelectItem value="Last Week Sun">Last Week Sun</SelectItem>
                  <SelectItem value="Last Week Mon">Last Week Mon</SelectItem>
                  <SelectItem value="Last Business Week">
                    Last Business Week
                  </SelectItem>
                  <SelectItem value="Last 14 Days">Last 14 Days</SelectItem>
                  <SelectItem value="This Month">This Month</SelectItem>
                  <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                  <SelectItem value="Last Month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range Picker - Only show when Custom is selected */}
            {dateRangeFilter === 'Custom' && (
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:col-span-2">
                <div className="space-y-2 w-full sm:min-w-0 sm:flex-1 sm:max-w-40">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Start Date
                  </Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={e => setCustomStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 w-full sm:min-w-0 sm:flex-1 sm:max-w-40">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    End Date
                  </Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={e => setCustomEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ActivityFilterCard
