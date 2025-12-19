import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Card, CardContent } from '@/src/components/ui/card'
import { Eye, EyeOff, User, Lock, Building2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { login } from '@/src/store/slices/authSlice'
import { setUserData } from '@/src/store/slices/userSlice'
import { RootState } from '@/src/store'
import { apiService } from '@/src/services/api'
import { useConfig } from '@/src/hooks/useConfig'
import { useTheme } from 'next-themes'
import logo from '../../public/logo.png'
import logoAlt from '../../public/logo-alt.png'

export default function Login(): React.JSX.Element {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, loading } = useAppSelector(
    (state: RootState) => state.auth
  )
  const userData = useAppSelector((state: RootState) => state.user)
  const config = useConfig()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedInput, setFocusedInput] = useState<string | null>(null)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (
      isAuthenticated &&
      !loading &&
      !userData.loading &&
      userData?.data?._id
    ) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, loading, router, userData])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('') // Clear error when user starts typing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Basic validation
      if (!formData.username || !formData.password) {
        throw new Error('Please fill in all fields')
      }

      // Example API call using the configured service
      // In a real implementation, you would call your authentication endpoint
      try {
        const response = await apiService.post('/v1/auth/login', {
          username: formData.username,
          password: formData.password,
        })

        // Update Redux state with the full user data from API response
        dispatch(
          login({
            accessToken: response.data.accessToken,
            expiresIn: response.data.expiresIn,
            refreshExpiresIn: response.data.refreshExpiresIn,
            refreshToken: response.data.refreshToken,
          })
        )

        // Fetch and save user profile data
        const profile = await apiService.get('/v1/profile')
        console.log(profile, 'profile')
        // Save user profile data to Redux store
        if (profile.data.success && profile.data.data) {
          dispatch(setUserData(profile.data.data))
        }
      } catch (apiError: any) {
        // Handle API errors
        if (apiError.response?.status === 401) {
          throw new Error('Wrong password or username')
        } else if (apiError.response?.data?.message) {
          throw new Error(apiError.response.data.message)
        } else {
          throw new Error('Login failed. Please try again.')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login - WePro</title>
        <meta name="description" content="Login to your WePro account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex">
        {/* Header with Logo */}
        <div className="absolute top-6 left-6 flex items-center space-x-3 z-10">
          <img
            src={mounted && resolvedTheme === 'dark' ? logoAlt.src : logo.src}
            alt="WePro Logo"
            className="h-8 w-auto"
            draggable={false}
          />
        </div>

        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-neutral-900">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-none bg-white dark:bg-neutral-900">
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold text-black dark:text-white mb-2 text-center">
                  Welcome Back
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-20 text-center">
                  Sign in to your WePro account
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className={`text-sm font-medium ${focusedInput === 'username' ? 'text-[#4a9430]' : 'text-black dark:text-gray-300'}`}
                    >
                      Username
                    </Label>
                    <div className="relative">
                      <User
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${focusedInput === 'username' ? 'text-[#4a9430]' : 'text-gray-400'}`}
                      />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={e =>
                          handleInputChange('username', e.target.value)
                        }
                        onFocus={() => setFocusedInput('username')}
                        onBlur={() => setFocusedInput(null)}
                        className="pl-10 h-11 focus:ring-[#4a9430] focus:ring-1 focus:outline-none focus-visible:ring-[#4a9430] focus-visible:ring-2 focus-visible:ring-offset-0"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className={`text-sm font-medium ${focusedInput === 'password' ? 'text-[#4a9430]' : 'text-black dark:text-gray-300'}`}
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${focusedInput === 'password' ? 'text-[#4a9430]' : 'text-gray-400'}`}
                      />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={e =>
                          handleInputChange('password', e.target.value)
                        }
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        className="pl-10 pr-10 h-11  focus:ring-[#4a9430] focus:ring-1 focus:outline-none focus-visible:ring-[#4a9430] focus-visible:ring-2 focus-visible:ring-offset-0"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-[#53a533] hover:bg-[#4a9430] h-11 text-white font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                {/* Footer Links */}
                <div className="mt-6 text-center space-y-2">
                  <a
                    href="#"
                    className="text-sm text-[#53a533] hover:text-[#4a9430] font-medium"
                  >
                    Forgot your password?
                  </a>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Need help?{' '}
                    <a
                      href="#"
                      className="text-[#53a533] hover:text-[#4a9430] font-medium"
                    >
                      Contact support
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side - Background Image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://vs-dev.wepro.ai/assets/images/big/auth-bg2.jpg')`,
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black to-[#4a9430] opacity-80"></div>

            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center justify-center"></div>
          </div>
        </div>
      </div>
    </>
  )
}
