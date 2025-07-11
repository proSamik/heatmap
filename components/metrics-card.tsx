"use client"

import type { MetricsData } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"
import { formatDisplayDate } from "@/lib/utils/date"

interface MetricsCardProps {
  data: MetricsData
}

export function MetricsCard({ data }: MetricsCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-2">
      {/* GitHub Metrics */}
      <CardContainer className="inter-var" containerClassName="py-4">
        <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-full h-auto rounded-xl p-6 border">
          <CardItem
            translateZ="50"
            className="text-lg font-bold text-neutral-600 dark:text-white text-center mb-4"
          >
            GitHub Development Metrics
          </CardItem>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <CardItem translateZ="60" className="flex flex-col items-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.github.total.toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Contributions</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {data.github.streak.longestStart && data.github.streak.longestEnd
                  ? `${formatDisplayDate(data.github.streak.longestStart)} - ${formatDisplayDate(data.github.streak.longestEnd)}`
                  : "No data"}
              </div>
            </CardItem>

            <CardItem translateZ="80" className="relative flex flex-col items-center">
              <div className="w-20 h-20 mx-auto mb-2 relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-300"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-orange-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${Math.min((data.github.streak.current / Math.max(data.github.streak.longest, 1)) * 100, 100)}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-orange-500">{data.github.streak.current}</span>
                </div>
              </div>
              <div className="text-sm text-orange-500 font-semibold">Current Streak</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {data.github.streak.currentStart && data.github.streak.currentEnd
                  ? `${formatDisplayDate(data.github.streak.currentStart)} - ${formatDisplayDate(data.github.streak.currentEnd)}`
                  : "No active streak"}
              </div>
            </CardItem>

            <CardItem translateZ="60" className="flex flex-col items-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.github.streak.longest}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {data.github.streak.longestStart && data.github.streak.longestEnd
                  ? `${formatDisplayDate(data.github.streak.longestStart)} - ${formatDisplayDate(data.github.streak.longestEnd)}`
                  : "No data"}
              </div>
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>

      {/* YouTube Metrics */}
      <CardContainer className="inter-var" containerClassName="py-4">
        <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-red-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-full h-auto rounded-xl p-6 border">
          <CardItem
            translateZ="50"
            className="text-lg font-bold text-neutral-600 dark:text-white text-center mb-4"
          >
            YouTube Content Metrics
          </CardItem>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <CardItem translateZ="60" className="flex flex-col items-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.youtube.total.toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Uploads</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {data.youtube.streak.longestStart && data.youtube.streak.longestEnd
                  ? `${formatDisplayDate(data.youtube.streak.longestStart)} - ${formatDisplayDate(data.youtube.streak.longestEnd)}`
                  : "No data"}
              </div>
            </CardItem>

            <CardItem translateZ="80" className="relative flex flex-col items-center">
              <div className="w-20 h-20 mx-auto mb-2 relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-300"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-red-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${Math.min((data.youtube.streak.current / Math.max(data.youtube.streak.longest, 1)) * 100, 100)}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-red-500">{data.youtube.streak.current}</span>
                </div>
              </div>
              <div className="text-sm text-red-500 font-semibold">Current Streak</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {data.youtube.streak.currentStart && data.youtube.streak.currentEnd
                  ? `${formatDisplayDate(data.youtube.streak.currentStart)} - ${formatDisplayDate(data.youtube.streak.currentEnd)}`
                  : "No active streak"}
              </div>
            </CardItem>

            <CardItem translateZ="60" className="flex flex-col items-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.youtube.streak.longest}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {data.youtube.streak.longestStart && data.youtube.streak.longestEnd
                  ? `${formatDisplayDate(data.youtube.streak.longestStart)} - ${formatDisplayDate(data.youtube.streak.longestEnd)}`
                  : "No data"}
              </div>
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>
    </div>
  )
}
