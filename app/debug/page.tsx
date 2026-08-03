"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { testConnection } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"
import { getRecommendedCars } from "@/lib/carService"

export default function DebugPage() {
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [tableData, setTableData] = useState<any>(null)
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTestConnection = async () => {
    setLoading(true)
    try {
      const result = await testConnection()
      setConnectionResult(result)
      console.log("Connection test result:", result)
    } catch (error) {
      setConnectionResult({ success: false, error: error.message })
    }
    setLoading(false)
  }

  const handleFetchSampleData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("inventory_row").select("*").limit(5)

      if (error) {
        setTableData({ error: error.message })
      } else {
        setTableData({ data, count: data?.length || 0 })
      }
    } catch (error) {
      setTableData({ error: error.message })
    }
    setLoading(false)
  }

  const handleTestCarService = async () => {
    setLoading(true)
    try {
      const mockPreferences = {
        monthlyBudget: 500,
        creditScore: 700,
        vehicleType: "any",
        downPayment: 5000,
      }

      const cars = await getRecommendedCars(mockPreferences)
      setTestResults({ cars, count: cars.length })
    } catch (error) {
      setTestResults({ error: error.message })
    }
    setLoading(false)
  }

  const handleCheckTableStructure = async () => {
    setLoading(true)
    try {
      // Get first row to see structure
      const { data, error } = await supabase.from("inventory_row").select("*").limit(1)

      if (error) {
        setTableData({ error: error.message })
      } else if (data && data.length > 0) {
        const columns = Object.keys(data[0])
        setTableData({
          structure: columns,
          sampleData: data[0],
          message: "Table structure detected successfully!",
        })
      } else {
        setTableData({ error: "Table exists but is empty" })
      }
    } catch (error) {
      setTableData({ error: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>Test your connection to the inventory_row table</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={handleTestConnection} disabled={loading}>
              Test Connection
            </Button>
            <Button onClick={handleCheckTableStructure} disabled={loading}>
              Check Table Structure
            </Button>
            <Button onClick={handleFetchSampleData} disabled={loading}>
              Fetch Sample Data
            </Button>
            <Button onClick={handleTestCarService} disabled={loading}>
              Test Car Service
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Environment Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</p>
                <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}</p>
                {process.env.NEXT_PUBLIC_SUPABASE_URL && (
                  <p className="text-sm text-gray-600">URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {connectionResult && (
            <Card>
              <CardHeader>
                <CardTitle className={connectionResult.success ? "text-green-600" : "text-red-600"}>
                  Connection Test Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(connectionResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {tableData && (
            <Card>
              <CardHeader>
                <CardTitle>Table Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(tableData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle>Car Service Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
