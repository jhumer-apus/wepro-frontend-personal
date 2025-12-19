import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useTheme } from 'next-themes'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Separator } from '@/src/components/ui/separator'
import { ArrowLeft, Edit, Globe, Info, MapPin } from 'lucide-react'
import { usePermissions } from '@/src/hooks/usePermissions'
import { Source } from '@/src/constants/interface/source'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { GoogleMap, Marker } from '@react-google-maps/api'

const mapContainerStyle = {
  width: '100%',
  height: '300px',
}

const getStatusBadgeColor = (isActive: boolean) => {
  return isActive
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
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

export default function ViewSourcePage() {
  const router = useRouter()
  const { id } = router.query
  const { checkPermission } = usePermissions()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [source, setSource] = useState<Source | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markerBuffer, setMarkerBuffer] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load source data
  useEffect(() => {
    const loadSource = async () => {
      if (id && typeof id === 'string') {
        try {
          setLoading(true)
          setError(null)
          const response = await apiService.get(`/v1/sources/${id}`)
          const sourceData = response.data.data
          setTimeout(() => {
            setMarkerBuffer(true)
          }, 1000)
          setSource(sourceData)
        } catch (err: any) {
          console.error('Failed to load source:', err)
          setError('Failed to load source details')
          toast.error('Failed to load source details', {
            description:
              'An error occurred while loading the source information.',
          })
        } finally {
          setLoading(false)
        }
      }
    }

    loadSource()
  }, [id])

  React.useEffect(() => {
    if (!checkPermission('MOD008', 'view')) {
      router.push('/settings/job/industry')
    }
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-neutral-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 dark:bg-neutral-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !source) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            {error || 'Source Not Found'}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {error ||
              "The source you're looking for doesn't exist or has been removed."}
          </p>
          <Button onClick={() => router.push('/settings/company/sources')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sources
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{source.name} - Source Details - WePro</title>
        <meta name="description" content={`View details for ${source.name}`} />
      </Head>

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/settings/company/sources')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sources
          </button>
        </div>

        <div className="space-y-6">
          {/* Header */}

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 dark:text-gray-400" />
                Basic Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                      {source.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        className={getStatusBadgeColor(
                          source.status === 'Active'
                        )}
                      >
                        {source.status}
                      </Badge>
                      <Badge variant="outline" className="dark:border-neutral-700 dark:text-gray-300">Code: {source.code}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      WePro Username
                    </label>
                    <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                      {source.weproUsername}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Email
                    </label>
                    <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                      {source.email}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Phone Number
                    </label>
                    <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                      {source.phoneNumber}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Franchise Code
                    </label>
                    <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                      {source.franchiseCode}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 dark:text-gray-400" />
                System Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created By
                  </label>
                  <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                    {source.createdBy?.name || '--'}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    @{source.createdBy?.username || '--'}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created At
                  </label>
                  <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                    {formatDate(source.createdAt)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Last Updated
                  </label>
                  <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                    {formatDate(source.updatedAt)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Tenant
                  </label>
                  <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                    {source.tenantId?.name || '--'}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    @{source.tenantId?.username || '--'}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 dark:text-gray-400" />
                Business Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Industry ID
                    </label>
                    <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                      {source.industryId}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Transaction Pay Fee
                    </label>
                    <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                      {source.transactionPayFee}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Phone Masking
                    </label>
                    <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                      {source.phoneMasking}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Call Routing
                    </label>
                    <div className="mt-1 text-neutral-900 dark:text-neutral-100">
                      {source.callRouting}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Details Card - Only show if lat and lng exist */}
            {source.lat && source.lng && (
              <Card className="dark:bg-neutral-800 dark:border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <MapPin className="w-5 h-5 dark:text-blue-400" />
                    Address Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Address Information */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 space-y-2 text-sm border dark:border-blue-800/30">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          Address:
                        </span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {source.address || '--'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          Address Line 2:
                        </span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {source.addressLine2 || '--'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">City:</span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {source.city || '--'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          State:
                        </span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {source.state || '--'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">ZIP:</span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {source.zipCode || '--'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          Country:
                        </span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {source.country || '--'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-blue-200 dark:border-blue-800/30">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            Coordinates:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {source.lat && source.lng
                              ? `${source.lat.toFixed(4)}, ${source.lng.toFixed(4)}`
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
                            lat: source.lat,
                            lng: source.lng,
                          }}
                          zoom={15}
                          options={{
                            mapTypeId: 'roadmap',
                            styles: mounted && resolvedTheme === 'dark' ? [
                              { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                              { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                              { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                              {
                                  featureType: 'administrative.locality',
                                  elementType: 'labels.text.fill',
                                  stylers: [{ color: '#d59563' }]
                              },
                              {
                                  featureType: 'poi',
                                  elementType: 'labels.text.fill',
                                  stylers: [{ color: '#d59563' }]
                              },
                              {
                                  featureType: 'poi.park',
                                  elementType: 'geometry',
                                  stylers: [{ color: '#263c3f' }]
                              },
                              {
                                  featureType: 'poi.park',
                                  elementType: 'labels.text.fill',
                                  stylers: [{ color: '#6b9a76' }]
                              },
                              {
                                  featureType: 'road',
                                  elementType: 'geometry',
                                  stylers: [{ color: '#38414e' }]
                              },
                              {
                                  featureType: 'road',
                                  elementType: 'geometry.stroke',
                                  stylers: [{ color: '#212a37' }]
                              },
                              {
                                  featureType: 'road',
                                  elementType: 'labels.text.fill',
                                  stylers: [{ color: '#9ca5b3' }]
                              },
                              {
                                  featureType: 'road.highway',
                                  elementType: 'geometry',
                                  stylers: [{ color: '#746855' }]
                              },
                              {
                                  featureType: 'road.highway',
                                  elementType: 'geometry.stroke',
                                  stylers: [{ color: '#1f2835' }]
                              },
                              {
                                  featureType: 'road.highway',
                                  elementType: 'labels.text.fill',
                                  stylers: [{ color: '#f3d19c' }]
                              },
                              {
                                  featureType: 'transit',
                                  elementType: 'geometry',
                                  stylers: [{ color: '#2f3948' }]
                              },
                              {
                                  featureType: 'transit.station',
                                  elementType: 'labels.text.fill',
                                  stylers: [{ color: '#d59563' }]
                              },
                              {
                                  featureType: 'water',
                                  elementType: 'geometry',
                                  stylers: [{ color: '#17263c' }]
                              },
                              {
                                  featureType: 'water',
                                  elementType: 'labels.text.fill',
                                  stylers: [{ color: '#515c6d' }]
                              },
                              {
                                  featureType: 'water',
                                  elementType: 'labels.text.stroke',
                                  stylers: [{ color: '#17263c' }]
                              },
                              {
                                  featureType: 'poi',
                                  elementType: 'labels',
                                  stylers: [{ visibility: 'off' }],
                              },
                            ] : [
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
                                lat: source.lat,
                                lng: source.lng,
                              }}
                              title="Source Location"
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

          {/* Actions */}
          <div className="flex justify-end gap-3">
            {checkPermission('MOD008', 'edit') && (
              <Button
                onClick={() =>
                  router.push(
                    `/settings/company/sources/create?id=${source._id}`
                  )
                }
                className="wepro-button-gradient text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Source
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
