import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import Layout from '../components/layout/index'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '../store'
import { AuthGuard } from '../components/AuthGuard'
import { useRouter } from 'next/router'
import { LoadScript } from '@react-google-maps/api'
import { ThemeProvider } from 'next-themes'

const inter = Inter({ subsets: ['latin'] })

// Loading component for PersistGate
const LoadingComponent = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-[#53a533] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
)

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isLoginPage = router.pathname === '/login'

  return (
    <div className={inter.className}>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
        libraries={['places']}
      >
        <AuthGuard>
          {isLoginPage ? (
            <Component {...pageProps} />
          ) : (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          )}
        </AuthGuard>
      </LoadScript>
    </div>
  )
}

export default function App(props: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingComponent />} persistor={persistor}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AppContent {...props} />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  )
}
