"use client"

import type { MetricsData } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MetricsCardProps {
  data: MetricsData
}

export function MetricsCard({ data }: MetricsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* GitHub Metrics */}
      <Card className="bg-white border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-lg text-gray-900">GitHub Development Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{data.github.total.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Contributions</div>
              <div className="text-xs text-gray-500 mt-1">
                {data.github.streak.longestStart && data.github.streak.longestEnd
                  ? `${data.github.streak.longestStart} - ${data.github.streak.longestEnd}`
                  : "No data"}
              </div>
            </div>

            <div className="relative">
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
              <div className="text-xs text-gray-500 mt-1">
                {data.github.streak.currentStart && data.github.streak.currentEnd
                  ? `${data.github.streak.currentStart} - ${data.github.streak.currentEnd}`
                  : "No active streak"}
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-gray-900">{data.github.streak.longest}</div>
              <div className="text-sm text-gray-600">Longest Streak</div>
              <div className="text-xs text-gray-500 mt-1">
                {data.github.streak.longestStart && data.github.streak.longestEnd
                  ? `${data.github.streak.longestStart} - ${data.github.streak.longestEnd}`
                  : "No data"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* YouTube Metrics */}
      <Card className="bg-white border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-lg text-gray-900">YouTube Content Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{data.youtube.total.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Uploads</div>
              <div className="text-xs text-gray-500 mt-1">
                {data.youtube.streak.longestStart && data.youtube.streak.longestEnd
                  ? `${data.youtube.streak.longestStart} - ${data.youtube.streak.longestEnd}`
                  : "No data"}
              </div>
            </div>

            <div className="relative">
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
              <div className="text-xs text-gray-500 mt-1">
                {data.youtube.streak.currentStart && data.youtube.streak.currentEnd
                  ? `${data.youtube.streak.currentStart} - ${data.youtube.streak.currentEnd}`
                  : "No active streak"}
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold text-gray-900">{data.youtube.streak.longest}</div>
              <div className="text-sm text-gray-600">Longest Streak</div>
              <div className="text-xs text-gray-500 mt-1">
                {data.youtube.streak.longestStart && data.youtube.streak.longestEnd
                  ? `${data.youtube.streak.longestStart} - ${data.youtube.streak.longestEnd}`
                  : "No data"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
