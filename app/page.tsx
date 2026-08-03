"use client"

import type React from "react"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { setUserPreferences } from "@/lib/features/carSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { User, RefreshCw, Search } from "lucide-react"

export default function HomePage() {
  const dispatch = useDispatch()
  const router = useRouter()

  const [formData, setFormData] = useState({
    creditScore: "780",
    monthlyBudget: "700",
    vehicleType: "Car",
    downPayment: "15000",
    hasTrade: "no",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.creditScore || !formData.monthlyBudget || !formData.vehicleType || !formData.downPayment) {
      alert("Please fill in all fields")
      return
    }

    dispatch(
      setUserPreferences({
        monthlyBudget: Number.parseFloat(formData.monthlyBudget),
        creditScore: Number.parseInt(formData.creditScore),
        vehicleType: formData.vehicleType,
        downPayment: Number.parseFloat(formData.downPayment),
        hasTrade: formData.hasTrade === "yes",
      }),
    )
    router.push("/results")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex min-h-screen">
      {/* Left sidebar with gradient */}
      <div className="w-24 bg-gradient-to-b from-blue-500 to-blue-700 fixed left-0 top-0 h-full"></div>

      {/* Right sidebar with gradient */}
      <div className="w-24 bg-gradient-to-b from-blue-500 to-blue-700 fixed right-0 top-0 h-full"></div>

      {/* Main content with proper margins to avoid sidebar overlap */}
      <div className="w-full mx-24">
        <div className="max-w-4xl mx-auto py-8 md:py-12">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Customer Information Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <User className="h-6 w-6 text-gray-700" />
                <h2 className="text-2xl font-medium text-gray-700">Customer Information</h2>
              </div>
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-700 mb-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="creditScore" className="text-gray-700">
                    Credit Score
                  </Label>
                  <Input
                    id="creditScore"
                    type="number"
                    value={formData.creditScore}
                    onChange={(e) => handleInputChange("creditScore", e.target.value)}
                    min="300"
                    max="850"
                    className="border-gray-300"
                  />
                  <p className="text-sm text-gray-500">Enter your credit score (300-850)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyBudget" className="text-gray-700">
                    Monthly Payment Budget ($)
                  </Label>
                  <Input
                    id="monthlyBudget"
                    type="number"
                    value={formData.monthlyBudget}
                    onChange={(e) => handleInputChange("monthlyBudget", e.target.value)}
                    min="100"
                    max="5000"
                    className="border-gray-300"
                  />
                  <p className="text-sm text-gray-500">Maximum monthly payment you can afford</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="downPayment" className="text-gray-700">
                    Down Payment ($)
                  </Label>
                  <Input
                    id="downPayment"
                    type="number"
                    value={formData.downPayment}
                    onChange={(e) => handleInputChange("downPayment", e.target.value)}
                    min="0"
                    max="100000"
                    className="border-gray-300"
                  />
                  <p className="text-sm text-gray-500">Amount you can pay upfront</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleType" className="text-gray-700">
                    Preferred Vehicle Type
                  </Label>
                  <Select
                    value={formData.vehicleType}
                    onValueChange={(value) => handleInputChange("vehicleType", value)}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Car">Car</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Truck">Truck</SelectItem>
                      <SelectItem value="Van">Van</SelectItem>
                      <SelectItem value="Luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Trade-in Information Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="h-6 w-6 text-gray-700" />
                <h2 className="text-2xl font-medium text-gray-700">Trade-in Information</h2>
              </div>
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-700 mb-6"></div>

              <div className="space-y-4">
                <Label className="text-gray-700">Do you have a vehicle to trade in?</Label>
                <RadioGroup
                  value={formData.hasTrade}
                  onValueChange={(value) => handleInputChange("hasTrade", value)}
                  className="flex gap-8"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="trade-yes" />
                    <Label htmlFor="trade-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="trade-no" />
                    <Label htmlFor="trade-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 rounded-md text-lg font-medium flex items-center gap-2"
              >
                <Search className="h-5 w-5" />
                FIND MY PERFECT CAR
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
