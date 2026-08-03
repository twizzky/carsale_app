"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import type { RootState } from "@/lib/store"
import { getRecommendedCars } from "@/lib/carService"
import type { Car } from "@/lib/types"
import { CarCard } from "@/components/CarCard"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Info, Filter } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ResultsPage() {
  const router = useRouter()
  const userPreferences = useSelector((state: RootState) => state.car.userPreferences)
  const [recommendedCars, setRecommendedCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [showFallbackNotice, setShowFallbackNotice] = useState(false)
  const [sortBy, setSortBy] = useState<string>("price-asc")
  const [filterMake, setFilterMake] = useState<string>("all")
  const [availableMakes, setAvailableMakes] = useState<string[]>([])

  useEffect(() => {
    if (!userPreferences) {
      console.log("No user preferences found, redirecting to home")
      router.push("/")
      return
    }

    const fetchRecommendations = async () => {
      setLoading(true)
      try {
        console.log("Fetching recommendations with preferences:", userPreferences)
        const cars = await getRecommendedCars(userPreferences)
        console.log("Received cars:", cars.length)
        setRecommendedCars(cars)

        // Extract unique makes for filtering
        const makes = Array.from(new Set(cars.map((car) => car.make)))
        setAvailableMakes(makes)

        setShowFallbackNotice(
          cars.length > 0 && cars.some((c) => c.estimatedMonthly > userPreferences.monthlyBudget * 1.1),
        )
      } catch (error) {
        console.error("Error fetching recommendations:", error)
        setRecommendedCars([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [userPreferences, router])

  const sortAndFilterCars = () => {
    let filtered = [...recommendedCars]

    // Apply make filter
    if (filterMake !== "all") {
      filtered = filtered.filter((car) => car.make === filterMake)
    }

    // Apply sorting
    switch (sortBy) {
      case "price-asc":
        return filtered.sort((a, b) => a.price - b.price)
      case "price-desc":
        return filtered.sort((a, b) => b.price - a.price)
      case "year-desc":
        return filtered.sort((a, b) => b.year - a.year)
      case "mileage-asc":
        return filtered.sort((a, b) => a.mileage - b.mileage)
      default:
        return filtered
    }
  }

  const displayedCars = sortAndFilterCars()

  if (!userPreferences) return null

  if (loading) {
    return (
      <div className="flex min-h-screen">
        {/* Left sidebar with gradient */}
        <div className="w-24 bg-gradient-to-b from-blue-500 to-blue-700 fixed left-0 top-0 h-full"></div>

        {/* Right sidebar with gradient */}
        <div className="w-24 bg-gradient-to-b from-blue-500 to-blue-700 fixed right-0 top-0 h-full"></div>

        {/* Main content with proper margins to avoid sidebar overlap */}
        <div className="w-full mx-24">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Left sidebar with gradient */}
      <div className="w-24 bg-gradient-to-b from-blue-500 to-blue-700 fixed left-0 top-0 h-full"></div>

      {/* Right sidebar with gradient */}
      <div className="w-24 bg-gradient-to-b from-blue-500 to-blue-700 fixed right-0 top-0 h-full"></div>

      {/* Main content with proper margins to avoid sidebar overlap */}
      <div className="w-full mx-24">
        <div className="max-w-6xl mx-auto py-8 md:py-12">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Recommended Vehicles</h1>
                <p className="text-gray-600 mt-2">
                  Based on ${userPreferences.monthlyBudget}/month •{userPreferences.vehicleType} • $
                  {userPreferences.downPayment} down
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4" />
                New Search
              </Button>
            </div>

            {showFallbackNotice && (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-700">Expanded Results</AlertTitle>
                <AlertDescription className="text-blue-600">
                  Showing some additional options beyond your exact criteria
                </AlertDescription>
              </Alert>
            )}

            {/* Filters and sorting */}
            <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Filter & Sort:</span>
              </div>
              <div className="flex flex-1 flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/3">
                  <Select value={filterMake} onValueChange={setFilterMake}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Filter by Make" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Makes</SelectItem>
                      {availableMakes.map((make) => (
                        <SelectItem key={make} value={make}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-1/3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="year-desc">Newest First</SelectItem>
                      <SelectItem value="mileage-asc">Lowest Mileage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {displayedCars.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500 text-lg">No vehicles found matching your criteria</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your budget or vehicle type</p>
                <Button className="mt-4 bg-blue-500 hover:bg-blue-600" onClick={() => router.push("/")}>
                  Adjust Search Criteria
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedCars.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
                <p className="text-sm text-gray-500 text-center mt-6">
                  Showing {displayedCars.length} of {Math.min(20, recommendedCars.length)} possible matches
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
