import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/src/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Textarea } from '@/src/components/ui/textarea'
import { Label } from '@/src/components/ui/label'
import { TrendingUp, Package, CreditCard, BarChart3, Bell, FileText, Box, Plus } from 'lucide-react'

const BillingAnsweringServicesSubscriptionPage = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<{ name: string; type: string; package: string; rate: string } | null>(null)
  const [entityType, setEntityType] = useState('source')
  const [selectedEntity, setSelectedEntity] = useState('')
  const [selectedPackage, setSelectedPackage] = useState('')
  const [reason, setReason] = useState('')

  const handleEdit = (row: { name: string; type: string; package: string; rate: string }) => {
    setEditingRow(row)
    setEntityType(row.type.toLowerCase())
    setSelectedEntity(row.name)
    setSelectedPackage(row.package)
    setReason('')
    setIsEditModalOpen(true)
  }

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving assignment:', { entityType, selectedEntity, selectedPackage, reason })
    setIsEditModalOpen(false)
  }

  const handleCancel = () => {
    setIsEditModalOpen(false)
    setEditingRow(null)
    setReason('')
  }

  const handleAddNew = () => {
    setEditingRow(null)
    setEntityType('source')
    setSelectedEntity('')
    setSelectedPackage('')
    setReason('')
    setIsEditModalOpen(true)
  }

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'usage', label: 'Usage', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'custom', label: 'Custom Packages', icon: Box },
  ]

  return (
    <>
      <Head>
        <title>My Answering Service - WePro</title>
        <meta name="description" content="Manage your answering service subscription" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            💼 My Answering Service
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your subscription, balance, and usage
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Current Balance
                  </p>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-3xl font-bold">$247.50</p>
                <p className="text-sm text-green-600">▲ 12% vs last</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Minutes Used
                  </p>
                </div>
                <p className="text-3xl font-bold">142 min</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  This month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Active Package
                  </p>
                </div>
                <p className="text-3xl font-bold">Professional</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  $2.00/min
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1">
          {tabItems.map(item => {
            const Icon = item.icon
            const active = activeTab === item.id

            return (
              <Button
                key={item.id}
                variant={active ? 'default' : 'ghost'}
                onClick={() => setActiveTab(item.id)}
                className="flex-1 items-center justify-center"
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Subscription Details */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Subscription Details</CardTitle>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        ● Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          Started:
                        </span>
                        <span className="text-sm font-medium">
                          October 1, 2024
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          Subscription ID:
                        </span>
                        <span className="text-sm font-medium">SUB-4CD-001</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      {/* Current Package */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-5 h-5 text-neutral-600" />
                          <span className="font-semibold">Current Package: Professional</span>
                        </div>
                        <div className="ml-7 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                          <div>• $2.00 per minute</div>
                          <div>• Includes appointment scheduling</div>
                          <div>• Advanced reporting</div>
                        </div>
                      </div>

                      <div className="border-t pt-4 space-y-3">
                        {/* Balance Info */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">💰</span>
                            <span className="font-semibold">Balance: $247.50</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">⚡</span>
                            <span className="font-semibold">
                              Auto-recharge: ON
                            </span>
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400 ml-7">
                            ($100 when balance &lt; $50)
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-4">
                        <Button variant="default" className="flex-1">
                          Recharge Now
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Change Package
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Manage Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Activity</CardTitle>
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <div>
                            <p className="text-sm font-medium">
                              Today 2:30 PM
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                              2 min call - Main Office
                            </p>
                          </div>
                        </div>
                        <span className="text-red-600 font-semibold">-$3.00</span>
                      </div>

                      <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <div>
                            <p className="text-sm font-medium">
                              Today 11:45 AM
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                              3 min call - Houston
                            </p>
                          </div>
                        </div>
                        <span className="text-red-600 font-semibold">-$4.50</span>
                      </div>

                      <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div>
                            <p className="text-sm font-medium">
                              Yesterday
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                              Auto-recharge successful
                            </p>
                          </div>
                        </div>
                        <span className="text-green-600 font-semibold">+$100</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <div>
                            <p className="text-sm font-medium">
                              Oct 22
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                              30 min total usage
                            </p>
                          </div>
                        </div>
                        <span className="text-red-600 font-semibold">-$45.00</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-neutral-500">Payments content coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-neutral-500">Usage content coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-neutral-500">Alerts content coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-neutral-500">Reports content coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Packages Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Entity-Specific Package Assignments</CardTitle>
                    <Button variant="default" onClick={handleAddNew}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Assignment
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      <span className="font-semibold">Default Package:</span> Professional ($2.00/min) - Applied to all by default
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Assignments Table */}
              <Card>
                <CardContent className="pt-6 px-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            Entity Name
                          </th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            Type
                          </th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            Package
                          </th>
                          <th className="text-left px-6 py-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            Rate
                          </th>
                          <th className="text-right px-6 py-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Houston Branch */}
                        <tr className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">Houston Branch</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary">Franchise</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline">Basic</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">$1.50/min</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit({ name: 'Houston Branch', type: 'Franchise', package: 'Basic', rate: '$1.50/min' })}
                              >
                                ✏️
                              </Button>
                              <Button variant="ghost" size="sm">
                                🗑️
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {/* Dallas Branch */}
                        <tr className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">Dallas Branch</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary">Franchise</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="default">Enterprise</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">$2.50/min</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit({ name: 'Dallas Branch', type: 'Franchise', package: 'Enterprise', rate: '$2.50/min' })}
                              >
                                ✏️
                              </Button>
                              <Button variant="ghost" size="sm">
                                🗑️
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {/* Fort Worth */}
                        <tr className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">Fort Worth</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary">Franchise</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline">Basic</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">$1.50/min</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit({ name: 'Fort Worth', type: 'Franchise', package: 'Basic', rate: '$1.50/min' })}
                              >
                                ✏️
                              </Button>
                              <Button variant="ghost" size="sm">
                                🗑️
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {/* Google Ads */}
                        <tr className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">Google Ads</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="default">Source</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="default">Enterprise</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">$2.50/min</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit({ name: 'Google Ads', type: 'Source', package: 'Enterprise', rate: '$2.50/min' })}
                              >
                                ✏️
                              </Button>
                              <Button variant="ghost" size="sm">
                                🗑️
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {/* Facebook Leads */}
                        <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">Facebook Leads</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="default">Source</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline">Basic</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">$1.50/min</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit({ name: 'Facebook Leads', type: 'Source', package: 'Basic', rate: '$1.50/min' })}
                              >
                                ✏️
                              </Button>
                              <Button variant="ghost" size="sm">
                                🗑️
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Showing 5 custom assignments
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Previous
                      </Button>
                      <Button variant="outline" size="sm">
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Assign Custom Package Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>📦 Assign Custom Package</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Entity Type */}
            <div className="space-y-3">
              <Label htmlFor="entity-type">Entity Type *</Label>
              <RadioGroup
                value={entityType}
                onValueChange={setEntityType}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="franchise" id="franchise" />
                  <Label htmlFor="franchise" className="font-normal cursor-pointer">
                    Franchise
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="source" id="source" />
                  <Label htmlFor="source" className="font-normal cursor-pointer">
                    Source
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Select Entity */}
            <div className="space-y-2">
              <Label htmlFor="select-entity">Select Entity *</Label>
              <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                <SelectTrigger id="select-entity">
                  <SelectValue placeholder="Choose a source..." />
                </SelectTrigger>
                <SelectContent>
                  {entityType === 'franchise' ? (
                    <>
                      <SelectItem value="Houston Branch">Houston Branch</SelectItem>
                      <SelectItem value="Dallas Branch">Dallas Branch</SelectItem>
                      <SelectItem value="Fort Worth">Fort Worth</SelectItem>
                      <SelectItem value="Austin Branch">Austin Branch</SelectItem>
                      <SelectItem value="San Antonio">San Antonio</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Google Ads">Google Ads</SelectItem>
                      <SelectItem value="Facebook Leads">Facebook Leads</SelectItem>
                      <SelectItem value="Website Contact">Website Contact</SelectItem>
                      <SelectItem value="Phone Directory">Phone Directory</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Select Package */}
            <div className="space-y-2">
              <Label htmlFor="select-package">Select Package *</Label>
              <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                <SelectTrigger id="select-package">
                  <SelectValue placeholder="Choose package..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic - $1.50/minute</SelectItem>
                  <SelectItem value="Professional">Professional - $2.00/minute (Current Default)</SelectItem>
                  <SelectItem value="Enterprise">Enterprise - $2.50/minute</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reason for Custom Assignment */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Custom Assignment (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="High-value leads requiring premium service"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BillingAnsweringServicesSubscriptionPage
