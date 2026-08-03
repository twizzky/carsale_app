export interface UserPreferences {
  monthlyBudget: number
  creditScore: number
  vehicleType: string
  downPayment: number
  hasTrade?: boolean
}

export interface Car {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  type: string
  mpg?: number
  image?: string | null
  estimatedMonthly: number
  location?: string
  exteriorColor?: string
  interiorColor?: string
  displacement?: string
  gasType?: string
  drivetrain?: string
  transmission?: string
  cost?: number
}

export interface InventoryRow {
  Name: string
  Year: number
  Make: string
  Model: string
  Kms: string
  "Exterior Color": string
  "Interior Colors": string
  Displacement: string
  "Gas Type": string | null
  Drivetrain: string
  Transmission: string
  Cost: string
  "Retail Price": string
}
