import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/src/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading, hasValidTokens } = useAuth()
  const router = useRouter()

  // Debug logging
  useEffect(() => {
    console.log('AuthGuard Debug:', {
      pathname: router.pathname,
      isAuthenticated,
      loading,
      hasValidTokens,
      isLoginPage: router.pathname === '/login',
    })
  }, [router.pathname, isAuthenticated, loading, hasValidTokens])

  useEffect(() => {
    // If user is on login page and is authenticated with valid tokens, redirect to dashboard
    if (
      router.pathname === '/login' &&
      !loading &&
      isAuthenticated &&
      hasValidTokens
    ) {
      console.log('Redirecting authenticated user from login to dashboard')
      router.push('/dashboard')
      return
    }

    // Skip authentication check for login page
    if (router.pathname === '/login') {
      return
    }

    // If not loading and user is not authenticated or doesn't have valid tokens, redirect to login
    if (!loading && (!isAuthenticated || !hasValidTokens)) {
      console.log('Redirecting unauthenticated user to login')
      router.push('/login')
    }
  }, [isAuthenticated, hasValidTokens, loading, router])

  // Show loading spinner while checking authentication (except on login page)
  if (loading && router.pathname !== '/login') {
    console.log('Showing loading spinner')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-[#4a9430] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  // For login page, always render children
  if (router.pathname === '/login') {
    console.log('Rendering login page')
    return <>{children}</>
  }

  // For other pages, only render if authenticated and has valid tokens
  if (!isAuthenticated || !hasValidTokens) {
    console.log('Not rendering - user not authenticated or no valid tokens')
    return null
  }

  console.log('Rendering protected page')
  return <>{children}</>
}
