import React, { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Slider } from '@/src/components/ui/slider'
import { Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react'
import config from '@/src/config'

interface SoundPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  audioUrl: string
  title?: string
  duration?: number
}

export function SoundPlayerModal({
  isOpen,
  onClose,
  audioUrl,
  title = 'Audio Player',
  duration,
}: SoundPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState<number>(duration || 0)

  const audioRef = useRef<HTMLAudioElement>(null)

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

  const processedAudioUrl = processAudioUrl(audioUrl)

  // Validate audio URL
  const isValidAudioUrl = (url: string): boolean => {
    if (!url) return false
    try {
      const urlObj = new URL(url)
      return ['http:', 'https:'].includes(urlObj.protocol)
    } catch {
      return false
    }
  }

  // Format time in MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Handle play/pause
  const togglePlayPause = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        try {
          console.log('Attempting to play audio:', processedAudioUrl)
          await audioRef.current.play()
        } catch (error) {
          console.error('Error playing audio:', error)
          setError(
            'Failed to play audio. This might be due to browser autoplay policies.'
          )
        }
      }
    }
  }

  // Handle seek
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const newTime = value[0]
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  // Reset audio
  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
    }
  }

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadStart = () => {
      console.log('Audio load started')
      setIsLoading(true)
    }
    const handleLoadedMetadata = () => {
      console.log('Audio metadata loaded')
      console.log('Audio duration:', audio.duration)

      // Set the duration from the audio element if it's available and valid
      if (
        audio.duration &&
        !isNaN(audio.duration) &&
        isFinite(audio.duration)
      ) {
        setAudioDuration(audio.duration)
        console.log('Set audio duration to:', audio.duration)
      }
    }

    const handleCanPlay = () => {
      console.log('Audio can play')
      console.log('Audio duration:', audio.duration)
      console.log('Audio src:', audio.src)
      setIsLoading(false)

      // Set the duration from the audio element if it's available and valid
      if (
        audio.duration &&
        !isNaN(audio.duration) &&
        isFinite(audio.duration)
      ) {
        setAudioDuration(audio.duration)
        console.log('Set audio duration to:', audio.duration)
      }
    }
    const handleError = (e: Event) => {
      const audioElement = e.target as HTMLAudioElement
      const error = audioElement.error
      let errorMessage = 'Failed to load audio file'

      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio loading was aborted'
            break
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading audio'
            break
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Audio format not supported or corrupted'
            break
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported'
            break
          default:
            errorMessage = `Audio error: ${error.message || 'Unknown error'}`
        }
      }

      console.error('Audio error:', error)
      console.error('Audio src:', audioElement.src)
      console.error('Audio networkState:', audioElement.networkState)
      console.error('Audio readyState:', audioElement.readyState)

      setError(errorMessage)
      setIsLoading(false)
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentTime(0)
      setIsPlaying(false)
      setError(null)
      setIsLoading(false)
      setAudioDuration(duration || 0)

      // Test if we can load the audio
      if (processedAudioUrl && isValidAudioUrl(processedAudioUrl)) {
        console.log('Testing audio load for URL:', processedAudioUrl)
        const testAudio = new Audio()
        testAudio.addEventListener('loadstart', () =>
          console.log('Test audio load started')
        )
        testAudio.addEventListener('canplay', () =>
          console.log('Test audio can play')
        )
        testAudio.addEventListener('error', e => {
          console.error('Test audio error:', e)
          const audioElement = e.target as HTMLAudioElement
          console.error('Test audio error details:', audioElement.error)
        })
        testAudio.src = processedAudioUrl
        testAudio.load()
      }
    }
  }, [isOpen, processedAudioUrl, duration])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Audio Element */}
          <audio
            ref={audioRef}
            src={processedAudioUrl}
            preload="metadata"
            crossOrigin="anonymous"
            className="hidden"
          />

          {/* Error State */}
          {(error || !isValidAudioUrl(processedAudioUrl)) && (
            <div className="text-center text-red-500 py-4">
              <p>{error || 'Invalid audio URL'}</p>
              {!isValidAudioUrl(processedAudioUrl) && (
                <p className="text-sm mt-2">URL: {processedAudioUrl}</p>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && !error && isValidAudioUrl(processedAudioUrl) && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600"></div>
              <p className="mt-2 text-sm text-neutral-600">Loading audio...</p>
            </div>
          )}

          {/* Player Controls */}
          {!error && isValidAudioUrl(processedAudioUrl) && (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>{formatTime(currentTime)}</span>
                  <span>
                    {audioDuration > 0 ? formatTime(audioDuration) : '--:--'}
                  </span>
                </div>
                <Slider
                  value={[currentTime]}
                  onValueChange={handleSeek}
                  max={audioDuration || 0}
                  step={1}
                  className="w-full"
                  disabled={audioDuration <= 0}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetAudio}
                  disabled={isLoading}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                  onClick={togglePlayPause}
                  disabled={isLoading || !!error}
                  className="w-12 h-12 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMute}
                  disabled={isLoading}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Volume Control */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-neutral-600" />
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    onValueChange={handleVolumeChange}
                    max={1}
                    step={0.1}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-neutral-600 w-8">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
