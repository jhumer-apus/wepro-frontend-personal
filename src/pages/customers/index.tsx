import React from 'react'
import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Input } from '@/src/components/ui/input'
import { Textarea } from '@/src/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
} from 'lucide-react'
import {
  customersMockData,
  mockCustomerDetails,
} from '@/src/constants/dummyData/customers'
import JobsTable from '@/src/components/table'
import { CustomerCard } from '@/src/components/customer/CustomerCard'
import { CustomerT } from '@/src/types/customer'
import { CustomerProfileView } from '@/src/components/customer/CustomerProfileView'
import { SourceFilter } from '@/src/components/customer/SourceFilter'



const CustomersIndex: React.FC = (): React.JSX.Element => {

  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerT | null>(
    null
  )
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showProfile, setShowProfile] = useState<boolean>(false)

  // Filters
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  // Sortings
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  

  const filteredCustomers = customersMockData.filter(customer => {
    const matchesSearch =
      customer.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber?.includes(searchTerm)

    const matchesSource = sourceFilter === 'all' || customer.sourceTitle === sourceFilter

    return matchesSearch && matchesSource
  })

  const sources = Array.from(
    new Set(customersMockData.map(c => c.sourceTitle).filter(Boolean))
  )

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





  const openCustomerProfile = () => {
    setSelectedCustomer(mockCustomerDetails)
    setShowProfile(true)
  }



  const customerColumns = [
      {
        columnName: "Client",
        cell: (row: CustomerT) => row.clientName ?? "—",
        sortKey: "clientName",
      },
      {
        columnName: "Company",
        cell: (row: CustomerT) => row.companyName ?? "—",
        sortKey: "companyName",
      },
      {
        columnName: "Source",
        cell: (row: CustomerT) => row.sourceTitle,
        sortKey: "sourceTitle",
      },
      {
        columnName: "Email",
        cell: (row: CustomerT) => row.email ?? "—",
        sortKey: "email",
      },
      {
        columnName: "Phone",
        cell: (row: CustomerT) => row.phoneNumber ?? "—",
        sortKey: "phoneNumber",
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
            // onClick={() => handleViewCustomer(row.id)}
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




  /* To Be Set Soon After Finishing Table */
  // if (showProfile && selectedCustomer) {
  //   return (
  //     <CustomerProfileView 
  //       selectedCustomer={selectedCustomer} 
  //       setShowProfile={setShowProfile} 
  //     />
  //   )
  // }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brandGreen-900 to-brandGreen-500 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
              <p className="text-sm text-slate-600">
                Manage customer relationships and history
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-[#53a533]/10 text-[#2f5f1f] border-[#53a533]/20">
              {totalCount} Total Customers
            </Badge>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Full Name" />
                  <Input placeholder="Email Address" />
                  <Input placeholder="Phone Number" />
                  <Textarea placeholder="Address" />
                  <Button className="w-full bg-gradient-to-r from-[#53a533] to-[#53a533] text-white">
                    Create Customer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>
          {/* Source Filter */}
          <SourceFilter
            sourceFilter={sourceFilter}
            sources={sources}
            onChange={(value) => {
              setSourceFilter(value)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      {/* Table */}
      <JobsTable
        rows={paginatedCustomers}
        columns={customerColumns}
        mobileRows={paginatedCustomers}
        mobileCard={(row) => (
          <CustomerCard
            customer={row}
            openCustomerProfile={openCustomerProfile}
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
      />
    </div>
  )
}

export default CustomersIndex
