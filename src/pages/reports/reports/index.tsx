import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
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
  FileBarChart,
  Users,
  User,
  BarChart3,
  Search,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  FileText,
  PieChart,
  Activity,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePermissions } from '@/src/hooks/usePermissions'

interface Report {
  id: string
  name: string
  type: string
  description: string
  lastGenerated: string
  status: 'ready' | 'generating' | 'error'
  size: string
  format: 'PDF' | 'Excel' | 'CSV'
}

export default function ReportsTabPage() {
  const router = useRouter()
  const { checkPermission, getUserType } = usePermissions()

  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Mock data for demonstration
  const mockReports: Report[] = [
    {
      id: '1',
      name: 'Monthly User Activity Report',
      type: 'User Analytics',
      description:
        'Comprehensive report of user activities and system usage for the month',
      lastGenerated: '2024-01-15 10:30:00',
      status: 'ready',
      size: '2.3 MB',
      format: 'PDF',
    },
    {
      id: '2',
      name: 'Job Performance Metrics',
      type: 'Job Analytics',
      description:
        'Detailed analysis of job completion rates and performance metrics',
      lastGenerated: '2024-01-14 15:45:00',
      status: 'ready',
      size: '1.8 MB',
      format: 'Excel',
    },
    {
      id: '3',
      name: 'Customer Satisfaction Survey',
      type: 'Customer Analytics',
      description:
        'Results from customer satisfaction surveys and feedback analysis',
      lastGenerated: '2024-01-13 09:20:00',
      status: 'ready',
      size: '3.1 MB',
      format: 'PDF',
    },
    {
      id: '4',
      name: 'System Performance Report',
      type: 'System Analytics',
      description: 'System performance metrics and technical analysis',
      lastGenerated: '2024-01-12 14:15:00',
      status: 'generating',
      size: '0 MB',
      format: 'CSV',
    },
    {
      id: '5',
      name: 'Financial Summary Report',
      type: 'Financial Analytics',
      description: 'Monthly financial summary and revenue analysis',
      lastGenerated: '2024-01-11 11:30:00',
      status: 'error',
      size: '0 MB',
      format: 'PDF',
    },
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReports(mockReports)
      setTotalCount(mockReports.length)
      setTotalPages(Math.ceil(mockReports.length / entriesPerPage))
      setLoading(false)
    }, 1000)
  }, [entriesPerPage])

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  const handleEntriesChange = (value: string) => {
    setEntriesPerPage(parseInt(value))
    setCurrentPage(1)
  }

  const handleGenerateReport = (reportId: string) => {
    // Simulate report generation
    setReports(prev =>
      prev.map(report =>
        report.id === reportId
          ? { ...report, status: 'generating' as const }
          : report
      )
    )

    // Simulate completion after 3 seconds
    setTimeout(() => {
      setReports(prev =>
        prev.map(report =>
          report.id === reportId
            ? {
                ...report,
                status: 'ready' as const,
                lastGenerated: new Date().toLocaleString(),
              }
            : report
        )
      )
    }, 3000)
  }

  const handleDownloadReport = (reportId: string) => {
    // Simulate download
    console.log(`Downloading report ${reportId}`)
  }

  const handleViewReport = (reportId: string) => {
    // Simulate viewing report
    console.log(`Viewing report ${reportId}`)
  }

  // Filter reports based on search term, type, and status
  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || report.type === filterType
    const matchesStatus =
      filterStatus === 'all' || report.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const currentReports = filteredReports.slice(startIndex, endIndex)

  const reportTypes = [
    'all',
    'User Analytics',
    'Job Analytics',
    'Customer Analytics',
    'System Analytics',
    'Financial Analytics',
  ]
  const reportStatuses = ['all', 'ready', 'generating', 'error']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'generating':
        return 'bg-blue-100 text-blue-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'Excel':
        return <FileBarChart className="h-4 w-4 text-green-500" />
      case 'CSV':
        return <FileText className="h-4 w-4 text-blue-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Reports - WePro</title>
        <meta name="description" content="Generate and view system reports" />
      </Head>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1">
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/reports/user-activities')}
            className="flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <Users className="w-4 h-4 mr-2" />
            User Activities
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleTabClick('/reports/my-activities')}
            className="flex-1 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <User className="w-4 h-4 mr-2" />
            My Activities
          </Button>
          <Button
            variant="default"
            onClick={() => handleTabClick('/reports/reports')}
            className="flex-1 flex items-center justify-center text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Reports
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Generate and manage system reports and analytics
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => console.log('Generate new report')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Reports
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {reports.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Ready Reports
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {reports.filter(r => r.status === 'ready').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Generating
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {reports.filter(r => r.status === 'generating').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <PieChart className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Report Types
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {new Set(reports.map(r => r.type)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card>
          <CardContent className="pt-6">
            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              {/* Show Entries Dropdown */}
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="entries"
                  className="text-sm text-neutral-600 dark:text-neutral-400"
                >
                  Show
                </Label>
                <Select
                  value={entriesPerPage.toString()}
                  onValueChange={handleEntriesChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="40">40</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <Label className="text-sm text-neutral-600 dark:text-neutral-400">
                  entries
                </Label>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search reports..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type === 'all' ? 'All Types' : type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status === 'all'
                            ? 'All Status'
                            : status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Last Generated</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentReports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.name}
                      </TableCell>
                      <TableCell>{report.type}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {report.description}
                      </TableCell>
                      <TableCell>{report.lastGenerated}</TableCell>
                      <TableCell>{report.size}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFormatIcon(report.format)}
                          {report.format}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}
                        >
                          {report.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {report.status === 'ready' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewReport(report.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadReport(report.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {report.status === 'error' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateReport(report.id)}
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          )}
                          {report.status === 'generating' && (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                              <span className="text-sm text-gray-500">
                                Generating...
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Showing {startIndex + 1} to{' '}
                {Math.min(endIndex, filteredReports.length)} of{' '}
                {filteredReports.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Page {currentPage} of{' '}
                  {Math.ceil(filteredReports.length / entriesPerPage)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(prev =>
                      Math.min(
                        prev + 1,
                        Math.ceil(filteredReports.length / entriesPerPage)
                      )
                    )
                  }
                  disabled={
                    currentPage >=
                    Math.ceil(filteredReports.length / entriesPerPage)
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
