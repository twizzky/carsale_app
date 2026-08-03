import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Car Sales Recommendation App",
  description: "Find the perfect car based on your budget and preferences",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="/env.js" suppressHydrationWarning />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
              {/* Header content with margins to avoid sidebar overlap */}
              <div className="mx-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center py-4">
                    <h1 className="text-2xl font-bold text-gray-900">CarFinder</h1>
                    <nav className="space-x-4">
                      <a href="/" className="text-gray-600 hover:text-gray-900">
                        Home
                      </a>
                      <a href="/results" className="text-gray-600 hover:text-gray-900">
                        Results
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </header>
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
