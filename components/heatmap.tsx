"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import type { ContributionData } from "@/lib/types"
import { getWeeksInYear, formatDate, formatDisplayDate } from "@/lib/utils/date"
import { calculateIntensity, getIntensityColor } from "@/lib/utils/intensity"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showExpanded, setShowExpanded] = useState(false)

  const { weeks, intensityMap, dataMap } = useMemo(() => {
    // Find the last date with data
    const lastDataDate = data.length > 0 
      ? data.reduce((latest, current) => current.date > latest ? current.date : latest, data[0].date)
      : undefined
    
    // Use current date in user's local timezone
    const now = new Date()
    const localDateString = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0')
    
    const weeks = getWeeksInYear(year, lastDataDate || localDateString)
    const intensityMap = calculateIntensity(data)
    const dataMap = new Map(data.map((d) => [d.date, { count: d.count, details: d.details }]))

    return { weeks, intensityMap, dataMap }
  }, [data, year])

  const totalContributions = useMemo(() => {
    return data.reduce((sum, d) => sum + d.count, 0)
  }, [data])

  const handleMouseEnter = (event: React.MouseEvent, date: string, count: number, details: any) => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout)
      setTooltipTimeout(null)
    }
    const element = event.currentTarget as HTMLElement
    const container = element.closest('.heatmap-container') as HTMLElement
    
    if (container) {
      const elementRect = element.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      
      const relativeX = elementRect.left - containerRect.left + element.offsetWidth / 2
      const relativeY = elementRect.top - containerRect.top
      
      setHoveredDay({
        date,
        count,
        details,
        x: relativeX,
        y: relativeY,
      })
    }
  }

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredDay(null)
      setShowExpanded(false) // Reset expanded state when tooltip disappears
    }, 1500) // 1.5 second delay before tooltip disappears
    setTooltipTimeout(timeout)
  }

  const handleTooltipMouseEnter = () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout)
      setTooltipTimeout(null)
    }
  }

  const handleTooltipMouseLeave = () => {
    setHoveredDay(null)
    setShowExpanded(false) // Reset expanded state when leaving tooltip
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout)
      }
    }
  }, [tooltipTimeout])

  const renderTooltipContent = () => {
    if (!hoveredDay) return null

    const { date, count, details } = hoveredDay

    return (
      <div 
        className={cn(
          "bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg pointer-events-auto z-50",
          showExpanded ? "max-w-md max-h-80" : "max-w-xs"
        )}
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
      >
        <div className="font-semibold mb-2">
          {count} {platform === "github" ? "contributions" : "uploads"} on {formatDisplayDate(date)}
        </div>

        {platform === "github" && details?.repos?.length > 0 && (
          <div>
            <div className="text-gray-300 mb-1">Repositories:</div>
            <div className={cn("space-y-1", showExpanded && "max-h-60 overflow-y-auto pr-2")}>
              {(showExpanded ? details.repos : details.repos.slice(0, 3)).map((repo: string, index: number) => (
                <div 
                  key={index} 
                  className="text-blue-300 cursor-pointer hover:text-blue-200 hover:underline break-all"
                  onClick={() => window.open(`https://github.com/${repo}`, '_blank')}
                >
                  {repo}
                </div>
              ))}
              {!showExpanded && details.repos.length > 3 && (
                <div 
                  className="text-gray-400 cursor-pointer hover:text-gray-200 underline"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowExpanded(true)
                  }}
                >
                  +{details.repos.length - 3} more (click to expand)
                </div>
              )}
              {showExpanded && (
                <div 
                  className="text-gray-400 cursor-pointer hover:text-gray-200 underline mt-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowExpanded(false)
                  }}
                >
                  Show less
                </div>
              )}
            </div>
          </div>
        )}

        {platform === "youtube" && details?.videos?.length > 0 && (
          <div>
            <div className="text-gray-300 mb-1">Videos:</div>
            <div className={cn("space-y-1", showExpanded && "max-h-60 overflow-y-auto pr-2")}>
              {(showExpanded ? details.videos : details.videos.slice(0, 2)).map((video: any, index: number) => (
                <div 
                  key={index} 
                  className="text-red-300 cursor-pointer hover:text-red-200 hover:underline break-all" 
                  title={video.title}
                  onClick={() => video.url && window.open(video.url, '_blank')}
                >
                  {video.title}
                </div>
              ))}
              {!showExpanded && details.videos.length > 2 && (
                <div 
                  className="text-gray-400 cursor-pointer hover:text-gray-200 underline"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowExpanded(true)
                  }}
                >
                  +{details.videos.length - 2} more (click to expand)
                </div>
              )}
              {showExpanded && (
                <div 
                  className="text-gray-400 cursor-pointer hover:text-gray-200 underline mt-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowExpanded(false)
                  }}
                >
                  Show less
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <div className="text-sm text-gray-700">
            {totalContributions} {platform === "github" ? "contributions" : "uploads"} in {year}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="relative heatmap-container">
          {/* Scrollable container for mobile */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[700px]">
              {/* Month labels */}
              <div className="flex mb-2 ml-8">
                {MONTHS.map((month, index) => (
                  <div
                    key={month}
                    className="flex-1 text-xs text-gray-600 text-center first:text-left"
                    style={{ minWidth: "58px" }}
                  >
                    {month}
                  </div>
                ))}
              </div>

              <div className="flex">
                {/* Day labels */}
                <div className="flex flex-col mr-2 text-xs text-gray-600 w-6">
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
                      {week.map((date, dayIndex) => {
                        const dateStr = date ? formatDate(date) : ""
                        const dayData = dateStr ? dataMap.get(dateStr) : null
                        const count = dayData?.count || 0
                        const details = dayData?.details
                        const intensity = dateStr ? intensityMap.get(dateStr) || 0 : 0

                        return (
                          <div
                            key={dayIndex}
                            className={cn(
                              "w-3 h-3 rounded-sm border border-gray-400 cursor-pointer transition-all duration-300",
                              date ? "hover:animate-pulse hover:shadow-lg hover:scale-110" : "",
                              date ? getIntensityColor(intensity, platform) : "bg-transparent border-transparent",
                              intensity > 0 && "hover:shadow-blue-500/80 hover:shadow-lg"
                            )}
                            style={{
                              animation: hoveredDay?.date === dateStr ? "heatmap-glow 0.5s ease-in-out infinite alternate" : undefined,
                              boxShadow: hoveredDay?.date === dateStr ? "0 0 10px rgba(59, 130, 246, 0.8)" : undefined
                            }}
                            onMouseEnter={(e) => {
                              if (date && count > 0) {
                                handleMouseEnter(e, dateStr, count, details)
                              }
                            }}
                            onMouseLeave={handleMouseLeave}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 text-xs text-gray-600 gap-2">
            <span>Learn how we count {platform === "github" ? "contributions" : "uploads"}</span>
            <div className="flex items-center gap-1">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn("w-3 h-3 rounded-sm border border-gray-400", getIntensityColor(level, platform))}
                />
              ))}
              <span>More</span>
            </div>
          </div>

          {/* Tooltip */}
          {hoveredDay && (
            <div
              className="absolute z-[9999]"
              style={{
                left: `${hoveredDay.x}px`,
                top: `${hoveredDay.y - 8}px`, // Position directly above with small gap
                transform: "translate(-50%, -100%)", // Center horizontally and position above
                pointerEvents: 'auto'
              }}
            >
              {renderTooltipContent()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
