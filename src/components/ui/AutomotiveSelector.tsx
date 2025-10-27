import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Badge } from '@/src/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Search, Car, Check, X, Plus } from 'lucide-react'

interface AutomotiveSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (make: string, model: string, years: string[]) => void
  automotiveDatabase: Record<string, Record<string, string[]>>
}

export default function AutomotiveSelector({
  isOpen,
  onClose,
  onSelect,
  automotiveDatabase,
}: AutomotiveSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('popular')

  // Popular combinations for quick selection
  const popularCombinations = [
    { make: 'Mercedes-Benz', model: 'SL', years: ['2014', '2015', '2016'] },
    { make: 'Mercedes-Benz', model: 'SLS', years: ['2014', '2015'] },
    { make: 'BMW', model: '3 Series', years: ['2019', '2020', '2021', '2022'] },
    { make: 'Audi', model: 'A4', years: ['2018', '2019', '2020', '2021'] },
    { make: 'Toyota', model: 'Camry', years: ['2018', '2019', '2020'] },
    { make: 'Honda', model: 'Civic', years: ['2016', '2017', '2018', '2019'] },
    {
      make: 'Ford',
      model: 'F-150',
      years: ['2019', '2020', '2021', '2022', '2023'],
    },
  ]

  const filteredMakes = Object.keys(automotiveDatabase).filter(make =>
    make.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const availableModels =
    selectedMake && automotiveDatabase[selectedMake]
      ? Object.keys(automotiveDatabase[selectedMake]).filter(model =>
          model.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : []

  const availableYears =
    selectedMake &&
    selectedModel &&
    automotiveDatabase[selectedMake]?.[selectedModel]
      ? automotiveDatabase[selectedMake][selectedModel]
      : []

  const toggleYear = (year: string) => {
    setSelectedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    )
  }

  const selectYearRange = (startYear: string, endYear: string) => {
    const start = parseInt(startYear)
    const end = parseInt(endYear)
    const range = []
    for (let year = start; year <= end; year++) {
      if (availableYears.includes(year.toString())) {
        range.push(year.toString())
      }
    }
    setSelectedYears(range)
  }

  const handleQuickSelect = (combo: any) => {
    setSelectedMake(combo.make)
    setSelectedModel(combo.model)
    setSelectedYears(combo.years)
  }

  const handleConfirm = () => {
    if (selectedMake && selectedModel && selectedYears.length > 0) {
      onSelect(selectedMake, selectedModel, selectedYears)
      // Reset form
      setSelectedMake('')
      setSelectedModel('')
      setSelectedYears([])
      setSearchTerm('')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Car className="w-5 h-5 mr-2" />
            Add Automotive Capabilities
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search makes or models..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={activeTab === 'popular' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('popular')}
              className="flex-1"
            >
              🔥 Popular
            </Button>
            <Button
              variant={activeTab === 'custom' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('custom')}
              className="flex-1"
            >
              🔧 Custom Selection
            </Button>
          </div>

          {activeTab === 'popular' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">
                Quick Select - Popular Combinations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {popularCombinations.map((combo, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors hover:border-[#53a533]/30 ${
                      selectedMake === combo.make &&
                      selectedModel === combo.model
                        ? 'border-[#53a533]/50 bg-[#53a533]/5'
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleQuickSelect(combo)}
                  >
                    <div className="font-medium text-gray-900">
                      {combo.make} {combo.model}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Years: {combo.years.join(', ')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {combo.years.length} year
                      {combo.years.length !== 1 ? 's' : ''} included
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Step 1: Select Make */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">1. Select Make</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredMakes.map(make => (
                      <div
                        key={make}
                        className={`p-2 rounded border cursor-pointer transition-colors ${
                          selectedMake === make
                            ? 'border-[#53a533]/50 bg-[#53a533]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          setSelectedMake(make)
                          setSelectedModel('')
                          setSelectedYears([])
                        }}
                      >
                        <div className="font-medium text-sm">{make}</div>
                        <div className="text-xs text-gray-500">
                          {Object.keys(automotiveDatabase[make]).length} models
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Select Model */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">2. Select Model</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedMake ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availableModels.map(model => (
                        <div
                          key={model}
                          className={`p-2 rounded border cursor-pointer transition-colors ${
                            selectedModel === model
                              ? 'border-[#53a533]/50 bg-[#53a533]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setSelectedModel(model)
                            setSelectedYears([])
                          }}
                        >
                          <div className="font-medium text-sm">{model}</div>
                          <div className="text-xs text-gray-500">
                            {automotiveDatabase[selectedMake][model].length}{' '}
                            years available
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Select a make first
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 3: Select Years */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">3. Select Years</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedModel ? (
                    <div className="space-y-3">
                      {/* Quick Year Range Selection */}
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => selectYearRange('2020', '2024')}
                          className="text-xs"
                        >
                          2020-2024
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => selectYearRange('2015', '2019')}
                          className="text-xs"
                        >
                          2015-2019
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedYears(availableYears)}
                          className="text-xs"
                        >
                          All Years
                        </Button>
                      </div>

                      {/* Individual Year Selection */}
                      <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto">
                        {availableYears.map(year => (
                          <Button
                            key={year}
                            size="sm"
                            variant={
                              selectedYears.includes(year)
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() => toggleYear(year)}
                            className="text-xs"
                          >
                            {year}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Select a model first
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Selection Summary */}
          {(selectedMake || selectedModel || selectedYears.length > 0) && (
            <Card className="bg-[#53a533]/5 border-[#53a533]/20">
              <CardContent className="p-4">
                <h4 className="font-medium text-[#1f3f15] mb-2">
                  Selection Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[#2f5f1f]">Make:</span>
                    <Badge variant={selectedMake ? 'default' : 'secondary'}>
                      {selectedMake || 'Not selected'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[#2f5f1f]">Model:</span>
                    <Badge variant={selectedModel ? 'default' : 'secondary'}>
                      {selectedModel || 'Not selected'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[#2f5f1f]">Years:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedYears.length > 0 ? (
                        selectedYears.map(year => (
                          <Badge
                            key={year}
                            variant="outline"
                            className="text-xs"
                          >
                            {year}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary">None selected</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={
                !selectedMake || !selectedModel || selectedYears.length === 0
              }
              className="bg-[#4a9430] text-white hover:bg-[#3d7a28]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {selectedYears.length} Capability
              {selectedYears.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
