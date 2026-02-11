import React from 'react'
import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import {
  Edit,
  Trash2,
  Eye,
} from 'lucide-react'
import { customersMockData } from '@/src/constants/dummyData/customers'
import JobsTable from '@/src/components/table'
import { CustomerCard } from '@/src/components/customer/CustomerCard'
import { CustomerT } from '@/src/constants/interface/customer'
import { CustomerProfileView } from '@/src/components/customer/CustomerProfileView'
import DashboardFilter from '@/src/components/dashboardFilter/DashboardFilter'
import SelectInput from '@/src/components/input/select'



const CustomersIndex: React.FC = (): React.JSX.Element => {

  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerT | null>(
    null
  )
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [toggleStatus, setToggleStatus] = useState<string>('')
  const [showProfile, setShowProfile] = useState<boolean>(false)

  /* Filters */
  const [moreFiltersData, setMoreFiltersData] = useState({
    source: 'all',
  })

  // Sortings
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  

  const filteredCustomers = customersMockData.filter(customer => {
    const matchesSearch =
      customer.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber?.includes(searchTerm)

    const matchesSource = moreFiltersData.source === 'all' || customer.sourceTitle === moreFiltersData.source

    const matchesStatus = toggleStatus === "" || customer.status === toggleStatus
    return matchesSearch && matchesSource && matchesStatus
  })

  const sources= Array.from(
    new Set(customersMockData.map(c => c.sourceTitle).filter(Boolean))
  )

  const sourcesFormatted = [
    { label: "All Source", value: "all" },
    ...sources.map(source => ({
      label: source,
      value: source,
    })),
  ]

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (!sortKey) return 0

    const aVal = a[sortKey as keyof CustomerT]
    const bVal = b[sortKey as keyof CustomerT]

    if (aVal == null) return 1
    if (bVal == null) return -1

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal
    }

    return sortDirection === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })

  const handleViewCustomer = (customer: CustomerT) => {
    setSelectedCustomer(customer)
    setShowProfile(true)
  }

  const customerColumns = [
      {
        columnName: "Serial No.",
        sortKey: "serialNumber",
        cell: (row: CustomerT) => (
          <span className="whitespace-nowrap">
            {row.serialNumber ?? "—"}
          </span>
        ),
      },
      {
        columnName: "Client",
        sortKey: "clientName",
        cell: (row: CustomerT) => (
          <span className="whitespace-nowrap">
            {row.clientName ?? "—"}
          </span>
        ),
      },
      {
        columnName: "Company",
        sortKey: "companyName",
        cell: (row: CustomerT) => (
          <span className="whitespace-nowrap">
            {row.companyName ?? "—"}
          </span>
        ),
      },
      {
        columnName: "Email",
        sortKey: "email",
        cell: (row: CustomerT) => (
          <span className="whitespace-nowrap">
            {row.email ?? "—"}
          </span>
        ),
      },
      {
        columnName: "Phone",
        sortKey: "phoneNumber",
        cell: (row: CustomerT) => (
          <span className="whitespace-nowrap">
            {row.phoneNumber ?? "—"}
          </span>
        ),
      },
      {
        columnName: "Source",
        sortKey: "sourceTitle",
        cell: (row: CustomerT) => (
          <span className="whitespace-nowrap">
            {row.sourceTitle}
          </span>
        ),
      },
      {
        columnName: "Unit",
        cell: (row: CustomerT) => `${row.addressUnit ?? "-"}`,
        sortKey: "addressUnit",
      },
      {
        columnName: "Location",
        cell: (row: CustomerT) => row.location ?? "—",
        sortKey: "location",
      },
    {
      columnName: "Actions",
      cell: (row: CustomerT) => (
        <div className="flex items-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewCustomer(row)}
          >
            <Eye className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            // onClick={() => handleEditCustomer(row.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            // onClick={() => handleDeleteCustomer(row.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]


  const totalCount = filteredCustomers.length
  const totalPages = Math.ceil(totalCount / pageSize)

  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )


  const handlePageSizeChange = (value: string) => {
    const newSize = Number(value)
    setPageSize(newSize)
    setCurrentPage(1) // reset to first page (important)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }


  const toggleList = [
    { label: "All", value: "" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ]

  /* To Be Set Soon After Finishing Table */

  if (showProfile && selectedCustomer) {
    return (
      <CustomerProfileView 
        selectedCustomer={selectedCustomer} 
        setShowProfile={setShowProfile} 
      />
    )
  }
  
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col md:h-screen">
      {/* Header */}
      <DashboardFilter 
        title='Customer Dashboard'
        // description='Manage customer relationships and history'
        toggleList={toggleList}
        searchQuery={searchTerm}
        onChangeSearchQuery={setSearchTerm}
        onToggleChange={setToggleStatus} 
        toggleStatus={toggleStatus} 
        moreFilters={
          [
            (
              /* Source Filter */
              <SelectInput
                label="Source"
                options={sourcesFormatted}
                placeholder="All Source"
                value={moreFiltersData.source}
                onSelect={val => setMoreFiltersData(prev => ({
                  ...prev,
                  source: typeof val === "string" ? val : prev.source,
                }))}
                onSearch={() => {}}
              />
            )
          ]
        }     
      />

      {/* Table */}
      <JobsTable
        rows={paginatedCustomers}
        columns={customerColumns}
        mobileRows={paginatedCustomers}
        mobileCard={(row) => (
          <CustomerCard
            customer={row}
            openCustomerProfile={handleViewCustomer}
          />
        )}
        onSort={handleSort}
        activeSortKey={sortKey ?? undefined}
        sortDirection={sortDirection}
        pageSize={pageSize}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageSizeChange={handlePageSizeChange}
        onPageChange={handlePageChange}
        maxHeightClassName={"max-h-[calc(100vh-420px)]"}
      />
    </div>
  )
}

export default CustomersIndex
