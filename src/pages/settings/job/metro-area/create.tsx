import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import {
  Loader2,
  MapPin,
  ArrowLeft,
  Building2,
  Palette,
  Shield,
} from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import {
  GoogleMap,
  Marker,
  StandaloneSearchBox,
  Polygon,
} from '@react-google-maps/api'
import { apiService } from '@/src/services/api'
import { usePermissions } from '@/src/hooks/usePermissions'

interface MetroAreaFormData {
  name: string
  zipcode: string
  radius: number
  radius_unit: string
  addressId: string
  latitude: number
  longitude: number
  text_color: string
  background_color: string
  is_advance_area_select: boolean
  polygon_coordinates?: google.maps.LatLngLiteral[]
}

interface MetroAreaFormErrors {
  name?: string
  zipcode?: string
  radius?: string
  latitude?: string
  longitude?: string
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
}

export default function CreateMetroAreaPage() {
  const router = useRouter()
  const { id } = router.query

  // Check if we're editing (id exists in URL)
  const isEditing = Boolean(id)

  const mapRef = useRef<google.maps.Map | null>(null)
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const { checkPermission } = usePermissions()

  const [formData, setFormData] = useState<MetroAreaFormData>({
    name: '',
    zipcode: '',
    radius: 5,
    radius_unit: 'miles',
    addressId: '',
    latitude: 0,
    longitude: 0,
    text_color: '#FFFFFF',
    background_color: '#FF5722',
    is_advance_area_select: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<MetroAreaFormErrors>({})
  const [mapLoaded, setMapLoaded] = useState(false)
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [polygonPoints, setPolygonPoints] = useState<
    google.maps.LatLngLiteral[]
  >([])
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false)
  const [diamondSize, setDiamondSize] = useState(5) // Default 5 miles
  const [markerBuffer, setMarkerBuffer] = useState<boolean>(false)

  // Fetch metro area data when editing
  useEffect(() => {
    const fetchMetroArea = async () => {
      if (isEditing && id && typeof id === 'string') {
        setIsLoading(true)
        try {
          const response = await apiService.get(`/v1/metro-areas/${id}`)
          const metroArea = response.data.data

          setFormData({
            name: metroArea.name,
            zipcode: metroArea.zipcode,
            radius: metroArea.radius,
            radius_unit: metroArea.radius_unit,
            addressId: metroArea.addressId,
            latitude: metroArea.latitude,
            longitude: metroArea.longitude,
            text_color: metroArea.text_color,
            background_color: metroArea.background_color,
            is_advance_area_select: metroArea.is_advance_area_select,
          })

          if (metroArea.is_advance_area_select) {
            setTimeout(() => {
              setMarkerBuffer(true)
            }, 1000)
          }

          // Set marker position
          setMarkerPosition({
            lat: metroArea.latitude,
            lng: metroArea.longitude,
          })

          // Set polygon points if they exist
          if (
            metroArea.polygon_coordinates &&
            metroArea.polygon_coordinates.length > 0
          ) {
            // Extract lat/lng from polygon coordinates (remove _id fields)
            const cleanPolygonPoints = metroArea.polygon_coordinates.map(
              (point: any) => ({
                lat: point.lat,
                lng: point.lng,
              })
            )
            setPolygonPoints(cleanPolygonPoints)
          } else {
            // Generate default diamond polygon
            const defaultDiamond = generateDefaultDiamond(
              { lat: metroArea.latitude, lng: metroArea.longitude },
              metroArea.radius || diamondSize
            )
            setPolygonPoints(defaultDiamond)
          }
        } catch (error: any) {
          console.error('Error fetching metro area:', error)
          toast.error(
            error.response?.data?.message || 'Failed to fetch metro area'
          )
          router.push('/settings/job/metro-area')
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchMetroArea()
  }, [isEditing, id, router])

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map
    setMapLoaded(true)
    console.log('Map loaded successfully')
  }

  const onSearchBoxLoad = (ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref
    console.log('Search box loaded successfully')
  }

  const onPlacesChanged = () => {
    if (!searchBoxRef.current) return
    const places = searchBoxRef.current.getPlaces()
    if (!places || places.length === 0) return
    const place = places[0]
    if (!place.geometry) return

    // Update map
    if (place.geometry.viewport && mapRef.current) {
      mapRef.current.fitBounds(place.geometry.viewport)
    } else if (place.geometry.location && mapRef.current) {
      mapRef.current.setCenter(place.geometry.location)
      mapRef.current.setZoom(17)
    }

    // Update marker position
    if (place.geometry.location) {
      const newPosition = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      }
      setMarkerPosition(newPosition)

      // Update form data with new coordinates
      setFormData(prev => ({
        ...prev,
        latitude: newPosition.lat,
        longitude: newPosition.lng,
        addressId: place.place_id || '',
      }))

      // Generate default diamond polygon around the marker
      const defaultDiamond = generateDefaultDiamond(newPosition, diamondSize)
      setPolygonPoints(defaultDiamond)

      // Populate address fields
      populateAddressFields(place)
    }
  }

  const onMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      if (isDrawingPolygon) {
        // Add point to polygon
        addPolygonPoint(event.latLng)
      } else {
        // Set single marker (existing behavior)
        const newPosition = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        }

        setMarkerPosition(newPosition)

        // Update form data with new coordinates (this is the reference point)
        setFormData(prev => ({
          ...prev,
          latitude: newPosition.lat,
          longitude: newPosition.lng,
        }))

        // Generate default diamond polygon around the marker
        const defaultDiamond = generateDefaultDiamond(newPosition, diamondSize)
        setPolygonPoints(defaultDiamond)

        // Reverse geocode the clicked location to get addressId
        reverseGeocode(event.latLng)
      }
    }
  }

  const onMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      }
      setMarkerPosition(newPosition)

      // Update form data with new coordinates
      setFormData(prev => ({
        ...prev,
        latitude: newPosition.lat,
        longitude: newPosition.lng,
      }))

      // Regenerate diamond polygon around the new marker position
      const defaultDiamond = generateDefaultDiamond(newPosition, diamondSize)
      setPolygonPoints(defaultDiamond)

      // Reverse geocode the dragged location
      reverseGeocode(event.latLng)
    }
  }

  const onMapDoubleClick = (event: google.maps.MapMouseEvent) => {
    if (isDrawingPolygon && event.latLng) {
      // Add the final point and stop drawing
      addPolygonPoint(event.latLng)
      stopPolygonDrawing()
    }
  }

  const populateAddressFields = (place: google.maps.places.PlaceResult) => {
    if (!place.address_components) return

    let addressComponents = {
      postal_code: '',
    }

    place.address_components.forEach(component => {
      const types = component.types
      if (types.includes('postal_code')) {
        addressComponents.postal_code = component.long_name
      }
    })

    setFormData(prev => ({
      ...prev,
      zipcode: addressComponents.postal_code || '',
      addressId: place.place_id || '',
      latitude: place.geometry?.location?.lat() || 0,
      longitude: place.geometry?.location?.lng() || 0,
    }))
  }

  const reverseGeocode = (latLng: google.maps.LatLng) => {
    if (!window.google?.maps) return

    const geocoder = new window.google.maps.Geocoder()

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        populateAddressFields(results[0])
      }
    })
  }

  const startPolygonDrawing = () => {
    setIsDrawingPolygon(true)
    setPolygonPoints([])
    // Keep the marker position and form data coordinates unchanged
    // They represent the reference point, not the polygon points
    toast.info(
      'Click on the map to add polygon points. Double-click to finish.'
    )
  }

  const stopPolygonDrawing = () => {
    setIsDrawingPolygon(false)
    if (polygonPoints.length >= 3) {
      toast.success('Polygon created successfully!')
    } else {
      setPolygonPoints([])
      toast.error('Polygon must have at least 3 points')
    }
  }

  const addPolygonPoint = (latLng: google.maps.LatLng) => {
    if (!isDrawingPolygon) return

    const newPoint = { lat: latLng.lat(), lng: latLng.lng() }
    setPolygonPoints(prev => [...prev, newPoint])

    // Don't update form data coordinates when adding polygon points
    // The form data coordinates should remain as the marker position
  }

  // Generate a diamond-shaped polygon around a center point
  const generateDefaultDiamond = (
    center: { lat: number; lng: number },
    sizeInMiles: number = 5
  ) => {
    // Convert miles to degrees (approximate)
    // 1 degree of latitude ≈ 69 miles
    // 1 degree of longitude ≈ 69 * cos(latitude) miles
    const latDelta = sizeInMiles / 69
    const lngDelta = sizeInMiles / (69 * Math.cos((center.lat * Math.PI) / 180))

    const points = [
      { lat: center.lat + latDelta, lng: center.lng }, // North
      { lat: center.lat, lng: center.lng + lngDelta }, // East
      { lat: center.lat - latDelta, lng: center.lng }, // South
      { lat: center.lat, lng: center.lng - lngDelta }, // West
    ]

    return points
  }

  const clearPolygon = () => {
    setPolygonPoints([])
    // Keep the marker position and form data coordinates unchanged
    // They represent the reference point, not the polygon points
  }

  const calculatePolygonCenter = (points: google.maps.LatLngLiteral[]) => {
    if (points.length === 0) return null

    const center = points.reduce(
      (acc, point) => ({
        lat: acc.lat + point.lat,
        lng: acc.lng + point.lng,
      }),
      { lat: 0, lng: 0 }
    )

    return {
      lat: center.lat / points.length,
      lng: center.lng / points.length,
    }
  }

  const handleInputChange = (
    field: keyof MetroAreaFormData,
    value: string | number | boolean
  ) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }

      // If Advanced Area Select is enabled, automatically set radius to 0
      if (field === 'is_advance_area_select' && value === true) {
        newData.radius = 0
        if (isEditing) {
          setTimeout(() => {
            setMarkerBuffer(true)
          }, 1000)
        }
      }

      return newData
    })

    // Only clear errors for fields that can have errors
    if (field === 'name' && errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }))
    } else if (field === 'zipcode' && errors.zipcode) {
      setErrors(prev => ({ ...prev, zipcode: undefined }))
    } else if (field === 'radius' && errors.radius) {
      setErrors(prev => ({ ...prev, radius: undefined }))
    } else if (field === 'latitude' && errors.latitude) {
      setErrors(prev => ({ ...prev, latitude: undefined }))
    } else if (field === 'longitude' && errors.longitude) {
      setErrors(prev => ({ ...prev, longitude: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: MetroAreaFormErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Metro area name is required'
    if (!formData.zipcode.trim()) newErrors.zipcode = 'Zipcode is required'

    // Only validate radius when Advanced Area Select is false
    if (!formData.is_advance_area_select && formData.radius <= 0) {
      newErrors.radius = 'Radius must be greater than 0'
    }

    // Only validate coordinates when Advanced Area Select is true
    if (
      formData.is_advance_area_select &&
      formData.latitude === 0 &&
      formData.longitude === 0
    ) {
      newErrors.latitude = 'Please select a location on the map'
    }

    // Validate polygon when Advanced Area Select is true
    if (formData.is_advance_area_select) {
      if (polygonPoints.length === 0) {
        newErrors.latitude =
          'Please place a marker on the map to create a metro area'
      } else if (polygonPoints.length < 3) {
        newErrors.latitude = 'Polygon must have at least 3 points to be valid'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      let payload: any = {
        name: formData.name,
        zipcode: formData.zipcode,
        addressId: formData.addressId,
        latitude: formData.latitude,
        longitude: formData.longitude,
        text_color: formData.text_color,
        background_color: formData.background_color,
        is_advance_area_select: formData.is_advance_area_select,
      }

      // Include polygon points if they exist and advanced area select is enabled
      if (formData.is_advance_area_select && polygonPoints.length >= 3) {
        payload.polygon_coordinates = polygonPoints
      }

      if (!formData.is_advance_area_select) {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${formData.zipcode}&components=country:US&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_SERVER_SIDE_API_KEY}`
        )

        if (response.data.results.length > 0) {
          payload.latitude = response.data.results[0].geometry.location.lat
          payload.longitude = response.data.results[0].geometry.location.lng
          payload.addressId = response.data.results[0].place_id
        } else {
          toast.error('Invalid zipcode')
          return
        }
      }

      // Set radius based on mode
      if (formData.is_advance_area_select) {
        payload.radius = 0
        payload.radius_unit = 'miles'
      } else {
        payload.radius = formData.radius
        payload.radius_unit = formData.radius_unit
      }

      console.log(
        `${isEditing ? 'Updating' : 'Creating'} metro area with payload:`,
        payload
      )

      if (isEditing && id) {
        if (payload.is_advance_area_select) {
          payload.radius = 0
        }
        await apiService.put(`/v1/metro-areas/${id}`, payload)
        toast.success('Metro area updated successfully!')
      } else {
        await apiService.post('/v1/metro-areas', payload)
        toast.success('Metro area created successfully!')
      }

      // Redirect to metro areas list
      router.push('/settings/job/metro-area')
    } catch (error: any) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} metro area:`,
        error
      )
      toast.error(
        error.response?.data?.error ||
          `Failed to ${isEditing ? 'update' : 'create'} metro area. Please try again.`
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Check permission to access this page
  if (!isEditing && !checkPermission('MOD029', 'create')) {
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
            You don't have permission to create metro areas.
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

  if (isEditing && !checkPermission('MOD029', 'edit')) {
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
            You don't have permission to edit metro areas.
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
        <title>
          {isEditing ? 'Edit Metro Area' : 'Create Metro Area'} - WePro
        </title>
        <meta
          name="description"
          content={
            isEditing ? 'Edit metro area details' : 'Create a new metro area'
          }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEditing ? 'Edit Metro Area' : 'Create New Metro Area'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="flex flex-col space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Metro Area Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Metro Area Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      placeholder="Enter metro area name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Zipcode */}
                  <div className="space-y-2">
                    <Label htmlFor="zipcode">Zipcode *</Label>
                    <Input
                      id="zipcode"
                      value={formData.zipcode}
                      onChange={e =>
                        handleInputChange('zipcode', e.target.value)
                      }
                      placeholder="Enter zipcode"
                      disabled={formData.is_advance_area_select}
                      className={`${errors.zipcode ? 'border-red-500' : ''} ${
                        formData.is_advance_area_select
                          ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
                          : ''
                      }`}
                    />
                    {formData.is_advance_area_select && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Zipcode will be automatically populated from map
                        selection
                      </p>
                    )}
                    {errors.zipcode && (
                      <p className="text-sm text-red-500">{errors.zipcode}</p>
                    )}
                  </div>

                  {/* Radius - Only show when Advanced Area Select is false */}
                  {!formData.is_advance_area_select && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="radius">Radius *</Label>
                        <Input
                          id="radius"
                          type="number"
                          min="1"
                          value={formData.radius}
                          onChange={e =>
                            handleInputChange(
                              'radius',
                              parseInt(e.target.value)
                            )
                          }
                          placeholder="25"
                          className={errors.radius ? 'border-red-500' : ''}
                        />
                        {errors.radius && (
                          <p className="text-sm text-red-500">
                            {errors.radius}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="radius_unit">Unit</Label>
                        <select
                          id="radius_unit"
                          value={formData.radius_unit}
                          onChange={e =>
                            handleInputChange('radius_unit', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="miles">Miles</option>
                          <option value="kilometers">Kilometers</option>
                        </select>
                      </div>
                    </div>
                  )}
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
                <CardContent className="space-y-6">
                  {/* Background Color */}
                  <div className="space-y-2">
                    <Label htmlFor="background_color">Background Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="background_color"
                        type="color"
                        value={formData.background_color}
                        onChange={e =>
                          handleInputChange('background_color', e.target.value)
                        }
                        className="w-16 h-10 p-1 border border-gray-300 rounded-md"
                      />
                      <Input
                        value={formData.background_color}
                        onChange={e =>
                          handleInputChange('background_color', e.target.value)
                        }
                        placeholder="#FF5722"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="space-y-2">
                    <Label htmlFor="text_color">Text Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="text_color"
                        type="color"
                        value={formData.text_color}
                        onChange={e =>
                          handleInputChange('text_color', e.target.value)
                        }
                        className="w-16 h-10 p-1 border border-gray-300 rounded-md"
                      />
                      <Input
                        value={formData.text_color}
                        onChange={e =>
                          handleInputChange('text_color', e.target.value)
                        }
                        placeholder="#FFFFFF"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Advanced Area Select */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_advance_area_select">
                        Advanced Area Select
                      </Label>
                      <Switch
                        id="is_advance_area_select"
                        checked={formData.is_advance_area_select}
                        onCheckedChange={checked =>
                          handleInputChange('is_advance_area_select', checked)
                        }
                      />
                    </div>
                    {formData.is_advance_area_select && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Advanced mode enabled: Use the map to precisely select
                        your metro area location. Radius settings will be hidden
                        as they're not needed in this mode.
                      </p>
                    )}
                    {!formData.is_advance_area_select && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Standard mode: Define metro area using zipcode and
                        radius. Map selection will be hidden.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Hidden fields for coordinates and address ID */}
              <input type="hidden" value={formData.latitude} />
              <input type="hidden" value={formData.longitude} />
              <input type="hidden" value={formData.addressId} />
            </div>

            {/* Right Column - Google Map or Placeholder */}
            {formData.is_advance_area_select ? (
              <div className="flex flex-col">
                <Card className="flex-1 flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0">
                    <div className="h-full flex flex-col">
                      <div className="p-4 pb-2">
                        <Alert>
                          <MapPin className="h-4 w-4" />
                          <AlertDescription>
                            Click on the map to place a marker. Then, select
                            'Draw Polygon' to begin outlining your area.
                          </AlertDescription>
                        </Alert>
                      </div>

                      <div className="flex-1 flex-col flex px-4 pb-4">
                        {/* Search Box */}
                        <StandaloneSearchBox
                          onLoad={onSearchBoxLoad}
                          onPlacesChanged={onPlacesChanged}
                        >
                          <input
                            type="text"
                            placeholder="Search for a location..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                          />
                        </StandaloneSearchBox>

                        {/* Polygon Drawing Controls */}
                        <div className="flex gap-2 mb-4">
                          {!isDrawingPolygon && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={startPolygonDrawing}
                              className="text-sm"
                              disabled={
                                formData.latitude === 0 ||
                                formData.longitude === 0
                              }
                            >
                              Draw Polygon
                            </Button>
                          )}

                          {/* Cancel button when drawing */}
                          {isDrawingPolygon && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsDrawingPolygon(false)
                                // Restore the default diamond polygon when cancelling
                                if (
                                  formData.latitude !== 0 &&
                                  formData.longitude !== 0
                                ) {
                                  const defaultDiamond = generateDefaultDiamond(
                                    {
                                      lat: formData.latitude,
                                      lng: formData.longitude,
                                    },
                                    diamondSize
                                  )
                                  setPolygonPoints(defaultDiamond)
                                }
                                toast.info(
                                  'Polygon drawing cancelled, restored default diamond'
                                )
                              }}
                              className="text-sm text-orange-600 border-orange-200 hover:bg-orange-50"
                            >
                              Cancel Drawing
                            </Button>
                          )}

                          {polygonPoints.length > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={stopPolygonDrawing}
                              disabled={!isDrawingPolygon}
                              className="text-sm"
                            >
                              Finish Polygon
                            </Button>
                          )}

                          {/* Diamond Size Control */}
                          {formData.latitude !== 0 &&
                            formData.longitude !== 0 &&
                            !isDrawingPolygon && (
                              <div className="flex items-center gap-2 ml-auto">
                                <Label
                                  htmlFor="diamondSize"
                                  className="text-xs text-gray-600"
                                >
                                  Diamond Size (miles):
                                </Label>
                                <Input
                                  id="diamondSize"
                                  type="number"
                                  min="1"
                                  max="50"
                                  value={diamondSize}
                                  className="w-16 h-8 text-xs"
                                  onChange={e => {
                                    const size = parseInt(e.target.value) || 5
                                    setDiamondSize(size)
                                    if (
                                      formData.latitude !== 0 &&
                                      formData.longitude !== 0
                                    ) {
                                      const newDiamond = generateDefaultDiamond(
                                        {
                                          lat: formData.latitude,
                                          lng: formData.longitude,
                                        },
                                        size
                                      )
                                      setPolygonPoints(newDiamond)
                                    }
                                  }}
                                />
                              </div>
                            )}
                        </div>

                        <div className="w-full grow">
                          <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={
                              !isEditing
                                ? defaultCenter
                                : markerPosition
                                  ? markerPosition
                                  : defaultCenter
                            }
                            zoom={11}
                            onLoad={onMapLoad}
                            onClick={onMapClick}
                            onDblClick={onMapDoubleClick}
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
                            {/* Marker */}
                            {((markerPosition && !isEditing) ||
                              (markerPosition &&
                                isEditing &&
                                markerBuffer)) && (
                              <Marker
                                position={markerPosition}
                                draggable={true}
                                onDragEnd={onMarkerDragEnd}
                                title="Drag to set location"
                                animation={google.maps.Animation.DROP}
                              />
                            )}

                            {/* Polygon */}
                            {((polygonPoints.length >= 1 && !isEditing) ||
                              (polygonPoints.length >= 1 &&
                                isEditing &&
                                markerBuffer)) && (
                              <Polygon
                                paths={polygonPoints}
                                options={{
                                  fillColor: '#3B82F6',
                                  fillOpacity: 0.3,
                                  strokeColor: '#1D4ED8',
                                  strokeWeight: 2,
                                  clickable: false,
                                }}
                              />
                            )}

                            {/* Polygon Point Markers */}
                            {(!isEditing || (isEditing && markerBuffer)) && (
                              <>
                                {polygonPoints.map((point, index) => (
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
                                    title={`Point ${index + 1}`}
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
            ) : (
              <div className="flex flex-col">
                <Card className="flex-1 flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Standard Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Standard Metro Area Mode
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-sm">
                          You're currently in standard mode. Use the zipcode and
                          radius fields on the left to define your metro area.
                          Switch to Advanced Area Select to use the interactive
                          map for precise location selection.
                        </p>
                      </div>
                      <div className="pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleInputChange('is_advance_area_select', true)
                          }
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                        >
                          Enable Advanced Mode
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                (formData.is_advance_area_select &&
                  (formData.latitude === 0 || formData.longitude === 0))
              }
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditing ? (
                'Update Metro Area'
              ) : (
                'Create Metro Area'
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
