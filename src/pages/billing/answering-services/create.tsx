import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Badge } from '@/src/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { X, Plus, ArrowLeft } from 'lucide-react'
import { cn } from '@/src/lib/utils'

interface Recipient {
  id: string
  email: string
  label: string
}

const BillingAnsweringServicesCreatePage = () => {
  const router = useRouter()
  const { package: packageParam } = router.query
  
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedPackage, setSelectedPackage] = useState<string>('professional')
  
  // Step 1 Form State
  const [subscriptionName, setSubscriptionName] = useState('')
  const [initialBalance, setInitialBalance] = useState<string>('100')
  const [enableAutoRecharge, setEnableAutoRecharge] = useState(true)
  const [balanceFallBelow, setBalanceFallBelow] = useState('50')
  const [rechargeAmount, setRechargeAmount] = useState('100')
  const [sendBalanceAlerts, setSendBalanceAlerts] = useState(true)
  const [alertThresholds, setAlertThresholds] = useState<string[]>(['100', '50', '25'])
  const [newThreshold, setNewThreshold] = useState('')
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', email: 'billing@company.com', label: 'Billing Dept' }
  ])
  const [newRecipientEmail, setNewRecipientEmail] = useState('')
  const [newRecipientLabel, setNewRecipientLabel] = useState('')
  
  // Step 2 State
  const [subscriptionId, setSubscriptionId] = useState('SUB-4CD-001')
  
  const balanceOptions = ['50', '100', '250', 'custom']
  const amountOptions = ['50', '100', '200', '250', '500', '1000']
  const thresholdOptions = ['10', '25', '50', '75', '100', '200']

  useEffect(() => {
    if (packageParam) {
      setSelectedPackage(packageParam as string)
    }
  }, [packageParam])

  const getPackageInfo = () => {
    const packages: Record<string, { name: string; emoji: string; price: string; setupFee: string }> = {
      basic: {
        name: 'Basic',
        emoji: '🥉',
        price: '$1.50/minute',
        setupFee: 'No Setup Fee'
      },
      professional: {
        name: 'Professional',
        emoji: '🥈',
        price: '$2.00/minute',
        setupFee: '$50 One-time Setup Fee'
      },
      enterprise: {
        name: 'Enterprise',
        emoji: '🥇',
        price: '$2.50/minute',
        setupFee: '$100 One-time Setup Fee'
      }
    }
    return packages[selectedPackage] || packages.professional
  }

  const packageInfo = getPackageInfo()
  
  const calculateTotalDue = () => {
    const setupFee = selectedPackage === 'basic' ? 0 : selectedPackage === 'professional' ? 50 : 100
    const balance = parseInt(initialBalance) || 0
    return setupFee + balance
  }

  const handleAddThreshold = () => {
    if (newThreshold && !alertThresholds.includes(newThreshold)) {
      setAlertThresholds([...alertThresholds, newThreshold])
      setNewThreshold('')
    }
  }

  const handleRemoveThreshold = (threshold: string) => {
    setAlertThresholds(alertThresholds.filter(t => t !== threshold))
  }

  const handleAddRecipient = () => {
    if (newRecipientEmail && newRecipientLabel) {
      const newRecipient: Recipient = {
        id: Date.now().toString(),
        email: newRecipientEmail,
        label: newRecipientLabel
      }
      setRecipients([...recipients, newRecipient])
      setNewRecipientEmail('')
      setNewRecipientLabel('')
    }
  }

  const handleRemoveRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id))
  }

  const handleContinueToStep2 = () => {
    setCurrentStep(2)
  }

  const handleComplete = () => {
    router.push('/billing/answering-services')
  }

  const handleViewDashboard = () => {
    router.push('/billing/answering-services/subscription')
  }

  const handleManageSubscription = () => {
    router.push('/billing/answering-services/subscription')
  }

  const handleAddPaymentMethod = () => {
    router.push('/billing/answering-services/paymentMethod')
  }

  if (currentStep === 2) {
    return (
      <>
        <Head>
          <title>Subscription Created - WePro</title>
          <meta name="description" content="Subscription successfully created" />
        </Head>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              Subscription Successfully Created!
            </h1>
          </div>

          {/* Subscription Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-neutral-600 dark:text-neutral-400">ID:</Label>
                  <p className="font-semibold">{subscriptionId}</p>
                </div>
                <div>
                  <Label className="text-neutral-600 dark:text-neutral-400">Provider:</Label>
                  <p className="font-semibold">ABC Answering Service</p>
                </div>
                <div>
                  <Label className="text-neutral-600 dark:text-neutral-400">Package:</Label>
                  <p className="font-semibold">{packageInfo.name} ({packageInfo.price})</p>
                </div>
                <div>
                  <Label className="text-neutral-600 dark:text-neutral-400">Balance:</Label>
                  <p className="font-semibold text-green-600">${initialBalance}.00</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-neutral-600 dark:text-neutral-400">Status:</Label>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ● Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next Card */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                <li>• Configure franchise-specific packages (optional)</li>
                <li>• Set up additional payment methods</li>
                <li>• Review alert settings</li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1"
              variant="outline"
              onClick={handleViewDashboard}
            >
              View Dashboard
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={handleManageSubscription}
            >
              Manage Subscription
            </Button>
            <Button
              className="flex-1"
              onClick={handleAddPaymentMethod}
            >
              Add Payment Method
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Setup Answering Service - WePro</title>
        <meta name="description" content="Setup your answering service subscription" />
      </Head>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Step {currentStep}/3
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Setup Your Answering Service
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Configure your subscription settings and payment preferences
          </p>
        </div>

        {/* Selected Package Card */}
        <Card className="border-2 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{packageInfo.emoji}</span>
              <div>
                <h3 className="font-semibold text-lg">{packageInfo.name} Package</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {packageInfo.price} • {packageInfo.setupFee}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 1: Subscription Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Subscription Name */}
            <div className="space-y-2">
              <Label htmlFor="subscriptionName">
                Subscription Name *
              </Label>
              <Input
                id="subscriptionName"
                placeholder="Main Office Answering Service"
                value={subscriptionName}
                onChange={(e) => setSubscriptionName(e.target.value)}
              />
            </div>

            {/* Initial Balance Recharge */}
            <div className="space-y-3">
              <Label>Initial Balance Recharge *</Label>
              <div className="grid grid-cols-4 gap-3">
                {balanceOptions.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={initialBalance === option ? 'default' : 'outline'}
                    onClick={() => setInitialBalance(option)}
                    className="capitalize"
                  >
                    ${option}
                  </Button>
                ))}
              </div>
              {initialBalance === 'custom' && (
                <Input
                  type="number"
                  placeholder="Enter custom amount"
                  onChange={(e) => setInitialBalance(e.target.value)}
                />
              )}
            </div>

            {/* Auto-Recharge Settings */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoRecharge"
                  checked={enableAutoRecharge}
                  onCheckedChange={(checked) => setEnableAutoRecharge(checked as boolean)}
                />
                <Label htmlFor="autoRecharge" className="text-base font-semibold">
                  ⚡ Enable automatic recharge
                </Label>
              </div>

              {enableAutoRecharge && (
                <div className="space-y-3 pl-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>When balance falls below:</Label>
                      <Select value={balanceFallBelow} onValueChange={setBalanceFallBelow}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {amountOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              ${option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Recharge amount:</Label>
                      <Select value={rechargeAmount} onValueChange={setRechargeAmount}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {amountOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              ${option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Alert Settings */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="balanceAlerts"
                  checked={sendBalanceAlerts}
                  onCheckedChange={(checked) => setSendBalanceAlerts(checked as boolean)}
                />
                <Label htmlFor="balanceAlerts" className="text-base font-semibold">
                  🔔 Send balance alerts
                </Label>
              </div>

              {sendBalanceAlerts && (
                <div className="space-y-3 pl-6">
                  <Label>Alert thresholds:</Label>
                  <div className="flex flex-wrap gap-2">
                    {alertThresholds.map((threshold) => (
                      <Badge key={threshold} variant="secondary" className="gap-1">
                        ${threshold}
                        <button
                          onClick={() => handleRemoveThreshold(threshold)}
                          className="ml-1 hover:bg-neutral-300 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Add threshold"
                      value={newThreshold}
                      onChange={(e) => setNewThreshold(e.target.value)}
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddThreshold}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label>Recipients:</Label>
                    <div className="space-y-2">
                      {recipients.map((recipient) => (
                        <div key={recipient.id} className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                          <span className="text-sm">
                            • {recipient.email} ({recipient.label})
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRecipient(recipient.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={newRecipientEmail}
                        onChange={(e) => setNewRecipientEmail(e.target.value)}
                      />
                      <Input
                        type="text"
                        placeholder="Label"
                        value={newRecipientLabel}
                        onChange={(e) => setNewRecipientLabel(e.target.value)}
                        className="w-32"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddRecipient}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Recipient
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total and Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-neutral-600 dark:text-neutral-400">Total Due Today:</Label>
                <p className="text-2xl font-bold">${calculateTotalDue()}</p>
                <p className="text-sm text-neutral-500">Setup + Initial Balance</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleContinueToStep2}
                  disabled={!subscriptionName}
                >
                  Continue to Payment →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default BillingAnsweringServicesCreatePage
