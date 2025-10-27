import { useRouter } from 'next/router'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import {
  Building2,
  User,
  Calendar,
  Code,
  Loader2,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react'
import {
  SettingsNavigation,
  CompanySettingsSubNavigation,
} from '@/src/components/job'
import { apiService } from '@/src/services/api'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { usePermissions } from '@/src/hooks/usePermissions'

interface CompanyProfile {
  _id: string
  name: string
  ownerName: string
  status: string
  isPrimary: boolean
  createdBy: {
    _id: string
    name: string
    username: string
  }
  tenantId: {
    _id: string
    name: string
    username: string
    companyName: string
  }
  createdAt: string
  updatedAt: string
  code: string
  address?: string
  addressLine2?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  email?: string
  phoneNumber?: string
  weproUsername?: string
  lat?: number
  lng?: number
}

const mapContainerStyle = {
  width: '100%',
  height: '300px',
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
}

export default function CompanyProfilePage() {
  const router = useRouter()
  const { checkPermission } = usePermissions()
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markerBuffer, setMarkerBuffer] = useState<boolean>(false)

  useEffect(() => {
    setTimeout(() => {
      setMarkerBuffer(true)
    }, 1000)
    if (!checkPermission('MOD028', 'view')) {
      router.push('/settings/company/franchises')
      return
    }
    fetchCompanyProfile()
  }, [])

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.get<{
        success: boolean
        message: string
        data: CompanyProfile
      }>('/v1/company-profile')
      const result = response.data

      if (result.success) {
        setCompanyProfile(result.data)
      } else {
        setError(result.message || 'Failed to fetch company profile')
      }
    } catch (err) {
      setError('An error occurred while fetching company profile')
      console.error('Error fetching company profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Company Profile - WePro</title>
          <meta name="description" content="Manage company profile" />
        </Head>
        <div className="space-y-6">
          <SettingsNavigation />
          <CompanySettingsSubNavigation />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Company Profile
              </h1>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-neutral-400 mx-auto mb-4 animate-spin" />
                <p className="text-neutral-600 dark:text-neutral-400">
                  Loading company profile...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Company Profile - WePro</title>
          <meta name="description" content="Manage company profile" />
        </Head>
        <div className="space-y-6">
          <SettingsNavigation />
          <CompanySettingsSubNavigation />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Company Profile
              </h1>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Error Loading Profile
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {error}
                </p>
                <Button onClick={fetchCompanyProfile} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Company Profile - WePro</title>
        <meta name="description" content="Manage company profile" />
      </Head>
      <div className="space-y-6">
        {/* Main Tab Navigation */}
        <SettingsNavigation />

        {/* Sub Tab Navigation */}
        <CompanySettingsSubNavigation />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Company Profile
            </h1>
          </div>
          <Button
            onClick={() => router.push('/settings/company/profile/edit')}
            className="shrink-0"
          >
            Edit Profile
          </Button>
        </div>

        {/* Company Profile Content */}
        {companyProfile && (
          <div className="grid gap-6">
            {/* Company Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Name
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {companyProfile.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Company Code
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      {companyProfile.code}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Owner Name
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {companyProfile.ownerName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Status
                    </label>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          companyProfile.status === 'Active'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-sm"
                      >
                        {companyProfile.status}
                      </Badge>
                      {companyProfile.isPrimary && (
                        <Badge variant="outline" className="text-sm">
                          Primary
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {companyProfile.email || '--'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {companyProfile.phoneNumber || '--'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Created By
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {companyProfile.createdBy.name} (
                      {companyProfile.createdBy.username})
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Tenant
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {companyProfile.tenantId.companyName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Created At
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(companyProfile.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Last Updated
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(companyProfile.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Details Card - Only show if lat and lng exist */}
            {companyProfile.lat && companyProfile.lng && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Address Information */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Address:
                        </span>
                        <span className="text-gray-900">
                          {companyProfile.address || '--'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Address Line 2:
                        </span>
                        <span className="text-gray-900">
                          {companyProfile.addressLine2 || '--'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">City:</span>
                        <span className="text-gray-900">
                          {companyProfile.city || '--'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          State:
                        </span>
                        <span className="text-gray-900">
                          {companyProfile.state || '--'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">ZIP:</span>
                        <span className="text-gray-900">
                          {companyProfile.zipCode || '--'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">
                          Country:
                        </span>
                        <span className="text-gray-900">
                          {companyProfile.country || '--'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-blue-200">
                        <div className="flex justify-between">
                          <span className="text-gray-600 font-medium">
                            Coordinates:
                          </span>
                          <span className="text-gray-900">
                            {companyProfile.lat && companyProfile.lng
                              ? `${companyProfile.lat.toFixed(4)}, ${companyProfile.lng.toFixed(4)}`
                              : '--'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map */}
                  <div className="space-y-4">
                    <div>
                      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={{
                            lat: companyProfile.lat,
                            lng: companyProfile.lng,
                          }}
                          zoom={15}
                          options={{
                            mapTypeId: 'roadmap',
                            styles: [
                              {
                                featureType: 'poi',
                                elementType: 'labels',
                                stylers: [{ visibility: 'off' }],
                              },
                            ],
                          }}
                        >
                          {markerBuffer && (
                            <Marker
                              position={{
                                lat: companyProfile.lat,
                                lng: companyProfile.lng,
                              }}
                              title="Company Location"
                            />
                          )}
                        </GoogleMap>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  )
}
