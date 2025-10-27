import React, { useState, useCallback } from 'react'
import { JobStat } from '@/src/constants/interface/dashboard'
import {
  jobsStats,
  topSources,
  revenueData,
  salesMetrics,
  upcomingAppointments,
  topTechnicians,
  aiInsights,
} from '@/src/constants/dummyData/dashboard'
import ActivityStatistics from '@/src/components/ActivityStatistics'
import ActivityFilterCard, {
  FilterState,
} from '@/src/components/ActivityFilterCard'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Progress } from '@/src/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  Phone,
  Plus,
  Zap,
  AlertCircle,
  Timer,
  FileText,
  CreditCard,
  Target,
  Filter,
  BarChart3,
  PieChart,
  Star,
  Activity,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Wrench,
  Map,
  Navigation,
  Receipt,
  TrendingUpDown,
  SlidersHorizontal,
  Move,
  Maximize2,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Settings as SettingsIcon,
} from 'lucide-react'

const DashboardIndex: React.FC = (): React.JSX.Element => {
  // Filter state for shared filtering across sections
  const [filters, setFilters] = useState<FilterState>({
    dateRangeFilter: 'All',
    customStartDate: '',
    customEndDate: '',
    filterUserId: 'all',
    filterTenantId: 'all',
  })

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Welcome back, John! 🚀 Here&apos;s your business performance today
          </p>
          <div className="flex items-center mt-2 text-sm text-neutral-500">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Last updated: 2 minutes ago
            <Button variant="ghost" size="sm" className="ml-2 h-6 px-2">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Global Filters */}
      <ActivityFilterCard
        onFilterChange={handleFilterChange}
        initialFilters={filters}
        showTitle={true}
      />

      {/* Activity Statistics Section */}
      <ActivityStatistics filters={filters} />

      {/* Global Controls */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              {/* Franchise Filter */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Franchise:
                </span>
                <Tabs defaultValue="all" className="w-fit">
                  <TabsList className="h-9 bg-white dark:bg-neutral-800 shadow-sm">
                    <TabsTrigger value="all" className="text-sm px-4">
                      All Locations
                    </TabsTrigger>
                    <TabsTrigger value="franchise1" className="text-sm px-4">
                      Houston Metro
                    </TabsTrigger>
                    <TabsTrigger value="franchise2" className="text-sm px-4">
                      Dallas
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Time Range Filter */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Time Range:
                </span>
                <Tabs defaultValue="today" className="w-fit">
                  <TabsList className="h-9 bg-white dark:bg-neutral-800 shadow-sm">
                    <TabsTrigger value="today" className="text-sm px-4">
                      Today
                    </TabsTrigger>
                    <TabsTrigger value="week" className="text-sm px-4">
                      This Week
                    </TabsTrigger>
                    <TabsTrigger value="lastweek" className="text-sm px-4">
                      Last Week
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Dashboard Controls */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Move className="w-4 h-4 mr-2" />
                Customize
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
        {jobsStats.map((stat, index) => {
          const Icon = stat.icon as React.ComponentType<{ className?: string }>
          return (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-brandGreen-50 to-brandGreen-100 dark:from-brandGreen-950 dark:to-brandGreen-900 rounded-xl shadow-sm">
                    <Icon className="w-6 h-6 text-brandGreen-600 dark:text-brandGreen-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {stat.changeType === 'positive' ? (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        stat.changeType === 'positive'
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {stat.value}
                </h3>
                <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                  {stat.name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Revenue & Profit */}
        <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg mr-3">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              Revenue & Profit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {revenueData.map(item => (
              <div
                key={item.name}
                className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {item.name}
                  </p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {item.value}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600">
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Lead Sources */}
        <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mr-3">
                <Target className="w-5 h-5 text-white" />
              </div>
              Top Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topSources.map(source => (
              <div key={source.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {source.name}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {source.value}%
                    </span>
                    <p className="text-xs text-neutral-500">
                      {source.count} leads • {source.revenue}
                    </p>
                  </div>
                </div>
                <Progress
                  value={parseFloat(source.value.toString())}
                  className="h-3"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Daily Sales Metrics */}
        <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg mr-3">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              Daily Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {salesMetrics.map(metric => (
              <div
                key={metric.name}
                className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {metric.name}
                  </p>
                  <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {metric.value}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600">
                    {metric.change}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* REALISTIC TEAM MAP - GPS TRACKING */}
        <Card className="lg:col-span-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center text-lg">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg mr-3">
                  <Map className="w-5 h-5 text-white" />
                </div>
                Team Map - Live GPS Tracking
                <div className="ml-3 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-neutral-500">Live GPS</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Full Screen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Realistic Map Display */}
            <div className="h-80 bg-gradient-to-b from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-xl mb-6 relative overflow-hidden shadow-inner">
              {/* Map Background with street patterns */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" viewBox="0 0 400 320">
                  {/* Street grid */}
                  <defs>
                    <pattern
                      id="streets"
                      patternUnits="userSpaceOnUse"
                      width="40"
                      height="40"
                    >
                      <path
                        d="M 0,20 L 40,20"
                        stroke="#64748b"
                        strokeWidth="1"
                      />
                      <path
                        d="M 20,0 L 20,40"
                        stroke="#64748b"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#streets)" />

                  {/* Main roads */}
                  <path d="M 0,80 L 400,80" stroke="#475569" strokeWidth="3" />
                  <path
                    d="M 0,160 L 400,160"
                    stroke="#475569"
                    strokeWidth="3"
                  />
                  <path
                    d="M 0,240 L 400,240"
                    stroke="#475569"
                    strokeWidth="3"
                  />
                  <path
                    d="M 100,0 L 100,320"
                    stroke="#475569"
                    strokeWidth="3"
                  />
                  <path
                    d="M 200,0 L 200,320"
                    stroke="#475569"
                    strokeWidth="3"
                  />
                  <path
                    d="M 300,0 L 300,320"
                    stroke="#475569"
                    strokeWidth="3"
                  />
                </svg>
              </div>

              {/* Neighborhoods */}
              <div className="absolute top-4 left-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                The Heights
              </div>
              <div className="absolute top-4 right-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Downtown Houston
              </div>
              <div className="absolute bottom-4 left-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Midtown
              </div>
              <div className="absolute bottom-4 right-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Medical Center
              </div>

              {/* Team Member Locations with Real GPS Pins */}
              {[
                {
                  name: 'Mike Rodriguez',
                  status: 'On Job',
                  location: 'Downtown',
                  x: 75,
                  y: 35,
                  job: '#4521',
                  customer: 'Sarah Johnson',
                },
                {
                  name: 'Lisa Martinez',
                  status: 'Available',
                  location: 'Midtown',
                  x: 25,
                  y: 65,
                  job: null,
                  customer: null,
                },
                {
                  name: 'Alex Kim',
                  status: 'On Job',
                  location: 'The Heights',
                  x: 15,
                  y: 25,
                  job: '#4522',
                  customer: 'David Chen',
                },
                {
                  name: 'Sarah Johnson',
                  status: 'Off Duty',
                  location: 'Home',
                  x: 85,
                  y: 75,
                  job: null,
                  customer: null,
                },
              ].map((member, index) => (
                <div
                  key={member.name}
                  className="absolute group cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${member.x}%`,
                    top: `${member.y}%`,
                  }}
                >
                  {/* GPS Pin with technician photo */}
                  <div
                    className={`relative ${member.status === 'On Job' ? 'animate-pulse' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                      <img
                        src={`https://images.unsplash.com/photo-${
                          index === 0
                            ? '1507003211169-0a1dd7228f2d'
                            : index === 1
                              ? '1494790108755-2616b612b786'
                              : index === 2
                                ? '1472099645785-5658abf4ff4e'
                                : '1438761681033-6461ffad8d80'
                        }?w=40&h=40&fit=crop&crop=face`}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        member.status === 'Available'
                          ? 'bg-green-500'
                          : member.status === 'On Job'
                            ? 'bg-blue-500'
                            : 'bg-gray-400'
                      }`}
                    ></div>

                    {/* Animated radius for active jobs */}
                    {member.status === 'On Job' && (
                      <div className="absolute -inset-6 border-2 border-blue-300 rounded-full animate-ping opacity-30"></div>
                    )}
                  </div>

                  {/* Enhanced hover tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-neutral-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 min-w-48">
                    <div className="font-semibold text-white">
                      {member.name}
                    </div>
                    <div className="text-emerald-300">{member.status}</div>
                    <div className="text-neutral-300">{member.location}</div>
                    {member.job && (
                      <>
                        <div className="text-blue-300 mt-1">
                          Job {member.job}
                        </div>
                        <div className="text-neutral-400">
                          {member.customer}
                        </div>
                      </>
                    )}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900"></div>
                  </div>
                </div>
              ))}

              {/* Map controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
                >
                  <Target className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>

              {/* Enhanced Map legend */}
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/20">
                <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                  Live Team Status
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Available (1)
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-neutral-600 dark:text-neutral-400">
                      On Job (2)
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Off Duty (1)
                    </span>
                  </div>
                </div>
              </div>

              {/* Live activity indicator */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                🔴 LIVE GPS TRACKING
              </div>
            </div>

            {/* Team Status List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: 'Mike Rodriguez',
                  status: 'On Job',
                  location: 'Downtown Houston',
                  eta: '15 min',
                  efficiency: 95,
                  currentJob: '#4521',
                },
                {
                  name: 'Lisa Martinez',
                  status: 'Available',
                  location: 'Midtown',
                  eta: 'Available',
                  efficiency: 92,
                  currentJob: null,
                },
                {
                  name: 'Alex Kim',
                  status: 'On Job',
                  location: 'The Heights',
                  eta: '30 min',
                  efficiency: 89,
                  currentJob: '#4522',
                },
                {
                  name: 'Sarah Johnson',
                  status: 'Off Duty',
                  location: 'Home',
                  eta: 'N/A',
                  efficiency: 91,
                  currentJob: null,
                },
              ].map((member, index) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 shadow-sm hover:shadow-md transition-all duration-200 border border-neutral-200 dark:border-neutral-700"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden shadow-md">
                        <img
                          src={`https://images.unsplash.com/photo-${
                            index === 0
                              ? '1507003211169-0a1dd7228f2d'
                              : index === 1
                                ? '1494790108755-2616b612b786'
                                : index === 2
                                  ? '1472099645785-5658abf4ff4e'
                                  : '1438761681033-6461ffad8d80'
                          }?w=48&h=48&fit=crop&crop=face`}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          member.status === 'Available'
                            ? 'bg-green-500'
                            : member.status === 'On Job'
                              ? 'bg-blue-500'
                              : 'bg-gray-400'
                        }`}
                      ></div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {member.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {member.location}
                      </p>
                      {member.currentJob && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Working on {member.currentJob}
                        </p>
                      )}
                      <div className="flex items-center mt-1">
                        <div className="w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${member.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-neutral-500">
                          {member.efficiency}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        member.status === 'Available'
                          ? 'default'
                          : member.status === 'On Job'
                            ? 'secondary'
                            : 'outline'
                      }
                      className="text-xs mb-1"
                    >
                      {member.status}
                    </Badge>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {member.eta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Coming Up Appointments */}
        <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mr-3">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                Coming Up Today
                <Badge variant="secondary" className="ml-3">
                  {upcomingAppointments.length}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-gradient-to-r from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 shadow-sm hover:shadow-md transition-all duration-200 border border-neutral-200 dark:border-neutral-700"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                      {appointment.customer}
                    </h4>
                    <Badge
                      variant={
                        appointment.status === 'confirmed'
                          ? 'default'
                          : 'outline'
                      }
                      className="text-xs"
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    {appointment.service}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {appointment.time}
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {appointment.value}
                    </span>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Route
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Jobs by Status Chart */}
        <Card className="lg:col-span-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg mr-3">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                Jobs by Status
              </div>
              <Tabs defaultValue="week" className="w-fit">
                <TabsList className="h-8">
                  <TabsTrigger value="week" className="text-xs">
                    This Week
                  </TabsTrigger>
                  <TabsTrigger value="month" className="text-xs">
                    This Month
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: 'Done Jobs',
                  value: 189,
                  percentage: 76.5,
                  color: 'bg-green-500',
                },
                {
                  name: 'Open Jobs',
                  value: 47,
                  percentage: 19,
                  color: 'bg-blue-500',
                },
                {
                  name: 'Canceled Jobs',
                  value: 11,
                  percentage: 4.5,
                  color: 'bg-red-500',
                },
              ].map(status => (
                <div
                  key={status.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full ${status.color}`}
                    ></div>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {status.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {status.value}
                    </span>
                    <div className="text-xs text-neutral-500">
                      {status.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="lg:col-span-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mr-3">
                <Activity className="w-5 h-5 text-white" />
              </div>
              Recent Activity
              <div className="ml-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-neutral-500">Live</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  user: 'Mike R.',
                  action: 'Completed job #4521',
                  time: '5 mins ago',
                  type: 'completion',
                  details: 'Garage Door Installation - $450',
                },
                {
                  user: 'Lisa M.',
                  action: 'Started job #4522',
                  time: '12 mins ago',
                  type: 'start',
                  details: 'HVAC Maintenance - $280',
                },
                {
                  user: 'System',
                  action: 'New appointment scheduled',
                  time: '18 mins ago',
                  type: 'system',
                  details: 'Auto-scheduled via AI',
                },
                {
                  user: 'Alex K.',
                  action: 'Updated customer notes',
                  time: '25 mins ago',
                  type: 'update',
                  details: 'Added follow-up requirements',
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                >
                  <div className="relative">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-600 text-white text-xs font-bold shadow-md">
                      {activity.user
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        activity.type === 'completion'
                          ? 'bg-emerald-500'
                          : activity.type === 'start'
                            ? 'bg-blue-500'
                            : activity.type === 'system'
                              ? 'bg-purple-500'
                              : 'bg-yellow-500'
                      }`}
                    ></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-900 dark:text-neutral-100">
                      <span className="font-medium">{activity.user}</span>{' '}
                      {activity.action}
                    </p>
                    <p className="text-xs text-neutral-500 mb-1">
                      {activity.time}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 rounded px-2 py-1 inline-block">
                      {activity.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Technicians */}
        <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg mr-3">
                <Star className="w-5 h-5 text-white" />
              </div>
              Top Technicians
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTechnicians.map((tech, index) => (
                <div
                  key={tech.name}
                  className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                        {tech.name}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-neutral-500">
                        <Badge
                          variant={
                            tech.status === 'Available'
                              ? 'default'
                              : tech.status === 'On Job'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="text-xs"
                        >
                          {tech.status}
                        </Badge>
                        <span className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 mr-1" />
                          {tech.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                      {tech.revenue}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {tech.jobs} jobs
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoices Panel */}
        <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg mr-3">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                name: 'Outstanding Invoices',
                value: 23,
                amount: '$18,450',
                color: 'bg-yellow-500',
              },
              {
                name: 'Overdue (30+ days)',
                value: 5,
                amount: '$3,240',
                color: 'bg-red-500',
              },
              {
                name: 'Paid This Week',
                value: 18,
                amount: '$14,280',
                color: 'bg-green-500',
              },
            ].map(stat => (
              <div
                key={stat.name}
                className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${stat.color}`}></div>
                  <div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      {stat.name}
                    </p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {stat.value} invoices
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {stat.amount}
                  </p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              <FileText className="w-4 h-4 mr-2" />
              View All Invoices
            </Button>
          </CardContent>
        </Card>

        {/* Top Call Flows */}
        <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg mr-3">
                <TrendingUpDown className="w-5 h-5 text-white" />
              </div>
              Top Call Flows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                name: 'In House Numbers',
                calls: 142,
                trend: '+8.5%',
                conversion: '72%',
              },
              {
                name: 'Main Call Flow',
                calls: 89,
                trend: '+12.3%',
                conversion: '68%',
              },
              {
                name: 'Smart Route Back',
                calls: 34,
                trend: '+5.2%',
                conversion: '85%',
              },
            ].map(flow => (
              <div
                key={flow.name}
                className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {flow.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {flow.calls} calls • {flow.conversion} conversion
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600">
                    {flow.trend}
                  </span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Call Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Leads Funnel */}
        <Card className="lg:col-span-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg mr-3">
                <Target className="w-5 h-5 text-white" />
              </div>
              Leads Funnel
              <Badge variant="secondary" className="ml-3">
                68.5% conversion
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                stage: 'New Leads',
                count: 156,
                percentage: 100,
                conversion: '100%',
              },
              {
                stage: 'Contacted',
                count: 124,
                percentage: 79.5,
                conversion: '79.5%',
              },
              {
                stage: 'Qualified',
                count: 89,
                percentage: 57.1,
                conversion: '71.8%',
              },
              {
                stage: 'Converted',
                count: 61,
                percentage: 39.1,
                conversion: '68.5%',
              },
            ].map(stage => (
              <div key={stage.stage} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {stage.stage}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {stage.count}
                    </span>
                    <span className="text-xs text-emerald-600 ml-2 font-semibold">
                      {stage.conversion}
                    </span>
                  </div>
                </div>
                <Progress value={stage.percentage} className="h-3" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Job Types */}
        <Card className="lg:col-span-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg mr-3">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              Top Job Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                name: 'Garage Door Repair',
                percentage: 76.45,
                count: 189,
                revenue: '$92,450',
              },
              {
                name: 'Appliances',
                percentage: 12.3,
                count: 30,
                revenue: '$18,940',
              },
              {
                name: 'Air Duct Cleaning',
                percentage: 7.8,
                count: 19,
                revenue: '$12,180',
              },
              {
                name: 'Gate Repair',
                percentage: 3.45,
                count: 9,
                revenue: '$5,420',
              },
            ].map(type => (
              <div key={type.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {type.name}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {type.percentage}%
                    </span>
                    <div className="text-xs text-neutral-500">
                      {type.count} jobs • {type.revenue}
                    </div>
                  </div>
                </div>
                <Progress value={type.percentage} className="h-3" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Calls */}
        <Card className="lg:col-span-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mr-3">
                <PhoneCall className="w-5 h-5 text-white" />
              </div>
              Recent Calls
              <Badge variant="secondary" className="ml-3">
                4 today
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  number: '(555) 123-4567',
                  duration: '4:32',
                  type: 'incoming',
                  status: 'answered',
                  time: '10:15 AM',
                  customer: 'Sarah Johnson',
                  outcome: 'Appointment booked',
                },
                {
                  number: '(555) 987-6543',
                  duration: '2:18',
                  type: 'outgoing',
                  status: 'completed',
                  time: '9:45 AM',
                  customer: 'Mike Davis',
                  outcome: 'Follow-up call',
                },
                {
                  number: '(555) 456-7890',
                  duration: '0:00',
                  type: 'incoming',
                  status: 'missed',
                  time: '9:20 AM',
                  customer: 'Unknown',
                  outcome: 'Callback needed',
                },
                {
                  number: '(555) 234-5678',
                  duration: '6:45',
                  type: 'incoming',
                  status: 'answered',
                  time: '8:55 AM',
                  customer: 'Lisa Chen',
                  outcome: 'Quote provided',
                },
              ].map((call, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                      {call.type === 'incoming' ? (
                        <PhoneIncoming
                          className={`w-4 h-4 ${call.status === 'missed' ? 'text-red-500' : 'text-emerald-500'}`}
                        />
                      ) : (
                        <PhoneOutgoing className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {call.customer || call.number}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {call.time} • {call.duration} • {call.outcome}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      call.status === 'missed'
                        ? 'destructive'
                        : call.status === 'answered'
                          ? 'default'
                          : 'secondary'
                    }
                    className="text-xs"
                  >
                    {call.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payouts Panel */}
        <Card className="lg:col-span-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg mr-3">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              Payouts
              <div className="ml-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg">
              <div className="text-3xl font-bold mb-1">$12,847</div>
              <div className="text-emerald-100">Total Balance</div>
              <div className="flex items-center justify-center mt-2 text-emerald-200">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+$2,340 this week</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Available Instantly
                  </span>
                </div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  $8,420
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Pending (2-3 days)
                  </span>
                </div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  $4,427
                </span>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg">
              <Zap className="w-4 h-4 mr-2" />
              Get Paid Now
            </Button>
          </CardContent>
        </Card>

        {/* Unpaid Jobs */}
        <Card className="lg:col-span-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg mr-3">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                Unpaid Jobs
                <Badge variant="destructive" className="ml-3">
                  3 overdue
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  customer: 'Johnson Electronics',
                  amount: '$1,245',
                  daysOverdue: 15,
                  job: '#4518',
                  priority: 'high',
                },
                {
                  customer: 'Metro Apartments',
                  amount: '$890',
                  daysOverdue: 8,
                  job: '#4512',
                  priority: 'medium',
                },
                {
                  customer: 'Smith Residence',
                  amount: '$425',
                  daysOverdue: 3,
                  job: '#4520',
                  priority: 'low',
                },
              ].map((job, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border-2 border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                      {job.customer}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          job.priority === 'high'
                            ? 'destructive'
                            : job.priority === 'medium'
                              ? 'secondary'
                              : 'outline'
                        }
                        className="text-xs"
                      >
                        {job.priority}
                      </Badge>
                      <Badge variant="destructive" className="text-xs">
                        {job.daysOverdue}d
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400 mb-1">
                    {job.amount}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                    Job {job.job}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs border-red-300 hover:bg-red-50"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Contact Customer
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WePro AI Assistant - MOVED TO BOTTOM */}
      <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden border-l-8 border-l-purple-500 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 opacity-95"></div>

        <CardHeader className="relative z-10 pb-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center text-2xl">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl mr-4 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-white font-bold">WePro AI Assistant</span>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-purple-200 text-sm">
                    Actively monitoring your business
                  </span>
                </div>
              </div>
              <div className="ml-4 px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full text-xs font-semibold text-white shadow-lg">
                🚀 AI POWERED
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Configure AI
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg">
                <Sparkles className="w-4 h-4 mr-2" />
                View All Insights
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Insights */}
            <div className="lg:col-span-2 space-y-4">
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-500/30 rounded-lg">
                      {insight.type === 'optimization' && (
                        <TrendingUp className="w-5 h-5 text-blue-200" />
                      )}
                      {insight.type === 'attention' && (
                        <AlertCircle className="w-5 h-5 text-yellow-200" />
                      )}
                      {insight.type === 'opportunity' && (
                        <DollarSign className="w-5 h-5 text-green-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-lg mb-2">
                        {insight.title}
                      </h4>
                      <p className="text-purple-200 mb-3">
                        {insight.description}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2 text-sm">
                        <span className="text-green-300 font-semibold">
                          {insight.impact}
                        </span>
                        <span className="text-blue-300">
                          Confidence: {insight.confidence}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Performance Stats */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <h4 className="font-semibold text-white mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  AI Performance Today
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-purple-200 mb-2">
                      <span>Schedule Optimization</span>
                      <span>94%</span>
                    </div>
                    <div className="w-full bg-purple-900/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-blue-500 h-2 rounded-full"
                        style={{ width: '94%' }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-purple-200 mb-2">
                      <span>Customer Predictions</span>
                      <span>87%</span>
                    </div>
                    <div className="w-full bg-purple-900/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                        style={{ width: '87%' }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-purple-200 mb-2">
                      <span>Revenue Forecasting</span>
                      <span>91%</span>
                    </div>
                    <div className="w-full bg-purple-900/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                        style={{ width: '91%' }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-xl border border-white/10">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      $18,750
                    </div>
                    <div className="text-purple-200 text-sm">
                      Revenue saved by AI this month
                    </div>
                    <div className="flex items-center justify-center mt-2 text-green-300 text-sm">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +$2,340 vs last month
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardIndex
