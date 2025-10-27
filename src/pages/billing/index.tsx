import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const BillingIndex: React.FC = (): React.JSX.Element | null => {
  const router = useRouter()
  const { pathname, asPath } = router

  // Redirect /billing to /billing/wepro
  useEffect(() => {
    if (pathname === '/billing' && asPath === '/billing') {
      router.replace('/billing/wepro')
    }
  }, [pathname, asPath, router])

  // Return null while redirecting
  return (
    <>
      <Head>
        <title>Billing - WePro</title>
        <meta name="description" content="Manage billing and subscriptions" />
      </Head>
      {null}
    </>
  )
}

export default BillingIndex
