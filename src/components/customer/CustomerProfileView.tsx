import { Customer, Notes } from "@/src/constants/dummyData/customers"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs"
import { 
    Edit, 
    User, 
    Wrench, 
    DollarSign, 
    Star, 
    MessageSquare, 
    Plus, 
    MoreVertical, 
    Eye, 
    Download, 
    PlayCircle, 
    FileText, 
    Trash2, 
    CreditCard, 
    PhoneCall, 
    Mail, 
    CheckCircle, 
    Clock, 
    XCircle, 
    AlertCircle 
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { CustomerT } from "@/src/types/customer"
import { OverviewCustomerTab } from "./OverviewCustomerTab"

interface CustomerProfileViewProps {
  selectedCustomer: CustomerT
  setShowProfile: (value: boolean) => void
}

export const CustomerProfileView = ({
    selectedCustomer,
    setShowProfile,
}:CustomerProfileViewProps) => {

    const getCommunicationIcon = (type: string, channel: string) => {
        if (type === 'call') return <PhoneCall className="w-4 h-4 text-green-500" />
        if (type === 'email') return <Mail className="w-4 h-4 text-[#53a533]/50" />
        if (channel === 'WhatsApp')
        return <MessageSquare className="w-4 h-4 text-green-600" />
        return <MessageSquare className="w-4 h-4 text-slate-500" />
    }

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
    const customerTabs = [
        {
            value: "overview",
            label: "Overview",
            content: (
            <OverviewCustomerTab
                selectedCustomer={selectedCustomer}
                getJobStatusIcon={getJobStatusIcon}
            />
            ),  
        },
        {
            value: "jobs",
            label: "Jobs & Tickets",
            content: (
            <JobsTab
                selectedCustomer={selectedCustomer}
                getJobStatusIcon={getJobStatusIcon}
                getStatusColor={getStatusColor}
            />
            ),
        },
        {
            value: "communications",
            label: "Communications",
            content: (
            <CommunicationsTab
                selectedCustomer={selectedCustomer}
                getCommunicationIcon={getCommunicationIcon}
            />
            ),
        },
        {
            value: "recordings",
            label: "Call Recordings",
            content: (
            <RecordingsTab selectedCustomer={selectedCustomer} />
            ),
        },
        {
            value: "notes",
            label: "Notes",
            content: (
            <NotesTab selectedCustomer={selectedCustomer} />
            ),
        },
        {
            value: "billing",
            label: "Billing",
            content: (
            <BillingTab selectedCustomer={selectedCustomer} />
            ),
        },
        ]

    return (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col">
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
                {/* <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedCustomer.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
                    {selectedCustomer.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                </Avatar> */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {selectedCustomer.clientName}
                    </h1>
                    {/* <p className="text-sm text-slate-600">
                        Customer since{' '}
                        {new Date(selectedCustomer.joinDate).toLocaleDateString()}
                    </p> */}
                </div>
                </div>
                <div className="flex items-center space-x-3">
                {/* <Badge className={getStatusColor(selectedCustomer.status)}>
                    {selectedCustomer.status}
                </Badge> */}
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
                        {customerTabs.map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#53a533]/50"
                        >
                            {tab.label}
                        </TabsTrigger>
                        ))}
                    </TabsList>

                    {customerTabs.map(tab => (
                        <TabsContent
                            key={tab.value}
                            value={tab.value}
                            className="flex-1 overflow-y-auto p-6"
                        >
                            {tab.content}
                        </TabsContent>
                    ))}
                </Tabs>

                <Tabs defaultValue="overview" className="h-full flex flex-col">

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