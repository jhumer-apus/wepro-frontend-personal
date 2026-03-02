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
import {
  Loader2,
  MapPin,
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Map,
  Shield,
} from 'lucide-react'
import { toast as toastSonner } from 'sonner'
import { toast } from '@/src/components/ui/use-toast'
import { GoogleMap, Marker, StandaloneSearchBox } from '@react-google-maps/api'
import { apiService } from '@/src/services/api'
import { usePermissions } from '@/src/hooks/usePermissions'

interface CompanyProfileFormData {
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
  latitude: string
  longitude: string
}

interface CompanyProfileResponse {
  success: boolean
  message: string
  data: {
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
    addressId?: string
    addressLine2?: string
    city?: string
    country?: string
    email?: string
    lat?: number
    lng?: number
    phoneNumber?: string
    state?: string
    weproUsername?: string
    zipCode?: string
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

export default function EditCompanyProfilePage() {
  const router = useRouter()

  const mapRef = useRef<google.maps.Map | null>(null)
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const { checkPermission } = usePermissions()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [formData, setFormData] = useState<CompanyProfileFormData>({
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
    latitude: '',
    longitude: '',
  })

  const [markerBuffer, setMarkerBuffer] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [errors, setErrors] = useState<Partial<CompanyProfileFormData>>({})
  const [mapLoaded, setMapLoaded] = useState(false)
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)

  // Fetch existing company profile data
  useEffect(() => {
    fetchCompanyProfile()
    setTimeout(() => {
      setMarkerBuffer(true)
    }, 1000)
  }, [])

  const fetchCompanyProfile = async () => {
    setIsFetching(true)
    try {
      const response = await apiService.get<CompanyProfileResponse>(
        '/v3/company-profile'
      )

      if (response.data.success) {
        const profile = response.data.data

        // Populate form data with all available fields from API
        setFormData({
          name: profile.name || '',
          ownerName: profile.ownerName || '',
          status: profile.status || 'Active',
          weproUsername:
            profile.weproUsername || profile.tenantId?.username || '',
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || '',
          address: profile.address || '',
          addressLine2: profile.addressLine2 || '',
          city: profile.city || '',
          state: profile.state || '',
          zipCode: profile.zipCode || '',
          country: profile.country || '',
          addressId: profile.addressId || '',
          latitude: profile.lat ? profile.lat.toString() : '',
          longitude: profile.lng ? profile.lng.toString() : '',
        })

        // Set marker position if coordinates exist
        if (profile.lat && profile.lng) {
          const newPosition = {
            lat: profile.lat,
            lng: profile.lng,
          }
          setMarkerPosition(newPosition)

          // Pan map to the location after a short delay to ensure map is loaded
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
          description:
            'Failed to fetch company profile data. Please try again.',
          variant: 'destructive',
        })
        router.push('/settings/company/profile')
      }
    } catch (error) {
      console.error('Error fetching company profile data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch company profile data. Please try again.',
        variant: 'destructive',
      })
      router.push('/settings/company/profile')
    } finally {
      setIsFetching(false)
    }
  }

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
    if (searchBoxRef.current) {
      const places = searchBoxRef.current.getPlaces()
      if (places && places.length > 0) {
        const place = places[0]
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()

          setMarkerPosition({ lat, lng })

          // Update map center
          if (mapRef.current) {
            mapRef.current.panTo({ lat, lng })
            mapRef.current.setZoom(15)
          }

          // Populate address fields
          populateAddressFields(place)
        }
      }
    }
  }

  const onMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()

      setMarkerPosition({ lat, lng })

      // Reverse geocode to get address
      reverseGeocode(lat, lng)
    }
  }

  const onMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()

      setMarkerPosition({ lat, lng })

      // Reverse geocode to get address
      reverseGeocode(lat, lng)
    }
  }

  const reverseGeocode = (lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        populateAddressFields(results[0])
      }
    })
  }

  const populateAddressFields = (
    place: google.maps.GeocoderResult | google.maps.places.PlaceResult
  ) => {
    if (!place.address_components) return

    let streetNumber = ''
    let route = ''
    let locality = ''
    let administrativeAreaLevel1 = ''
    let postalCode = ''
    let country = ''

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
      latitude: place.geometry?.location?.lat().toString() || '',
      longitude: place.geometry?.location?.lng().toString() || '',
    }))
  }

  const handleInputChange = (
    field: keyof CompanyProfileFormData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CompanyProfileFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required'
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required'
    }

    if (!formData.status) {
      newErrors.status = 'Status is required'
    }

    if (!formData.weproUsername.trim()) {
      newErrors.weproUsername = 'Wepro username is required'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Prepare the payload for the API with correct field names
      const payload: any = {
        name: formData.name,
        ownerName: formData.ownerName,
        status: formData.status,
        weproUsername: formData.weproUsername,
        address: formData.address,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        addressId: formData.addressId,
        lat: formData.latitude ? parseFloat(formData.latitude) : undefined,
        lng: formData.longitude ? parseFloat(formData.longitude) : undefined,
      }

      // Only include email and phoneNumber if they have values
      if (formData.email.trim()) {
        payload.email = formData.email.trim()
      }
      if (formData.phoneNumber.trim()) {
        payload.phone = formData.phoneNumber.trim()
      }

      // Make the actual API call
      const response = await apiService.put('/v3/company-profile', payload)

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Company profile updated successfully!',
        })

        // Redirect back to profile page
        router.push('/settings/company/profile')
      } else {
        toast({
          title: 'Error',
          description:
            response.data.message ||
            'Failed to update company profile. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      console.error('Error updating company profile:', error)
      toastSonner.error('Failed to save changes', {
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

  if (!checkPermission('MOD028', 'edit')) {
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
        <title>Edit Company Profile - WePro</title>
        <meta name="description" content="Edit company profile information" />
      </Head>

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Company Profile
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Edit Company Profile
          </h1>
        </div>

        {/* Form */}
        {isFetching ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading company profile data...</p>
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
                    {/* Company Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={e =>
                          handleInputChange('name', e.target.value)
                        }
                        placeholder="Enter company name"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    {/* Owner Name */}
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

                    {/* Wepro Username */}
                    <div className="space-y-2">
                      <Label htmlFor="weproUsername">Wepro Username *</Label>
                      <Input
                        id="weproUsername"
                        value={formData.weproUsername}
                        onChange={e =>
                          handleInputChange('weproUsername', e.target.value)
                        }
                        placeholder="Enter Wepro username"
                        className={errors.weproUsername ? 'border-red-500' : ''}
                      />
                      {errors.weproUsername && (
                        <p className="text-sm text-red-500">
                          {errors.weproUsername}
                        </p>
                      )}
                    </div>

                    {/* Email and Phone - Two Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
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

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={e =>
                            handleInputChange('phoneNumber', e.target.value)
                          }
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    {/* Status - Moved to bottom */}
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
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
                      {errors.status && (
                        <p className="text-sm text-red-500">{errors.status}</p>
                      )}
                    </div>

                    {/* Location Details - Integrated into Basic Information */}
                    <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Location Details
                        </span>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 space-y-2 text-sm border dark:border-blue-800/30">
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
                              {formData.latitude && formData.longitude
                                ? `${parseFloat(formData.latitude).toFixed(4)}, ${parseFloat(formData.longitude).toFixed(4)}`
                                : '--'}
                            </span>
                          </div>
                        </div>

                        {/* Hidden fields for coordinates and address ID */}
                        <input type="hidden" value={formData.latitude} />
                        <input type="hidden" value={formData.longitude} />
                        <input type="hidden" value={formData.addressId} />
                      </div>
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
                      Location Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 p-0">
                    <div className="h-full flex flex-col">
                      <div className="p-4 pb-2">
                        <Alert>
                          <MapPin className="h-4 w-4" />
                          <AlertDescription>
                            Use the search box on the map to find a location, or
                            click on the map to set a marker. The address fields
                            will be automatically populated based on your
                            selection.
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
                            {/* Marker */}
                            {markerPosition && markerBuffer && (
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
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
