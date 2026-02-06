import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs"
import { 
    Edit, 
    MessageSquare, 
    PhoneCall, 
    Mail, 
    CheckCircle, 
    Clock, 
    XCircle, 
    AlertCircle 
} from "lucide-react"
import { Button } from "../ui/button"
import { CustomerT } from "@/src/types/customer"
import { OverviewCustomerTab } from "./OverviewCustomerTab"
import { JobsCustomerTab } from "./JobsCustomerTab"
import { CommunicationsCustomerTab } from "./CommunicationsCustomerTab"
import { RecordingCustomerTab } from "./RecordingCustomerTab"
import { NotesCustomerTab } from "./NotesCustomerTab"
import { BillingCustomerTab } from "./BillingCustomerTab"

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
                <JobsCustomerTab
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
                <CommunicationsCustomerTab
                    selectedCustomer={selectedCustomer}
                    getCommunicationIcon={getCommunicationIcon}
                />
            ),
        },
        {
            value: "recordings",
            label: "Call Recordings",
            content: (
                <RecordingCustomerTab selectedCustomer={selectedCustomer} />
            ),
        },
        {
            value: "notes",
            label: "Notes",
            content: (
                <NotesCustomerTab selectedCustomer={selectedCustomer} />
            ),
        },
        {
            value: "billing",
            label: "Billing",
            content: (
                <BillingCustomerTab selectedCustomer={selectedCustomer} />
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
            </div>
        </div>
    )
}