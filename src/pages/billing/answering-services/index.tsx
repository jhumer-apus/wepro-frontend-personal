import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/src/components/ui/dialog'
import { Check, Star, X } from 'lucide-react'
import { cn } from '@/src/lib/utils'

interface PackageFeature {
  text: string
}

interface Package {
  tier: 'basic' | 'professional' | 'enterprise'
  name: string
  price: string
  pricePer: string
  setupFee: string
  features: PackageFeature[]
  perfectFor: string
  badge?: string
  badgeVariant?: 'default' | 'secondary'
}

const packages: Package[] = [
  {
    tier: 'basic',
    name: 'Basic',
    price: '$1.50',
    pricePer: '/minute',
    setupFee: 'No Setup Fee',
    features: [
      { text: '24/7 Coverage' },
      { text: 'Message Take' },
      { text: 'Call Forward' },
      { text: 'Basic Reports' },
      { text: 'Email Alerts' },
    ],
    perfectFor: 'Small Business',
  },
  {
    tier: 'professional',
    name: 'Professional',
    price: '$2.00',
    pricePer: '/minute',
    setupFee: '$50 Setup Fee',
    features: [
      { text: 'All Basic Features' },
      { text: 'Appointments' },
      { text: 'Order Processing' },
      { text: 'Call Recording' },
      { text: 'SMS Alerts' },
      { text: 'Detailed Reports' },
    ],
    perfectFor: 'Growing Teams',
    badge: 'Most Popular',
    badgeVariant: 'default',
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    price: '$2.50',
    pricePer: '/minute',
    setupFee: '$100 Setup',
    features: [
      { text: 'All Professional Features' },
      { text: 'CRM Integration' },
      { text: 'Custom Scripts' },
      { text: 'API Access' },
      { text: 'Priority Support' },
      { text: 'White Label' },
    ],
    perfectFor: 'Enterprises',
  },
]

// Comparison data with all features
interface ComparisonFeature {
  name: string
  basic: boolean
  professional: boolean
  enterprise: boolean
}

const comparisonFeatures: ComparisonFeature[] = [
  { name: '24/7 Coverage', basic: true, professional: true, enterprise: true },
  { name: 'Message Taking', basic: true, professional: true, enterprise: true },
  { name: 'Call Forwarding', basic: true, professional: true, enterprise: true },
  { name: 'Email Notifications', basic: true, professional: true, enterprise: true },
  { name: 'Basic Reporting', basic: true, professional: true, enterprise: true },
  { name: 'Appointment Scheduling', basic: false, professional: true, enterprise: true },
  { name: 'Order Processing', basic: false, professional: true, enterprise: true },
  { name: 'Call Recording', basic: false, professional: true, enterprise: true },
  { name: 'SMS Notifications', basic: false, professional: true, enterprise: true },
  { name: 'Advanced Reports', basic: false, professional: true, enterprise: true },
  { name: 'CRM Integration', basic: false, professional: false, enterprise: true },
  { name: 'Custom Scripts', basic: false, professional: false, enterprise: true },
  { name: 'API Access', basic: false, professional: false, enterprise: true },
  { name: 'Priority Support', basic: false, professional: false, enterprise: true },
  { name: 'White Label Options', basic: false, professional: false, enterprise: true },
]

const BillingAnsweringServicesPage = () => {
  const router = useRouter()
  const [compareModalOpen, setCompareModalOpen] = useState(false)

  const handleSelectPackage = (tier: string) => {
    // Navigate to create page with the selected package
    router.push(`/billing/answering-services/create?package=${tier}`)
  }

  const getTierEmoji = (tier: string) => {
    switch (tier) {
      case 'basic':
        return '🥉'
      case 'professional':
        return '🥈'
      case 'enterprise':
        return '🥇'
      default:
        return '📦'
    }
  }

  const getTierStyles = (tier: string) => {
    switch (tier) {
      case 'professional':
        return 'border-2 border-primary shadow-lg'
      default:
        return 'border border-neutral-200 dark:border-neutral-700'
    }
  }

  return (
    <>
      <Head>
        <title>Answering Services Packages - WePro</title>
        <meta
          name="description"
          content="Choose your answering service package"
        />
      </Head>

      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant="ghost"
            onClick={() => router.push('/billing/wepro')}
            className="flex-1 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mr-2"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            WePro
          </Button>
          <Button
            variant="default"
            onClick={() => router.push('/billing/answering-services')}
            className="flex-1 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 mr-2"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Answering Services
          </Button>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            📦 Choose Your Answering Service Package
            </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Select the package that best fits your business needs
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setCompareModalOpen(true)}
              className="gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M8 7h8M8 11h8M8 15h8M8 19h8" />
              </svg>
              Compare Packages
            </Button>
          </div>
        </div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {packages.map(packageItem => (
            <Card
              key={packageItem.tier}
              className={cn(
                'flex flex-col h-full',
                getTierStyles(packageItem.tier)
              )}
            >
              <CardHeader className="relative">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-4xl">{getTierEmoji(packageItem.tier)}</span>
              </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {packageItem.name.toUpperCase()}
                  </h3>
                  {packageItem.badge && (
                    <Badge
                      variant={packageItem.badgeVariant || 'default'}
                      className="mt-2"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {packageItem.badge}
                    </Badge>
                )}
              </div>
              </CardHeader>

              <CardContent className="flex flex-col flex-1">
                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                      {packageItem.price}
                    </span>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {packageItem.pricePer}
                    </span>
                        </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {packageItem.setupFee}
                          </p>
                        </div>

                {/* Features */}
                <div className="flex-1 space-y-3 mb-6">
                  {packageItem.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {feature.text}
                            </span>
                          </div>
                  ))}
            </div>

                {/* Perfect For */}
                <div className="mb-4 text-center">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Perfect for:
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {packageItem.perfectFor}
                  </p>
              </div>

                {/* Select Button */}
                <Button
                  className="w-full"
                        variant={
                    packageItem.tier === 'professional' ? 'default' : 'outline'
                  }
                  onClick={() => handleSelectPackage(packageItem.tier)}
                >
                  {packageItem.tier === 'professional'
                    ? 'Select Pro →'
                    : `Select ${packageItem.name}`}
                </Button>
          </CardContent>
        </Card>
          ))}
      </div>

        {/* Compare Packages Modal */}
        <Dialog open={compareModalOpen} onOpenChange={setCompareModalOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                📊 Compare Package Features
              </DialogTitle>
              <DialogDescription>
                Compare all features across our packages to find the best fit for your business
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6">
              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-neutral-200 dark:border-neutral-700">
                      <th className="text-left p-3 font-semibold text-neutral-900 dark:text-neutral-100">
                        Feature
                      </th>
                      <th className="text-center p-3 font-semibold text-neutral-900 dark:text-neutral-100">
                        Basic
                      </th>
                      <th className="text-center p-3 font-semibold text-neutral-900 dark:text-neutral-100">
                        Professional
                      </th>
                      <th className="text-center p-3 font-semibold text-neutral-900 dark:text-neutral-100">
                        Enterprise
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Pricing Row */}
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
                      <td className="p-3 font-medium">Price per minute</td>
                      <td className="text-center p-3">$1.50</td>
                      <td className="text-center p-3">$2.00</td>
                      <td className="text-center p-3">$2.50</td>
                    </tr>
                    <tr className="border-b-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
                      <td className="p-3 font-medium">Setup Fee</td>
                      <td className="text-center p-3">FREE</td>
                      <td className="text-center p-3">$50</td>
                      <td className="text-center p-3">$100</td>
                    </tr>

                    {/* Feature Rows */}
                    {comparisonFeatures.map((feature, index) => (
                      <tr
                        key={index}
                        className={cn(
                          'border-b border-neutral-200 dark:border-neutral-700',
                          index % 5 === 4 && 'border-b-2'
                        )}
                      >
                        <td className="p-3">{feature.name}</td>
                        <td className="text-center p-3">
                          {feature.basic ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </td>
                        <td className="text-center p-3">
                          {feature.professional ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </td>
                        <td className="text-center p-3">
                          {feature.enterprise ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <DialogFooter className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => handleSelectPackage('basic')}
                className="flex-1"
              >
                Select Basic
              </Button>
              <Button
                variant="default"
                onClick={() => handleSelectPackage('professional')}
                className="flex-1"
              >
                Select Professional
              </Button>
              <Button
                variant="default"
                onClick={() => handleSelectPackage('enterprise')}
                className="flex-1"
              >
                Select Enterprise
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default BillingAnsweringServicesPage
