import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import {
  ArrowLeft,
  Building2,
  Edit,
  Package,
  Clock,
  Shield,
  Loader2,
  ChevronDown,
  ChevronRight,
  Wrench,
} from 'lucide-react'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { Loading } from '@/src/components/ui/loading'
import { Industry } from '@/src/constants/interface/industry'
import { usePermissions } from '@/src/hooks/usePermissions'

interface IndustryResponse {
  success: boolean
  message: string
  data: Industry
}

interface Tenant {
  _id: string
  name: string
  username: string
}

interface JobType {
  _id: string
  name: string
  code: string
  description: string
  active: boolean
  level: number
  children: JobType[]
  car_info: boolean
  industry_code: string
  parent_code: string | null
  isP1: boolean
  tenant_id: Tenant
  createdBy: Tenant
  createdAt: string
  updatedAt: string
}

interface JobTypeTreeResponse {
  success: boolean
  message: {
    industry: {
      code: string
      name: string
    }
    tree: JobType[]
    totalCount: number
    filters: {
      active: boolean
      user_access: string
    }
  }
  data: string
}

const getStatusBadgeColor = (active: boolean) => {
  return active
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

const getP1BadgeColor = (isP1: boolean) => {
  if (isP1 === false) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
  }
  return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
}

export default function IndustryViewPage(): React.JSX.Element {
  const router = useRouter()
  const { checkPermission, getUserType } = usePermissions()

  const { id } = router.query
  const [industryData, setIndustryData] = useState<Industry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Job Type Tree state
  const [jobTypeTreeData, setJobTypeTreeData] =
    useState<JobTypeTreeResponse | null>(null)
  const [jobTypeTreeLoading, setJobTypeTreeLoading] = useState(false)
  const [jobTypeTreeError, setJobTypeTreeError] = useState<string | null>(null)
  const [expandedJobTypes, setExpandedJobTypes] = useState<Set<string>>(
    new Set()
  )

  const fetchIndustryData = useCallback(async () => {
    return
    if (id && typeof id === 'string') {
      setLoading(true)
      setError(null)
      try {
        const url = `/v3/industries/${id}`

        const response = await apiService.get<IndustryResponse>(url)

        if (response.data.success) {
          setIndustryData(response.data.data)
        } else {
          setError(response.data.message || 'Failed to load industry data')
          toast.error('Failed to load industry data', {
            description:
              response.data.message ||
              'The industry information could not be retrieved.',
          })
        }
      } catch (error: any) {
        console.error('Error fetching industry data:', error)
        setError(
          error.response?.data?.message ||
            'An error occurred while loading the industry'
        )
        toast.error('Failed to load industry data', {
          description:
            error.response?.data?.message ||
            'An error occurred while loading the industry.',
        })
      } finally {
        setLoading(false)
      }
    }
  }, [id])

  const fetchJobTypeTree = useCallback(async () => {
    if (id) {
      setJobTypeTreeLoading(true)
      setJobTypeTreeError(null)
      try {
        const url = `/v3/job-types/tree/${id}?active=true`
        const response = await apiService.get<JobTypeTreeResponse>(url)

        if (response.data.success) {
          setJobTypeTreeData(response.data)
        } else {
          setJobTypeTreeError(
            response.data.data || 'Failed to load job type tree'
          )
        }
      } catch (error: any) {
        console.error('Error fetching job type tree:', error)
        setJobTypeTreeError(
          error.response?.data?.message ||
            'An error occurred while loading the job type tree'
        )
      } finally {
        setJobTypeTreeLoading(false)
      }
    }
  }, [id])

  useEffect(() => {
    fetchIndustryData()
  }, [fetchIndustryData])

  useEffect(() => {
    if (id) {
      fetchJobTypeTree()
    }
  }, [fetchJobTypeTree])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleEdit = () => {
    if (id) {
      router.push(`/settings/job/industry/create?id=${id}`)
    }
  }

  const handleBack = () => {
    router.push('/settings/job/industry')
  }

  const toggleJobTypeExpanded = (id: string) => {
    const newExpanded = new Set(expandedJobTypes)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedJobTypes(newExpanded)
  }

  const getJobTypeLevelStats = (item: JobType) => {
    const jobTypeCount = item.children.filter(child => child.level === 2).length
    const subTypeCount = item.children.filter(child => child.level === 3).length

    if (item.level === 1) {
      return `${jobTypeCount} job types`
    } else if (item.level === 2) {
      return `${subTypeCount} sub-types`
    }
    return ''
  }

  const renderJobTypeItem = (item: JobType, depth: number = 0) => {
    const isExpanded = expandedJobTypes.has(item._id)
    const hasChildren = item.children && item.children.length > 0
    const canExpand = hasChildren && item.level < 4

    // Calculate width based on depth - each level gets slightly narrower
    const widthPercentage = Math.max(100 - depth * 8, 70) // Minimum 70% width

    return (
      <div key={item._id} className="space-y-1">
        <div
          className={`
            relative flex items-start justify-between p-4 rounded-lg border transition-all duration-200
            ${depth === 0 ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-100'}
            hover:shadow-md hover:border-gray-300 hover:bg-${depth === 0 ? 'gray-50' : 'white'}
          `}
          style={{
            width: `${widthPercentage}%`,
            marginLeft: `${depth * 24}px`,
          }}
        >
          {/* Expand/collapse button with better positioning */}
          {canExpand && (
            <button
              onClick={() => toggleJobTypeExpanded(item._id)}
              className={`
                absolute p-2 hover:bg-blue-100 rounded-full transition-all duration-200
                ${isExpanded ? 'bg-blue-50 text-blue-700' : 'text-blue-600 hover:text-blue-700'}
              `}
              style={{ left: '8px', top: '16px' }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Main content with proper indentation */}
          <div
            className="flex-1"
            style={{ marginLeft: canExpand ? '40px' : '16px' }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                {/* Header with badges */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    {item.active && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    )}
                    {item.car_info && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Car Info
                      </span>
                    )}
                    {item.isP1 && (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        P1
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Stats and metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {item.code}
                  </span>
                  {getJobTypeLevelStats(item)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Children with visual connection lines */}
        {isExpanded && hasChildren && (
          <div className="relative">
            {/* Vertical connection line */}
            <div
              className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-blue-300 to-gray-200"
              style={{ left: `${depth * 24 + 16}px` }}
            />

            {/* Children container */}
            <div className="space-y-2">
              {item.children.map(child => renderJobTypeItem(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Industry - WePro</title>
        </Head>
        <div className="p-6">
          <Loading message="Loading industry details..." />
        </div>
      </>
    )
  }

  // Check permission to access this page
  if (
    !checkPermission('MOD012', 'view') &&
    !checkPermission('MOD013', 'view')
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You don't have permission to view this page.
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>
          {jobTypeTreeData?.message?.industry?.name} - Industry Details - WePro
        </title>
        <meta
          name="description"
          content={`View job type tree for ${jobTypeTreeData?.message?.industry?.name} industry`}
        />
      </Head>

      <div className="p-6">
        {/* Back Button and Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Industries
          </button>
        </div>

        {/* Header */}
        {/*<div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {industryData.name}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Industry Details
              </p>
            </div>
            {(getUserType() === 'P1' || checkPermission('MOD012', 'edit') || checkPermission('MOD013', 'edit')) && (
              <Button onClick={handleEdit} className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Industry
              </Button>
            )}
          </div>
        </div>*/}

        <div className="space-y-6">
          {/* Basic Information */}
          {/*<Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Industry Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Industry Name
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {industryData.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Industry Code
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {industryData.code}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge className={getStatusBadgeColor(industryData.active)}>
                      {industryData.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                {!(getUserType() === 'P1' || checkPermission('MOD012', 'view')) && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Type
                    </label>
                    <div className="mt-1">
                      <Badge className={getP1BadgeColor(industryData.isP1)}>
                        {industryData.isP1 === false ? 'Custom' : 'Default'}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>*/}

          {/* System Information */}
          {/*<Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created At
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {formatDate(industryData.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Last Updated
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {formatDate(industryData.updatedAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Industry ID
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium font-mono text-sm">
                    {industryData._id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Version
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    v{industryData.__v}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>*/}

          {/* Job Type Tree */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Job Type Tree
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobTypeTreeLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">
                      Loading job types...
                    </p>
                  </div>
                </div>
              ) : jobTypeTreeError ? (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-4">
                    <Wrench className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Error Loading Job Types
                  </h3>
                  <p className="text-gray-600 mb-4">{jobTypeTreeError}</p>
                  <Button
                    onClick={fetchJobTypeTree}
                    variant="outline"
                    size="sm"
                  >
                    Try Again
                  </Button>
                </div>
              ) : jobTypeTreeData && jobTypeTreeData.message.tree.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900 mb-1">
                          Job Types Overview
                        </h3>
                        <p className="text-blue-700 text-sm">
                          {jobTypeTreeData.message.totalCount} total job types
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-900">
                          {jobTypeTreeData.message.totalCount}
                        </div>
                        <div className="text-blue-600 text-sm">Job Types</div>
                      </div>
                    </div>
                  </div>

                  {/* Job Types Tree */}
                  <div className="space-y-3">
                    {jobTypeTreeData.message.tree.map(jobType =>
                      renderJobTypeItem(jobType)
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Job Types Found
                  </h3>
                  <p className="text-gray-600">
                    No job types have been created for this industry yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          {/*{industryData.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-900 dark:text-neutral-100">
                  {industryData.description}
                </p>
              </CardContent>
            </Card>
          )}*/}
        </div>
      </div>
    </>
  )
}
