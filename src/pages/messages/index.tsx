// @ts-nocheck
import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { JobForm } from '@/src/components/job'
import NewJobScheduleDialog from '@/src/components/schedule/NewJobScheduleDialog'
import { Input } from '@/src/components/ui/input'
import SelectInput from '@/src/components/input/select'
import { Textarea } from '@/src/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
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
import { calculateEndTime } from '@/src/lib/calculate'
import {
  MessageSquare,
  Search,
  Phone,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Image,
  Camera,
  User,
  Settings,
  Star,
  Archive,
  Edit,
  Eye,
  FileText,
  Check,
  CheckCheck,
  Clock,
  Plus,
  UserPlus,
  PhoneCall,
  Calendar,
  Wrench,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageCircle,
  Globe,
  ChevronDown,
  Zap,
  Users,
  Building,
} from 'lucide-react'

const MessagesIndex: React.FC = (): React.JSX.Element => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [franchiseFilter, setFranchiseFilter] = useState('all')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showAddJobDialog, setShowAddJobDialog] = useState(false)
  const [selectedMessageForJob, setSelectedMessageForJob] = useState<any>(null)
  const [showClientLog, setShowClientLog] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [showEditJobDialog, setShowEditJobDialog] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [newJobData, setNewJobData] = useState({
    title: '',
    client: '',
    clientPhone: '',
    address: '',
    description: '',
    jobType: 'HVAC',
    estimatedDuration: 120,
    scheduledDate: '',
    scheduledTime: '09:00',
    endTime: '11:00',
    value: 0,
    technicianId: 'unassigned',
    metroArea: 'Houston Metro',
    tags: [],
    notes: '',
  })

  const technicians = [
    { id: 'tech-1', name: 'Mike Rodriguez' },
    { id: 'tech-2', name: 'Jennifer Lee' },
    { id: 'tech-3', name: 'David Smith' },
  ]
  const metroAreas = ['Houston Metro', 'Dallas Metro', 'Austin Metro']

  // Sample conversations data
  const [conversationsList] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      type: 'client',
      avatar: 'SJ',
      lastMessage: 'My kitchen sink is leaking badly, can someone come today?',
      timestamp: '2 min ago',
      unread: 2,
      online: true,
      phone: '+1 (555) 123-4567',
      address: '123 Main St, Houston, TX',
      jobHistory: 5,
      source: 'google-ads',
      franchise: 'Houston Central',
    },
    {
      id: 2,
      name: 'Mike Rodriguez',
      type: 'tech',
      avatar: 'MR',
      lastMessage:
        "Finished the HVAC job at Johnson's. Moving to next location.",
      timestamp: '5 min ago',
      unread: 0,
      online: true,
      phone: '+1 (555) 987-6543',
      specialties: ['HVAC', 'Plumbing'],
      completedJobs: 847,
      rating: 4.9,
    },
    {
      id: 3,
      name: 'Lisa Chen',
      type: 'client',
      avatar: 'LC',
      lastMessage: 'Thank you for the excellent service! The problem is fixed.',
      timestamp: '15 min ago',
      unread: 0,
      online: false,
      phone: '+1 (555) 456-7890',
      address: '456 Oak Ave, Dallas, TX',
      jobHistory: 2,
      source: 'referral',
      franchise: 'Dallas North',
    },
    {
      id: 4,
      name: 'Marketing Lead',
      type: 'marketing',
      avatar: 'ML',
      lastMessage:
        'New lead from Facebook: AC not working, needs urgent repair',
      timestamp: '1 hour ago',
      unread: 1,
      online: false,
      source: 'facebook',
      leadInfo: {
        urgency: 'high',
        service: 'HVAC',
        location: 'Austin, TX',
      },
    },
    {
      id: 5,
      name: 'Daniel Morris',
      type: 'client',
      avatar: 'DM',
      lastMessage: 'Can we move my appointment to tomorrow morning?',
      timestamp: '2 hours ago',
      unread: 0,
      online: false,
      phone: '+1 (555) 654-1142',
      address: '112 Cedar Ln, Austin, TX',
      jobHistory: 3,
      source: 'google-ads',
      franchise: 'Houston Central',
    },
    {
      id: 6,
      name: 'Olivia Carter',
      type: 'client',
      avatar: 'OC',
      lastMessage: 'The upstairs vent is still making noise.',
      timestamp: '3 hours ago',
      unread: 1,
      online: true,
      phone: '+1 (555) 207-8841',
      address: '78 Lakeview Dr, Houston, TX',
      jobHistory: 4,
      source: 'referral',
      franchise: 'Houston Central',
    },
    {
      id: 7,
      name: 'Ethan Walker',
      type: 'client',
      avatar: 'EW',
      lastMessage: 'Thanks, the issue is resolved now.',
      timestamp: '5 hours ago',
      unread: 0,
      online: false,
      phone: '+1 (555) 990-3310',
      address: '503 Maple Ave, Dallas, TX',
      jobHistory: 2,
      source: 'website',
      franchise: 'Dallas North',
    },
    {
      id: 8,
      name: 'Sophia Reed',
      type: 'client',
      avatar: 'SR',
      lastMessage: 'Please share the invoice once done.',
      timestamp: 'Yesterday',
      unread: 0,
      online: false,
      phone: '+1 (555) 812-4439',
      address: '17 Hillcrest Rd, Sugar Land, TX',
      jobHistory: 6,
      source: 'google-ads',
      franchise: 'Houston Central',
    },
    {
      id: 9,
      name: 'Noah Bennett',
      type: 'tech',
      avatar: 'NB',
      lastMessage: 'I am at the customer location for Job #J702.',
      timestamp: 'Yesterday',
      unread: 0,
      online: true,
      phone: '+1 (555) 731-2294',
      specialties: ['Electrical', 'Plumbing'],
      completedJobs: 412,
      rating: 4.7,
    },
    {
      id: 10,
      name: 'Ava Brooks',
      type: 'client',
      avatar: 'AB',
      lastMessage: 'Can someone check the AC before the weekend?',
      timestamp: '2 days ago',
      unread: 2,
      online: false,
      phone: '+1 (555) 118-7726',
      address: '65 Westpark Ct, Katy, TX',
      jobHistory: 1,
      source: 'facebook',
      franchise: 'Dallas North',
    },
  ])

  // Sample messages for selected conversation
  const [messages] = useState({
    1: [
      {
        id: 1,
        sender: 'Sarah Johnson',
        type: 'client',
        content:
          'Hi, I have a major leak in my kitchen sink. Water is everywhere!',
        timestamp: '10:30 AM',
        status: 'read',
        jobId: null,
        isNewInquiry: true,
      },
      {
        id: 2,
        sender: 'Dispatcher',
        type: 'company',
        content:
          "Hello Sarah! I'm so sorry to hear about the leak. I've created Job #J001 for you. Mike Rodriguez will be there within 2 hours.",
        timestamp: '10:32 AM',
        status: 'read',
        jobId: 'J001',
        isNewInquiry: false,
      },
      {
        id: 3,
        sender: 'Sarah Johnson',
        type: 'client',
        content:
          "Thank you! For Job #J001 - It's under the sink, looks like the pipe connection is loose. Water is pooling on the floor.",
        timestamp: '10:35 AM',
        status: 'read',
        jobId: 'J001',
        isNewInquiry: false,
      },
      {
        id: 4,
        sender: 'Sarah Johnson',
        type: 'client',
        content: 'My kitchen sink is leaking badly, can someone come today?',
        timestamp: '10:37 AM',
        status: 'delivered',
        jobId: null,
        isNewInquiry: true,
      },
      {
        id: 5,
        sender: 'Mike Rodriguez',
        type: 'tech',
        content: "I'm 15 minutes away for Job #J001. The parts are ready.",
        timestamp: '12:15 PM',
        status: 'read',
        jobId: 'J001',
        isNewInquiry: false,
      },
    ],
    2: [
      {
        id: 1,
        sender: 'Mike Rodriguez',
        type: 'tech',
        content: 'Job #J002 completed successfully. Customer is very happy!',
        timestamp: '3:45 PM',
        status: 'read',
        jobId: 'J002',
        isNewInquiry: false,
      },
      {
        id: 2,
        sender: 'Dispatcher',
        type: 'company',
        content: 'Great work Mike! Please update the status in the system.',
        timestamp: '3:47 PM',
        status: 'read',
        jobId: 'J002',
        isNewInquiry: false,
      },
    ],
  })

  // Quick reply templates
  const quickReplies = [
    "We'll have someone there within 2 hours",
    'Our technician is on the way',
    'Thank you for choosing our service!',
    'Can you send a photo of the issue?',
    "What's the best time for our tech to arrive?",
    "We'll call you when we're 15 minutes away",
  ]
  const franchiseOptions = [
    { label: 'All Franchises', value: 'all' },
    { label: 'Houston Central', value: 'Houston Central' },
    { label: 'Dallas North', value: 'Dallas North' },
  ]

  // Client log data
  const clientLogData = {
    1: {
      personalInfo: {
        name: "Sarah Johnson",
        phone: "+1 (555) 123-4567",
        email: "sarah.johnson@email.com",
        address: "123 Main St, Houston, TX 77001",
      },
      jobHistory: [
        {
          id: "J001",
          date: "2024-01-15",
          service: "Plumbing",
          issue: "Kitchen sink repair",
          technician: "Mike Rodriguez",
          status: "Completed",
          cost: "$185",
        },
        {
          id: "J002",
          date: "2024-02-20",
          service: "HVAC",
          issue: "AC maintenance",
          technician: "Jennifer Lee",
          status: "Completed",
          cost: "$125",
        },
      ],
      preferences: {
        preferredTime: "Morning (8-12 PM)",
        notes: "Has a dog - please call before entering yard",
      },
    },
  };

  const filteredConversations = conversationsList.filter(conv => {
    const matchesSearch = conv.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesFilter =
      filterType === 'all' ||
      conv.type === filterType ||
      (filterType === 'marketing' && conv.type === 'marketing')
    const matchesFranchise =
      franchiseFilter === 'all' || conv.franchise === franchiseFilter
    return matchesSearch && matchesFilter && matchesFranchise
  })

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Message sending logic would go here
      setNewMessage('')
    }
  }

  const createJobFromMessage = (message: any) => {
    setSelectedMessageForJob(message)
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(now.getDate()).padStart(2, '0')}`
    const startTime = '09:00'
    setNewJobData({
      title: `${selectedConversation?.name || message?.sender || 'Client'} Service Request`,
      client: selectedConversation?.name || message?.sender || '',
      clientPhone: selectedConversation?.phone || '',
      address: selectedConversation?.address || '',
      description: message?.content || '',
      jobType: 'HVAC',
      estimatedDuration: 120,
      scheduledDate: today,
      scheduledTime: startTime,
      endTime: calculateEndTime(startTime, 120),
      value: 0,
      technicianId: 'unassigned',
      metroArea: 'Houston Metro',
      tags: [],
      notes: 'Created from Messages page',
    })
    setShowAddJobDialog(true)
  }

  const handleCreateJob = () => {
    console.log('Creating scheduled job:', newJobData)
    setShowAddJobDialog(false)
  }

  const viewClientLog = (client: any) => {
    setSelectedClient(client)
    setShowClientLog(true)
  }

  const archiveConversation = (convId: any) => {
    // Archive logic would go here
    console.log('Archiving conversation:', convId)
  }

  const starMessage = (messageId: any) => {
    // Star message logic would go here
    console.log('Starring message:', messageId)
  }

  const editJob = (jobId: any) => {
    const selectedJobData = jobData[jobId] ?? {
      id: jobId,
      service: 'General Service',
      issue: 'Dummy issue description from messages',
      priority: 'Medium',
      status: 'Pending',
      technician: 'Tech One',
      scheduledDate: '2024-03-20',
      scheduledTime: '09:00',
      estimatedCost: '$150',
      notes: 'Created from message conversation',
    }

    // Provide a richer payload so JobForm opens with sensible values.
    setSelectedJob({
      id: selectedJobData.id,
      clientName: selectedConversation?.name || 'Sample Customer',
      companyName: 'WePro Demo Company',
      email: 'demo.customer@email.com',
      phoneNumber: selectedConversation?.phone || '+1 (555) 000-0000',
      location: selectedConversation?.address || '123 Demo St',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA',
      jobCategory: selectedJobData.service,
      jobType: selectedJobData.service,
      source: 'Messages',
      status: selectedJobData.status,
      startDate: selectedJobData.scheduledDate,
      startTime: selectedJobData.scheduledTime,
      assignedTechnician: selectedJobData.technician,
      jobDescription: selectedJobData.issue,
      revenue: Number(String(selectedJobData.estimatedCost).replace(/[^0-9.]/g, '')) || 0,
      notes: selectedJobData.notes,
    })
    setShowEditJobDialog(true)
  }

  const sendQuote = (message: any) => {
    // Quote sending logic would go here
    console.log('Sending quote for:', message)
  }

  const callClient = (phone: any) => {
    // Call initiation logic would go here
    console.log('Calling:', phone)
  }

  // Sample job data
  const jobData = {
    J001: {
      id: 'J001',
      service: 'Plumbing',
      issue: 'Kitchen sink leak',
      priority: 'High',
      status: 'In Progress',
      technician: 'Mike Rodriguez',
      scheduledDate: '2024-03-15',
      scheduledTime: '10:00 AM',
      estimatedCost: '$185',
      notes: 'Customer mentioned loose pipe connection',
    },
    J002: {
      id: 'J002',
      service: 'HVAC',
      issue: 'AC maintenance',
      priority: 'Medium',
      status: 'Completed',
      technician: 'Jennifer Lee',
      scheduledDate: '2024-03-14',
      scheduledTime: '2:00 PM',
      estimatedCost: '$125',
      notes: 'Annual maintenance completed',
    },
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col border md:h-[calc(100vh-112px)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brandGreen-900 to-brandGreen-500 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
              <div className="flex flex-row items-center space-x-2">
                <p className="text-sm text-slate-600">
                  Team & Client Communication
                </p>
                <Badge className="bg-[#53a533]/10 text-[#2f5f1f] border-[#53a533]/20">
                  {filteredConversations.reduce(
                    (acc, conv) => acc + conv.unread,
                    0
                  )}{' '}
                  Unread
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-96 bg-white/70 backdrop-blur-sm border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>

            <div className="mb-3">
              <SelectInput
                options={franchiseOptions}
                placeholder="All Franchises"
                value={franchiseFilter}
                onSearch={() => {}}
                onSelect={val =>
                  setFranchiseFilter(Array.isArray(val) ? 'all' : val || 'all')
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-1">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
                className="text-xs h-7"
              >
                All
              </Button>
              <Button
                variant={filterType === 'client' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('client')}
                className="text-xs h-7"
              >
                <User className="w-2.5 h-2.5 mr-1" />
                Clients
              </Button>
              <Button
                variant={filterType === 'tech' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('tech')}
                className="text-xs h-7"
              >
                <Wrench className="w-2.5 h-2.5 mr-1" />
                Techs
              </Button>
              <Button
                variant={filterType === 'marketing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('marketing')}
                className="text-xs h-7"
              >
                <Globe className="w-2.5 h-2.5 mr-1" />
                Marketing
              </Button>
              <Button
                variant={filterType === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('email')}
                className="text-xs h-7"
              >
                <MessageCircle className="w-2.5 h-2.5 mr-1" />
                Email
              </Button>
              <Button
                variant={filterType === 'whatsapp' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('whatsapp')}
                className="text-xs h-7"
              >
                <MessageSquare className="w-2.5 h-2.5 mr-1" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedConversation?.id === conv.id
                      ? 'bg-[#53a533]/5 border-l-4 border-l-brandGreen-600'
                      : ''
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback
                          className={`
                          ${conv.type === 'client' ? 'bg-green-100 text-green-700' : ''}
                          ${conv.type === 'tech' ? 'bg-[#53a533]/10 text-[#3d7a28]' : ''}
                          ${conv.type === 'marketing' ? 'bg-purple-100 text-purple-700' : ''}
                        `}
                        >
                          {conv.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {conv.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-slate-900 truncate">
                          {conv.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {conv.unread > 0 && (
                            <Badge className="bg-[#53a533]/50 text-white text-xs px-1.5 py-0.5 rounded-full">
                              {conv.unread}
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {conv.type === 'client' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => viewClientLog(conv)}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Client Log
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => createJobFromMessage(conv)}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Job
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem>
                                <Phone className="w-4 h-4 mr-2" />
                                Call {conv.name}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => archiveConversation(conv.id)}
                              >
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className="w-4 h-4 mr-2" />
                                Star Conversation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 truncate mb-1">
                        {conv.lastMessage}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{conv.timestamp}</span>
                        <div className="flex items-center space-x-2">
                          {conv.source && (
                            <Badge variant="outline" className="text-xs px-1">
                              {conv.source === 'google-ads'
                                ? 'Google'
                                : conv.source}
                            </Badge>
                          )}
                          {conv.type === 'client' && (
                            <span className="text-slate-400 flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {conv.jobHistory} jobs
                            </span>
                          )}
                          {conv.type === 'tech' && (
                            <span className="text-slate-400 flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              {conv.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                {filterType === 'marketing' ? (
                  <>
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No marketing conversations yet</p>
                    <p className="text-sm">
                      Chats from external sources will appear here
                    </p>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No conversations found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback
                        className={`
                        ${selectedConversation.type === 'client' ? 'bg-green-100 text-green-700' : ''}
                        ${selectedConversation.type === 'tech' ? 'bg-[#53a533]/10 text-[#3d7a28]' : ''}
                        ${selectedConversation.type === 'marketing' ? 'bg-purple-100 text-purple-700' : ''}
                      `}
                      >
                        {selectedConversation.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        {selectedConversation.name}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        {selectedConversation.phone && (
                          <span>{selectedConversation.phone}</span>
                        )}
                        {selectedConversation.online ? (
                          <span className="text-green-600 flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            Online
                          </span>
                        ) : (
                          <span className="text-slate-500">Offline</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {selectedConversation.type === 'client' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewClientLog(selectedConversation)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Client Log
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages[selectedConversation.id]?.map(message => (
                  <div key={message.id} className="space-y-2">
                    <div
                      className={`flex ${message.type === 'company' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'company'
                            ? 'bg-[#53a533]/50 text-white'
                            : message.type === 'tech'
                              ? 'bg-amber-100 border border-amber-200 text-amber-900'
                              : 'bg-white border border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs opacity-75">
                            {message.sender}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => starMessage(message.id)}
                              >
                                <Star className="w-4 h-4 mr-2" />
                                Star Message
                              </DropdownMenuItem>
                              {message.type === 'client' && (
                                <DropdownMenuItem
                                  onClick={() => createJobFromMessage(message)}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Create Job
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-75">
                            {message.timestamp}
                          </span>
                          {message.type === 'company' && (
                            <div className="flex items-center">
                              {message.status === 'read' ? (
                                <CheckCheck className="w-3 h-3 text-[#53a533]/20" />
                              ) : message.status === 'delivered' ? (
                                <Check className="w-3 h-3 text-[#53a533]/20" />
                              ) : (
                                <Clock className="w-3 h-3 text-[#53a533]/20" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inline Job Actions */}
                    {message.jobId && (
                      <div
                        className={`flex ${message.type === 'company' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="bg-[#53a533]/5 border border-[#53a533]/20 rounded-lg p-3 max-w-xs lg:max-w-md">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Wrench className="w-4 h-4 text-[#4a9430]" />
                              <span className="text-sm font-medium text-[#1f3f15]">
                                Job #{message.jobId}
                              </span>
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Active
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 bg-white"
                              onClick={() => editJob(message.jobId)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit Job
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 bg-white"
                              onClick={() => editJob(message.jobId)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 bg-white"
                              onClick={() => editJob(message.jobId)}
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Reschedule
                            </Button>
                          </div>
                          <div className="mt-2 text-xs text-[#3d7a28]">
                            <p>Tech: Mike Rodriguez • Status: In Progress</p>
                            <p>Service: Plumbing • Priority: High</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* New Inquiry Actions */}
                    {message.isNewInquiry && message.type === 'client' && (
                      <div className="flex justify-start">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-xs lg:max-w-md">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">
                              New Service Request
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 bg-white"
                              onClick={() => createJobFromMessage(message)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Create Job
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 bg-white"
                              onClick={() => sendQuote(message)}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Send Quote
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 bg-white"
                              onClick={() =>
                                callClient(selectedConversation?.phone)
                              }
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Call Back
                            </Button>
                          </div>
                          <div className="mt-2 text-xs text-green-700">
                            <p>Detected: Emergency Plumbing Issue</p>
                            <p>Suggested: High Priority • 2-hour response</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {showQuickReplies && (
                <div className="border-t border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-900">
                      Quick Replies
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickReplies(false)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickReplies.map((reply, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-left justify-start text-xs"
                        onClick={() => {
                          setNewMessage(reply)
                          setShowQuickReplies(false)
                        }}
                      >
                        {reply}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="border-t border-slate-200 p-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                  >
                    <Zap className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Image className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 flex items-center space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-12 h-12 text-[#4a9430]" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-slate-600 max-w-sm">
                  Choose from your existing conversations or start a new chat
                  with a team member or client.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Client Log Dialog */}
      <Dialog open={showClientLog} onOpenChange={setShowClientLog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Log - {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          {selectedClient && clientLogData[selectedClient.id] && (
            <div className="space-y-6">
              {/* Personal Info */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Name
                      </label>
                      <p className="text-sm">
                        {clientLogData[selectedClient.id].personalInfo.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Phone
                      </label>
                      <p className="text-sm">
                        {clientLogData[selectedClient.id].personalInfo.phone}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Email
                      </label>
                      <p className="text-sm">
                        {clientLogData[selectedClient.id].personalInfo.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Address
                      </label>
                      <p className="text-sm">
                        {clientLogData[selectedClient.id].personalInfo.address}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job History */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Wrench className="w-4 h-4 mr-2" />
                    Job History
                  </h3>
                  <div className="space-y-3">
                    {clientLogData[selectedClient.id].jobHistory.map(job => (
                      <div
                        key={job.id}
                        className="border border-slate-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Job #{job.id}</span>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={
                                job.status === 'Completed'
                                  ? 'bg-green-100 text-green-800'
                                  : ''
                              }
                            >
                              {job.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p>
                            <span className="font-medium">Date:</span>{' '}
                            {job.date}
                          </p>
                          <p>
                            <span className="font-medium">Service:</span>{' '}
                            {job.service}
                          </p>
                          <p>
                            <span className="font-medium">Issue:</span>{' '}
                            {job.issue}
                          </p>
                          <p>
                            <span className="font-medium">Technician:</span>{' '}
                            {job.technician}
                          </p>
                          <p>
                            <span className="font-medium">Cost:</span>{' '}
                            {job.cost}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences & Notes
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Preferred Time:</span>{' '}
                      {
                        clientLogData[selectedClient.id].preferences
                          .preferredTime
                      }
                    </p>
                    <p>
                      <span className="font-medium">Notes:</span>{' '}
                      {clientLogData[selectedClient.id].preferences.notes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <NewJobScheduleDialog
        showNewJobDialog={showAddJobDialog}
        setShowNewJobDialog={setShowAddJobDialog}
        newJobData={newJobData}
        setNewJobData={setNewJobData}
        calculateEndTime={calculateEndTime}
        technicians={technicians}
        metroAreas={metroAreas}
        handleCreateJob={handleCreateJob}
      />

      <JobForm
        open={showEditJobDialog}
        onOpenChange={open => {
          setShowEditJobDialog(open)
          if (!open) {
            setSelectedJob(null)
          }
        }}
        jobId={selectedJob?.id ?? null}
        formData={selectedJob ?? undefined}
        onJobUpdated={() => {
          // Optional: refresh data after save.
        }}
      />
    </div>
  )
}

export default MessagesIndex
