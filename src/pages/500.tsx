import Head from 'next/head'
import Link from 'next/link'

export default function Custom500() {
  return (
    <>
      <Head>
        <title>500 - Server Error | WePro</title>
        <meta name="description" content="Internal server error" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
          <p className="text-xl text-gray-600 mb-8">Internal server error</p>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go Home
          </Link>
        </div>
      </div>
    </>
  )
}
