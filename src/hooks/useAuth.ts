import { useRouter } from 'next/router'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/slices/authSlice'
import { useEffect, useState } from 'react'
import { persistor } from '../store'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { tokens, isAuthenticated, loading, error } = useAppSelector(
    state => state.auth
  )
  const [isRehydrated, setIsRehydrated] = useState(false)

  useEffect(() => {
    // Check if already bootstrapped
    const persistorState = persistor.getState()
    console.log('Initial persistor state:', persistorState)

    if (persistorState.bootstrapped) {
      console.log('Persistor already bootstrapped, setting rehydrated to true')
      setIsRehydrated(true)
    } else {
      // Subscribe to persistor changes
      const unsubscribe = persistor.subscribe(() => {
        const { bootstrapped } = persistor.getState()
        console.log('Persistor state changed:', { bootstrapped })
        if (bootstrapped) {
          console.log('Setting rehydrated to true')
          setIsRehydrated(true)
        }
      })

      // Safety timeout - if persistor doesn't bootstrap within 5 seconds, force rehydration
      const timeoutId = setTimeout(() => {
        console.log('Persistor timeout - forcing rehydration')
        setIsRehydrated(true)
      }, 5000)

      return () => {
        unsubscribe()
        clearTimeout(timeoutId)
      }
    }
  }, [])

  const handleLogout = async () => {
    const { clearServerSession } = await import('../services/api')
    await clearServerSession()
    dispatch(logout())
    router.push('/login')
  }

  // Valid session: either stored tokens (legacy) or isAuthenticated (light server uses httpOnly cookies)
  const hasValidTokens =
    (tokens && tokens.accessToken && tokens.refreshToken) || isAuthenticated

  // Only show loading if we're still rehydrating OR if the auth slice is explicitly loading
  const isLoading = !isRehydrated || loading

  // Debug logging
  useEffect(() => {
    console.log('useAuth Debug:', {
      tokens: !!tokens,
      isAuthenticated,
      loading,
      isRehydrated,
      hasValidTokens,
      isLoading,
    })
  }, [
    tokens,
    isAuthenticated,
    loading,
    isRehydrated,
    hasValidTokens,
    isLoading,
  ])

  return {
    tokens,
    isAuthenticated: isAuthenticated && hasValidTokens,
    loading: isLoading,
    error,
    logout: handleLogout,
    hasValidTokens,
  }
}
