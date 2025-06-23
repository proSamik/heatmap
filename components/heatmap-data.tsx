"use client"

import { motion } from "framer-motion"
import { Heatmap } from "@/components/heatmap"
import { MetricsCard } from "@/components/metrics-card"
import type { ContributionData, MetricsData } from "@/lib/types"
import { calculateStreak } from "@/lib/utils/streak"

interface HeatmapDataProps {
  githubData: ContributionData[]
  youtubeData: ContributionData[]
  selectedYear: number
  showLastYear: boolean
}

/**
 * Component that renders heatmap data with metrics and visualizations
 */
export function HeatmapData({ githubData, youtubeData, selectedYear, showLastYear }: HeatmapDataProps) {
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <MetricsCard data={metricsData} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="space-y-6 flex flex-col items-center justify-center"
        id="heatmaps-container"
      >
        <div id="heatmap" className="flex justify-center">
          <Heatmap
            data={githubData}
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
    </>
  )
} 