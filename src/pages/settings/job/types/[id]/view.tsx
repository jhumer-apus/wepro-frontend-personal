import React, { useState, useEffect } from 'react'
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
  Briefcase,
  Edit,
  Factory,
  Clock,
  Shield,
  Building2,
  User,
  Code,
  Layers,
  FileText,
  Car,
} from 'lucide-react'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { Loading } from '@/src/components/ui/loading'
import { usePermissions } from '@/src/hooks/usePermissions'

interface JobTypeResponse {
  success: boolean
  message: {
    _id: string
    name: string
    industry_code: string
    parent_code: string
    isP1: boolean
    tenant_id: {
      _id: string
      name: string
      username: string
    }
    createdBy: {
      _id: string
      name: string
      username: string
    }
    active: boolean
    level: number
    description: string
    car_info: boolean
    createdAt: string
    updatedAt: string
    code: string
    industry: {
      _id: string
      name: string
      code: string
    }
    parentJobType: {
      _id: string
      name: string
      level: number
      code: string
    }
    subJobTypes: any[]
  }
  data: string
}

export default function JobTypeViewPage(): React.JSX.Element {
  const router = useRouter()
  const { checkPermission } = usePermissions()

  // Check permission to access this page
  if (
    !checkPermission('MOD014', 'view') &&
    !checkPermission('MOD015', 'view')
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

  const { id } = router.query
  const [jobTypeData, setJobTypeData] = useState<
    JobTypeResponse['message'] | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobTypeData = async () => {
      if (id && typeof id === 'string') {
        setLoading(true)
        setError(null)
        try {
          const response = await apiService.get<JobTypeResponse>(
            `/v3/job-types/${id}`
          )

          if (response.data.success) {
            setJobTypeData(response.data.message)
          } else {
            setError(response.data.message || 'Failed to load job type data')
            toast.error('Failed to load job type data', {
              description:
                response.data.message ||
                'The job type information could not be retrieved.',
            })
          }
        } catch (error: any) {
          console.error('Error fetching job type data:', error)
          setError(
            error.response?.data?.message ||
              'An error occurred while loading the job type'
          )
          toast.error('Failed to load job type data', {
            description:
              error.response?.data?.message ||
              'An error occurred while loading the job type.',
          })
        } finally {
          setLoading(false)
        }
      }
    }

    fetchJobTypeData()
  }, [id])

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
      router.push(`/settings/job/types/create?id=${id}`)
    }
  }

  const handleBack = () => {
    router.push('/settings/job/types')
  }

  const getStatusBadgeColor = (active: boolean) => {
    return active
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }

  const getP1BadgeColor = (isP1: boolean) => {
    return isP1
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Job Type - WePro</title>
        </Head>
        <div className="p-6">
          <Loading message="Loading job type details..." />
        </div>
      </>
    )
  }

  if (error || !jobTypeData) {
    return (
      <>
        <Head>
          <title>Job Type Not Found - WePro</title>
        </Head>
        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Job Types
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Briefcase className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Job Type Not Found
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {error || 'The job type you are looking for does not exist.'}
              </p>
              <Button onClick={handleBack} variant="outline">
                Back to Job Types
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{jobTypeData.name} - Job Type Details - WePro</title>
        <meta
          name="description"
          content={`View details for ${jobTypeData.name}`}
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
            Back to Job Types
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {jobTypeData.name}
              </h1>
            </div>
            {(checkPermission('MOD014', 'edit') ||
              checkPermission('MOD015', 'edit')) && (
              <Button onClick={handleEdit} className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Job Type
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Job Type Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Job Type Name
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {jobTypeData.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Code
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {jobTypeData.code}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Level
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {jobTypeData.level}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Status
                  </label>
                  <Badge
                    className={`${getStatusBadgeColor(jobTypeData.active)} ml-3`}
                  >
                    {jobTypeData.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    P1 Job Type
                  </label>
                  <Badge
                    className={`${getP1BadgeColor(jobTypeData.isP1)} ml-3`}
                  >
                    {jobTypeData.isP1 ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Car Information
                  </label>
                  <Badge
                    className={`${jobTypeData.car_info ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'} ml-3`}
                  >
                    {jobTypeData.car_info ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Description
                </label>
                <p className="text-neutral-900 dark:text-neutral-100 font-medium mt-1">
                  {jobTypeData.description || 'No description provided'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Industry Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="w-5 h-5" />
                Industry Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Industry Name
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {jobTypeData.industry?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Industry Code
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {jobTypeData.industry_code}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Job Type Information */}
          {jobTypeData.parentJobType && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Parent Job Type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Parent Name
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                      {jobTypeData.parentJobType.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Parent Code
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                      {jobTypeData.parent_code}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Parent Level
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                      {jobTypeData.parentJobType.level}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sub Job Types */}
          {jobTypeData.subJobTypes && jobTypeData.subJobTypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Sub Job Types ({jobTypeData.subJobTypes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {jobTypeData.subJobTypes.map(
                    (subType: any, index: number) => (
                      <div
                        key={subType._id || index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {subType.name}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Code: {subType.code}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-3">
                          Level {subType.level}
                        </Badge>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tenant and Creator Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Tenant & Creator Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Tenant Name
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {jobTypeData.tenant_id.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created By
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {jobTypeData.createdBy.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created At
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {formatDate(jobTypeData.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Last Updated
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {formatDate(jobTypeData.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
