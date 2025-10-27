import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/src/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, hasValidTokens } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if not loading and user is not authenticated or doesn't have valid tokens
    if (!loading && (!isAuthenticated || !hasValidTokens)) {
      router.push('/login')
    }
  }, [isAuthenticated, hasValidTokens, loading, router])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-[#4a9430] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated or doesn't have valid tokens
  if (!isAuthenticated || !hasValidTokens) {
    return null
  }

  return <>{children}</>
}
