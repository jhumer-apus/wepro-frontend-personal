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
import { exportToCSV } from '@/src/utils/exportToCSV'
import { Checkbox } from '@/src/components/ui/checkbox'
import CustomerDashboardFilter from '@/src/components/customer/CustomerDashboardFilter'
import CreateCustomerDialog from '@/src/components/customer/form/CreateCustomerDialog'
import EditCustomerDialog from '@/src/components/customer/form/EditCustomerDialog'



const CustomersIndex: React.FC = (): React.JSX.Element => {

  const [openCreateCustomerDialog, setOpenCreateCustomerDialog] = useState<boolean>(false)
  const [openEditCustomerDialog, setOpenEditCustomerDialog] = useState<boolean>(false)
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [customers, setCustomers] = useState<CustomerT[]>(customersMockData)
  const [customerToEdit, setCustomerToEdit] = useState<CustomerT | null>(null)

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerT | null>(
    null
  )
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showProfile, setShowProfile] = useState<boolean>(false)

  /* Filters */
  const [moreFiltersData, setMoreFiltersData] = useState({
    source: 'all',
  })

  // Sortings
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());


  const handleRowToggle = (id: string, isChecked: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);

      if (isChecked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }

      return newSet;
    });
  };

  

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber?.includes(searchTerm)

    const matchesSource = moreFiltersData.source === 'all' || customer.sourceTitle === moreFiltersData.source

    return matchesSearch && matchesSource
  })

  const sources= Array.from(
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

  const handleViewCustomer = (customer: CustomerT) => {
    setSelectedCustomer(customer)
    setShowProfile(true)
  }

  const customerColumns = [
      {
        columnName: "Serial No.",
        sortKey: "serialNumber",
        cell: (row: CustomerT) => (
          <div className="grid grid-cols-3 gap-1 place-items-center min-w-[120px]">
            
            {/* Col 1: Checkbox */}
            <Checkbox
              aria-label={`Select customer ${row.id}`}
              checked={selectedRows.has(row.id)}
              onCheckedChange={checked =>
                handleRowToggle(row.id, Boolean(checked))
              }
            />

            {/* Col 2: Serial Number */}
            <div className="font-medium ">
              {row.serialNumber ?? "—"}
            </div>

            {/* Col 3: View */}
            <Button
              size="icon"
              variant="ghost"
              className={`h-7 w-7 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-sm`}
              onClick={() => handleViewCustomer(row)}
              title="View job"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
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
        columnName: "Address",
        cell: (row: CustomerT) => (
          <span className="whitespace-nowrap">
            {[row.city, row.state, row.country]
              .filter(Boolean)
              .join(", ") || "-"}
          </span>
        ),
      },
      {
        columnName: "Location",
        cell: (row: CustomerT) => row.location ?? "—",
        sortKey: "location",
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

  const handleExport = () => {
    exportToCSV(
      sortedCustomers,
      [
        { header: "Serial No.", accessor: c => c.serialNumber ?? "" },
        { header: "Client", accessor: c => c.clientName ?? "" },
        { header: "Company", accessor: c => c.companyName ?? "" },
        { header: "Email", accessor: c => c.email ?? "" },
        { header: "Phone", accessor: c => c.phoneNumber ?? "" },
        { header: "Source", accessor: c => c.sourceTitle ?? "" },
        { header: "Unit", accessor: c => c.apartmentUnit ?? "" },
        { header: "Location", accessor: c => c.location ?? "" },
        {
          header: "Full Address",
          accessor: c =>
            [c.apartmentUnit, c.city, c.state, c.country, c.zipCode]
              .filter(Boolean)
              .join(", "),
        },
      ],
      "customers_export.csv"
    );
  };


  const nextSerialNumber =
    customers.length > 0
      ? Math.max(...customers.map(c => c.serialNumber)) + 1
      : 1;


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
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col md:h-[calc(100vh-8rem)]">
      {/* Header */}
      <CustomerDashboardFilter 
        searchQuery={searchTerm}
        onChangeSearchQuery={setSearchTerm}
        moreFiltersData={moreFiltersData}
        setMoreFiltersData={setMoreFiltersData} 
        handleOpenCreateCustomer={() => setOpenCreateCustomerDialog(() => true)}
      />

      
      {selectedRows.size > 0 && (
        <div className="flex items-center gap-3 my-2">

          {/* Bulk Delete */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              const confirmed = window.confirm(
                `Delete ${selectedRows.size} selected customer(s)?`
              );
              if (!confirmed) return;

              // If using real state:
              setCustomers(prev =>
                prev.filter(c => !selectedRows.has(c.id))
              );
              console.log("Deleting:", Array.from(selectedRows));

              setSelectedRows(new Set());
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>

          {/* Edit Section */}
          <div className="flex items-center gap-2 bg-gray-200 rounded-md">

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const selectedId = Array.from(selectedRows)[0];

                const findCustomer = customers.find(c => c.id === selectedId) ?? null
                setCustomerToEdit(() => findCustomer)

                if (findCustomer) {
                  setOpenEditCustomerDialog(() => true)
                }
              }}
              disabled={selectedRows.size !== 1}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>

            {selectedRows.size !== 1 && (
              <p className="text-xs text-gray-500 pr-2">
                Select exactly one customer to edit
              </p>
            )}
          </div>

        </div>
      )}


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
        onExport={handleExport}
        className="flex-1 flex flex-col"
        tableClassName="flex-1 flex flex-col overflow-y-hidden"
      />


      {/* Create Customer Dialog */}
      <CreateCustomerDialog
        nextSerialNumber={nextSerialNumber}
        open={openCreateCustomerDialog}
        setOpen={setOpenCreateCustomerDialog}
        onCreate={(newCustomer) => {
          setCustomers(prev => [...prev, newCustomer]);
        }}
      />

      {/* Edit Customer Dialog */}
      <EditCustomerDialog 
        customer={customerToEdit} 
        onUpdate={(updated: CustomerT) => {
          setCustomers(prev =>
            prev.map(c => (c.id === updated.id ? updated : c))
          )
        }} 
        open={openEditCustomerDialog} 
        setOpen={setOpenEditCustomerDialog} 
      />

    </div>
  )
}

export default CustomersIndex
