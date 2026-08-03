import Image from "next/image"
import type { Car } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gauge, Fuel, Zap, Cog } from "lucide-react"

interface CarCardProps {
  car: Car
}

export function CarCard({ car }: CarCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={car.image || `/placeholder.svg?height=400&width=600&query=${car.make}%20${car.model}`}
            alt={`${car.make} ${car.model}`}
            fill
            className="object-cover"
            crossOrigin="anonymous"
          />
          <Badge className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700">{car.year}</Badge>
          {car.exteriorColor && (
            <Badge className="absolute top-2 left-2 bg-gray-700/80 hover:bg-gray-800/80">{car.exteriorColor}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {car.year} {car.make} {car.model}
        </h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
          <div className="flex items-center text-gray-600">
            <Gauge className="w-4 h-4 mr-1.5 text-blue-500" />
            <span className="text-sm">{car.mileage.toLocaleString()} km</span>
          </div>

          {car.transmission && (
            <div className="flex items-center text-gray-600">
              <Cog className="w-4 h-4 mr-1.5 text-blue-500" />
              <span className="text-sm">{car.transmission}</span>
            </div>
          )}

          {car.drivetrain && (
            <div className="flex items-center text-gray-600">
              <Zap className="w-4 h-4 mr-1.5 text-blue-500" />
              <span className="text-sm">{car.drivetrain}</span>
            </div>
          )}

          {car.displacement && (
            <div className="flex items-center text-gray-600">
              <Fuel className="w-4 h-4 mr-1.5 text-blue-500" />
              <span className="text-sm">{car.displacement}</span>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Price:</span>
            <span className="font-semibold text-lg">${car.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Est. Monthly:</span>
            <span className="font-semibold text-green-600">${car.estimatedMonthly}/mo</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-blue-500 hover:bg-blue-600">View Details</Button>
      </CardFooter>
    </Card>
  )
}
