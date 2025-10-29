import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Plus, ArrowLeft } from 'lucide-react'

interface PaymentCard {
  id: string
  type: string
  last4: string
  expires: string
  addedDate: string
  status: 'primary' | 'secondary' | 'inactive'
}

const BillingAnsweringServicesPaymentMethodPage = () => {
  const router = useRouter()
  
  const [cards, setCards] = useState<PaymentCard[]>([
    {
      id: '1',
      type: 'Visa',
      last4: '4242',
      expires: '12/2025',
      addedDate: 'Oct 1, 2024',
      status: 'primary'
    },
    {
      id: '2',
      type: 'MasterCard',
      last4: '5555',
      expires: '08/2026',
      addedDate: 'Oct 15, 2024',
      status: 'secondary'
    },
    {
      id: '3',
      type: 'Amex',
      last4: '1111',
      expires: '03/2027',
      addedDate: 'Oct 20, 2024',
      status: 'inactive'
    }
  ])

  const getStatusBadge = (status: PaymentCard['status']) => {
    switch (status) {
      case 'primary':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">PRIMARY</Badge>
      case 'secondary':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">SECONDARY</Badge>
      default:
        return null
    }
  }

  const handleSetPrimary = (id: string) => {
    setCards(cards.map(card => {
      if (card.id === id) {
        return { ...card, status: 'primary' }
      }
      if (card.status === 'primary') {
        return { ...card, status: 'inactive' }
      }
      return card
    }))
  }

  const handleSetSecondary = (id: string) => {
    setCards(cards.map(card => {
      if (card.id === id) {
        return { ...card, status: 'secondary' }
      }
      if (card.status === 'secondary') {
        return { ...card, status: 'inactive' }
      }
      return card
    }))
  }

  const handleRemoveCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id))
  }

  const getPrimaryCard = () => cards.find(card => card.status === 'primary')
  const getSecondaryCard = () => cards.find(card => card.status === 'secondary')

  const getActionButtons = (card: PaymentCard) => {
    const buttons = []
    
    if (card.status === 'primary') {
      buttons.push(
        <Button
          key="secondary"
          variant="outline"
          size="sm"
          onClick={() => handleSetSecondary(card.id)}
        >
          Set as Secondary
        </Button>
      )
    } else if (card.status === 'secondary') {
      buttons.push(
        <Button
          key="primary"
          variant="outline"
          size="sm"
          onClick={() => handleSetPrimary(card.id)}
        >
          Set as Primary
        </Button>
      )
    } else { // inactive
      buttons.push(
        <Button
          key="primary"
          variant="outline"
          size="sm"
          onClick={() => handleSetPrimary(card.id)}
        >
          Set as Primary
        </Button>,
        <Button
          key="secondary"
          variant="outline"
          size="sm"
          onClick={() => handleSetSecondary(card.id)}
        >
          Set as Secondary
        </Button>
      )
    }
    
    buttons.push(
      <Button
        key="remove"
        variant="outline"
        size="sm"
        onClick={() => handleRemoveCard(card.id)}
      >
        Remove
      </Button>
    )
    
    return buttons
  }

  return (
    <>
      <Head>
        <title>Payment Methods - WePro</title>
        <meta name="description" content="Manage your payment methods" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            💳 Payment Methods
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your payment methods and auto-recharge settings
          </p>
        </div>

        {/* Your Cards Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Cards</CardTitle>
              <Button variant="default">
                <Plus className="w-4 h-4 mr-2" />
                Add New Card
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={`
                  ${index !== cards.length - 1 ? 'border-b border-neutral-200 dark:border-neutral-700' : ''}
                  py-4
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{card.type} ****{card.last4}</span>
                        {getStatusBadge(card.status)}
                      </div>
                      <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                        <p>Expires: {card.expires}</p>
                        <p>Added: {card.addedDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 ml-9">
                  {getActionButtons(card)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Auto-Recharge Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Auto-Recharge Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Primary Card:</span>
                <span className="font-semibold">
                  {getPrimaryCard() ? `${getPrimaryCard()?.type} ****${getPrimaryCard()?.last4}` : 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Secondary Card:</span>
                <span className="font-semibold">
                  {getSecondaryCard() ? `${getSecondaryCard()?.type} ****${getSecondaryCard()?.last4}` : 'Not set'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ℹ️ If primary card fails, secondary will be charged
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default BillingAnsweringServicesPaymentMethodPage
