import React, { useState, useEffect, useRef } from 'react'
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
import { Textarea } from '@/src/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Switch } from '@/src/components/ui/switch'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { ArrowLeft, Save, Loader2, MapPin } from 'lucide-react'
import { usePermissions } from '@/src/hooks/usePermissions'
import { Source, SourceFormData } from '@/src/constants/interface/source'
import { dummySources } from '@/src/constants/dummyData/sources'
import { toast } from 'sonner'
import { GoogleMap, Marker, StandaloneSearchBox } from '@react-google-maps/api'
import { apiService } from '@/src/services/api'
import { Franchise } from '@/src/constants/interface/franchise'
import { Industry } from '@/src/constants/interface/industry'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/src/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover'
import { cn } from '@/src/lib/utils'
import { ChevronsUpDown, Check } from 'lucide-react'

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]

const transactionPayFeeOptions = [
  { value: 'Company', label: 'Company' },
  { value: 'Client', label: 'Client' },
]

const phoneMaskingOptions = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
]

const callRoutingOptions = [
  { value: 'AI', label: 'AI' },
  { value: 'Answering Service', label: 'Answering Service' },
  { value: 'Company Agents', label: 'Company Agents' },
  {
    value: 'Ring 10 seconds to Company Agent Then Answering Service',
    label: 'Ring 10 seconds to Company Agent Then Answering Service',
  },
  { value: 'AI Then Answering Service', label: 'AI Then Answering Service' },
  { value: 'Answering Service Then AI', label: 'Answering Service Then AI' },
  { value: 'AI Then Company Agent', label: 'AI Then Company Agent' },
  { value: 'Company Agent Then AI', label: 'Company Agent Then AI' },
  {
    value: 'AI Then Ring 10 seconds to Company Agent Then Answering Service',
    label: 'AI Then Ring 10 seconds to Company Agent Then Answering Service',
  },
  {
    value: 'Ring 10 seconds to AI Then Company Agent Then Answering Service',
    label: 'Ring 10 seconds to AI Then Company Agent Then Answering Service',
  },
  {
    value: 'Ring 10 seconds to Company Agent Then Answering Service Then AI',
    label: 'Ring 10 seconds to Company Agent Then Answering Service Then AI',
  },
]

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
}

export default function CreateSourcePage() {
  const router = useRouter()
  const { id } = router.query
  const { checkPermission } = usePermissions()
  const isEditing = Boolean(id)

  const mapRef = useRef<google.maps.Map | null>(null)
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [markerBuffer, setMarkerBuffer] = useState<boolean>(false)
  const [franchisesLoading, setFranchisesLoading] = useState(false)
  const [availableFranchises, setAvailableFranchises] = useState<Franchise[]>(
    []
  )
  const [franchiseOpen, setFranchiseOpen] = useState(false)
  const [industriesLoading, setIndustriesLoading] = useState(false)
  const [availableIndustries, setAvailableIndustries] = useState<Industry[]>([])
  const [industryOpen, setIndustryOpen] = useState(false)
  const [formData, setFormData] = useState<SourceFormData>({
    name: '',
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
    lat: 0,
    lng: 0,
    franchiseCode: '',
    industryId: '',
    transactionPayFee: 'Company',
    phoneMasking: 'Yes',
    callRouting: 'AI Then Company Agent',
  })

  // Fetch franchises from API
  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        setFranchisesLoading(true)
        const response = await apiService.get(
          '/v1/franchises?page=1&limit=50&sort=-createdAt'
        )
        setAvailableFranchises(response.data.data)
      } catch (error) {
        console.error('Error fetching franchises:', error)
        toast.error('Failed to load franchises', {
          description:
            'Please try again or contact support if the issue persists.',
        })
      } finally {
        setFranchisesLoading(false)
      }
    }

    fetchFranchises()
  }, [])

  // Fetch industries from API
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setIndustriesLoading(true)
        const response = await apiService.get(
          '/v1/industries?sort=-createdAt&page=1&limit=50'
        )
        setAvailableIndustries(response.data.data)
      } catch (error) {
        console.error('Error fetching industries:', error)
        toast.error('Failed to load industries', {
          description:
            'Please try again or contact support if the issue persists.',
        })
      } finally {
        setIndustriesLoading(false)
      }
    }

    fetchIndustries()
  }, [])

  // Load source data if editing
  useEffect(() => {
    const loadSourceData = async () => {
      if (isEditing && id && typeof id === 'string') {
        // Wait for franchises and industries to be loaded first
        if (
          availableFranchises.length === 0 ||
          availableIndustries.length === 0
        ) {
          console.log('Waiting for franchises and industries to load...')
          return
        }

        setLoading(true)
        try {
          // Fetch source data from API
          const response = await apiService.get(`/v1/sources/${id}`)
          const sourceData = response.data.data
          setTimeout(() => {
            setMarkerBuffer(true)
          }, 1000)
          console.log('Source data received:', sourceData)

          if (sourceData) {
            setFormData({
              name: sourceData.name || '',
              status: sourceData.status || 'Active',
              weproUsername: sourceData.weproUsername || '',
              email: sourceData.email || '',
              phoneNumber: sourceData.phoneNumber || '',
              address: sourceData.address || '',
              addressLine2: sourceData.addressLine2 || '',
              city: sourceData.city || '',
              state: sourceData.state || '',
              zipCode: sourceData.zipCode || '',
              country: sourceData.country || '',
              addressId: sourceData.addressId || '',
              lat: sourceData.lat || 0,
              lng: sourceData.lng || 0,
              franchiseCode: sourceData.franchiseCode || '',
              industryId: sourceData.industryId || '',
              transactionPayFee: sourceData.transactionPayFee || 'Company',
              phoneMasking: sourceData.phoneMasking || 'Yes',
              callRouting: sourceData.callRouting || 'AI Then Company Agent',
            })

            // Set marker position if coordinates exist
            if (sourceData.lat && sourceData.lng) {
              const newPosition = {
                lat: sourceData.lat,
                lng: sourceData.lng,
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
          }
        } catch (error) {
          console.error('Error loading source data:', error)
          toast.error('Failed to load source data', {
            description:
              'Please try again or contact support if the issue persists.',
          })
          router.push('/settings/company/sources')
        } finally {
          setLoading(false)
        }
      }
    }

    loadSourceData()
  }, [isEditing, id, availableFranchises.length, availableIndustries.length])

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
      lat: place.geometry?.location?.lat() || 0,
      lng: place.geometry?.location?.lng() || 0,
    }))
  }

  const handleInputChange = (field: keyof SourceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const getSelectedFranchiseName = () => {
    const selectedFranchise = availableFranchises.find(
      f => f.code === formData.franchiseCode
    )
    return selectedFranchise
      ? `${selectedFranchise.name} (${selectedFranchise.code})`
      : ''
  }

  const getSelectedIndustryName = () => {
    const selectedIndustry = availableIndustries.find(
      i => i.code === formData.industryId
    )
    return selectedIndustry
      ? `${selectedIndustry.name} (${selectedIndustry.code})`
      : ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Source name is required')
      return
    }

    if (!formData.weproUsername.trim()) {
      toast.error('WePro username is required')
      return
    }

    if (!formData.email.trim()) {
      toast.error('Email is required')
      return
    }

    if (!formData.phoneNumber.trim()) {
      toast.error('Phone number is required')
      return
    }

    if (!formData.franchiseCode.trim()) {
      toast.error('Franchise code is required')
      return
    }

    if (!formData.industryId.trim()) {
      toast.error('Industry ID is required')
      return
    }

    try {
      setSaving(true)

      // Prepare the payload for the API
      const payload = {
        name: formData.name,
        status: formData.status,
        weproUsername: formData.weproUsername,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        addressId: formData.addressId,
        lat: formData.lat,
        lng: formData.lng,
        franchiseCode: formData.franchiseCode,
        industryId: formData.industryId,
        transactionPayFee: formData.transactionPayFee,
        phoneMasking: formData.phoneMasking,
        callRouting: formData.callRouting,
      }

      // Make the actual API call
      let response
      if (isEditing && id) {
        response = await apiService.put(`/v1/sources/${id}`, payload)
      } else {
        response = await apiService.post('/v1/sources', payload)
      }

      if (response.data.success) {
        toast.success(
          isEditing
            ? 'Source updated successfully!'
            : 'Source created successfully!',
          {
            description: isEditing
              ? 'The source has been updated in the system.'
              : 'The new source has been added to the system.',
          }
        )

        router.push('/settings/company/sources')
      } else {
        toast.error(
          isEditing ? 'Failed to update source' : 'Failed to create source',
          {
            description:
              response.data.message ||
              (isEditing
                ? 'An error occurred while updating the source.'
                : 'An error occurred while creating the source.'),
          }
        )
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? 'updating' : 'creating'} source:`,
        error
      )
      toast.error(
        isEditing ? 'Failed to update source' : 'Failed to create source',
        {
          description: isEditing
            ? 'An error occurred while updating the source.'
            : 'An error occurred while creating the source.',
        }
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/settings/company/sources')
  }

  React.useEffect(() => {
    if (!checkPermission('MOD008', 'view')) {
      router.push('/settings/job/industry')
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading source...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{isEditing ? 'Edit Source' : 'Create Source'} - WePro</title>
        <meta
          name="description"
          content={
            isEditing ? 'Edit company source' : 'Create new company source'
          }
        />
      </Head>
      <div>
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sources
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {isEditing ? 'Edit Source' : 'Create New Source'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="flex flex-col">
              {/* Basic Information */}
              <Card className="flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    Source Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Source Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Source Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={e =>
                          handleInputChange('name', e.target.value)
                        }
                        placeholder="Enter source name"
                        required
                      />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={value =>
                          handleInputChange('status', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* WePro Username */}
                    <div className="space-y-2">
                      <Label htmlFor="weproUsername">WePro Username *</Label>
                      <Input
                        id="weproUsername"
                        value={formData.weproUsername}
                        onChange={e =>
                          handleInputChange('weproUsername', e.target.value)
                        }
                        placeholder="Enter WePro username"
                        required
                      />
                    </div>

                    {/* Email */}
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
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={e =>
                          handleInputChange('phoneNumber', e.target.value)
                        }
                        placeholder="Enter phone number"
                        required
                      />
                    </div>

                    {/* Franchise Code */}
                    <div className="space-y-2">
                      <Label htmlFor="franchiseCode">Franchise *</Label>
                      <Popover
                        open={franchiseOpen}
                        onOpenChange={setFranchiseOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={franchiseOpen}
                            className="w-full justify-between"
                            disabled={franchisesLoading}
                          >
                            {getSelectedFranchiseName() ||
                              'Select franchise...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search franchise..." />
                            <CommandList>
                              <CommandEmpty>
                                {franchisesLoading
                                  ? 'Loading franchises...'
                                  : 'No franchise found.'}
                              </CommandEmpty>
                              <CommandGroup>
                                {availableFranchises.map(franchise => (
                                  <CommandItem
                                    key={franchise._id}
                                    value={`${franchise.name} ${franchise.code}`}
                                    onSelect={() => {
                                      handleInputChange(
                                        'franchiseCode',
                                        franchise.code
                                      )
                                      setFranchiseOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        formData.franchiseCode ===
                                          franchise.code
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {franchise.name}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        Code: {franchise.code}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Industry ID */}
                    <div className="space-y-2">
                      <Label htmlFor="industryId">Industry *</Label>
                      <Popover
                        open={industryOpen}
                        onOpenChange={setIndustryOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={industryOpen}
                            className="w-full justify-between"
                            disabled={industriesLoading}
                          >
                            {getSelectedIndustryName() || 'Select industry...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search industry..." />
                            <CommandList>
                              <CommandEmpty>
                                {industriesLoading
                                  ? 'Loading industries...'
                                  : 'No industry found.'}
                              </CommandEmpty>
                              <CommandGroup>
                                {availableIndustries.map(industry => (
                                  <CommandItem
                                    key={industry._id || industry.code}
                                    value={`${industry.name} ${industry.code}`}
                                    onSelect={() => {
                                      handleInputChange(
                                        'industryId',
                                        industry.code
                                      )
                                      setIndustryOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        formData.industryId === industry.code
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {industry.name}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        Code: {industry.code}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Transaction Pay Fee */}
                    <div className="space-y-2">
                      <Label htmlFor="transactionPayFee">
                        Transaction Pay Fee
                      </Label>
                      <Select
                        value={formData.transactionPayFee}
                        onValueChange={value =>
                          handleInputChange('transactionPayFee', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select transaction pay fee" />
                        </SelectTrigger>
                        <SelectContent>
                          {transactionPayFeeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Phone Masking */}
                    <div className="space-y-2">
                      <Label htmlFor="phoneMasking">Phone Masking</Label>
                      <Select
                        value={formData.phoneMasking}
                        onValueChange={value =>
                          handleInputChange('phoneMasking', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select phone masking" />
                        </SelectTrigger>
                        <SelectContent>
                          {phoneMaskingOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Call Routing */}
                    <div className="space-y-2">
                      <Label htmlFor="callRouting">Call Routing</Label>
                      <Select
                        value={formData.callRouting}
                        onValueChange={value =>
                          handleInputChange('callRouting', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select call routing" />
                        </SelectTrigger>
                        <SelectContent>
                          {callRoutingOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                      Location Details
                    </h3>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3">
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

                      <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            Coordinates:
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">
                            {formData.lat && formData.lng
                              ? `${formData.lat.toFixed(4)}, ${formData.lng.toFixed(4)}`
                              : '--'}
                          </span>
                        </div>
                      </div>
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
                          center={markerPosition || defaultCenter}
                          zoom={12}
                          onLoad={onMapLoad}
                          onClick={onMapClick}
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
                          {((!isEditing && markerPosition) ||
                            (isEditing && markerPosition && markerBuffer)) && (
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

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Source' : 'Create Source'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
