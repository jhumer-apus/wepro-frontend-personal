import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { apiService } from '@/src/services/api'
import { toast } from 'sonner'
import { Loading, ButtonLoading } from '@/src/components/ui/loading'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import {
  ArrowLeft,
  Save,
  Phone,
  Shield,
  Upload,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
} from 'lucide-react'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { usePermissions } from '@/src/hooks/usePermissions'
import { Textarea } from '@/src/components/ui/textarea'
import config from '@/src/config'

interface FormData {
  title: string
  voiceType: string
  content?: string
  transcript?: string
  status: string
  audioFile?: File | null
}

interface ValidationErrors {
  title?: string
  content?: string
  transcript?: string
  audioFile?: string
}

export default function CreateVoiceTemplatePage(): React.JSX.Element {
  const router = useRouter()
  const { id } = router.query
  const { checkPermission, getUserType, userData } = usePermissions()
  const tenantId = userData?.tenantId

  // Check if we're editing (id exists in URL)
  const isEditing = Boolean(id)

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState<FormData>({
    title: '',
    voiceType: 'Text-to-Speech',
    content: '',
    transcript: '',
    status: 'Active',
    audioFile: null,
  })

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Audio file playback states
  const [isPlayingExistingAudio, setIsPlayingExistingAudio] = useState(false)
  const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const existingAudioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load template data if editing
  useEffect(() => {
    const loadData = async () => {
      if (isEditing && id && typeof id === 'string') {
        setIsLoading(true)
        try {
          const response = await apiService.get(`/v3/templates/voice/${id}`)

          let templateData
          if (response.data.success !== undefined) {
            templateData = response.data.data
          } else {
            templateData = response.data
          }

          if (templateData) {
            console.log('Loading template data:', templateData)

            const formDataToSet = {
              title: templateData.title || '',
              voiceType: templateData.voiceType || 'Text-to-Speech',
              content: templateData.content || '',
              transcript: templateData.transcript || '',
              status: templateData.status || 'Active',
              audioFile: null,
            }

            console.log('Setting form data:', formDataToSet)
            setFormData(formDataToSet)

            // Set existing audio URL if available for Audio File or Record Voice type
            if (
              (templateData.voiceType === 'Audio File' ||
                templateData.voiceType === 'Record Voice') &&
              templateData.audioUrl
            ) {
              const processedUrl = processAudioUrl(templateData.audioUrl)
              setExistingAudioUrl(processedUrl)
            }
          }
        } catch (error: any) {
          console.error('Error loading template data:', error)
          toast.error('Failed to load template data', {
            description:
              'Please try again or contact support if the issue persists.',
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadData()
  }, [id, isEditing])

  const handleInputChange = (
    field: keyof FormData,
    value: string | File | null
  ) => {
    // Prevent input if character limit is reached
    if (field === 'title' && typeof value === 'string' && value.length > 200) {
      return // Don't update if title exceeds 200 characters
    }

    if (
      field === 'content' &&
      typeof value === 'string' &&
      value.length > 5000
    ) {
      return // Don't update if content exceeds 5000 characters
    }

    if (
      field === 'transcript' &&
      typeof value === 'string' &&
      value.length > 2000
    ) {
      return // Don't update if transcript exceeds 2000 characters
    }

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear validation error when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type for audio files
      if (
        formData.voiceType === 'Audio File' &&
        !file.type.startsWith('audio/')
      ) {
        toast.error('Please select a valid audio file')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }

      handleInputChange('audioFile', file)

      // Clear validation error
      if (validationErrors.audioFile) {
        setValidationErrors(prev => ({
          ...prev,
          audioFile: undefined,
        }))
      }
    }
  }

  // Audio recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))

        // Convert blob to File for form submission
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' })
        handleInputChange('audioFile', file)

        // Clear validation error
        if (validationErrors.audioFile) {
          setValidationErrors(prev => ({
            ...prev,
            audioFile: undefined,
          }))
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error(
        'Failed to start recording. Please check microphone permissions.'
      )
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)

      // Resume timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Process audio URL to replace localhost with proper API base URL
  const processAudioUrl = (url: string): string => {
    if (!url) return url

    console.log('Original audio URL:', url)
    console.log('Config API rootUrl:', config.api.rootUrl)
    console.log('Config API baseUrl:', config.api.baseUrl)

    // If the URL contains localhost:5000, replace it with the API base URL
    if (url.includes('http://localhost:5000')) {
      const processedUrl = url.replace(
        'http://localhost:5000',
        config.api.rootUrl || config.api.baseUrl.replace('/api', '')
      )
      console.log('Processed audio URL:', processedUrl)
      return processedUrl
    }

    // If the URL is relative, make it absolute
    if (url.startsWith('/')) {
      const baseUrl =
        config.api.rootUrl || config.api.baseUrl.replace('/api', '')
      const processedUrl = `${baseUrl}${url}`
      console.log('Converted relative URL to absolute:', processedUrl)
      return processedUrl
    }

    console.log('Using original URL:', url)
    return url
  }

  // Process the existing audio URL for playback
  const processedExistingAudioUrl = existingAudioUrl
    ? processAudioUrl(existingAudioUrl)
    : null

  // Existing audio playback functions
  const playExistingAudio = () => {
    if (processedExistingAudioUrl && existingAudioRef.current) {
      existingAudioRef.current.play()
      setIsPlayingExistingAudio(true)
    }
  }

  const pauseExistingAudio = () => {
    if (existingAudioRef.current) {
      existingAudioRef.current.pause()
      setIsPlayingExistingAudio(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // Validate title
    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    } else if (formData.title.length > 200) {
      errors.title = `Title must be 200 characters or less (currently ${formData.title.length} characters)`
    }

    // Validate based on voice type
    if (formData.voiceType === 'Text-to-Speech') {
      if (!formData.content?.trim()) {
        errors.content = 'Content is required for Text-to-Speech'
      } else if (formData.content.length > 5000) {
        errors.content = `Content must be 5000 characters or less (currently ${formData.content.length} characters)`
      }
    } else if (
      formData.voiceType === 'Audio File' ||
      formData.voiceType === 'Record Voice'
    ) {
      // In edit mode, audio file is optional for Audio File and Record Voice types
      if (!isEditing && !formData.audioFile) {
        errors.audioFile = 'Audio file is required'
      }
      if (!formData.transcript?.trim()) {
        errors.transcript = 'Transcript is required'
      } else if (formData.transcript.length > 2000) {
        errors.transcript = `Transcript must be 2000 characters or less (currently ${formData.transcript.length} characters)`
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting')
      return
    }

    if (!tenantId) {
      toast.error('Tenant ID is required')
      return
    }

    setIsSaving(true)

    try {
      if (formData.voiceType === 'Text-to-Speech') {
        // JSON payload for Text-to-Speech
        const payload = {
          title: formData.title.trim(),
          voiceType: formData.voiceType,
          content: formData.content?.trim(),
          status: formData.status,
        }

        if (isEditing && id) {
          await apiService.put(`/v3/templates/voice/${id}`, payload)
        } else {
          await apiService.post(
            '/v3/templates/voice/text-to-speech/create',
            payload
          )
        }
      } else {
        // FormData payload for Audio File and Record Voice
        const formDataPayload = new FormData()
        formDataPayload.append('title', formData.title.trim())
        formDataPayload.append('voiceType', formData.voiceType)
        formDataPayload.append('transcript', formData.transcript?.trim() || '')
        formDataPayload.append('status', formData.status)

        if (formData.audioFile) {
          formDataPayload.append('audioFile', formData.audioFile)
        }

        const endpoint =
          formData.voiceType === 'Audio File'
            ? '/v3/templates/voice/audio-file/create'
            : '/v3/templates/voice/record-voice/create'

        if (isEditing && id) {
          await apiService.put(`/v3/templates/voice/${id}`, formDataPayload, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        } else {
          await apiService.post(endpoint, formDataPayload, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        }
      }

      toast.success(
        `Voice template ${isEditing ? 'updated' : 'created'} successfully!`,
        {
          description: `The ${formData.voiceType.toLowerCase()} template has been ${isEditing ? 'updated' : 'added'} to the system.`,
        }
      )

      // Redirect back to the templates list
      router.push('/settings/templates/voice')
    } catch (error: any) {
      console.error('Error saving template:', error)
      toast.error(
        isEditing ? 'Failed to update template' : 'Failed to create template',
        {
          description:
            error.response?.data?.message ||
            'An error occurred while saving the template.',
        }
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Check permission for create mode
  if (!isEditing && !checkPermission('MOD031', 'create')) {
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
  if (isEditing && !checkPermission('MOD031', 'edit')) {
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

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <Head>
        <title>
          {isEditing ? 'Edit Voice Template' : 'Create Voice Template'} - WePro
        </title>
        <meta
          name="description"
          content={
            isEditing ? 'Edit voice template' : 'Create new voice template'
          }
        />
      </Head>

      <div className="p-6">
        {/* Back Button - Top Left */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/settings/templates/voice')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Voice Templates
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {isEditing
                  ? 'Edit Voice Template'
                  : 'Create New Voice Template'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Status:
              </span>
              <Select
                value={formData.status}
                onValueChange={value => handleInputChange('status', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Voice Template Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title *
                  </Label>
                  <div className="text-sm">
                    {(() => {
                      const charCount = formData.title.length
                      const isNearLimit = charCount > 160
                      const isOverLimit = charCount > 200

                      return (
                        <span
                          className={`font-medium ${
                            isOverLimit
                              ? 'text-red-500'
                              : isNearLimit
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                        >
                          {charCount}/200 characters
                        </span>
                      )
                    })()}
                  </div>
                </div>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter voice template title"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  className={validationErrors.title ? 'border-red-500' : ''}
                  maxLength={200}
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-500">
                    {validationErrors.title}
                  </p>
                )}
              </div>

              {/* Voice Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="voiceType" className="text-sm font-medium">
                  Voice Type *
                </Label>
                <Select
                  value={formData.voiceType}
                  onValueChange={value => handleInputChange('voiceType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Text-to-Speech">
                      Text-to-Speech
                    </SelectItem>
                    <SelectItem value="Audio File">Audio File</SelectItem>
                    <SelectItem value="Record Voice">Record Voice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Text-to-Speech Content */}
              {formData.voiceType === 'Text-to-Speech' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content" className="text-sm font-medium">
                      Content *
                    </Label>
                    <div className="text-sm">
                      {(() => {
                        const charCount = formData.content?.length || 0
                        const isNearLimit = charCount > 4500
                        const isOverLimit = charCount > 5000

                        return (
                          <span
                            className={`font-medium ${
                              isOverLimit
                                ? 'text-red-500'
                                : isNearLimit
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-neutral-500 dark:text-neutral-400'
                            }`}
                          >
                            {charCount}/5000 characters
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                  <Textarea
                    id="content"
                    placeholder="Enter text content for speech synthesis. Use variables like {{customerName}}, {{companyName}}, etc."
                    value={formData.content || ''}
                    onChange={e => handleInputChange('content', e.target.value)}
                    className={`min-h-[200px] ${validationErrors.content ? 'border-red-500' : ''}`}
                    maxLength={5000}
                  />
                  {validationErrors.content && (
                    <p className="text-sm text-red-500">
                      {validationErrors.content}
                    </p>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Use variables like {'{{customerName}}'},{' '}
                      {'{{companyName}}'}, {'{{appointmentDate}}'},{' '}
                      {'{{appointmentTime}}'}, and {'{{companyPhone}}'} that
                      will be replaced dynamically.
                    </p>
                  </div>
                </div>
              )}

              {/* Audio File Upload */}
              {formData.voiceType === 'Audio File' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="audioFile" className="text-sm font-medium">
                      Audio File {isEditing ? '(Optional)' : '*'} (.mp3)
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="audioFile"
                        type="file"
                        accept="audio/mp3,audio/mpeg"
                        onChange={handleFileChange}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById('audioFile')?.click()
                        }
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </Button>
                      {isEditing && processedExistingAudioUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={
                            isPlayingExistingAudio
                              ? pauseExistingAudio
                              : playExistingAudio
                          }
                          className="flex items-center gap-2"
                        >
                          {isPlayingExistingAudio ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          {isPlayingExistingAudio ? 'Pause' : 'Play'}
                        </Button>
                      )}
                    </div>
                    {validationErrors.audioFile && (
                      <p className="text-sm text-red-500">
                        {validationErrors.audioFile}
                      </p>
                    )}
                    {formData.audioFile && (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        File selected: {formData.audioFile.name} (
                        {(formData.audioFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="transcript"
                        className="text-sm font-medium"
                      >
                        Transcript *
                      </Label>
                      <div className="text-sm">
                        {(() => {
                          const charCount = formData.transcript?.length || 0
                          const isNearLimit = charCount > 1800
                          const isOverLimit = charCount > 2000

                          return (
                            <span
                              className={`font-medium ${
                                isOverLimit
                                  ? 'text-red-500'
                                  : isNearLimit
                                    ? 'text-yellow-600 dark:text-yellow-400'
                                    : 'text-neutral-500 dark:text-neutral-400'
                              }`}
                            >
                              {charCount}/2000 characters
                            </span>
                          )
                        })()}
                      </div>
                    </div>
                    <Textarea
                      id="transcript"
                      placeholder="Enter transcript of the audio file for accessibility and search purposes"
                      value={formData.transcript || ''}
                      onChange={e =>
                        handleInputChange('transcript', e.target.value)
                      }
                      className={`min-h-[150px] ${validationErrors.transcript ? 'border-red-500' : ''}`}
                      maxLength={2000}
                    />
                    {validationErrors.transcript && (
                      <p className="text-sm text-red-500">
                        {validationErrors.transcript}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Record Voice */}
              {formData.voiceType === 'Record Voice' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Record Audio {isEditing ? '(Optional)' : '*'}
                    </Label>
                    <div className="flex items-center gap-4">
                      {!isRecording && !audioBlob && (
                        <Button
                          type="button"
                          onClick={startRecording}
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Mic className="w-4 h-4" />
                          Start Recording
                        </Button>
                      )}

                      {isEditing &&
                        processedExistingAudioUrl &&
                        !isRecording &&
                        !audioBlob && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={
                              isPlayingExistingAudio
                                ? pauseExistingAudio
                                : playExistingAudio
                            }
                            className="flex items-center gap-2"
                          >
                            {isPlayingExistingAudio ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            {isPlayingExistingAudio ? 'Pause' : 'Play'} Existing
                          </Button>
                        )}

                      {isRecording && (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            onClick={
                              isPaused ? resumeRecording : pauseRecording
                            }
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            {isPaused ? (
                              <Play className="w-4 h-4" />
                            ) : (
                              <Pause className="w-4 h-4" />
                            )}
                            {isPaused ? 'Resume' : 'Pause'}
                          </Button>
                          <Button
                            type="button"
                            onClick={stopRecording}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Square className="w-4 h-4" />
                            Stop
                          </Button>
                        </div>
                      )}

                      {audioBlob && !isRecording && (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            onClick={isPlaying ? pausePlayback : playRecording}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            {isPlaying ? 'Pause' : 'Play'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setAudioBlob(null)
                              setAudioUrl(null)
                              handleInputChange('audioFile', null)
                            }}
                            variant="outline"
                            className="flex items-center gap-2 text-red-600"
                          >
                            <MicOff className="w-4 h-4" />
                            Re-record
                          </Button>
                        </div>
                      )}
                    </div>

                    {isRecording && (
                      <div className="text-sm text-red-600 dark:text-red-400">
                        Recording: {formatTime(recordingTime)}
                      </div>
                    )}

                    {audioBlob && (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Recording complete: {formatTime(recordingTime)}
                      </div>
                    )}

                    {validationErrors.audioFile && (
                      <p className="text-sm text-red-500">
                        {validationErrors.audioFile}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="transcript"
                        className="text-sm font-medium"
                      >
                        Transcript *
                      </Label>
                      <div className="text-sm">
                        {(() => {
                          const charCount = formData.transcript?.length || 0
                          const isNearLimit = charCount > 1800
                          const isOverLimit = charCount > 2000

                          return (
                            <span
                              className={`font-medium ${
                                isOverLimit
                                  ? 'text-red-500'
                                  : isNearLimit
                                    ? 'text-yellow-600 dark:text-yellow-400'
                                    : 'text-neutral-500 dark:text-neutral-400'
                              }`}
                            >
                              {charCount}/2000 characters
                            </span>
                          )
                        })()}
                      </div>
                    </div>
                    <Textarea
                      id="transcript"
                      placeholder="Enter transcript of the recorded audio for accessibility and search purposes"
                      value={formData.transcript || ''}
                      onChange={e =>
                        handleInputChange('transcript', e.target.value)
                      }
                      className={`min-h-[150px] ${validationErrors.transcript ? 'border-red-500' : ''}`}
                      maxLength={2000}
                    />
                    {validationErrors.transcript && (
                      <p className="text-sm text-red-500">
                        {validationErrors.transcript}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Hidden audio element for playback */}
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  className="hidden"
                />
              )}

              {/* Hidden audio element for existing audio playback */}
              {processedExistingAudioUrl && (
                <audio
                  ref={existingAudioRef}
                  src={processedExistingAudioUrl}
                  onEnded={() => setIsPlayingExistingAudio(false)}
                  onPause={() => setIsPlayingExistingAudio(false)}
                  onPlay={() => setIsPlayingExistingAudio(true)}
                  className="hidden"
                />
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/settings/templates/voice')}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="wepro-button-gradient text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isSaving || !tenantId}
            >
              {isSaving ? (
                <ButtonLoading
                  message={isEditing ? 'Updating...' : 'Creating...'}
                />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Template' : 'Create Template'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
