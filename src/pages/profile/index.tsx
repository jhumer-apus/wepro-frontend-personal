import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

import { Skeleton } from '../../components/ui/skeleton'
import { Button } from '../../components/ui/button'
import {
  ArrowLeft,
  User,
  Shield,
  Key,
  Edit,
  X,
  ChevronsUpDown,
  Check,
  Clock,
} from 'lucide-react'
import { profileService } from '../../services/profileService'
import { Profile } from '../../constants/interface/profile'
import { toast } from 'sonner'
import { apiService } from '../../services/api'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover'
import { cn } from '../../lib/utils'

interface Timezone {
  _id: string
  location: string
  value: string
  name: string
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

interface WorkingHour {
  _id: string
  dayOfWeek: number
  userId: string
  createdAt: string
  endTime: string
  isActive: boolean
  startTime: string
  updatedAt: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    timezoneId: '',
  })
  const [editLoading, setEditLoading] = useState(false)
  const [timezonesLoading, setTimezonesLoading] = useState(false)
  const [availableTimezones, setAvailableTimezones] = useState<Timezone[]>([])
  const [timezoneOpen, setTimezoneOpen] = useState(false)
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([])
  const [workingHoursLoading, setWorkingHoursLoading] = useState(false)
  const [showWorkingHoursModal, setShowWorkingHoursModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [workingHoursForm, setWorkingHoursForm] = useState({
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
  })
  const [workingHoursFormLoading, setWorkingHoursFormLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
    fetchTimezones()
    fetchWorkingHours()
  }, [])

  const fetchTimezones = async () => {
    try {
      setTimezonesLoading(true)
      const response = await apiService.get('/v1/timezones?page=1&limit=20')
      setAvailableTimezones(response.data.data)
    } catch (error) {
      console.error('Error fetching timezones:', error)
    } finally {
      setTimezonesLoading(false)
    }
  }

  const fetchWorkingHours = async () => {
    try {
      setWorkingHoursLoading(true)
      const response = await apiService.get('/v1/profile/working-hours')
      setWorkingHours(response.data.data)
    } catch (error) {
      console.error('Error fetching working hours:', error)
      toast.error('Failed to load working hours')
    } finally {
      setWorkingHoursLoading(false)
    }
  }

  const getSelectedTimezoneName = () => {
    const selectedTimezone = availableTimezones.find(
      t => t._id === editForm.timezoneId
    )
    return selectedTimezone ? selectedTimezone.name : ''
  }

  const getDayName = (dayOfWeek: number) => {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    return days[dayOfWeek]
  }

  const formatTime = (time: string) => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await profileService.getProfile()
      setProfile(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile')
      toast.error('Failed to load profile information')
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

  const openEditModal = () => {
    if (profile) {
      setEditForm({
        name: profile.name,
        username: profile.username,
        timezoneId: profile.timezoneId._id,
      })
      setShowEditModal(true)
    }
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditForm({
      name: '',
      username: '',
      timezoneId: '',
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)

    try {
      const response = await profileService.updateProfile(editForm)

      toast.success('Profile updated successfully')

      // Refresh profile data
      await fetchProfile()
      closeEditModal()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setEditLoading(false)
    }
  }

  const openWorkingHoursModal = (dayOfWeek: number) => {
    setSelectedDay(dayOfWeek)
    const existingHour = workingHours.find(hour => hour.dayOfWeek === dayOfWeek)
    if (existingHour) {
      setWorkingHoursForm({
        startTime: existingHour.startTime,
        endTime: existingHour.endTime,
        isActive: existingHour.isActive,
      })
    } else {
      setWorkingHoursForm({
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      })
    }
    setShowWorkingHoursModal(true)
  }

  const closeWorkingHoursModal = () => {
    setShowWorkingHoursModal(false)
    setSelectedDay(null)
    setWorkingHoursForm({
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
    })
  }

  const handleWorkingHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDay === null) return

    setWorkingHoursFormLoading(true)

    try {
      const existingHour = workingHours.find(
        hour => hour.dayOfWeek === selectedDay
      )
      const payload = {
        dayOfWeek: selectedDay,
        startTime: workingHoursForm.startTime,
        endTime: workingHoursForm.endTime,
        isActive: workingHoursForm.isActive,
      }

      // Always use POST for both creating and updating
      await apiService.post('/v1/profile/working-hours', payload)
      toast.success(
        existingHour
          ? 'Working hours updated successfully'
          : 'Working hours created successfully'
      )

      // Refresh working hours data
      await fetchWorkingHours()
      closeWorkingHoursModal()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save working hours')
    } finally {
      setWorkingHoursFormLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Profile
          </h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Button onClick={fetchProfile} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-600 mb-4">
            Profile Not Found
          </h1>
          <p className="text-neutral-600 mb-6">
            Unable to load profile information.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Profile - WePro</title>
        <meta
          name="description"
          content="Manage your account information and preferences"
        />
      </Head>

      <div className="p-6">
        {/* Back Button and Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Profile
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Manage your account information and preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <div>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Your personal and account details
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={openEditModal} variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Full Name
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {profile.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Username
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {profile.username}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Account Type
                  </label>
                  <Badge variant="secondary" className="text-sm">
                    {profile.type}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Timezone
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {profile.timezoneId.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Account Details
              </CardTitle>
              <CardDescription>
                Account creation and update information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Account Created
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {formatDate(profile.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Last Updated
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                    {formatDate(profile.updatedAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Tenant ID
                  </label>
                  <p className="text-sm font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                    {profile.tenantId}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Working Hours
              </CardTitle>
              <CardDescription>Your working hours for the week</CardDescription>
            </CardHeader>
            <CardContent>
              {workingHoursLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.from({ length: 7 }, (_, index) => {
                    const existingHour = workingHours.find(
                      hour => hour.dayOfWeek === index
                    )

                    if (existingHour && existingHour.isActive) {
                      return (
                        <div
                          key={existingHour._id}
                          className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-24">
                              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {getDayName(index)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                {formatTime(existingHour.startTime)}
                              </span>
                              <span className="text-neutral-400">-</span>
                              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                {formatTime(existingHour.endTime)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">Active</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openWorkingHoursModal(index)}
                            >
                              Set
                            </Button>
                          </div>
                        </div>
                      )
                    } else {
                      // Handle both inactive working hours and days without working hours
                      const displayText = existingHour
                        ? `${formatTime(existingHour.startTime)} - ${formatTime(existingHour.endTime)}`
                        : 'No hours set'
                      const isItalic = !existingHour

                      return (
                        <div
                          key={
                            existingHour ? existingHour._id : `empty-${index}`
                          }
                          className="flex items-center justify-between p-4 bg-neutral-25 dark:bg-neutral-900 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-24">
                              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                {getDayName(index)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm text-neutral-400 dark:text-neutral-500 ${isItalic ? 'italic' : ''}`}
                              >
                                {displayText}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-neutral-400"
                            >
                              Inactive
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openWorkingHoursModal(index)}
                            >
                              Set
                            </Button>
                          </div>
                        </div>
                      )
                    }
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Edit Profile
              </h2>
              <button
                onClick={closeEditModal}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  type="text"
                  value={editForm.name}
                  onChange={e =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Username *</Label>
                <Input
                  type="text"
                  value={editForm.username}
                  onChange={e =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Timezone *</Label>
                <Popover open={timezoneOpen} onOpenChange={setTimezoneOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={timezoneOpen}
                      className="w-full justify-between"
                      disabled={timezonesLoading}
                    >
                      {timezonesLoading
                        ? 'Loading timezones...'
                        : editForm.timezoneId
                          ? getSelectedTimezoneName()
                          : 'Select timezone...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search timezones..."
                        className="focus:ring-0 focus:outline-none focus:border-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-0"
                      />
                      <CommandList>
                        <CommandEmpty>
                          {timezonesLoading
                            ? 'Loading timezones...'
                            : 'No timezone found.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {availableTimezones.map(timezone => (
                            <CommandItem
                              key={timezone._id}
                              onSelect={() => {
                                setEditForm({
                                  ...editForm,
                                  timezoneId: timezone._id,
                                })
                                setTimezoneOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  editForm.timezoneId === timezone._id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {timezone.name} ({timezone.location})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditModal}
                  className="flex-1"
                  disabled={editLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 text-white" disabled={editLoading}>
                  {editLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Working Hours Modal */}
      {showWorkingHoursModal && selectedDay !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Set Working Hours - {getDayName(selectedDay)}
              </h2>
              <button
                onClick={closeWorkingHoursModal}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWorkingHoursSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Active</Label>
                <Switch
                  checked={workingHoursForm.isActive}
                  onCheckedChange={checked =>
                    setWorkingHoursForm({
                      ...workingHoursForm,
                      isActive: checked,
                    })
                  }
                />
              </div>

              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={workingHoursForm.startTime}
                  onChange={e =>
                    setWorkingHoursForm({
                      ...workingHoursForm,
                      startTime: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={workingHoursForm.endTime}
                  onChange={e =>
                    setWorkingHoursForm({
                      ...workingHoursForm,
                      endTime: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeWorkingHoursModal}
                  className="flex-1"
                  disabled={workingHoursFormLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 text-white"
                  disabled={workingHoursFormLoading}
                >
                  {workingHoursFormLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
