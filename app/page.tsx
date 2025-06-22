"use client"

import { useState, useEffect } from "react"
import { Heatmap } from "@/components/heatmap"
import { MetricsCard } from "@/components/metrics-card"
import { YearSelector } from "@/components/year-selector"
import { RefreshPanel } from "@/components/refresh-panel"
import type { ContributionData, MetricsData } from "@/lib/types"
import { calculateStreak } from "@/lib/utils/streak"
import { getLastYearRange, getYearRange } from "@/lib/utils/date"
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

  const fetchData = async (startDate: string, endDate: string) => {
    setLoading(true)
    setError(null)

    try {
      const [githubResponse, youtubeResponse] = await Promise.all([
        fetch(`/api/github?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/youtube?startDate=${startDate}&endDate=${endDate}`),
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

  useEffect(() => {
    const dateRange = showLastYear ? getLastYearRange() : getYearRange(selectedYear)
    fetchData(dateRange.start, dateRange.end)
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your habit data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Samik&apos;s Heatmap of Contribution</h1>
            <p className="text-gray-600">Track your GitHub contributions and YouTube uploads in one place</p>
          </header>

          <MetricsCard data={metricsData} />

          <div className="space-y-8">
            <YearSelector
              selectedYear={selectedYear}
              availableYears={availableYears}
              onYearChange={setSelectedYear}
              showLastYear={showLastYear}
              onToggleLastYear={() => setShowLastYear(!showLastYear)}
            />

            <Heatmap
              data={githubData}
              year={showLastYear ? new Date().getFullYear() : selectedYear}
              platform="github"
              title={`${githubData.reduce((sum, d) => sum + d.count, 0)} contributions in ${showLastYear ? "the last year" : selectedYear}`}
            />

            <Heatmap
              data={youtubeData}
              year={showLastYear ? new Date().getFullYear() : selectedYear}
              platform="youtube"
              title={`${youtubeData.reduce((sum, d) => sum + d.count, 0)} uploads in ${showLastYear ? "the last year" : selectedYear}`}
            />
          </div>

          {/* Refresh Panel at Bottom */}
          <div className="mt-12">
            <RefreshPanel onRefreshComplete={handleRefreshComplete} />
          </div>
        </div>
      </div>
    </div>
  )
}
