import { supabase, testConnection, getInventoryTable } from "./supabase"
import type { Car, UserPreferences, InventoryRow } from "./types"

// MAIN FUNCTIONS
export async function getRecommendedCars(preferences: UserPreferences): Promise<Car[]> {
  console.log("[getRecommendedCars] Starting with preferences:", preferences)

  try {
    // 1. Test connection first
    const connectionTest = await testConnection()
    if (!connectionTest.success) {
      console.error("[getRecommendedCars] Connection test failed:", connectionTest.error)
      return []
    }

    // inside getRecommendedCars(), just after connectionTest:
    const table = (await getInventoryTable()) || "inventory_row"

    // 2. Get a sample row to understand the table structure
    const { data: sampleData, error: sampleError } = await supabase.from(table).select("*").limit(1)

    if (sampleError) {
      console.error("[getRecommendedCars] Error fetching sample data:", sampleError)
      return []
    }

    if (!sampleData || sampleData.length === 0) {
      console.error("[getRecommendedCars] Table is empty")
      return []
    }

    console.log("[getRecommendedCars] Sample row structure:", Object.keys(sampleData[0]))

    // 3. Calculate budget constraints
    const maxMonthlyPayment = Math.max(100, preferences.monthlyBudget)
    const interestRate = getInterestRateByCredit(preferences.creditScore)
    const loanTermMonths = 60
    const maxLoanAmount = calculateMaxLoanAmount(maxMonthlyPayment, interestRate, loanTermMonths)
    const maxPrice = Math.max(5000, maxLoanAmount + preferences.downPayment)

    console.log("[getRecommendedCars] Budget calculations:", {
      maxMonthlyPayment,
      interestRate,
      maxLoanAmount,
      maxPrice,
    })

    // 4. Build query - start simple and add filters
    let query = supabase.from(table).select("*").limit(50)

    // Try to add price filter if we can identify the price column
    const priceColumn = detectPriceColumn(sampleData[0])
    if (priceColumn && maxPrice < 1000000) {
      query = query.lte(priceColumn, Math.floor(maxPrice))
      console.log(`[getRecommendedCars] Filtering by ${priceColumn} <= ${maxPrice}`)
    }

    // Try to add vehicle type filter
    const typeColumn = detectTypeColumn(sampleData[0])
    if (typeColumn && preferences.vehicleType.toLowerCase() !== "any") {
      const vehicleType = mapVehicleType(preferences.vehicleType)
      query = query.eq(typeColumn, vehicleType)
      console.log(`[getRecommendedCars] Filtering by ${typeColumn} = ${vehicleType}`)
    }

    const { data: inventory, error } = await query

    if (error) {
      console.error("[getRecommendedCars] Query error:", error)
      // Fallback to simple query
      const { data: fallbackData } = await supabase.from(table).select("*").limit(20)

      if (fallbackData && fallbackData.length > 0) {
        console.log(`[getRecommendedCars] Fallback query returned ${fallbackData.length} cars`)
        return fallbackData.map((row) => createCarObject(row, preferences, interestRate, loanTermMonths))
      }

      return []
    }

    console.log(`[getRecommendedCars] Query returned ${inventory?.length || 0} cars`)

    if (!inventory || inventory.length === 0) {
      // Try one more simple query
      const { data: simpleData } = await supabase.from(table).select("*").limit(20)

      if (simpleData && simpleData.length > 0) {
        console.log(`[getRecommendedCars] Simple query returned ${simpleData.length} cars`)
        return simpleData.map((row) => createCarObject(row, preferences, interestRate, loanTermMonths))
      }

      return []
    }

    // 5. Transform and filter results
    const results = inventory
      .map((row) => createCarObject(row, preferences, interestRate, loanTermMonths))
      .filter((car) => car.estimatedMonthly <= preferences.monthlyBudget * 1.2)
      .slice(0, 20)

    console.log(`[getRecommendedCars] Returning ${results.length} filtered cars`)
    return results
  } catch (error) {
    console.error("[getRecommendedCars] Unexpected error:", error)
    return []
  }
}

export async function getAllCars(): Promise<Car[]> {
  console.log("[getAllCars] Fetching all cars")
  try {
    const table = (await getInventoryTable()) || "inventory_row"
    const { data, error } = await supabase.from(table).select("*").limit(100)

    if (error) {
      console.error("[getAllCars] Error:", error)
      return []
    }

    return (data || []).map((row) => createCarObject(row))
  } catch (error) {
    console.error("[getAllCars] Unexpected error:", error)
    return []
  }
}

export async function getCarById(id: string): Promise<Car | null> {
  console.log("[getCarById] Fetching car:", id)
  try {
    const table = (await getInventoryTable()) || "inventory_row"
    const { data, error } = await supabase.from(table).select("*").eq("id", id).single()

    if (error) {
      console.error("[getCarById] Error:", error)
      return null
    }

    return data ? createCarObject(data) : null
  } catch (error) {
    console.error("[getCarById] Unexpected error:", error)
    return null
  }
}

// HELPER FUNCTIONS TO DETECT COLUMN NAMES
function detectPriceColumn(sampleRow: any): string | null {
  const possiblePriceColumns = [
    "Retail Price",
    "retail_price",
    "asking_price",
    "sale_price",
    "price",
    "cost",
    "amount",
    "value",
  ]

  for (const col of possiblePriceColumns) {
    if (col in sampleRow) {
      console.log(`[detectPriceColumn] Found price column: ${col}`)
      return col
    }
  }

  // Look for columns containing 'price' in the name
  const columns = Object.keys(sampleRow)
  const priceCol = columns.find((col) => col.toLowerCase().includes("price"))
  if (priceCol) {
    console.log(`[detectPriceColumn] Found price column by pattern: ${priceCol}`)
    return priceCol
  }

  console.log(`[detectPriceColumn] No price column found in:`, columns)
  return null
}

function detectTypeColumn(sampleRow: any): string | null {
  const possibleTypeColumns = ["vehicle_type", "type", "body_type", "category", "style"]

  for (const col of possibleTypeColumns) {
    if (col in sampleRow) {
      console.log(`[detectTypeColumn] Found type column: ${col}`)
      return col
    }
  }

  console.log(`[detectTypeColumn] No type column found in:`, Object.keys(sampleRow))
  return null
}

function createCarObject(row: any, preferences?: UserPreferences, interestRate?: number, loanTermMonths?: number): Car {
  // Check if we're dealing with the new CSV format
  if (row.Name || row.Make || row.Model || row.Year || row["Retail Price"]) {
    return createCarFromCSV(row, preferences, interestRate, loanTermMonths)
  }

  // Detect column names dynamically for the old format
  const columns = Object.keys(row)

  // Find price column
  const priceCol = detectPriceColumn(row)
  const price = priceCol ? row[priceCol] || 0 : 0

  // Find type column
  const typeCol = detectTypeColumn(row)
  const vehicleType = typeCol ? row[typeCol] || "car" : "car"

  // Find other columns
  const makeCol = columns.find((col) => col.toLowerCase().includes("make")) || "make"
  const modelCol = columns.find((col) => col.toLowerCase().includes("model")) || "model"
  const yearCol = columns.find((col) => col.toLowerCase().includes("year")) || "year"
  const mileageCol = columns.find((col) => col.toLowerCase().includes("mile")) || "mileage"
  const locationCol =
    columns.find((col) => col.toLowerCase().includes("location") || col.toLowerCase().includes("city")) || "location"
  const imageCol =
    columns.find((col) => col.toLowerCase().includes("image") || col.toLowerCase().includes("photo")) || "images"

  console.log("[createCarObject] Detected columns:", {
    price: priceCol,
    type: typeCol,
    make: makeCol,
    model: modelCol,
    year: yearCol,
    mileage: mileageCol,
  })

  const baseCar: Car = {
    id: row.id?.toString() || `car_${Date.now()}_${Math.random()}`,
    make: row[makeCol] || "Unknown",
    model: row[modelCol] || "Unknown",
    year: Number.parseInt(row[yearCol]) || 2020,
    price: Number.parseFloat(price.toString().replace(/[$,]/g, "")) || 0,
    mileage: Number.parseInt((row[mileageCol] || 0).toString().replace(/[,]/g, "")) || 0,
    type: vehicleType.toLowerCase(),
    mpg: estimateMPG(row[makeCol] || "Unknown", vehicleType || "car", Number.parseInt(row[yearCol]) || 2020),
    image: parseImageUrl(row[imageCol]),
    location: row[locationCol],
    estimatedMonthly: 0,
  }

  if (preferences && interestRate !== undefined && loanTermMonths) {
    const loanAmount = Math.max(0, baseCar.price - (preferences.downPayment || 0))
    baseCar.estimatedMonthly = Math.round(calculateMonthlyPayment(loanAmount, interestRate, loanTermMonths))
  }

  return baseCar
}

function createCarFromCSV(
  row: InventoryRow,
  preferences?: UserPreferences,
  interestRate?: number,
  loanTermMonths?: number,
): Car {
  // Parse values from CSV format
  const retailPrice = Number.parseFloat(row["Retail Price"].replace(/[$,]/g, "")) || 0
  const mileage = Number.parseInt(row.Kms.replace(/[,]/g, "")) || 0
  const cost = Number.parseFloat(row.Cost.replace(/[$,]/g, "")) || 0

  const baseCar: Car = {
    id: `car_${Date.now()}_${Math.random()}`,
    make: row.Make || "Unknown",
    model: row.Model || "Unknown",
    year: Number.parseInt(row.Year.toString()) || 2020,
    price: retailPrice,
    mileage: mileage,
    type: determineVehicleType(row.Model, row.Make),
    exteriorColor: row["Exterior Color"],
    interiorColor: row["Interior Colors"],
    displacement: row.Displacement,
    gasType: row["Gas Type"] || undefined,
    drivetrain: row.Drivetrain,
    transmission: row.Transmission,
    cost: cost,
    estimatedMonthly: 0,
  }

  if (preferences && interestRate !== undefined && loanTermMonths) {
    const loanAmount = Math.max(0, baseCar.price - (preferences.downPayment || 0))
    baseCar.estimatedMonthly = Math.round(calculateMonthlyPayment(loanAmount, interestRate, loanTermMonths))
  }

  return baseCar
}

// Determine vehicle type based on model and make
function determineVehicleType(model: string, make: string): string {
  const modelLower = model.toLowerCase()
  const makeLower = make.toLowerCase()

  // SUVs
  if (
    modelLower.includes("suv") ||
    modelLower.includes("crossover") ||
    modelLower.includes("explorer") ||
    modelLower.includes("escape") ||
    modelLower.includes("equinox") ||
    modelLower.includes("terrain") ||
    modelLower.includes("tahoe") ||
    modelLower.includes("suburban") ||
    modelLower.includes("expedition") ||
    modelLower.includes("highlander") ||
    modelLower.includes("rav4") ||
    modelLower.includes("cr-v") ||
    modelLower.includes("pilot") ||
    modelLower.includes("rogue") ||
    modelLower.includes("pathfinder") ||
    modelLower.includes("santa fe") ||
    modelLower.includes("tucson")
  ) {
    return "SUV"
  }

  // Trucks
  if (
    modelLower.includes("truck") ||
    modelLower.includes("pickup") ||
    modelLower.includes("silverado") ||
    modelLower.includes("sierra") ||
    modelLower.includes("f-150") ||
    modelLower.includes("ram") ||
    modelLower.includes("tundra") ||
    modelLower.includes("tacoma") ||
    modelLower.includes("ranger") ||
    modelLower.includes("colorado") ||
    modelLower.includes("canyon")
  ) {
    return "Truck"
  }

  // Vans
  if (
    modelLower.includes("van") ||
    modelLower.includes("caravan") ||
    modelLower.includes("sienna") ||
    modelLower.includes("odyssey") ||
    modelLower.includes("pacifica") ||
    modelLower.includes("sedona")
  ) {
    return "Van"
  }

  // Luxury
  if (
    makeLower === "bmw" ||
    makeLower === "mercedes" ||
    makeLower === "mercedes-benz" ||
    makeLower === "audi" ||
    makeLower === "lexus" ||
    makeLower === "infiniti" ||
    makeLower === "acura" ||
    makeLower === "cadillac" ||
    makeLower === "lincoln" ||
    makeLower === "porsche" ||
    makeLower === "jaguar" ||
    makeLower === "land rover" ||
    makeLower === "maserati" ||
    makeLower === "bentley" ||
    makeLower === "rolls-royce"
  ) {
    return "Luxury"
  }

  // Default to Car
  return "Car"
}

// Keep all the other helper functions the same...
function mapVehicleType(inputType: string): string {
  const mapping: Record<string, string> = {
    sedan: "sedan",
    suv: "suv",
    truck: "truck",
    hatchback: "hatchback",
    coupe: "coupe",
    convertible: "convertible",
    minivan: "minivan",
  }
  return mapping[inputType.toLowerCase()] || inputType.toLowerCase()
}

function parseImageUrl(images: unknown): string | undefined {
  if (!images) return undefined

  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0]
      }
    } catch {
      const urls = images.split(",")
      return urls[0]?.trim()
    }
    return images.trim()
  }

  if (Array.isArray(images) && images.length > 0) {
    return images[0]
  }

  return undefined
}

function getInterestRateByCredit(creditScore: number): number {
  if (creditScore >= 800) return 0.03
  if (creditScore >= 740) return 0.04
  if (creditScore >= 670) return 0.06
  if (creditScore >= 580) return 0.09
  return 0.12
}

function calculateMaxLoanAmount(monthlyPayment: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12
  if (monthlyRate === 0) return monthlyPayment * months
  return (monthlyPayment * (Math.pow(1 + monthlyRate, months) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, months))
}

function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0) return 0
  const monthlyRate = annualRate / 12
  if (monthlyRate === 0) return principal / months
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}

function estimateMPG(make: string, vehicleType: string, year: number): number {
  const baseMPG: Record<string, number> = {
    sedan: 30,
    suv: 25,
    truck: 20,
    minivan: 22,
    hatchback: 32,
    coupe: 28,
    convertible: 26,
  }

  let mpg = baseMPG[vehicleType.toLowerCase()] || 25

  const currentYear = new Date().getFullYear()
  if (year >= currentYear - 2) mpg += 3
  else if (year >= currentYear - 7) mpg += 1
  else if (year < currentYear - 12) mpg -= 2

  const efficientMakes = ["TOYOTA", "HONDA", "NISSAN", "HYUNDAI", "KIA", "MAZDA"]
  const luxuryMakes = ["BMW", "MERCEDES", "AUDI", "LEXUS", "ACURA", "INFINITI"]

  if (efficientMakes.includes(make.toUpperCase())) mpg += 2
  if (luxuryMakes.includes(make.toUpperCase())) mpg -= 1

  return Math.max(15, Math.min(40, mpg))
}
