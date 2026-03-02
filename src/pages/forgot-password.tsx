import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Card, CardContent } from '@/src/components/ui/card'
import { Mail } from 'lucide-react'
import { apiService } from '@/src/services/api'
import logo from '../../public/logo.png'
import logoAlt from '../../public/logo-alt.png'

export default function ForgotPassword(): React.JSX.Element {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      if (!email) {
        throw new Error('Please enter your email address')
      }

      await apiService.post('/v3/auth/forgot-password', {
        email,
      })

      setMessage(
        'If an account exists for this email, we sent reset instructions.'
      )
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message
      setError(
        apiMessage ||
          (err instanceof Error ? err.message : 'Unable to process request')
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Forgot Password - WePro</title>
        <meta name="description" content="Reset your WePro password" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex">
        <div className="absolute top-6 left-6 flex items-center space-x-3 z-10">
          <img
            src={mounted && resolvedTheme === 'dark' ? logoAlt.src : logo.src}
            alt="WePro Logo"
            className="h-8 w-auto"
            draggable={false}
          />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-neutral-900">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-none bg-white dark:bg-neutral-900">
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold text-black dark:text-white mb-2 text-center">
                  Reset your password
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-10 text-center">
                  Enter the email associated with your account and we will send
                  you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-black dark:text-gray-300"
                    >
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-10 h-11 focus:ring-[#4a9430] focus:ring-1 focus:outline-none focus-visible:ring-[#4a9430] focus-visible:ring-2 focus-visible:ring-offset-0"
                        required
                      />
                    </div>
                  </div>

                  {message && (
                    <div className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                      {message}
                    </div>
                  )}

                  {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-[#53a533] hover:bg-[#4a9430] h-11 text-white font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending link...</span>
                      </div>
                    ) : (
                      'Send reset link'
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Remembered it?{' '}
                  <Link href="/login" legacyBehavior passHref>
                    <a className="text-[#53a533] hover:text-[#4a9430] font-medium">
                      Back to login
                    </a>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 relative">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://vs-dev.wepro.ai/assets/images/big/auth-bg2.jpg')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black to-[#4a9430] opacity-80"></div>
            <div className="absolute inset-0 flex items-center justify-center"></div>
          </div>
        </div>
      </div>
    </>
  )
}

