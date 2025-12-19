import { useState, useRef, useEffect } from 'react'
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
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Loader2, MapPin, ArrowLeft, Building2, Shield } from 'lucide-react'
import { toast as toastSonner } from 'sonner'
import { toast } from '@/src/components/ui/use-toast'
import { GoogleMap, Marker, StandaloneSearchBox } from '@react-google-maps/api'
import { apiService } from '@/src/services/api'
import { usePermissions } from '@/src/hooks/usePermissions'
interface FranchiseFormData {
  name: string
  ownerName: string
  status: string
  weproUsername: string
  email: string
  phoneNumber: string
  address: string
  addressLine2: string
  city: string
  state: string
  zipCode: string
  country: string
  addressId: string
  lat: string
  lng: string
}

interface FranchiseResponse {
  success: boolean
  message: string
  data: {
    _id: string
    name: string
    ownerName: string
    status: string
    weproUsername: string
    isPrimary: boolean
    email: string
    phoneNumber: string
    address: string
    addressLine2: string
    city: string
    state: string
    zipCode: string
    country: string
    addressId: string
    lat: number
    lng: number
    code: string
    createdBy: {
      _id: string
      name: string
      username: string
    }
    tenantId: {
      _id: string
      name: string
      username: string
    }
    createdAt: string
    updatedAt: string
  }
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
}

export default function CreateFranchisePage() {
  const router = useRouter()
  const { id } = router.query
  const isEditMode = Boolean(id)
  const { checkPermission } = usePermissions()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const mapRef = useRef<google.maps.Map | null>(null)
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const searchBoxFallbackRef = useRef<HTMLDivElement | null>(null)

  const [formData, setFormData] = useState<FranchiseFormData>({
    name: '',
    ownerName: '',
    status: 'Active',
    weproUsername: '',
    email: '',
    phoneNumber: '',
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    addressId: '',
    lat: '',
    lng: '',
  })

  const [bufferTest, setBufferTest] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [errors, setErrors] = useState<Partial<FranchiseFormData>>({})
  const [mapLoaded, setMapLoaded] = useState(false)
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)

  // Fetch existing franchise data if editing
  useEffect(() => {
    if (isEditMode && id && typeof id === 'string') {
      fetchFranchiseData(id)
    }
    setTimeout(() => {
      setBufferTest(true)
    }, 1000)
  }, [isEditMode, id])

  // Debug effect to log marker position changes
  useEffect(() => {
    console.log('Marker position changed:', markerPosition)
  }, [markerPosition])

  const fetchFranchiseData = async (franchiseId: string) => {
    setIsFetching(true)
    try {
      const response = await apiService.get<FranchiseResponse>(
        `/v1/franchises/${franchiseId}`
      )

      if (response.data.success) {
        const franchise = response.data.data

        // Populate form data
        setFormData({
          name: franchise.name || '',
          ownerName: franchise.ownerName || '',
          status: franchise.status || 'Active',
          weproUsername: franchise.weproUsername || '',
          email: franchise.email || '',
          phoneNumber: franchise.phoneNumber || '',
          address: franchise.address || '',
          addressLine2: franchise.addressLine2 || '',
          city: franchise.city || '',
          state: franchise.state || '',
          zipCode: franchise.zipCode || '',
          country: franchise.country || '',
          addressId: franchise.addressId || '',
          lat: franchise.lat?.toString() || '',
          lng: franchise.lng?.toString() || '',
        })

        // Set marker position if coordinates exist
        if (franchise.lat && franchise.lng) {
          const newPosition = {
            lat: franchise.lat,
            lng: franchise.lng,
          }
          setMarkerPosition(newPosition)

          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.panTo(newPosition)
              mapRef.current.setZoom(15)
            }
          }, 500)
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch franchise data. Please try again.',
          variant: 'destructive',
        })
        router.push('/settings/company/franchises')
      }
    } catch (error) {
      console.error('Error fetching franchise data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch franchise data. Please try again.',
        variant: 'destructive',
      })
      router.push('/settings/company/franchises')
    } finally {
      setIsFetching(false)
    }
  }

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map
    setMapLoaded(true)
    console.log('Map loaded successfully')
    console.log('Google Maps API available:', !!window.google?.maps)
    console.log('Map instance:', map)
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
        lat: newPosition.lat.toString(),
        lng: newPosition.lng.toString(),
      }))

      // Populate address fields
      populateAddressFields(place)
    }
  }

  const onMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      }
      console.log('Map clicked, setting marker position:', newPosition)
      console.log('Current markerPosition state before update:', markerPosition)

      setMarkerPosition(newPosition)

      // Update form data with new coordinates
      setFormData(prev => ({
        ...prev,
        lat: newPosition.lat.toString(),
        lng: newPosition.lng.toString(),
      }))

      // Reverse geocode the clicked location
      reverseGeocode(event.latLng)
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
        lat: newPosition.lat.toString(),
        lng: newPosition.lng.toString(),
      }))

      // Reverse geocode the dragged location
      reverseGeocode(event.latLng)
    }
  }

  const populateAddressFields = (place: google.maps.places.PlaceResult) => {
    if (!place.address_components) return

    let addressComponents = {
      street_number: '',
      route: '',
      subpremise: '',
      locality: '',
      administrative_area_level_1: '',
      postal_code: '',
      country: '',
      place_id: '',
    }

    place.address_components.forEach(component => {
      const types = component.types
      if (types.includes('street_number')) {
        addressComponents.street_number = component.long_name
      } else if (types.includes('route')) {
        addressComponents.route = component.long_name
      } else if (types.includes('subpremise')) {
        addressComponents.subpremise = component.long_name
      } else if (types.includes('locality')) {
        addressComponents.locality = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        addressComponents.administrative_area_level_1 = component.short_name
      } else if (types.includes('postal_code')) {
        addressComponents.postal_code = component.long_name
      } else if (types.includes('country')) {
        addressComponents.country = component.long_name
      }
    })

    const address =
      `${addressComponents.street_number} ${addressComponents.route}`.trim()
    const addressLine2 = addressComponents.subpremise || ''

    setFormData(prev => ({
      ...prev,
      address: address || place?.formatted_address || '',
      addressLine2: addressLine2,
      city: addressComponents.locality || '',
      state: addressComponents.administrative_area_level_1 || '',
      zipCode: addressComponents.postal_code || '',
      country: addressComponents.country || '',
      addressId: place.place_id || '',
      lat: place.geometry?.location?.lat().toString() || '',
      lng: place.geometry?.location?.lng().toString() || '',
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

  const handleInputChange = (field: keyof FranchiseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FranchiseFormData> = {}

    if (!formData.name.trim()) newErrors.name = 'Franchise name is required'
    if (!formData.ownerName.trim())
      newErrors.ownerName = 'Owner name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = 'Phone number is required'
    if (!formData.weproUsername.trim())
      newErrors.weproUsername = 'Username is required'
    if (!formData.lat.trim() || !formData.lng.trim()) {
      newErrors.lat = 'Please select a location on the map'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone number validation
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
        newErrors.phoneNumber = 'Please enter a valid phone number'
      }
    }

    // Username validation
    if (formData.weproUsername && formData.weproUsername.trim()) {
      if (formData.weproUsername.length < 3) {
        newErrors.weproUsername = 'Username must be at least 3 characters long'
      } else if (formData.weproUsername.length > 50) {
        newErrors.weproUsername =
          'Username must be no more than 50 characters long'
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
      let response

      if (isEditMode && id && typeof id === 'string') {
        // Update existing franchise
        console.log('Updating franchise with ID:', id)
        console.log('Update payload:', formData)

        response = await apiService.put(`/v1/franchises/${id}`, formData)

        toast({
          title: 'Success!',
          description: 'Franchise updated successfully.',
        })
      } else {
        // Create new franchise
        console.log('Creating new franchise')
        console.log('Create payload:', formData)

        response = await apiService.post('/v1/franchises', formData)

        toast({
          title: 'Success!',
          description: 'Franchise created successfully.',
        })
      }

      // Redirect to franchises list
      router.push('/settings/company/franchises')
    } catch (error) {
      console.error(
        `Error ${isEditMode ? 'updating' : 'creating'} franchise:`,
        error
      )
      toastSonner.error(`Failed to ${isEditMode ? 'update' : 'create'} franchise. Please try again.`, {
        description:
          error.response?.data?.details?.[0]?.message ||
          error.response?.data?.message ||
          error.response?.data?.error ||
          'An error occurred while saving the changes.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check permission for create mode
  if (!isEditMode && !checkPermission('MOD027', 'create')) {
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

  // Check permission for edit mode
  if (isEditMode && !checkPermission('MOD027', 'edit')) {
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
          {isEditMode ? 'Edit Franchise' : 'Create Franchise'} - WePro
        </title>
        <meta
          name="description"
          content={
            isEditMode
              ? 'Edit company franchise'
              : 'Create a new company franchise'
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
            Back to Franchises
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEditMode ? 'Edit Franchise' : 'Create New Franchise'}
          </h1>
        </div>

        {/* Form */}
        {isFetching ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading franchise data...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="flex flex-col">
                {/* Basic Information */}
                <Card className="flex-1 flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1">
                    {/* Franchise Name - Full Width */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Franchise Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={e =>
                          handleInputChange('name', e.target.value)
                        }
                        placeholder="Enter franchise name"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    {/* Owner Name - Full Width */}
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Owner Name *</Label>
                      <Input
                        id="ownerName"
                        value={formData.ownerName}
                        onChange={e =>
                          handleInputChange('ownerName', e.target.value)
                        }
                        placeholder="Enter owner name"
                        className={errors.ownerName ? 'border-red-500' : ''}
                      />
                      {errors.ownerName && (
                        <p className="text-sm text-red-500">
                          {errors.ownerName}
                        </p>
                      )}
                    </div>

                    {/* Username and Email - Two Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weproUsername">Username *</Label>
                        <Input
                          id="weproUsername"
                          value={formData.weproUsername}
                          onChange={e =>
                            handleInputChange('weproUsername', e.target.value)
                          }
                          placeholder="Enter username (3-50 characters)"
                          className={
                            errors.weproUsername ? 'border-red-500' : ''
                          }
                        />
                        {errors.weproUsername && (
                          <p className="text-sm text-red-500">
                            {errors.weproUsername}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={e =>
                            handleInputChange('email', e.target.value)
                          }
                          placeholder="Enter email address"
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Phone Number - Full Width */}
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={e =>
                          handleInputChange('phoneNumber', e.target.value)
                        }
                        placeholder="Enter phone number"
                        className={errors.phoneNumber ? 'border-red-500' : ''}
                      />
                      {errors.phoneNumber && (
                        <p className="text-sm text-red-500">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>

                    {/* Status - Full Width at Bottom */}
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="status"
                          checked={formData.status === 'Active'}
                          onCheckedChange={checked =>
                            handleInputChange(
                              'status',
                              checked ? 'Active' : 'Inactive'
                            )
                          }
                        />
                        <Label htmlFor="status" className="text-sm font-normal">
                          {formData.status === 'Active' ? 'Active' : 'Inactive'}
                        </Label>
                      </div>
                    </div>

                    {/* Location Details - Integrated into Basic Information */}
                    <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Location Details *
                        </span>
                      </div>

                      <div
                        className={`rounded-lg p-3 space-y-2 text-sm border ${
                          errors.lat
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            Address:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {formData.address || '--'}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            Address Line 2:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {formData.addressLine2 || '--'}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            City:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {formData.city || '--'}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            State:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {formData.state || '--'}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            ZIP:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {formData.zipCode || '--'}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            Country:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {formData.country || '--'}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-blue-200 dark:border-blue-800/30">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                              Coordinates:
                            </span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {formData.lat && formData.lng
                                ? `${parseFloat(formData.lat).toFixed(4)}, ${parseFloat(formData.lng).toFixed(4)}`
                                : '--'}
                            </span>
                          </div>
                        </div>

                        {/* Hidden fields for coordinates and address ID */}
                        <input type="hidden" value={formData.lat} />
                        <input type="hidden" value={formData.lng} />
                        <input type="hidden" value={formData.addressId} />
                      </div>

                      {errors.lat && (
                        <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                          {errors.lat}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Google Map */}
              <div className="flex flex-col">
                <Card className="flex-1 flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location Selection *
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0">
                    <div className="h-full flex flex-col">
                      <div className="p-4 pb-2">
                        <Alert
                          className={
                            errors.lat ? 'border-red-200 bg-red-50' : ''
                          }
                        >
                          <MapPin className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Required:</strong> Use the search box on the
                            map to find a location, or click on the map to set a
                            marker. The address fields will be automatically
                            populated based on your selection.
                          </AlertDescription>
                        </Alert>
                      </div>

                      <div className="flex-1 flex-col flex px-4 pb-4">
                        {/* Search Box - Now has access to Google Maps API from global LoadScript */}
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

                        <div className="w-full grow">
                          <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={defaultCenter}
                            zoom={13}
                            onLoad={onMapLoad}
                            onClick={onMapClick}
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
                            {/* Marker - Always show when markerPosition is set */}
                            {bufferTest && markerPosition && (
                              <Marker
                                position={markerPosition}
                                draggable={true}
                                onDragEnd={onMarkerDragEnd}
                                title="Drag to set location"
                                animation={google.maps.Animation.DROP}
                              />
                            )}
                          </GoogleMap>
                        </div>

                        {!mapLoaded && (
                          <div className="flex items-center justify-center w-full h-full bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
                            <div className="text-center">
                              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400 dark:text-neutral-500" />
                              <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading || isFetching}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isFetching}
                className="min-w-[120px] text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : isEditMode ? (
                  'Update Franchise'
                ) : (
                  'Create Franchise'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
