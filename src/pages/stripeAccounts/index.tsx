import { useRouter } from 'next/router'
import Head from 'next/head'
import { useEffect } from 'react'

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'Settings' },
  { key: 'payouts', label: 'Payouts', icon: 'TrendingUp' },
  { key: 'payments', label: 'Payments', icon: 'CreditCard' },
  { key: 'disputes', label: 'Disputes', icon: 'AlertTriangle' },
  { key: 'equipment', label: 'Equipment', icon: 'ShoppingCart' },
]

export default function StripeAccountsLayout() {
  const router = useRouter()
  const { asPath, pathname } = router

  // Redirect /stripeAccounts to /stripeAccounts/overview only if we're at the exact /stripeAccounts path
  useEffect(() => {
    if (pathname === '/stripeAccounts' && asPath === '/stripeAccounts') {
      router.replace('/stripeAccounts/overview')
    }
  }, [pathname, asPath, router])

  // If we're at the exact /stripeAccounts path, show the tabbed interface
  if (pathname === '/stripeAccounts' && asPath === '/stripeAccounts') {
    return (
      <>
        <Head>
          <title>Stripe Accounts - WePro</title>
          <meta
            name="description"
            content="Manage WePro Stripe accounts and payment processing"
          />
        </Head>
      </>
    )
  }

  return null // This component will redirect, so no need to render anything
}
