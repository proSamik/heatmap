"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Heatmap } from "@/components/heatmap"
import { MetricsCard } from "@/components/metrics-card"
import { YearSelector } from "@/components/year-selector"
import { RefreshPanel } from "@/components/refresh-panel"
import type { ContributionData, MetricsData } from "@/lib/types"
import { calculateStreak } from "@/lib/utils/streak"
import { getLast365DaysRange, getYearRange, formatDate } from "@/lib/utils/date"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const [githubData, setGithubData] = useState<ContributionData[]>([])
  const [youtubeData, setYoutubeData] = useState<ContributionData[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showLastYear, setShowLastYear] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const availableYears = Array.from({ length: new Date().getFullYear() - 2024 + 1 }, (_, i) => 2024 + i).reverse()

  const fetchData = async (startDate: string, endDate: string, autoRefresh = false) => {
    setLoading(true)
    setError(null)

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
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

  const metricsData: MetricsData = {
    github: {
      total: githubData.reduce((sum, d) => sum + d.count, 0),
      streak: calculateStreak(githubData),
    },
    youtube: {
      total: youtubeData.reduce((sum, d) => sum + d.count, 0),
      streak: calculateStreak(youtubeData),
    },
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
          <span className="text-gray-900">Loading your habit data...</span>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-900">{error}</p>
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
      <div className="container mx-auto px-4 py-8 w-full">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-3xl md:text-5xl font-bold mb-4 text-gray-900"
            >
              Samik&apos;s Heatmap of Contribution
            </motion.h1>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <MetricsCard data={metricsData} />
          </motion.div>

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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="space-y-6 flex flex-col items-center justify-center" // Center aligned in a column
            id="heatmaps-container"
          >
            <div id="heatmap" className="flex justify-center"> {/* Centering the heatmap */}
              <Heatmap
                data={githubData} // Keeping only the GitHub heatmap
                year={showLastYear ? new Date().getFullYear() : selectedYear}
                platform="github"
                title={`${githubData.reduce((sum, d) => sum + d.count, 0)} contributions in ${showLastYear ? "the last year" : selectedYear}`}
                showLastYear={showLastYear}
              />
            </div>

            <div id="youtube-heatmap">
              <Heatmap
                data={youtubeData}
                year={showLastYear ? new Date().getFullYear() : selectedYear}
                platform="youtube"
                title={`${youtubeData.reduce((sum, d) => sum + d.count, 0)} uploads in ${showLastYear ? "the last year" : selectedYear}`}
                showLastYear={showLastYear}
              />
            </div>
          </motion.div>

          {/* Large spacing before admin panel */}
          <div className="h-32"></div>

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
    </motion.div>
  )
}
