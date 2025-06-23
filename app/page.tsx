"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { YearSelector } from "@/components/year-selector"
import { RefreshPanel } from "@/components/refresh-panel"
import { SyncLoader } from "@/components/sync-loader"
import { HeatmapData } from "@/components/heatmap-data"
import type { ContributionData } from "@/lib/types"
import { getLast365DaysRange, getYearRange, formatDate } from "@/lib/utils/date"

export default function HomePage() {
  const [githubData, setGithubData] = useState<ContributionData[]>([])
  const [youtubeData, setYoutubeData] = useState<ContributionData[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showLastYear, setShowLastYear] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [minLoadingComplete, setMinLoadingComplete] = useState(false)

  const availableYears = Array.from({ length: new Date().getFullYear() - 2024 + 1 }, (_, i) => 2024 + i).reverse()

  const fetchData = async (startDate: string, endDate: string, autoRefresh = false) => {
    setLoading(true)
    setError(null)
    setMinLoadingComplete(false)

    // Set minimum loading time to ensure sync loader shows properly
    const minLoadingTime = setTimeout(() => {
      setMinLoadingComplete(true)
    }, 1000) 

    try {
      // Build URLs with auto-refresh logic
      const today = formatDate(new Date())
      const shouldAutoRefresh = autoRefresh && endDate >= today
      
      const githubUrl = `/api/github?startDate=${startDate}&endDate=${endDate}${shouldAutoRefresh ? '&refresh=true' : ''}`
      const youtubeUrl = `/api/youtube?startDate=${startDate}&endDate=${endDate}${shouldAutoRefresh ? '&refresh=true' : ''}`

      const [githubResponse, youtubeResponse] = await Promise.all([
        fetch(githubUrl),
        fetch(youtubeUrl),
      ])

      if (!githubResponse.ok || !youtubeResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const [githubResult, youtubeResult] = await Promise.all([githubResponse.json(), youtubeResponse.json()])

      setGithubData(githubResult.data || [])
      setYoutubeData(youtubeResult.data || [])

      // Wait for minimum loading time to complete before allowing completion
      if (!minLoadingComplete) {
        await new Promise(resolve => {
          const checkMinLoading = () => {
            if (minLoadingComplete) {
              resolve(true)
            } else {
              setTimeout(checkMinLoading, 100)
            }
          }
          checkMinLoading()
        })
      }
    } catch (err) {
      clearTimeout(minLoadingTime)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      clearTimeout(minLoadingTime)
      setLoading(false)
    }
  }

  const checkAndRefreshRecentData = async () => {
    try {
      const today = new Date()
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const startDate = formatDate(sevenDaysAgo)
      const endDate = formatDate(today)

      // Check if we need to refresh recent data (last 7 days including today)
      const refreshUrl = `/api/github?startDate=${startDate}&endDate=${endDate}&refresh=true`
      const youtubeRefreshUrl = `/api/youtube?startDate=${startDate}&endDate=${endDate}&refresh=true`

      await Promise.all([
        fetch(refreshUrl),
        fetch(youtubeRefreshUrl)
      ])

      console.log('Auto-refreshed recent data (last 7 days)')
    } catch (error) {
      console.log('Auto-refresh failed:', error)
    }
  }

  useEffect(() => {
    const dateRange = showLastYear ? getLast365DaysRange() : getYearRange(selectedYear)
    
    // First load: fetch data normally
    fetchData(dateRange.start, dateRange.end)
    
    // Auto-refresh recent data in the background
    if (showLastYear || selectedYear === new Date().getFullYear()) {
      // Small delay to ensure initial load completes first
      setTimeout(() => {
        checkAndRefreshRecentData().then(() => {
          // Refresh the display data after auto-refresh
          fetchData(dateRange.start, dateRange.end)
        })
      }, 1000)
    }
  }, [selectedYear, showLastYear, refreshKey])

  const handleRefreshComplete = () => {
    setRefreshKey((prev) => prev + 1)
  }



  const handleLoadingComplete = () => {
    setLoading(false);
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="relative flex flex-col gap-4 items-center justify-center px-4 min-h-screen"
      >
        <div className="text-center bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-2">⚠️ Connection Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0.0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
      className="relative w-full min-h-screen overflow-auto"
    >
      {loading ? (
        /* Show sync loader while loading */
        <SyncLoader 
          loading={loading} 
          onComplete={handleLoadingComplete}
          duration={2000}
        />
      ) : (
        /* Show content only when loading is complete */
        <div className="container mx-auto px-4 pt-2 w-full">
          <div className="max-w-7xl mx-auto space-y-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
            >
              <YearSelector
                selectedYear={selectedYear}
                availableYears={availableYears}
                onYearChange={setSelectedYear}
                showLastYear={showLastYear}
                onToggleLastYear={() => setShowLastYear(!showLastYear)}
              />
            </motion.div>

            <HeatmapData
              githubData={githubData}
              youtubeData={youtubeData}
              selectedYear={selectedYear}
              showLastYear={showLastYear}
            />

            {/* Large spacing before admin panel */}
            <div className="h-32"></div>

            <header className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-3xl md:text-5xl font-bold mb-4 text-gray-900"
              >
                Samik&apos;s Heatmap of Contribution to the world
              </motion.h1>
            </header>

            {/* Admin Panel at Very Bottom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="pb-8 pt-16"
            >
              <RefreshPanel onRefreshComplete={handleRefreshComplete} />
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
