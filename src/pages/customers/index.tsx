import React from 'react'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Input } from '@/src/components/ui/input'
import { Textarea } from '@/src/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/src/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  MoreVertical,
  MessageSquare,
  PhoneCall,
  FileText,
  Wrench,
  DollarSign,
  Clock,
  PlayCircle,
  Download,
  Edit,
  Trash2,
  User,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Users,
} from 'lucide-react'
import {
  customers,
  mockCustomerDetails,
  Customer,
  Notes,
} from '@/src/constants/dummyData/customers'

const CustomersIndex: React.FC = (): React.JSX.Element => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  )
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showProfile, setShowProfile] = useState<boolean>(false)

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    const matchesFilter =
      filterStatus === 'all' || customer.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in-progress':
        return <Clock className="w-4 h-4 text-[#53a533]/50" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getCommunicationIcon = (type: string, channel: string) => {
    if (type === 'call') return <PhoneCall className="w-4 h-4 text-green-500" />
    if (type === 'email') return <Mail className="w-4 h-4 text-[#53a533]/50" />
    if (channel === 'WhatsApp')
      return <MessageSquare className="w-4 h-4 text-green-600" />
    return <MessageSquare className="w-4 h-4 text-slate-500" />
  }

  const openCustomerProfile = (customerId: string) => {
    // In a real app, this would fetch the customer details
    setSelectedCustomer(mockCustomerDetails)
    setShowProfile(true)
  }

  if (showProfile && selectedCustomer) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowProfile(false)}
                className="text-slate-600"
              >
                ← Back to Customers
              </Button>
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedCustomer.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
                  {selectedCustomer.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {selectedCustomer.name}
                </h1>
                <p className="text-sm text-slate-600">
                  Customer since{' '}
                  {new Date(selectedCustomer.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(selectedCustomer.status)}>
                {selectedCustomer.status}
              </Badge>
              <Button className="bg-gradient-to-r from-[#53a533] to-[#53a533] text-white">
                <Edit className="w-4 h-4 mr-2" />
                Edit Customer
              </Button>
            </div>
          </div>
        </div>

        {/* Customer Profile Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-6 bg-white border-b border-slate-200 rounded-none p-0">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#53a533]/50"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="jobs"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#53a533]/50"
              >
                Jobs & Tickets
              </TabsTrigger>
              <TabsTrigger
                value="communications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#53a533]/50"
              >
                Communications
              </TabsTrigger>
              <TabsTrigger
                value="recordings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#53a533]/50"
              >
                Call Recordings
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#53a533]/50"
              >
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#53a533]/50"
              >
                Billing
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent
              value="overview"
              className="flex-1 overflow-y-auto p-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Info Card */}
                <div className="lg:col-span-1">
                  <Card className="border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>Customer Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Email
                        </label>
                        <p className="text-sm text-slate-900">
                          {selectedCustomer.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Phone
                        </label>
                        <p className="text-sm text-slate-900">
                          {selectedCustomer.phone}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Alternate Phone
                        </label>
                        <p className="text-sm text-slate-900">
                          {selectedCustomer.alternatePhone}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Address
                        </label>
                        <p className="text-sm text-slate-900">
                          {selectedCustomer.address}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Property Type
                        </label>
                        <p className="text-sm text-slate-900">
                          {selectedCustomer.propertyType}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Preferred Technician
                        </label>
                        <p className="text-sm text-slate-900">
                          {selectedCustomer.preferredTech}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Emergency Contact
                        </label>
                        <p className="text-sm text-slate-900">
                          {selectedCustomer.emergencyContact}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedCustomer.tags.map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Stats and Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#53a533]/50 rounded-lg flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Total Jobs</p>
                            <p className="text-2xl font-bold text-[#4a9430]">
                              {selectedCustomer.totalJobs}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">
                              Total Spent
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              ${selectedCustomer.totalSpent.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-yellow-50 to-amber-50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <Star className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Rating</p>
                            <p className="text-2xl font-bold text-yellow-600">
                              {selectedCustomer.rating}/5
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Messages</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {selectedCustomer.communications?.length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Jobs */}
                  <Card className="border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Recent Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedCustomer.jobHistory?.slice(0, 3).map(job => (
                          <div
                            key={job.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              {getJobStatusIcon(job.status)}
                              <div>
                                <p className="font-medium text-slate-900">
                                  {job.type}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {job.id} • {job.date}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">
                                ${job.amount}
                              </p>
                              <div className="flex items-center space-x-1">
                                {[...Array(job.rating)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-3 h-3 fill-yellow-400 text-yellow-400"
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Notes */}
                  <Card className="border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Customer Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700">
                        {selectedCustomer.customerNotes}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Jobs & Tickets Tab */}
            <TabsContent value="jobs" className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Job History
                  </h3>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    New Job
                  </Button>
                </div>
                {selectedCustomer.jobHistory?.map(job => (
                  <Card
                    key={job.id}
                    className="border-0 bg-white/70 backdrop-blur-sm"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {getJobStatusIcon(job.status)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-slate-900">
                                {job.type}
                              </h4>
                              <Badge className={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">
                              {job.description}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-500">
                              <div>
                                <span className="font-medium">Job ID:</span>{' '}
                                {job.id}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span>{' '}
                                {job.date}
                              </div>
                              <div>
                                <span className="font-medium">Technician:</span>{' '}
                                {job.tech}
                              </div>
                              <div>
                                <span className="font-medium">Amount:</span> $
                                {job.amount}
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center space-x-1 mb-1">
                                <span className="text-sm font-medium text-slate-600">
                                  Rating:
                                </span>
                                {[...Array(job.rating)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-slate-600">
                                {job.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Job
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Communications Tab */}
            <TabsContent
              value="communications"
              className="flex-1 overflow-y-auto p-6"
            >
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Communication History
                </h3>
                {selectedCustomer.communications?.map(comm => (
                  <Card
                    key={comm.id}
                    className="border-0 bg-white/70 backdrop-blur-sm"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        {getCommunicationIcon(comm.type, comm.channel)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-slate-900 capitalize">
                                {comm.type}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {comm.channel}
                              </Badge>
                              <Badge
                                variant={
                                  comm.direction === 'incoming'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {comm.direction}
                              </Badge>
                            </div>
                            <span className="text-sm text-slate-500">
                              {comm.date}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700">
                            {comm.content}
                          </p>
                          {comm.type === 'call' && (
                            <div className="mt-2 flex items-center space-x-4 text-sm text-slate-500">
                              <span>Duration: {comm.duration}</span>
                              {comm.recordingUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#4a9430] p-0 h-auto"
                                >
                                  <PlayCircle className="w-4 h-4 mr-1" />
                                  Play Recording
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Call Recordings Tab */}
            <TabsContent
              value="recordings"
              className="flex-1 overflow-y-auto p-6"
            >
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Call Recordings
                </h3>
                {selectedCustomer.callRecordings?.map(recording => (
                  <Card
                    key={recording.id}
                    className="border-0 bg-white/70 backdrop-blur-sm"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                            <PlayCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {recording.type}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {recording.date}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                              <span>Duration: {recording.duration}</span>
                              <Badge variant="outline" className="text-xs">
                                {recording.quality}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Play
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-slate-600">
                          {recording.notes}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Customer Notes
                  </h3>
                  <Button className="bg-gradient-to-r from-[#53a533] to-[#53a533] text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </div>
                {(Array.isArray(selectedCustomer.notes)
                  ? selectedCustomer.notes
                  : []
                )?.map((note: Notes) => (
                  <Card
                    key={note.id}
                    className="border-0 bg-white/70 backdrop-blur-sm"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#4a9430]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {note.type}
                              </Badge>
                              <span className="text-sm text-slate-500">
                                {note.date}
                              </span>
                              <span className="text-sm text-slate-500">
                                by {note.author}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700">
                              {note.content}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Note
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Note
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Billing Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Billing Address
                      </label>
                      <p className="text-sm text-slate-900">
                        {selectedCustomer.billingAddress}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Payment Method
                      </label>
                      <p className="text-sm text-slate-900">
                        {selectedCustomer.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Total Spent
                      </label>
                      <p className="text-2xl font-bold text-green-600">
                        ${selectedCustomer.totalSpent.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedCustomer.jobHistory?.map(job => (
                        <div
                          key={job.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-slate-900">
                              {job.type}
                            </p>
                            <p className="text-sm text-slate-500">{job.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">
                              ${job.amount}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#4a9430] p-0 h-auto"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col">
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
              {customers.length} Total Customers
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
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('active')}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === 'inactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('inactive')}
            >
              Inactive
            </Button>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <Card
              key={customer.id}
              className="border-0 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => openCustomerProfile(customer.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={customer.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white text-lg font-semibold">
                      {customer.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {customer.name}
                      </h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={e => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation()
                              openCustomerProfile(customer.id)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={e => e.stopPropagation()}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={e => e.stopPropagation()}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={e => e.stopPropagation()}>
                            <Phone className="w-4 h-4 mr-2" />
                            Call Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p className="flex items-center space-x-2">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{customer.email}</span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <Phone className="w-3 h-3" />
                        <span>{customer.phone}</span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{customer.address}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                        {customer.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(customer.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-center">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">
                          {customer.totalJobs}
                        </p>
                        <p className="text-xs text-slate-500">Jobs</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-green-600">
                          ${customer.totalSpent.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">Spent</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Last Contact</p>
                        <p className="text-sm font-medium text-slate-900">
                          {customer.lastContact}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CustomersIndex
