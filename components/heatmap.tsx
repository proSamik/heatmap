"use client"

import type React from "react"

import { useState, useMemo } from "react"
import type { ContributionData } from "@/lib/types"
import { getWeeksInYear, formatDate } from "@/lib/utils/date"
import { calculateIntensity, getIntensityColor } from "@/lib/utils/intensity"
import { cn } from "@/lib/utils"

interface HeatmapProps {
  data: ContributionData[]
  year: number
  platform: "github" | "youtube"
  title: string
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function Heatmap({ data, year, platform, title }: HeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string
    count: number
    details: any
    x: number
    y: number
  } | null>(null)

  const { weeks, intensityMap, dataMap } = useMemo(() => {
    const weeks = getWeeksInYear(year)
    const intensityMap = calculateIntensity(data)
    const dataMap = new Map(data.map((d) => [d.date, { count: d.count, details: d.details }]))

    return { weeks, intensityMap, dataMap }
  }, [data, year])

  const totalContributions = useMemo(() => {
    return data.reduce((sum, d) => sum + d.count, 0)
  }, [data])

  const handleMouseEnter = (event: React.MouseEvent, date: string, count: number, details: any) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setHoveredDay({
      date,
      count,
      details,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
  }

  const renderTooltipContent = () => {
    if (!hoveredDay) return null

    const { date, count, details } = hoveredDay

    return (
      <div className="bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg max-w-xs">
        <div className="font-semibold mb-2">
          {count} {platform === "github" ? "contributions" : "uploads"} on {date}
        </div>

        {platform === "github" && details?.repos?.length > 0 && (
          <div>
            <div className="text-gray-300 mb-1">Repositories:</div>
            <div className="space-y-1">
              {details.repos.slice(0, 3).map((repo: string, index: number) => (
                <div key={index} className="text-blue-300">
                  {repo}
                </div>
              ))}
              {details.repos.length > 3 && <div className="text-gray-400">+{details.repos.length - 3} more</div>}
            </div>
          </div>
        )}

        {platform === "youtube" && details?.videos?.length > 0 && (
          <div>
            <div className="text-gray-300 mb-1">Videos:</div>
            <div className="space-y-1">
              {details.videos.slice(0, 2).map((video: any, index: number) => (
                <div key={index} className="text-red-300 truncate">
                  {video.title}
                </div>
              ))}
              {details.videos.length > 2 && <div className="text-gray-400">+{details.videos.length - 2} more</div>}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="text-sm text-gray-600">
          {totalContributions} {platform === "github" ? "contributions" : "uploads"} in {year}
        </div>
      </div>

      <div className="relative">
        {/* Month labels */}
        <div className="flex mb-2 ml-8">
          {MONTHS.map((month, index) => (
            <div
              key={month}
              className="flex-1 text-xs text-gray-600 text-center first:text-left"
              style={{ minWidth: `${100 / 12}%` }}
            >
              {month}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col mr-2 text-xs text-gray-600">
            {DAYS.map((day, index) => (
              <div key={day} className="h-3 flex items-center" style={{ marginBottom: "2px" }}>
                {index % 2 === 1 ? day : ""}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const date = week[dayIndex]
                  const dateStr = date ? formatDate(date) : ""
                  const dayData = dateStr ? dataMap.get(dateStr) : null
                  const count = dayData?.count || 0
                  const details = dayData?.details
                  const intensity = dateStr ? intensityMap.get(dateStr) || 0 : 0

                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "w-3 h-3 rounded-sm border border-gray-300 cursor-pointer transition-all hover:ring-2 hover:ring-blue-500",
                        date ? getIntensityColor(intensity, platform) : "bg-transparent border-transparent",
                      )}
                      onMouseEnter={(e) => {
                        if (date) {
                          handleMouseEnter(e, dateStr, count, details)
                        }
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
          <span>Learn how we count {platform === "github" ? "contributions" : "uploads"}</span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn("w-3 h-3 rounded-sm border border-gray-300", getIntensityColor(level, platform))}
              />
            ))}
            <span>More</span>
          </div>
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div
            className="fixed pointer-events-none z-50"
            style={{
              left: hoveredDay.x,
              top: hoveredDay.y,
              transform: "translate(-50%, -100%)",
            }}
          >
            {renderTooltipContent()}
          </div>
        )}
      </div>
    </div>
  )
}
