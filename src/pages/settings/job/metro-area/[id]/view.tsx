import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import {
  Loader2,
  MapPin,
  ArrowLeft,
  Building2,
  Palette,
  Shield,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { GoogleMap, Marker, Polygon, Circle } from '@react-google-maps/api'
import { apiService } from '@/src/services/api'
import { usePermissions } from '@/src/hooks/usePermissions'
import { MetroArea } from '@/src/constants/interface/metroArea'

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MetroAreaViewPage() {
  const router = useRouter()
  const { id } = router.query
  const { checkPermission } = usePermissions()

  const [metroArea, setMetroArea] = useState<MetroArea | null>(null)
  const [markerBuffer, setMarkerBuffer] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [polygonPoints, setPolygonPoints] = useState<
    google.maps.LatLngLiteral[]
  >([])

  // Fetch metro area data
  useEffect(() => {
    const fetchMetroArea = async () => {
      if (id && typeof id === 'string') {
        setIsLoading(true)
        try {
          const response = await apiService.get(`/v1/metro-areas/${id}`)
          const metroAreaData = response.data.data
          setMetroArea(metroAreaData)
          setTimeout(() => {
            setMarkerBuffer(true)
          }, 1000)
          // Set polygon points if they exist
          if (
            metroAreaData.polygon_coordinates &&
            metroAreaData.polygon_coordinates.length > 0
          ) {
            // Extract lat/lng from polygon coordinates (remove _id fields)
            const cleanPolygonPoints = metroAreaData.polygon_coordinates.map(
              (point: any) => ({
                lat: point.lat,
                lng: point.lng,
              })
            )
            setPolygonPoints(cleanPolygonPoints)
          }
        } catch (error: any) {
          console.error('Error fetching metro area:', error)
          setError(
            error.response?.data?.message || 'Failed to fetch metro area'
          )
          toast.error(
            error.response?.data?.message || 'Failed to fetch metro area'
          )
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchMetroArea()
  }, [id])

  const onMapLoad = (map: google.maps.Map) => {
    setMapLoaded(true)
    console.log('Map loaded successfully')
  }

  // Check permission to access this page
  if (!checkPermission('MOD029', 'view')) {
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
            You don't have permission to view metro areas.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => router.push('/settings/job/metro-area')}
              variant="outline"
            >
              Back to Metro Areas
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading metro area details...
          </p>
        </div>
      </div>
    )
  }

  if (error || !metroArea) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
            <Eye className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Error Loading Metro Area
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {error || 'Failed to load metro area details'}
          </p>
          <div className="mt-6">
            <Button
              onClick={() => router.push('/settings/job/metro-area')}
              variant="outline"
            >
              Back to Metro Areas
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>View Metro Area - {metroArea.name} - WePro</title>
        <meta
          name="description"
          content={`View details for metro area: ${metroArea.name}`}
        />
      </Head>

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Metro Areas
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {metroArea.name}
            </h1>
          </div>
          {checkPermission('MOD029', 'edit') && (
            <Button
              onClick={() =>
                router.push(
                  `/settings/job/metro-area/create?id=${metroArea._id}`
                )
              }
            >
              Edit Metro Area
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Details */}
          <div className="flex flex-col space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {metroArea.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Code
                  </label>
                  <div className="mt-1">
                    <Badge
                      style={{
                        backgroundColor: metroArea.background_color,
                        color: metroArea.text_color,
                      }}
                      className="font-mono block w-fit"
                    >
                      {metroArea.code}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Zipcode
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {metroArea.zipcode}
                  </p>
                </div>

                {!metroArea.is_advance_area_select && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Radius
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {metroArea.radius} {metroArea.radius_unit}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-neutral-500" />
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {metroArea.latitude.toFixed(6)}°,{' '}
                      {metroArea.longitude.toFixed(6)}°
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Area Selection Mode
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        metroArea.is_advance_area_select
                          ? 'default'
                          : 'secondary'
                      }
                      className="block w-fit"
                    >
                      {metroArea.is_advance_area_select
                        ? 'Advanced'
                        : 'Standard'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Background Color
                  </label>
                  <div className="flex items-center gap-3 mt-1">
                    <div
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: metroArea.background_color }}
                    />
                    <span className="font-mono text-sm">
                      {metroArea.background_color}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Text Color
                  </label>
                  <div className="flex items-center gap-3 mt-1">
                    <div
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: metroArea.text_color }}
                    />
                    <span className="font-mono text-sm">
                      {metroArea.text_color}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Created At
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatDate(metroArea.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tenant
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {metroArea.tenant_id.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Map */}
          <div className="flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Map
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="h-full flex flex-col">
                  <div className="p-4 pb-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {metroArea.is_advance_area_select
                        ? 'Advanced area selection with custom polygon boundary'
                        : 'Standard area selection with radius-based boundary'}
                    </p>
                  </div>

                  <div className="flex-1 px-4 pb-4">
                    <div className="w-full h-full">
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={{
                          lat: metroArea.latitude,
                          lng: metroArea.longitude,
                        }}
                        zoom={11}
                        onLoad={onMapLoad}
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
                          <>
                            {/* Center Marker */}
                            <Marker
                              position={{
                                lat: metroArea.latitude,
                                lng: metroArea.longitude,
                              }}
                              title={`${metroArea.name} - Center Point`}
                              animation={google.maps.Animation.DROP}
                            />

                            {/* Circle for Standard Area Selection */}
                            {!metroArea.is_advance_area_select && (
                              <Circle
                                center={{
                                  lat: metroArea.latitude,
                                  lng: metroArea.longitude,
                                }}
                                radius={
                                  metroArea.radius_unit === 'miles'
                                    ? metroArea.radius * 1609.34
                                    : metroArea.radius * 1000
                                } // Convert to meters
                                options={{
                                  fillColor: '#3B82F6',
                                  fillOpacity: 0.3,
                                  strokeColor: '#1D4ED8',
                                  strokeWeight: 3,
                                  clickable: false,
                                }}
                              />
                            )}

                            {/* Polygon for Advanced Area Selection */}
                            {metroArea.is_advance_area_select &&
                              polygonPoints.length >= 3 && (
                                <Polygon
                                  paths={polygonPoints}
                                  options={{
                                    fillColor: '#3B82F6',
                                    fillOpacity: 0.3,
                                    strokeColor: '#1D4ED8',
                                    strokeWeight: 3,
                                    clickable: false,
                                  }}
                                />
                              )}

                            {/* Polygon Point Markers for Advanced Area Selection */}
                            {metroArea.is_advance_area_select &&
                              polygonPoints.map((point, index) => (
                                <Marker
                                  key={index}
                                  position={point}
                                  icon={{
                                    url:
                                      'data:image/svg+xml;charset=UTF-8,' +
                                      encodeURIComponent(`
                                         <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                         <circle cx="6" cy="6" r="6" fill="#1D4ED8" stroke="white" stroke-width="2"/>
                                         <text x="6" y="8" text-anchor="middle" fill="white" font-size="8" font-family="Arial">${index + 1}</text>
                                         </svg>
                                     `),
                                    scaledSize: new google.maps.Size(12, 12),
                                  }}
                                  title={`Polygon Point ${index + 1}`}
                                />
                              ))}
                          </>
                        )}
                      </GoogleMap>
                    </div>

                    {!mapLoaded && (
                      <div className="flex items-center justify-center w-full h-full bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-500">Loading map...</p>
                        </div>
                      </div>
                    )}
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
