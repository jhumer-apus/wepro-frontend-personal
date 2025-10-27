import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Progress } from '@/src/components/ui/progress'
import {
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Globe,
} from 'lucide-react'
import { apiService } from '@/src/services/api'
import { usePermissions } from '@/src/hooks/usePermissions'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts'
import { FilterState } from './ActivityFilterCard'

interface ActivityStats {
  summary: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    successRate: string
    uniqueUsers: number
    avgResponseTime: string
  }
  requestsByMethod: {
    GET: number
    POST: number
    PUT: number
    DELETE: number
    PATCH: number
  }
  requestsByModule: {
    [key: string]: number
  }
  topEndpoints: Array<{
    endpoint: string
    count: number
  }>
  topUsers: Array<{
    userId: string
    userName: string
    userEmail: string | null
    requestCount: number
  }>
  errorStats: Array<{
    statusCode: number
    count: number
    sampleErrors: string[]
  }>
  hourlyStats: Array<{
    hour: number
    day: number
    requestCount: number
    avgResponseTime: string
  }>
}

interface ActivityStatisticsProps {
  filters: FilterState
}

const ActivityStatistics: React.FC<ActivityStatisticsProps> = React.memo(
  ({ filters }) => {
    const { getUserType, checkPermission } = usePermissions()
    const [stats, setStats] = useState<ActivityStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      const fetchStats = async () => {
        // Don't fetch if dateRange is Custom but startDate or endDate is not set
        if (
          filters.dateRangeFilter === 'Custom' &&
          (!filters.customStartDate || !filters.customEndDate)
        ) {
          return
        }

        // Don't fetch if dateRange is Custom but endDate is less than startDate
        if (
          filters.dateRangeFilter === 'Custom' &&
          filters.customStartDate &&
          filters.customEndDate &&
          new Date(filters.customEndDate) < new Date(filters.customStartDate)
        ) {
          return
        }

        try {
          setLoading(true)
          setError(null)

          // Build query parameters
          const queryParams = new URLSearchParams()

          // Add date range filter if provided
          if (filters.dateRangeFilter && filters.dateRangeFilter !== 'All') {
            queryParams.append('dateRange', filters.dateRangeFilter)

            // Only add startDate and endDate for Custom range
            if (filters.dateRangeFilter === 'Custom') {
              if (filters.customStartDate) {
                queryParams.append('startDate', filters.customStartDate)
              }
              if (filters.customEndDate) {
                queryParams.append('endDate', filters.customEndDate)
              }
            }
          }

          // Add userId filter if provided
          if (filters.filterUserId && filters.filterUserId !== 'all') {
            queryParams.append('userId', filters.filterUserId)
          }

          // Add tenantId filter if provided (only for P1 users)
          if (
            getUserType() === 'P1' &&
            filters.filterTenantId &&
            filters.filterTenantId !== 'all'
          ) {
            queryParams.append('tenantId', filters.filterTenantId)
          }

          const path = checkPermission('MOD017', 'view_all_logs')
            ? `/v1/admin/activity-logs/stats`
            : `/v1/activity-logs/stats`

          const url = queryParams.toString()
            ? `${path}?${queryParams.toString()}`
            : path
          console.log('OOOOOO')
          const response = await apiService.get(url)
          if (response.data.success) {
            setStats(response.data.data.stats)
          } else {
            setError('Failed to fetch activity statistics')
          }
        } catch (err) {
          setError('Error loading activity statistics')
          console.error('Error fetching activity stats:', err)
        } finally {
          setLoading(false)
        }
      }

      fetchStats()
    }, [filters])
    // Loading spinner component for individual cards
    const LoadingSpinner = () => (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    )

    if (error || !stats) {
      return (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg mr-3">
                <Activity className="w-5 h-5 text-white" />
              </div>
              Activity Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-red-500">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                <p>{error || 'Failed to load statistics'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    const methodColors = {
      GET: 'bg-blue-500',
      POST: 'bg-green-500',
      PUT: 'bg-yellow-500',
      DELETE: 'bg-red-500',
      PATCH: 'bg-purple-500',
    }

    const moduleColors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
    ]

    const getStatusColor = (statusCode: number) => {
      if (statusCode >= 200 && statusCode < 300) return 'text-green-500'
      if (statusCode >= 300 && statusCode < 400) return 'text-blue-500'
      if (statusCode >= 400 && statusCode < 500) return 'text-yellow-500'
      if (statusCode >= 500) return 'text-red-500'
      return 'text-gray-500'
    }

    return (
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg mr-3">
              <Activity className="w-5 h-5 text-white" />
            </div>
            Activity Statistics
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Total Requests
                    </p>
                    {loading ? (
                      <LoadingSpinner />
                    ) : (
                      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {stats?.summary.totalRequests.toLocaleString() || '0'}
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Successful
                    </p>
                    {loading ? (
                      <LoadingSpinner />
                    ) : (
                      <p className="text-2xl font-bold text-green-600">
                        {stats?.summary.successfulRequests.toLocaleString() ||
                          '0'}
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Failed
                    </p>
                    {loading ? (
                      <LoadingSpinner />
                    ) : (
                      <p className="text-2xl font-bold text-red-600">
                        {stats?.summary.failedRequests.toLocaleString() || '0'}
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Success Rate
                    </p>
                    {loading ? (
                      <LoadingSpinner />
                    ) : (
                      <p className="text-2xl font-bold text-emerald-600">
                        {stats?.summary.successRate || '0%'}
                      </p>
                    )}
                  </div>
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                    <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Requests by Method - Bar Chart */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mr-3">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  Requests by Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  {loading ? (
                    <LoadingSpinner />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(stats?.requestsByMethod || {}).map(
                          ([method, count]) => ({
                            method,
                            count,
                            percentage: (
                              (count /
                                Object.values(
                                  stats?.requestsByMethod || {}
                                ).reduce((a, b) => a + b, 0)) *
                              100
                            ).toFixed(1),
                          })
                        )}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                        />
                        <XAxis dataKey="method" tick={{ fontSize: 12 }} />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={value => value.toLocaleString()}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-white dark:bg-neutral-800 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg">
                                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                    {label}
                                  </p>
                                  <p className="text-blue-600 dark:text-blue-400">
                                    Requests: {data.count.toLocaleString()}
                                  </p>
                                  <p className="text-neutral-600 dark:text-neutral-400">
                                    Percentage: {data.percentage}%
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Method Statistics */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
                  {loading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <div
                          key={index}
                          className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                        >
                          <LoadingSpinner />
                        </div>
                      ))
                    : Object.entries(stats?.requestsByMethod || {}).map(
                        ([method, count]) => {
                          const total = Object.values(
                            stats?.requestsByMethod || {}
                          ).reduce((a, b) => a + b, 0)
                          const percentage =
                            total > 0 ? (count / total) * 100 : 0
                          return (
                            <div
                              key={method}
                              className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                            >
                              <div
                                className={`w-4 h-4 rounded-full mx-auto mb-2 ${methodColors[method as keyof typeof methodColors]}`}
                              ></div>
                              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                {method}
                              </div>
                              <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                {count.toLocaleString()}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                          )
                        }
                      )}
                </div>
              </CardContent>
            </Card>

            {/* Requests by Module - Pie Chart */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mr-3">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  Requests by Module
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  {/* Pie Chart Visualization */}
                  <div className="flex-1 flex justify-center">
                    <div className="w-80 h-80">
                      {loading ? (
                        <LoadingSpinner />
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={Object.entries(
                                stats?.requestsByModule || {}
                              ).map(([module, count], index) => ({
                                name: module,
                                value: count,
                                color:
                                  moduleColors[index % moduleColors.length],
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name} ${((percent || 0) * 100).toFixed(0)}%`
                              }
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {Object.entries(
                                stats?.requestsByModule || {}
                              ).map((_, index) => {
                                const colors = [
                                  '#3b82f6',
                                  '#10b981',
                                  '#f59e0b',
                                  '#ef4444',
                                  '#8b5cf6',
                                  '#ec4899',
                                  '#6366f1',
                                  '#f97316',
                                ]
                                return (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={colors[index % colors.length]}
                                  />
                                )
                              })}
                            </Pie>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  const total = Object.values(
                                    stats?.requestsByModule || {}
                                  ).reduce((a, b) => a + b, 0)
                                  const percentage =
                                    total > 0
                                      ? ((data.value / total) * 100).toFixed(1)
                                      : '0'
                                  return (
                                    <div className="bg-white dark:bg-neutral-800 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg">
                                      <p className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                                        {data.name}
                                      </p>
                                      <p className="text-blue-600 dark:text-blue-400">
                                        Requests: {data.value.toLocaleString()}
                                      </p>
                                      <p className="text-neutral-600 dark:text-neutral-400">
                                        Percentage: {percentage}%
                                      </p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 space-y-1">
                    {loading
                      ? Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between px-2 py-1 rounded"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                              <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                            </div>
                            <div className="text-right">
                              <div className="h-3 w-8 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-1"></div>
                              <div className="h-2 w-6 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                            </div>
                          </div>
                        ))
                      : Object.entries(stats?.requestsByModule || {}).map(
                          ([module, count], index) => {
                            const total = Object.values(
                              stats?.requestsByModule || {}
                            ).reduce((a, b) => a + b, 0)
                            const percentage =
                              total > 0 ? (count / total) * 100 : 0
                            const colors = [
                              '#3b82f6',
                              '#10b981',
                              '#f59e0b',
                              '#ef4444',
                              '#8b5cf6',
                              '#ec4899',
                              '#6366f1',
                              '#f97316',
                            ]
                            return (
                              <div
                                key={module}
                                className="flex items-center justify-between px-2 py-1 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                              >
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor:
                                        colors[index % colors.length],
                                    }}
                                  ></div>
                                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 capitalize">
                                    {module}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                    {count.toLocaleString()}
                                  </span>
                                  <div className="text-xs text-neutral-500">
                                    {percentage.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            )
                          }
                        )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hourly Trends */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg mr-3">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                Hourly Request Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={
                        stats?.hourlyStats?.map(hour => ({
                          time: `Day ${hour.day}, ${hour.hour}:00`,
                          requests: hour.requestCount,
                          avgResponseTime: parseFloat(hour.avgResponseTime),
                          day: hour.day,
                          hour: hour.hour,
                        })) || []
                      }
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        yAxisId="requests"
                        orientation="left"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        yAxisId="responseTime"
                        orientation="right"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white dark:bg-neutral-800 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg">
                                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                  {label}
                                </p>
                                <p className="text-blue-600 dark:text-blue-400">
                                  Requests:{' '}
                                  {payload[0]?.value?.toLocaleString()}
                                </p>
                                <p className="text-green-600 dark:text-green-400">
                                  Avg Response: {payload[1]?.value?.toFixed(2)}
                                  ms
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Line
                        yAxisId="requests"
                        type="monotone"
                        dataKey="requests"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                      />
                      <Line
                        yAxisId="responseTime"
                        type="monotone"
                        dataKey="avgResponseTime"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Legend */}
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Request Count
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Avg Response Time (ms)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Endpoints */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mr-3">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  Top Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>
                            <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                          </div>
                          <div className="h-5 w-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                        </div>
                      ))
                    : stats?.topEndpoints
                        ?.slice(0, 8)
                        .map((endpoint, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white font-bold text-xs">
                                {index + 1}
                              </div>
                              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 font-mono">
                                {endpoint.endpoint}
                              </span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {endpoint.count.toLocaleString()}
                            </Badge>
                          </div>
                        )) || []}
                </div>
              </CardContent>
            </Card>

            {/* Top Users */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg mr-3">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Top Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>
                            <div>
                              <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-1"></div>
                              <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                            </div>
                          </div>
                          <div className="h-5 w-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                        </div>
                      ))
                    : stats?.topUsers?.map((user, index) => (
                        <div
                          key={user.userId}
                          className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold text-sm">
                              {user.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                {user.userName}
                              </div>
                              {user.userEmail && (
                                <div className="text-xs text-neutral-500">
                                  {user.userEmail}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {user.requestCount.toLocaleString()}
                          </Badge>
                        </div>
                      )) || []}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Statistics */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg mr-3">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                Error Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                            <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                          </div>
                          <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                          <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                          <div className="h-3 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  : stats?.errorStats?.map((error, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(error.statusCode)} border-current`}
                            >
                              {error.statusCode}
                            </Badge>
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                              {error.count} errors
                            </span>
                          </div>
                          <span className="text-xs text-neutral-500">
                            {stats?.summary?.failedRequests
                              ? (
                                  (error.count / stats.summary.failedRequests) *
                                  100
                                ).toFixed(1)
                              : '0'}
                            % of total errors
                          </span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                            Sample errors:
                          </p>
                          {error.sampleErrors
                            .slice(0, 2)
                            .map((sampleError, errorIndex) => (
                              <p
                                key={errorIndex}
                                className="text-xs text-neutral-500 dark:text-neutral-400 italic"
                              >
                                • {sampleError}
                              </p>
                            ))}
                        </div>
                      </div>
                    )) || []}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison function to check if filters have changed
    return (
      JSON.stringify(prevProps.filters) === JSON.stringify(nextProps.filters)
    )
  }
)

export default ActivityStatistics
