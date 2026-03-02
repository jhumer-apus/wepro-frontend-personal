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
import {
  ArrowLeft,
  Edit,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Globe,
  Navigation,
  Shield,
} from 'lucide-react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { apiService } from '@/src/services/api'
import { Loading } from '@/src/components/ui/loading'
import { toast } from 'sonner'
import { Franchise } from '@/src/constants/interface/franchise'
import { usePermissions } from '@/src/hooks/usePermissions'

const mapContainerStyle = {
  width: '100%',
  height: '300px',
}

const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'inactive':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const getPrimaryBadgeColor = (isPrimary: boolean) => {
  return isPrimary
    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) {
    return 'N/A'
  }
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatAddress = (franchise: Franchise) => {
  const parts = [
    franchise.address,
    franchise.addressLine2,
    franchise.city,
    franchise.state,
    franchise.zipCode,
    franchise.country,
  ].filter(Boolean)

  return parts.join(', ')
}

export default function FranchiseViewPage() {
  const router = useRouter()
  const { id } = router.query

  const [markerBuffer, setMarkerBuffer] = useState(false)
  const [franchise, setFranchise] = useState<Franchise | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { checkPermission } = usePermissions()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (id) {
      fetchFranchise()
      setTimeout(() => {
        setMarkerBuffer(true)
      }, 1000)
    }
  }, [id])

  const fetchFranchise = async () => {
    try {
      setLoading(true)
      const response = await apiService.get(`/v3/franchises/${id}`)

      if (response.data.success) {
        setFranchise(response.data.data)
        setError(null)
      } else {
        setError(response.data.message || 'Failed to fetch franchise')
      }
    } catch (err: any) {
      console.error('Error fetching franchise:', err)
      setError(err.response?.data?.message || 'Failed to fetch franchise')
    } finally {
      setLoading(false)
    }
  }

  if (!checkPermission('MOD027', 'view')) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loading message="Loading franchise details..." size="lg" />
      </div>
    )
  }

  if (error || !franchise) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Franchise
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Unable to load franchise details'}
          </p>
          <div className="space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/settings/company/franchises')}
            >
              Back to Franchises
            </Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{franchise.name} - Franchise Details - WePro</title>
        <meta
          name="description"
          content={`View details for ${franchise.name} franchise`}
        />
      </Head>

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/settings/company/franchises')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Franchises
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {franchise.name}
              </h1>
            </div>
            <Button
              onClick={() =>
                router.push(`/settings/company/franchises/create?id=${id}`)
              }
              className="flex items-center gap-2 text-white"
            >
              <Edit className="w-4 h-4" />
              Edit Franchise
            </Button>
          </div>
        </div>

        {/* Franchise Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Franchise Name
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {franchise.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Franchise Code
                    </label>
                    <p className="text-lg font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                      {franchise.code}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Status
                    </label>
                    <div className="mt-1">
                      <Badge className={getStatusBadgeColor(franchise.status)}>
                        {franchise.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Owner Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Owner Name
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {franchise.ownerName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Username
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      @{franchise.weproUsername}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-neutral-400" />
                      <a
                        href={`mailto:${franchise.email}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {franchise.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      <a
                        href={`tel:${franchise.phoneNumber}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {franchise.phoneNumber}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Full Address
                  </label>
                  <p className="text-lg text-neutral-900 dark:text-neutral-100 mt-1">
                    {formatAddress(franchise)}
                  </p>
                </div>
                {franchise.addressLine2 && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Address Line 2
                    </label>
                    <p className="text-lg text-neutral-900 dark:text-neutral-100 mt-1">
                      {franchise.addressLine2}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      City
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {franchise.city || '--'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      State/Province
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {franchise.state || '--'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      ZIP/Postal Code
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {franchise.zipCode || '--'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Country
                    </label>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {franchise.country || '--'}
                    </p>
                  </div>
                </div>
                {franchise.lat && franchise.lng && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Coordinates
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Navigation className="w-4 h-4 text-neutral-400" />
                      <span className="text-lg font-mono text-neutral-900 dark:text-neutral-100">
                        {franchise.lat.toFixed(6)}, {franchise.lng.toFixed(6)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Map Display */}
                {franchise.lat && franchise.lng && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2 block">
                      Location Map
                    </label>
                    <div className="mt-2 border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={{ lat: franchise.lat, lng: franchise.lng }}
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
                              lat: franchise.lat,
                              lng: franchise.lng,
                            }}
                            title={franchise.name}
                            animation={google.maps.Animation.DROP}
                          />
                        )}
                      </GoogleMap>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created By
                  </label>
                  <p className="text-sm text-neutral-900 dark:text-neutral-100 mt-1">
                    {franchise.createdBy.name} (@{franchise.createdBy.username})
                  </p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Created At
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <p className="text-sm text-neutral-900 dark:text-neutral-100">
                      {formatDate(franchise.createdAt)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Last Updated
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatDate(franchise.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
