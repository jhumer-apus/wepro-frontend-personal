import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAppSelector } from '@/src/store/hooks'
import { RootState } from '@/src/store'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAppSelector(
    (state: RootState) => state.auth
  )

  useEffect(() => {
    console.log(isAuthenticated)
    if (!loading) {
      if (isAuthenticated) {
        console.log('aaaa')
        router.push('/dashboard')
      } else {
        console.log('bbbb')
        router.push('/login')
      }
    }
  }, [isAuthenticated, loading, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        das
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  return null
}
